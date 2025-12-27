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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button, Input, Card, CardContent, Avatar, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

const leaderboardData = [
  { rank: 1, prevRank: 1, name: "Arjun Mehta", college: "IIT Bombay", score: 2847, change: 0, avatar: null },
  { rank: 2, prevRank: 3, name: "Priya Sharma", college: "IIT Delhi", score: 2789, change: 1, avatar: null },
  { rank: 3, prevRank: 2, name: "Rahul Verma", college: "BITS Pilani", score: 2756, change: -1, avatar: null },
  { rank: 4, prevRank: 4, name: "Sneha Patel", college: "NIT Trichy", score: 2701, change: 0, avatar: null },
  { rank: 5, prevRank: 7, name: "Vikram Singh", college: "IIT Madras", score: 2689, change: 2, avatar: null },
  { rank: 6, prevRank: 5, name: "Ananya Gupta", college: "IIIT Hyderabad", score: 2654, change: -1, avatar: null },
  { rank: 7, prevRank: 6, name: "Karthik Reddy", college: "VIT Vellore", score: 2632, change: -1, avatar: null },
  { rank: 8, prevRank: 10, name: "Neha Joshi", college: "IIT Kanpur", score: 2598, change: 2, avatar: null },
  { rank: 9, prevRank: 8, name: "Aditya Kumar", college: "DTU Delhi", score: 2567, change: -1, avatar: null },
  { rank: 10, prevRank: 9, name: "Ishita Saxena", college: "NSUT Delhi", score: 2534, change: -1, avatar: null },
];

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  // Get current user rank from session
  const userRank = {
    rank: 0,
    prevRank: 0,
    name: session?.user?.name || session?.user?.email?.split("@")[0] || "You",
    college: "Complete your profile",
    score: 0,
    change: 0,
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-500" />;
    return null;
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "rank-gold";
    if (rank === 2) return "rank-silver";
    if (rank === 3) return "rank-bronze";
    return "";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-success-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-error-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            National Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See where you stand among 50,000+ students nationwide
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
                  #{userRank.rank}
                </div>
                <div>
                  <p className="text-[#6B7280] text-sm">Your Current Rank</p>
                  <p className="text-2xl font-bold text-[#1F2937]">#{userRank.rank}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="h-4 w-4 text-[#10B981]" />
                    <span className="text-[#10B981] text-sm">
                      Up {userRank.change} positions this week
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-[#1F2937]">{userRank.score}</p>
                  <p className="text-[#6B7280] text-sm">Total Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-[#0EA5E9]">Top 1%</p>
                  <p className="text-[#6B7280] text-sm">Percentile</p>
                </div>
              </div>
            </div>
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
        <Tabs defaultValue="all" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="contextual">Contextual</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Top 3 Podium */}
      <div className="hidden md:grid grid-cols-3 gap-4 items-end">
        {/* 2nd Place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center p-6 border-[#E5E7EB] bg-white shadow-sm">
            <div className="relative inline-block mb-4">
              <Avatar fallback={leaderboardData[1].name} size="xl" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold shadow-lg">
                2
              </div>
            </div>
            <h3 className="font-semibold">{leaderboardData[1].name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{leaderboardData[1].college}</p>
            <p className="text-2xl font-bold font-display">{leaderboardData[1].score}</p>
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
              <Avatar fallback={leaderboardData[0].name} size="xl" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg">
                1
              </div>
            </div>
            <h3 className="font-semibold text-lg">{leaderboardData[0].name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{leaderboardData[0].college}</p>
            <p className="text-3xl font-bold font-display text-amber-600">{leaderboardData[0].score}</p>
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
              <Avatar fallback={leaderboardData[2].name} size="xl" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                3
              </div>
            </div>
            <h3 className="font-semibold">{leaderboardData[2].name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{leaderboardData[2].college}</p>
            <p className="text-2xl font-bold font-display">{leaderboardData[2].score}</p>
          </Card>
        </motion.div>
      </div>

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
                  <th className="text-right p-4 font-medium text-muted-foreground">Score</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Change</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((student, index) => (
                  <motion.tr
                    key={student.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "border-b border-border hover:bg-muted/50 transition-colors",
                      student.rank <= 3 && "bg-muted/30"
                    )}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(student.rank)}
                        <span
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                            getRankBadgeClass(student.rank),
                            student.rank > 3 && "bg-muted"
                          )}
                        >
                          {student.rank}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={student.name} size="sm" />
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground md:hidden">
                            {student.college}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">
                      {student.college}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold font-display">{student.score}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getChangeIcon(student.change)}
                        <span
                          className={cn(
                            "text-sm",
                            student.change > 0 && "text-success-500",
                            student.change < 0 && "text-error-500",
                            student.change === 0 && "text-muted-foreground"
                          )}
                        >
                          {student.change > 0 ? `+${student.change}` : student.change === 0 ? "-" : student.change}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing 1-10 of 50,000 students
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="ghost" size="sm">
                2
              </Button>
              <Button variant="ghost" size="sm">
                3
              </Button>
              <span className="text-muted-foreground">...</span>
              <Button variant="ghost" size="sm">
                5000
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
