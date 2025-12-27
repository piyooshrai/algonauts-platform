"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Building2,
  GraduationCap,
  Award,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function CollegeAnalyticsPage() {
  // Fetch various data for analytics
  const { data: placementStats, isLoading: placementsLoading } = api.placements.getVerificationStats.useQuery();
  const { data: leaderboardData, isLoading: leaderboardLoading } = api.leaderboards.getStudentLeaderboard.useQuery({
    scope: "college",
    metric: "xp",
    limit: 10,
  });

  const isLoading = placementsLoading || leaderboardLoading;

  const stats = placementStats || {
    total: 0,
    verified30: 0,
    verified90: 0,
    retained90: 0,
    verification30Rate: 0,
    verification90Rate: 0,
    retention90Rate: 0,
  };

  const topPerformers = leaderboardData?.leaderboard || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  // Calculate mock analytics metrics
  const analytics = {
    totalStudents: topPerformers.length * 10, // Multiplier for demo
    activeStudents: Math.floor(topPerformers.length * 8),
    placementRate: stats.total > 0 ? (stats.verified90 / stats.total) * 100 : 0,
    averagePackage: 8.5, // LPA
    highestPackage: 24, // LPA
    companiesHiring: 45,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applicationsSubmitted: topPerformers.reduce((acc: number, s: any) => acc + (s.score || 0), 0),
    weeklyChange: {
      students: 12,
      placements: 5,
      applications: 23,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-[#0EA5E9]" />
          Analytics Dashboard
        </h1>
        <p className="text-[#6B7280] mt-1">Comprehensive placement and engagement analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Students</p>
                <p className="text-3xl font-bold text-[#1F2937] mt-1">{analytics.totalStudents}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-[#10B981]" />
                  <span className="text-xs text-[#10B981]">+{analytics.weeklyChange.students} this week</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center">
                <Users className="h-6 w-6 text-[#0EA5E9]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Placement Rate</p>
                <p className="text-3xl font-bold text-[#10B981] mt-1">{analytics.placementRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-[#10B981]" />
                  <span className="text-xs text-[#10B981]">+2.3% vs last year</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Avg. Package</p>
                <p className="text-3xl font-bold text-[#F59E0B] mt-1">{analytics.averagePackage} LPA</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-[#10B981]" />
                  <span className="text-xs text-[#10B981]">+0.5 LPA vs last year</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Companies</p>
                <p className="text-3xl font-bold text-[#8B5CF6] mt-1">{analytics.companiesHiring}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-[#10B981]" />
                  <span className="text-xs text-[#10B981]">+8 new this season</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#0EA5E9]" />
              Placement Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">Confirmed Placements</span>
                  <span className="font-medium text-[#1F2937]">{stats.total}</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div
                    className="bg-[#0EA5E9] h-2 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">30-Day Verified</span>
                  <span className="font-medium text-[#F59E0B]">{stats.verified30}</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div
                    className="bg-[#F59E0B] h-2 rounded-full"
                    style={{ width: `${stats.verification30Rate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">90-Day Verified</span>
                  <span className="font-medium text-[#10B981]">{stats.verified90}</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div
                    className="bg-[#10B981] h-2 rounded-full"
                    style={{ width: `${stats.verification90Rate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">Retained at 90 Days</span>
                  <span className="font-medium text-[#8B5CF6]">{stats.retained90}</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div
                    className="bg-[#8B5CF6] h-2 rounded-full"
                    style={{ width: `${stats.retention90Rate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#10B981]" />
              Package Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#D1FAE5]">
                <div>
                  <p className="text-sm text-[#6B7280]">Highest Package</p>
                  <p className="text-xl font-bold text-[#10B981]">{analytics.highestPackage} LPA</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#10B981]" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FEF3C7]">
                <div>
                  <p className="text-sm text-[#6B7280]">Average Package</p>
                  <p className="text-xl font-bold text-[#F59E0B]">{analytics.averagePackage} LPA</p>
                </div>
                <BarChart3 className="h-8 w-8 text-[#F59E0B]" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 rounded-lg bg-[#F3F4F6]">
                  <p className="text-2xl font-bold text-[#1F2937]">15%</p>
                  <p className="text-xs text-[#6B7280]">{">"} 15 LPA</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#F3F4F6]">
                  <p className="text-2xl font-bold text-[#1F2937]">45%</p>
                  <p className="text-xs text-[#6B7280]">8-15 LPA</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#F3F4F6]">
                  <p className="text-2xl font-bold text-[#1F2937]">40%</p>
                  <p className="text-xs text-[#6B7280]">{"<"} 8 LPA</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#F59E0B]" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {topPerformers.slice(0, 5).map((student: any, index: number) => (
                  <div key={student.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? "bg-[#FEF3C7] text-[#F59E0B]" :
                      index === 1 ? "bg-[#E5E7EB] text-[#6B7280]" :
                      index === 2 ? "bg-[#FED7AA] text-[#EA580C]" :
                      "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1F2937]">{student.name}</p>
                      <p className="text-xs text-[#6B7280]">{student.score?.toLocaleString()} XP</p>
                    </div>
                    {index < 3 && (
                      <Badge variant={index === 0 ? "warning" : "secondary"}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#0EA5E9]" />
                  <div>
                    <p className="font-medium text-[#1F2937]">Active Students</p>
                    <p className="text-xs text-[#6B7280]">Last 7 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1F2937]">{analytics.activeStudents}</p>
                  <p className="text-xs text-[#10B981]">85% active</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-[#F59E0B]" />
                  <div>
                    <p className="font-medium text-[#1F2937]">Applications</p>
                    <p className="text-xs text-[#6B7280]">This month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1F2937]">{analytics.applicationsSubmitted}</p>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-[#10B981]" />
                    <p className="text-xs text-[#10B981]">+{analytics.weeklyChange.applications}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-[#10B981]" />
                  <div>
                    <p className="font-medium text-[#1F2937]">Profile Completion</p>
                    <p className="text-xs text-[#6B7280]">Average</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1F2937]">78%</p>
                  <p className="text-xs text-[#10B981]">+5% this month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
