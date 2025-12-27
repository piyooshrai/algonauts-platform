"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  CheckSquare,
  TrendingUp,
  Award,
  Building2,
  ChevronRight,
  Loader2,
  BarChart3,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function CollegeDashboardPage() {
  // Fetch college data
  const { data: profileData, isLoading: profileLoading } = api.profile.get.useQuery();
  const { data: statsData, isLoading: statsLoading } = api.placements.getCollegeStats.useQuery();

  const isLoading = profileLoading || statsLoading;

  // Mock data - replace with real data from API
  const stats = statsData || {
    totalStudents: 0,
    activeStudents: 0,
    placedStudents: 0,
    placementRate: 0,
    averagePackage: 0,
    highestPackage: 0,
    topCompanies: [],
  };

  const collegeProfile = profileData?.profile?.college || {
    collegeName: "Your College",
  };

  // Top performing students - would come from API
  const topStudents = [
    { name: "Student 1", score: 95, rank: 12 },
    { name: "Student 2", score: 92, rank: 28 },
    { name: "Student 3", score: 89, rank: 45 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#0EA5E9]" />
            College Dashboard
          </h1>
          <p className="text-[#6B7280] mt-1">{collegeProfile.collegeName}</p>
        </div>
        <Link href="/college/students/import">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Import Students
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Students</p>
                <p className="text-3xl font-bold text-[#1F2937] mt-1">{stats.totalStudents}</p>
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
                <p className="text-sm text-[#6B7280]">Placed Students</p>
                <p className="text-3xl font-bold text-[#10B981] mt-1">{stats.placedStudents}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Placement Rate</p>
                <p className="text-3xl font-bold text-[#8B5CF6] mt-1">{stats.placementRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Avg Package</p>
                <p className="text-3xl font-bold text-[#F59E0B] mt-1">
                  {stats.averagePackage ? `${(stats.averagePackage / 100000).toFixed(1)}L` : "-"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                <Award className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#0EA5E9]" />
              Placement Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Placement</span>
                <span className="text-sm text-[#6B7280]">
                  {stats.placedStudents} / {stats.totalStudents}
                </span>
              </div>
              <Progress value={stats.placementRate} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB]">
              <div className="text-center p-4 bg-[#F9FAFB] rounded-lg">
                <p className="text-2xl font-bold text-[#1F2937]">
                  {stats.highestPackage ? `${(stats.highestPackage / 100000).toFixed(0)}L` : "-"}
                </p>
                <p className="text-sm text-[#6B7280]">Highest Package</p>
              </div>
              <div className="text-center p-4 bg-[#F9FAFB] rounded-lg">
                <p className="text-2xl font-bold text-[#1F2937]">{stats.activeStudents}</p>
                <p className="text-sm text-[#6B7280]">Active on Platform</p>
              </div>
            </div>

            <Link href="/college/analytics">
              <Button variant="outline" className="w-full gap-2">
                View Detailed Analytics
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#F59E0B]" />
              Top Performing Students
            </CardTitle>
            <Link href="/college/students" className="text-sm text-[#0EA5E9] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-[#6B7280]">No students added yet</p>
                <Link href="/college/students/import" className="mt-2 inline-block">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Upload className="h-4 w-4" />
                    Import Students
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-[#FEF3C7] text-[#B45309]"
                          : index === 1
                          ? "bg-[#F3F4F6] text-[#6B7280]"
                          : "bg-[#FED7AA] text-[#C2410C]"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#1F2937]">{student.name}</p>
                        <p className="text-xs text-[#6B7280]">National Rank #{student.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#0EA5E9]">{student.score}</p>
                      <p className="text-xs text-[#6B7280]">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/college/students">
              <div className="p-4 rounded-lg border border-[#E5E7EB] hover:border-[#0EA5E9] hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                <Users className="h-8 w-8 text-[#0EA5E9] mb-3" />
                <h3 className="font-semibold text-[#1F2937]">Manage Students</h3>
                <p className="text-sm text-[#6B7280] mt-1">View and manage your student roster</p>
              </div>
            </Link>
            <Link href="/college/placements">
              <div className="p-4 rounded-lg border border-[#E5E7EB] hover:border-[#10B981] hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                <CheckSquare className="h-8 w-8 text-[#10B981] mb-3" />
                <h3 className="font-semibold text-[#1F2937]">Track Placements</h3>
                <p className="text-sm text-[#6B7280] mt-1">Monitor student placement status</p>
              </div>
            </Link>
            <Link href="/college/analytics">
              <div className="p-4 rounded-lg border border-[#E5E7EB] hover:border-[#8B5CF6] hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                <BarChart3 className="h-8 w-8 text-[#8B5CF6] mb-3" />
                <h3 className="font-semibold text-[#1F2937]">View Analytics</h3>
                <p className="text-sm text-[#6B7280] mt-1">Detailed placement analytics</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
