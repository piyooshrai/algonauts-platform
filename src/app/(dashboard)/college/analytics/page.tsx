"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Building2,
  GraduationCap,
  Award,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function CollegeAnalyticsPage() {
  // Fetch college dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = api.college.getDashboardStats.useQuery();

  // Fetch detailed analytics
  const { data: analyticsData, isLoading: analyticsLoading } = api.college.getAnalytics.useQuery();

  // Fetch top students
  const { data: studentsData, isLoading: studentsLoading } = api.college.getStudents.useQuery({
    limit: 5,
    sortBy: "rank",
    sortOrder: "asc",
  });

  const isLoading = statsLoading || analyticsLoading || studentsLoading;

  const stats = dashboardStats || {
    totalStudents: 0,
    activeStudents: 0,
    placedStudents: 0,
    placementRate: 0,
    averagePackage: 0,
    highestPackage: 0,
    topCompanies: [],
    recentApplications: 0,
  };

  const topPerformers = studentsData?.students || [];
  // placementTrend and roleStats available for future use
  const companyStats = analyticsData?.companyStats || [];
  const branchStats = analyticsData?.branchStats || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  // Use real data from API
  const analytics = {
    totalStudents: stats.totalStudents,
    activeStudents: stats.activeStudents,
    placementRate: stats.placementRate,
    averagePackage: stats.averagePackage,
    highestPackage: stats.highestPackage,
    companiesHiring: companyStats.length,
    applicationsSubmitted: stats.recentApplications,
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
                <p className="text-xs text-[#6B7280] mt-1">{analytics.activeStudents} active</p>
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
                <p className="text-3xl font-bold text-[#10B981] mt-1">{analytics.placementRate}%</p>
                <p className="text-xs text-[#6B7280] mt-1">{stats.placedStudents} placed</p>
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
                <p className="text-3xl font-bold text-[#F59E0B] mt-1">
                  {analytics.averagePackage > 0 ? `${analytics.averagePackage} LPA` : "-"}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Highest: {analytics.highestPackage > 0 ? `${analytics.highestPackage} LPA` : "-"}
                </p>
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
                <p className="text-3xl font-bold text-[#8B5CF6] mt-1">{analytics.companiesHiring || "-"}</p>
                <p className="text-xs text-[#6B7280] mt-1">{analytics.applicationsSubmitted} recent applications</p>
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
        {/* Placement Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#0EA5E9]" />
              Placement Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">Placed Students</span>
                  <span className="font-medium text-[#1F2937]">{stats.placedStudents} / {stats.totalStudents}</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div
                    className="bg-[#10B981] h-2 rounded-full"
                    style={{ width: `${stats.placementRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB]">
                <div className="text-center p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-2xl font-bold text-[#10B981]">
                    {stats.averagePackage > 0 ? `${stats.averagePackage}L` : "-"}
                  </p>
                  <p className="text-sm text-[#6B7280]">Avg Package</p>
                </div>
                <div className="text-center p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-2xl font-bold text-[#F59E0B]">
                    {stats.highestPackage > 0 ? `${stats.highestPackage}L` : "-"}
                  </p>
                  <p className="text-sm text-[#6B7280]">Highest Package</p>
                </div>
              </div>

              {stats.topCompanies.length > 0 && (
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <p className="text-sm font-medium mb-2">Top Companies</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.topCompanies.map((company: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-[#E0F2FE] text-[#0369A1] rounded-full text-sm">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#10B981]" />
              Top Hiring Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {companyStats.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No placement data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {companyStats.slice(0, 5).map((company: { company: string; count: number; avgSalary: number }, index: number) => (
                  <div key={company.company} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? "bg-[#D1FAE5] text-[#10B981]" :
                        index === 1 ? "bg-[#E0F2FE] text-[#0EA5E9]" :
                        "bg-[#F3F4F6] text-[#6B7280]"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#1F2937]">{company.company}</p>
                        <p className="text-xs text-[#6B7280]">{company.count} placements</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#10B981]">
                        {company.avgSalary > 0 ? `${company.avgSalary} LPA` : "-"}
                      </p>
                      <p className="text-xs text-[#6B7280]">avg package</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#F59E0B]" />
              Top Performing Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No student data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topPerformers.map((student: { id: string; name: string; branch?: string | null; rank?: number | null; isPlaced: boolean }, index: number) => (
                  <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB]">
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
                      <p className="text-xs text-[#6B7280]">{student.branch || "N/A"}</p>
                    </div>
                    {student.rank && (
                      <span className="text-sm font-semibold text-[#0EA5E9]">#{student.rank}</span>
                    )}
                    {student.isPlaced && (
                      <Badge variant="success">Placed</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branch Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#8B5CF6]" />
              Students by Branch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {branchStats.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No branch data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {branchStats.map((branch: { branch: string; count: number }) => (
                  <div key={branch.branch} className="flex items-center justify-between p-3 rounded-lg border border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-[#8B5CF6]" />
                      <p className="font-medium text-[#1F2937]">{branch.branch}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1F2937]">{branch.count}</p>
                      <p className="text-xs text-[#6B7280]">students</p>
                    </div>
                  </div>
                ))}

                {/* Summary */}
                <div className="pt-3 border-t border-[#E5E7EB]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B7280]">Active Students</span>
                    <span className="font-medium text-[#1F2937]">{analytics.activeStudents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-[#6B7280]">Recent Applications</span>
                    <span className="font-medium text-[#1F2937]">{analytics.applicationsSubmitted}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
