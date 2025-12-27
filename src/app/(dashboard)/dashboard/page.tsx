"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui";

// Mock user data - matches seeded database
const user = {
  name: "Rahul Sharma",
  firstName: "Rahul",
  college: "IIT Delhi",
  graduationYear: 2025,
  rank: 247,
  rankChange: 12,
  score: 75,
  percentile: 92,
  streak: 7,
  longestStreak: 14,
};

// Mock opportunities data
const opportunities = [
  {
    id: "opp_swe_intern_001",
    company: "TechCorp India",
    role: "Software Engineer Intern",
    location: "Bangalore",
    salary: "25K-40K/mo",
    match: 92,
    logo: "TC",
    logoColor: "bg-teal-500",
    spots: 3,
    totalSpots: 10,
    deadline: "2 days left",
    isHot: true,
  },
  {
    id: "opp_fullstack_001",
    company: "TechCorp India",
    role: "Full Stack Developer",
    location: "Remote",
    salary: "10-18 LPA",
    match: 88,
    logo: "TC",
    logoColor: "bg-teal-500",
    spots: 5,
    totalSpots: 8,
    deadline: "5 days left",
    isHot: false,
  },
  {
    id: "opp_data_analyst_001",
    company: "TechCorp India",
    role: "Data Analyst",
    location: "Mumbai",
    salary: "8-12 LPA",
    match: 76,
    logo: "TC",
    logoColor: "bg-teal-500",
    spots: 2,
    totalSpots: 5,
    deadline: "1 week left",
    isHot: false,
  },
];

// Mission checklist items
const missionItems = [
  { id: 1, label: "Complete your profile", completed: true, xp: 50 },
  { id: 2, label: "Take technical assessment", completed: true, xp: 100 },
  { id: 3, label: "Apply to 3 opportunities", completed: false, progress: 1, total: 3, xp: 75 },
  { id: 4, label: "Get your first shortlist", completed: false, xp: 150 },
];

// College pulse data
const collegePulse = {
  collegeName: "IIT Delhi",
  collegeRank: 3,
  totalStudents: 1247,
  placedThisWeek: 12,
  avgPackage: "18.5 LPA",
  recentPlacements: [
    { name: "Priya M.", company: "Google", role: "SDE", package: "45 LPA" },
    { name: "Amit K.", company: "Microsoft", role: "PM", package: "38 LPA" },
    { name: "Sneha R.", company: "Amazon", role: "SDE", package: "32 LPA" },
  ],
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
  const completedMissions = missionItems.filter((m) => m.completed).length;
  const totalMissions = missionItems.length;
  const missionProgress = (completedMissions / totalMissions) * 100;

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
                    user.rankChange > 0 ? "text-[#10B981]" : "text-[#EF4444]"
                  }`}>
                    {user.rankChange > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(user.rankChange)}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#1F2937]">#{user.rank}</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">of 50,000 students</p>
              </div>

              {/* Score Card */}
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#6B7280]">LayersRank Score</span>
                  <Trophy className="h-4 w-4 text-[#F59E0B]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1F2937]">{user.score}</span>
                  <span className="text-sm text-[#6B7280]">/ 100</span>
                </div>
                <p className="text-xs text-[#10B981] mt-1">Top {100 - user.percentile}% percentile</p>
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
                  <Sparkles className="h-5 w-5 text-[#2A9D8F]" />
                  <h2 className="text-lg font-semibold text-[#1F2937]">Opportunities For You</h2>
                </div>
                <Link
                  href="/opportunities"
                  className="text-sm font-medium text-[#2A9D8F] hover:text-[#238b7e] flex items-center gap-1 transition-colors"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {opportunities.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="block p-5 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className={`w-12 h-12 rounded-lg ${opp.logoColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {opp.logo}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[#1F2937]">{opp.role}</h3>
                              {opp.isHot && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEE2E2] text-[#DC2626] text-xs font-medium rounded-full">
                                  <Zap className="h-3 w-3" />
                                  Hot
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#6B7280]">{opp.company}</p>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#D1FAE5] text-[#059669] text-sm font-semibold rounded-full">
                            {opp.match}% match
                          </div>
                        </div>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-[#6B7280]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {opp.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {opp.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {opp.deadline}
                          </span>
                        </div>

                        {/* Scarcity signal */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[#6B7280]">
                              <Users className="h-3 w-3 inline mr-1" />
                              {opp.spots} spots left
                            </span>
                            <span className="text-[#6B7280]">{opp.totalSpots - opp.spots}/{opp.totalSpots} filled</span>
                          </div>
                          <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F59E0B] rounded-full transition-all"
                              style={{ width: `${((opp.totalSpots - opp.spots) / opp.totalSpots) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-5 w-5 text-[#D1D5DB] flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
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
                {missionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      item.completed ? "opacity-60" : "hover:bg-[#F9FAFB]"
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
                      {item.progress !== undefined && !item.completed && (
                        <div className="mt-1.5">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[#6B7280]">{item.progress}/{item.total}</span>
                          </div>
                          <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2A9D8F] rounded-full"
                              style={{ width: `${(item.progress / item.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-[#2A9D8F] flex-shrink-0">
                      +{item.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* College Pulse */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
              <div className="p-5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-5 w-5 text-[#2A9D8F]" />
                  <h2 className="text-lg font-semibold text-[#1F2937]">College Pulse</h2>
                </div>
                <p className="text-sm text-[#6B7280]">{collegePulse.collegeName}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] border-b border-[#E5E7EB]">
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#1F2937]">#{collegePulse.collegeRank}</p>
                  <p className="text-xs text-[#6B7280]">College Rank</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#10B981]">{collegePulse.placedThisWeek}</p>
                  <p className="text-xs text-[#6B7280]">Placed (Week)</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#1F2937]">{collegePulse.avgPackage}</p>
                  <p className="text-xs text-[#6B7280]">Avg Package</p>
                </div>
              </div>

              {/* Recent Placements */}
              <div className="p-4">
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">
                  Recent Placements
                </p>
                <div className="space-y-3">
                  {collegePulse.recentPlacements.map((placement, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-medium text-[#6B7280]">
                          {placement.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1F2937]">{placement.name}</p>
                          <p className="text-xs text-[#6B7280]">{placement.company} • {placement.role}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#10B981]">{placement.package}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
