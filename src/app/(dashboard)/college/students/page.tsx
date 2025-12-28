"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Upload,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Award,
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

export default function CollegeStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "placed">("all");
  const [branchFilter, setBranchFilter] = useState("");
  const [page, setPage] = useState(1);

  // Fetch branches for filter dropdown
  const { data: branches } = api.college.getBranches.useQuery();

  // Fetch students from college using proper API
  const { data: studentsData, isLoading } = api.college.getStudents.useQuery({
    page,
    limit: 20,
    search: searchQuery || undefined,
    branch: branchFilter || undefined,
    status: statusFilter,
    sortBy: "rank",
    sortOrder: "asc",
  });

  const students = studentsData?.students || [];
  const pagination = studentsData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  // Create branch options for select
  const branchOptions = [
    { value: "", label: "All Branches" },
    ...(branches?.map((b: string) => ({ value: b, label: b })) || []),
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
            <Users className="h-6 w-6 text-[#0EA5E9]" />
            Student Roster
          </h1>
          <p className="text-[#6B7280] mt-1">{pagination.total} students enrolled</p>
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
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          options={statusFilters}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val as "all" | "active" | "inactive" | "placed");
            setPage(1);
          }}
        />
        <Select
          options={branchOptions}
          value={branchFilter}
          onChange={(val) => {
            setBranchFilter(val);
            setPage(1);
          }}
        />
      </div>

      {/* Students List */}
      {students.length === 0 ? (
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
                    <th className="text-left p-4 font-medium text-[#6B7280]">Branch</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Year</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Rank</th>
                    <th className="text-left p-4 font-medium text-[#6B7280]">Status</th>
                    <th className="text-right p-4 font-medium text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: {
                    id: string;
                    name: string;
                    email: string;
                    branch?: string | null;
                    graduationYear?: number | null;
                    rank?: number | null;
                    isPlaced: boolean;
                    isActive: boolean;
                  }, index: number) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={student.name || "?"} size="sm" />
                          <div>
                            <p className="font-medium text-[#1F2937]">{student.name}</p>
                            <p className="text-sm text-[#6B7280]">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-[#1F2937]">{student.branch || "-"}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-[#1F2937]">{student.graduationYear || "-"}</span>
                      </td>
                      <td className="p-4">
                        {student.rank ? (
                          <span className="font-semibold text-[#0EA5E9] flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            #{student.rank}
                          </span>
                        ) : (
                          <span className="text-[#6B7280]">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {student.isPlaced ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Placed
                          </Badge>
                        ) : student.isActive ? (
                          <Badge variant="info" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/college/students/${student.id}`}>
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280]">
                  Showing {(page - 1) * pagination.limit + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} students
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-[#6B7280]">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
