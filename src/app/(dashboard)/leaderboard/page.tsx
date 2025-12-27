"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Trophy,
  Medal,
  Crown,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
} from "lucide-react";
import { Input, Card, CardContent, Avatar, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc/client";

type LeaderboardScope = "college" | "state" | "national";

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [scope, setScope] = useState<LeaderboardScope>("national");

  // Fetch real leaderboard data
  const { data: leaderboardData, isLoading: leaderboardLoading } = api.leaderboards.getStudentLeaderboard.useQuery({
    scope,
    metric: "xp",
    limit: 20,
    includeContext: true,
  });

  // Fetch user's ranking summary
  const { data: rankingSummary, isLoading: rankingLoading } = api.leaderboards.getUserRankingSummary.useQuery();

  // Fetch weekly movement
  const { data: movement } = api.leaderboards.getWeeklyMovement.useQuery();

  const isLoading = leaderboardLoading || rankingLoading;

  // User rank data
  const userRank = {
    rank: rankingSummary?.rankings?.[scope]?.rank || 0,
    score: rankingSummary?.xpTotal || 0,
    percentile: rankingSummary?.rankings?.[scope]?.percentile || 0,
    change: movement?.movement || 0,
    total: rankingSummary?.rankings?.[scope]?.total || 0,
  };

  // Filter leaderboard by search
  const leaderboard = leaderboardData?.leaderboard || [];
  const contextUsers = leaderboardData?.contextUsers || [];
  const filteredLeaderboard = searchQuery
    ? leaderboard.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.collegeName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leaderboard;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-500" />;
    return null;
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-amber-400 to-amber-600 text-white";
    if (rank === 2) return "bg-gradient-to-br from-slate-300 to-slate-500 text-white";
    if (rank === 3) return "bg-gradient-to-br from-orange-400 to-orange-600 text-white";
    return "bg-[#F3F4F6] text-[#1F2937]";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-[#10B981]" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-[#EF4444]" />;
    return <Minus className="h-4 w-4 text-[#6B7280]" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  const topThree = filteredLeaderboard.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            {scope === "college" ? "College" : scope === "state" ? "State" : "National"} Leaderboard
          </h1>
          <p className="text-muted-foreground">
            {userRank.total > 0
              ? `See where you stand among ${userRank.total.toLocaleString()} students`
              : "Loading rankings..."}
          </p>
        </div>
      </div>

      {/* Your Rank Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white border border-[#E5E7EB] shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#E0F2FE] flex items-center justify-center text-2xl font-bold text-[#0EA5E9]">
                  #{userRank.rank || "-"}
                </div>
                <div>
                  <p className="text-[#6B7280] text-sm">Your Current Rank</p>
                  <p className="text-2xl font-bold text-[#1F2937]">
                    {userRank.rank > 0 ? `#${userRank.rank}` : "Not ranked"}
                  </p>
                  {userRank.change !== 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      {getChangeIcon(userRank.change)}
                      <span className={userRank.change > 0 ? "text-[#10B981]" : "text-[#EF4444]"}>
                        {userRank.change > 0 ? `Up ${userRank.change}` : `Down ${Math.abs(userRank.change)}`} positions this week
                      </span>
                    </div>
                  )}
                  {movement?.movementMessage && (
                    <p className="text-sm text-[#6B7280] mt-1">{movement.movementMessage}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-[#1F2937]">{userRank.score.toLocaleString()}</p>
                  <p className="text-[#6B7280] text-sm">Total XP</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-[#0EA5E9]">
                    {userRank.percentile > 0 ? `Top ${100 - userRank.percentile}%` : "-"}
                  </p>
                  <p className="text-[#6B7280] text-sm">Percentile</p>
                </div>
              </div>
            </div>

            {/* Motivational message */}
            {leaderboardData?.userStats?.motivationalMessage && (
              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <p className="text-sm font-medium text-[#1F2937]">
                  {leaderboardData.userStats.motivationalMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by name or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={scope} onValueChange={(v) => setScope(v as LeaderboardScope)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="college">College</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="national">National</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <div className="hidden md:grid grid-cols-3 gap-4 items-end">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center p-6 border-[#E5E7EB] bg-white shadow-sm">
              <div className="relative inline-block mb-4">
                <Avatar fallback={topThree[1]?.name || "2"} size="xl" src={topThree[1]?.avatarUrl} />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold shadow-lg">
                  2
                </div>
              </div>
              <h3 className="font-semibold">{topThree[1]?.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{topThree[1]?.collegeName}</p>
              <p className="text-2xl font-bold font-display">{topThree[1]?.score?.toLocaleString()}</p>
            </Card>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center p-6 border-amber-300 bg-gradient-to-b from-amber-50 to-white shadow-sm">
              <Crown className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <div className="relative inline-block mb-4">
                <Avatar fallback={topThree[0]?.name || "1"} size="xl" src={topThree[0]?.avatarUrl} />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>
              </div>
              <h3 className="font-semibold text-lg">{topThree[0]?.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{topThree[0]?.collegeName}</p>
              <p className="text-3xl font-bold font-display text-amber-600">{topThree[0]?.score?.toLocaleString()}</p>
            </Card>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center p-6 border-orange-300 bg-white shadow-sm">
              <div className="relative inline-block mb-4">
                <Avatar fallback={topThree[2]?.name || "3"} size="xl" src={topThree[2]?.avatarUrl} />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                  3
                </div>
              </div>
              <h3 className="font-semibold">{topThree[2]?.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{topThree[2]?.collegeName}</p>
              <p className="text-2xl font-bold font-display">{topThree[2]?.score?.toLocaleString()}</p>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Rank</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">College</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">XP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      {searchQuery ? "No students match your search" : "No leaderboard data available"}
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredLeaderboard.map((student, index) => (
                      <motion.tr
                        key={student.userId || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "border-b border-border hover:bg-muted/50 transition-colors",
                          student.rank <= 3 && "bg-muted/30",
                          student.isCurrentUser && "bg-[#E0F2FE] border-[#0EA5E9]/30"
                        )}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(student.rank)}
                            <span
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                getRankBadgeClass(student.rank)
                              )}
                            >
                              {student.rank}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar fallback={student.name || "?"} size="sm" src={student.avatarUrl} />
                            <div>
                              <p className={cn("font-medium", student.isCurrentUser && "text-[#0EA5E9]")}>
                                {student.name}
                                {student.isCurrentUser && " (You)"}
                              </p>
                              <p className="text-sm text-muted-foreground md:hidden">
                                {student.collegeName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">
                          {student.collegeName}
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold font-display">{student.score?.toLocaleString()}</span>
                        </td>
                      </motion.tr>
                    ))}

                    {/* Context users (if current user is not in top list) */}
                    {contextUsers.length > 0 && (
                      <>
                        <tr>
                          <td colSpan={4} className="p-2 text-center text-xs text-muted-foreground bg-muted/20">
                            ••• Your ranking •••
                          </td>
                        </tr>
                        {contextUsers.map((student, index) => (
                          <motion.tr
                            key={`context-${student.userId || index}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                              "border-b border-border hover:bg-muted/50 transition-colors",
                              student.isCurrentUser && "bg-[#E0F2FE] border-[#0EA5E9]/30"
                            )}
                          >
                            <td className="p-4">
                              <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-[#F3F4F6]">
                                {student.rank}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar fallback={student.name || "?"} size="sm" src={student.avatarUrl} />
                                <div>
                                  <p className={cn("font-medium", student.isCurrentUser && "text-[#0EA5E9]")}>
                                    {student.name}
                                    {student.isCurrentUser && " (You)"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 hidden md:table-cell text-muted-foreground">
                              {student.collegeName}
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-semibold font-display">{student.score?.toLocaleString()}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
            Showing top {filteredLeaderboard.length} of {userRank.total.toLocaleString()} students
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
