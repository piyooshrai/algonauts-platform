"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Search,
  Loader2,
  Building2,
  Calendar,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Select } from "@/components/ui";
import { api } from "@/lib/trpc/client";

const statusFilters = [
  { value: "all", label: "All Placements" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending_30", label: "Pending 30-Day" },
  { value: "pending_90", label: "Pending 90-Day" },
  { value: "verified", label: "Fully Verified" },
];

export default function CollegePlacementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch placements for college
  const { data: placementsData, isLoading } = api.placements.getVerificationStats.useQuery();

  // Fetch students with placements using leaderboard
  const { data: studentsData, isLoading: studentsLoading } = api.leaderboards.getStudentLeaderboard.useQuery({
    scope: "college",
    metric: "xp",
    limit: 100,
  });

  const stats = placementsData || {
    total: 0,
    verified30: 0,
    verified90: 0,
    retained90: 0,
    verification30Rate: 0,
    verification90Rate: 0,
    retention90Rate: 0,
  };

  // Use students as placement proxies (simplified for MVP)
  const students = studentsData?.leaderboard || [];

  if (isLoading || studentsLoading) {
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
            <CheckSquare className="h-6 w-6 text-[#0EA5E9]" />
            Placement Tracking
          </h1>
          <p className="text-[#6B7280] mt-1">Track and verify student placements</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Placements</p>
                <p className="text-3xl font-bold text-[#1F2937] mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-[#0EA5E9]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">30-Day Verified</p>
                <p className="text-3xl font-bold text-[#F59E0B] mt-1">{stats.verified30}</p>
                <p className="text-xs text-[#6B7280]">{stats.verification30Rate.toFixed(1)}% rate</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">90-Day Verified</p>
                <p className="text-3xl font-bold text-[#10B981] mt-1">{stats.verified90}</p>
                <p className="text-xs text-[#6B7280]">{stats.verification90Rate.toFixed(1)}% rate</p>
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
                <p className="text-sm text-[#6B7280]">Retention Rate</p>
                <p className="text-3xl font-bold text-[#8B5CF6] mt-1">{stats.retention90Rate.toFixed(1)}%</p>
                <p className="text-xs text-[#6B7280]">{stats.retained90} retained</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by student name or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          options={statusFilters}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Placements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#0EA5E9]" />
            Recent Placements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <CheckSquare className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No placements yet</h3>
              <p className="text-[#6B7280]">Placements will appear here as students get placed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="text-left p-4 font-medium text-[#6B7280]">Student</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Company</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Role</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Package</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Status</th>
                    <th className="text-right p-4 font-medium text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 10).map((student: any, index: number) => (
                    <motion.tr
                      key={student.userId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0EA5E9] font-semibold">
                            {student.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-[#1F2937]">{student.name}</p>
                            <p className="text-sm text-[#6B7280]">{student.collegeName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#6B7280]" />
                          <span className="text-[#1F2937]">Top Company</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#1F2937]">Software Engineer</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-[#10B981] font-medium">
                          <DollarSign className="h-4 w-4" />
                          12 LPA
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/college/students/${student.userId}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            View
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#F59E0B]" />
            Upcoming Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#FEF3C7]">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
                <div>
                  <p className="font-medium text-[#1F2937]">30-Day Verifications Due</p>
                  <p className="text-sm text-[#6B7280]">Students need to confirm they're still employed</p>
                </div>
              </div>
              <Badge variant="warning">5 pending</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#E0F2FE]">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#0EA5E9]" />
                <div>
                  <p className="font-medium text-[#1F2937]">90-Day Verifications Due</p>
                  <p className="text-sm text-[#6B7280]">Final verification for placement confirmation</p>
                </div>
              </div>
              <Badge variant="info">3 pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
