"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Upload,
  ChevronRight,
  Loader2,
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Button, Input, Card, CardContent, Badge, Select, Avatar } from "@/components/ui";
import { api } from "@/lib/trpc/client";

const statusFilters = [
  { value: "all", label: "All Students" },
  { value: "placed", label: "Placed" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const yearFilters = [
  { value: "all", label: "All Years" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2026", label: "2026" },
];

export default function CollegeStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Fetch students from college
  const { data: studentsData, isLoading } = api.leaderboards.getStudentLeaderboard.useQuery({
    scope: "college",
    metric: "xp",
    limit: 100,
  });

  const students = studentsData?.leaderboard || [];

  // Filter students
  const filteredStudents = students.filter((student: any) => {
    const matchesSearch =
      !searchQuery ||
      student.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
            <Users className="h-6 w-6 text-[#0EA5E9]" />
            Student Roster
          </h1>
          <p className="text-[#6B7280] mt-1">{students.length} students enrolled</p>
        </div>
        <Link href="/college/students/import">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          options={statusFilters}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <Select
          options={yearFilters}
          value={yearFilter}
          onChange={setYearFilter}
        />
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-[#6B7280] mb-4">
              {searchQuery ? "Try adjusting your search" : "Import students to get started"}
            </p>
            <Link href="/college/students/import">
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Import Students
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="text-left p-4 font-medium text-[#6B7280]">Student</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Score</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Rank</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Status</th>
                    <th className="text-right p-4 font-medium text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student: any, index: number) => (
                    <motion.tr
                      key={student.userId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={student.name || "?"} size="sm" src={student.avatarUrl} />
                          <div>
                            <p className="font-medium text-[#1F2937]">{student.name}</p>
                            <p className="text-sm text-[#6B7280]">{student.collegeName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-[#0EA5E9]">
                          {student.score?.toLocaleString() || "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[#1F2937]">
                          {student.rank ? `#${student.rank}` : "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
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
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
