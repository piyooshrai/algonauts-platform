"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Trophy,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
  GraduationCap,
  Award,
  ChevronRight,
  Zap,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui";
import { api } from "@/lib/trpc/client";

// Map mission item IDs to their edit URLs
const missionEditUrls: Record<string, string> = {
  name: "/onboarding/student?step=0&focus=name",
  avatar: "/onboarding/student?step=0&focus=avatar",
  bio: "/onboarding/student?step=0&focus=bio",
  location: "/onboarding/student?step=0&focus=location",
  education: "/onboarding/student?step=1",
  resume: "/onboarding/student?step=3",
  skills: "/onboarding/student?step=2",
  linkedin: "/onboarding/student?step=0&focus=linkedin",
  github: "/onboarding/student?step=0&focus=github",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Fetch real data from tRPC
  const { data: profileStats, isLoading: profileLoading } = api.profile.getStats.useQuery();
  const { data: checklist, isLoading: checklistLoading } = api.profile.getCompletionChecklist.useQuery();
  const { data: opportunitiesData, isLoading: opportunitiesLoading } = api.opportunities.search.useQuery({
    limit: 3,
  });
  const { data: rankingSummary, isLoading: rankingLoading } = api.leaderboards.getUserRankingSummary.useQuery();
  const { data: streakData } = api.streaks.getCurrent.useQuery();

  // Derived data
  const profile = profileStats?.profile;
  const stats = profileStats?.stats;
  const opportunities = opportunitiesData?.opportunities || [];
  const missionItems = checklist?.items || [];
  const completedMissions = missionItems.filter((m) => m.completed).length;
  const totalMissions = missionItems.length;
  const missionProgress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  // User data from session and profile
  const user = {
    firstName: session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there",
    college: profile?.collegeName || "Complete your profile",
    graduationYear: profile?.graduationYear || new Date().getFullYear() + 1,
    rank: rankingSummary?.rankings?.national?.rank || 0,
    rankChange: 0, // TODO: Track weekly changes
    score: profile?.layersRankOverall || 0,
    percentile: rankingSummary?.rankings?.national?.percentile || 0,
    streak: streakData?.currentStreak || profile?.currentStreak || 0,
    longestStreak: streakData?.longestStreak || profile?.longestStreak || 0,
  };

  const isLoading = profileLoading || checklistLoading || opportunitiesLoading || rankingLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Welcome Header */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#1F2937]">
                    Welcome back, {user.firstName}!
                  </h1>
                  <p className="text-[#6B7280] mt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4" />
                      {user.college}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Class of {user.graduationYear}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] text-[#B45309] text-sm font-medium rounded-full">
                    <Flame className="h-4 w-4" />
                    {user.streak} day streak
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Rank Card */}
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#6B7280]">Your Rank</span>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    user.rankChange > 0 ? "text-[#10B981]" : user.rankChange < 0 ? "text-[#EF4444]" : "text-[#6B7280]"
                  }`}>
                    {user.rankChange > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : user.rankChange < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    {user.rankChange !== 0 ? Math.abs(user.rankChange) : "-"}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#1F2937]">
                    {user.rank > 0 ? `#${user.rank}` : "-"}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">
                  of {rankingSummary?.rankings?.national?.total?.toLocaleString() || "0"} students
                </p>
              </div>

              {/* Score Card */}
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#6B7280]">LayersRank Score</span>
                  <Trophy className="h-4 w-4 text-[#F59E0B]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1F2937]">
                    {user.score ? Math.round(user.score) : "-"}
                  </span>
                  <span className="text-sm text-[#6B7280]">/ 100</span>
                </div>
                <p className="text-xs text-[#10B981] mt-1">
                  {user.percentile > 0 ? `Top ${100 - user.percentile}% percentile` : "Take assessments to rank"}
                </p>
              </div>

              {/* Streak Card */}
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#6B7280]">Current Streak</span>
                  <Flame className="h-4 w-4 text-[#F59E0B]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1F2937]">{user.streak}</span>
                  <span className="text-sm text-[#6B7280]">days</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">Best: {user.longestStreak} days</p>
              </div>
            </div>
          </motion.div>

          {/* Opportunities For You */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#0EA5E9]" />
                  <h2 className="text-lg font-semibold text-[#1F2937]">Opportunities For You</h2>
                </div>
                <Link
                  href="/opportunities"
                  className="text-sm font-medium text-[#0EA5E9] hover:text-[#0284c7] flex items-center gap-1 transition-colors"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {opportunities.length === 0 ? (
                  <div className="p-8 text-center">
                    <Sparkles className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
                    <p className="text-[#6B7280]">No opportunities yet. Check back soon!</p>
                  </div>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  opportunities.map((opp: any) => (
                    <Link
                      key={opp.id}
                      href={`/opportunities/${opp.id}`}
                      className="block p-5 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Company Logo */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {opp.company?.companyName?.substring(0, 2).toUpperCase() || "CO"}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-[#1F2937]">{opp.title}</h3>
                                {opp.scarcity?.demandLevel === "very_high" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEE2E2] text-[#DC2626] text-xs font-medium rounded-full">
                                    <Zap className="h-3 w-3" />
                                    Hot
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#6B7280]">{opp.company?.companyName}</p>
                            </div>
                          </div>

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-[#6B7280]">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {opp.isRemote ? "Remote" : opp.locations?.[0] || "Location TBD"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {opp.salaryMin && opp.salaryMax
                                ? `₹${(opp.salaryMin / 100000).toFixed(0)}-${(opp.salaryMax / 100000).toFixed(0)} LPA`
                                : "Competitive"}
                            </span>
                            {opp.scarcity?.closingIn?.urgency !== "low" && (
                              <span className="flex items-center gap-1 text-[#DC2626]">
                                <Clock className="h-3.5 w-3.5" />
                                {opp.scarcity?.closingIn?.type === "time"
                                  ? `${opp.scarcity.closingIn.value} ${opp.scarcity.closingIn.value === 1 ? "day" : "days"} left`
                                  : `${opp.scarcity?.closingIn?.value} spots left`}
                              </span>
                            )}
                          </div>

                          {/* Scarcity signal */}
                          {opp.scarcity && opp.scarcity.totalApplications > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-[#6B7280]">
                                  <Users className="h-3 w-3 inline mr-1" />
                                  {opp.scarcity.totalApplications} applied
                                </span>
                                {opp.scarcity.applicationsFromYourCollege > 0 && (
                                  <span className="text-[#0EA5E9]">
                                    {opp.scarcity.applicationsFromYourCollege} from your college
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="h-5 w-5 text-[#D1D5DB] flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Your Mission */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
              <div className="p-5 border-b border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-[#1F2937]">Your Mission</h2>
                  <span className="text-sm text-[#6B7280]">{completedMissions}/{totalMissions}</span>
                </div>
                <Progress value={missionProgress} size="sm" className="bg-[#E5E7EB]" />
                <p className="text-xs text-[#6B7280] mt-2">
                  Complete missions to earn XP and boost your rank
                </p>
              </div>
              <div className="p-3">
                {missionItems.length === 0 ? (
                  <p className="text-sm text-[#6B7280] text-center py-4">Loading missions...</p>
                ) : (
                  missionItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!item.completed && missionEditUrls[item.id]) {
                          router.push(missionEditUrls[item.id]);
                        }
                      }}
                      disabled={item.completed}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left ${
                        item.completed
                          ? "opacity-60 cursor-default"
                          : "hover:bg-[#F9FAFB] cursor-pointer"
                      } transition-colors`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-[#D1D5DB] flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.completed ? "line-through text-[#9CA3AF]" : "text-[#1F2937]"}`}>
                          {item.label}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[#0EA5E9] flex-shrink-0">
                        +{item.points} XP
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
              <div className="p-5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-5 w-5 text-[#0EA5E9]" />
                  <h2 className="text-lg font-semibold text-[#1F2937]">Your Progress</h2>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] border-b border-[#E5E7EB]">
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#1F2937]">{stats?.applications || 0}</p>
                  <p className="text-xs text-[#6B7280]">Applications</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#10B981]">{stats?.badges || 0}</p>
                  <p className="text-xs text-[#6B7280]">Badges</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#1F2937]">{profile?.totalXp || 0}</p>
                  <p className="text-xs text-[#6B7280]">Total XP</p>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#6B7280]">Profile Completion</p>
                  <span className="text-sm font-semibold text-[#0EA5E9]">
                    {profile?.profileCompletionPct || 0}%
                  </span>
                </div>
                <Progress value={profile?.profileCompletionPct || 0} size="sm" className="bg-[#E5E7EB]" />
                {(profile?.profileCompletionPct || 0) < 100 && (
                  <Link
                    href="/profile"
                    className="mt-3 text-xs text-[#0EA5E9] hover:underline flex items-center gap-1"
                  >
                    Complete your profile to unlock more opportunities
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
