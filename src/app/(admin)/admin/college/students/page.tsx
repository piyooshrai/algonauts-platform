"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  Badge,
  Avatar,
  Button,
  Input,
  Select,
  Modal,
} from "@/components/ui";

// Mock student data
const mockStudents = [
  { id: 1, name: "Priya Sharma", email: "priya.sharma@college.edu", year: 2025, branch: "Computer Science", rank: 12, lastAssessment: "2024-01-15", status: "active" },
  { id: 2, name: "Rahul Verma", email: "rahul.verma@college.edu", year: 2025, branch: "Electronics", rank: 28, lastAssessment: "2024-01-14", status: "active" },
  { id: 3, name: "Ananya Patel", email: "ananya.patel@college.edu", year: 2024, branch: "Computer Science", rank: 45, lastAssessment: "2024-01-10", status: "active" },
  { id: 4, name: "Vikram Singh", email: "vikram.singh@college.edu", year: 2025, branch: "Mechanical", rank: 67, lastAssessment: "2024-01-12", status: "active" },
  { id: 5, name: "Neha Gupta", email: "neha.gupta@college.edu", year: 2024, branch: "Information Technology", rank: 89, lastAssessment: "2024-01-08", status: "active" },
  { id: 6, name: "Amit Kumar", email: "amit.kumar@college.edu", year: 2025, branch: "Computer Science", rank: 102, lastAssessment: "2024-01-11", status: "active" },
  { id: 7, name: "Shruti Agarwal", email: "shruti.agarwal@college.edu", year: 2026, branch: "Electronics", rank: 156, lastAssessment: "2024-01-09", status: "active" },
  { id: 8, name: "Karan Malhotra", email: "karan.malhotra@college.edu", year: 2024, branch: "Civil", rank: 234, lastAssessment: "2024-01-07", status: "inactive" },
  { id: 9, name: "Pooja Reddy", email: "pooja.reddy@college.edu", year: 2025, branch: "Computer Science", rank: 178, lastAssessment: "2024-01-13", status: "active" },
  { id: 10, name: "Rohan Joshi", email: "rohan.joshi@college.edu", year: 2026, branch: "Mechanical", rank: 312, lastAssessment: "2024-01-06", status: "active" },
  { id: 11, name: "Meera Nair", email: "meera.nair@college.edu", year: 2025, branch: "Information Technology", rank: 245, lastAssessment: "2024-01-05", status: "active" },
  { id: 12, name: "Arjun Desai", email: "arjun.desai@college.edu", year: 2024, branch: "Electronics", rank: 389, lastAssessment: "2024-01-04", status: "inactive" },
];

const branchOptions = [
  { value: "all", label: "All Branches" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Electronics", label: "Electronics" },
  { value: "Mechanical", label: "Mechanical" },
  { value: "Civil", label: "Civil" },
  { value: "Information Technology", label: "Information Technology" },
];

const yearOptions = [
  { value: "all", label: "All Years" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type SortField = "name" | "rank" | "lastAssessment" | "year";
type SortOrder = "asc" | "desc";

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredStudents = useMemo(() => {
    let result = [...mockStudents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
    }

    // Branch filter
    if (branchFilter !== "all") {
      result = result.filter((student) => student.branch === branchFilter);
    }

    // Year filter
    if (yearFilter !== "all") {
      result = result.filter((student) => student.year === parseInt(yearFilter));
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((student) => student.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "rank":
          comparison = a.rank - b.rank;
          break;
        case "lastAssessment":
          comparison = new Date(b.lastAssessment).getTime() - new Date(a.lastAssessment).getTime();
          break;
        case "year":
          comparison = a.year - b.year;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, branchFilter, yearFilter, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track student performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => window.location.href = "/admin/college/upload"}>
            Bulk Upload
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <Input
                  icon={Search}
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Toggle (Mobile) */}
              <Button
                variant="outline"
                className="lg:hidden gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {(branchFilter !== "all" || yearFilter !== "all" || statusFilter !== "all") && (
                  <Badge variant="info" className="ml-1">
                    {[branchFilter, yearFilter, statusFilter].filter((f) => f !== "all").length}
                  </Badge>
                )}
              </Button>

              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center gap-3">
                <Select
                  options={branchOptions}
                  value={branchFilter}
                  onChange={setBranchFilter}
                  className="w-44"
                />
                <Select
                  options={yearOptions}
                  value={yearFilter}
                  onChange={setYearFilter}
                  className="w-32"
                />
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-32"
                />
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <Select
                  options={branchOptions}
                  value={branchFilter}
                  onChange={setBranchFilter}
                />
                <Select
                  options={yearOptions}
                  value={yearFilter}
                  onChange={setYearFilter}
                />
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredStudents.length}</span> of{" "}
          <span className="font-medium text-foreground">{mockStudents.length}</span> students
        </p>
      </div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th
                      className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Student
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th
                      className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("year")}
                    >
                      <div className="flex items-center gap-1">
                        Year
                        <SortIcon field="year" />
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Branch</th>
                    <th
                      className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("rank")}
                    >
                      <div className="flex items-center gap-1">
                        LayersRank
                        <SortIcon field="rank" />
                      </div>
                    </th>
                    <th
                      className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("lastAssessment")}
                    >
                      <div className="flex items-center gap-1">
                        Last Assessment
                        <SortIcon field="lastAssessment" />
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={student.name} size="sm" />
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">{student.year}</td>
                      <td className="py-4 px-6">
                        <Badge variant="outline">{student.branch}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-primary">#{student.rank}</span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(student.lastAssessment).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={student.status === "active" ? "success" : "secondary"}>
                          {student.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No students found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Student Profile Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Profile"
        description={selectedStudent?.email}
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar fallback={selectedStudent.name} size="lg" />
              <div>
                <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                <p className="text-muted-foreground">
                  {selectedStudent.branch} • Class of {selectedStudent.year}
                </p>
              </div>
              <Badge
                variant={selectedStudent.status === "active" ? "success" : "secondary"}
                className="ml-auto"
              >
                {selectedStudent.status}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">#{selectedStudent.rank}</p>
                <p className="text-sm text-muted-foreground">LayersRank</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Assessments</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1 gap-2">
                <Mail className="h-4 w-4" />
                Send Email
              </Button>
              <Button className="flex-1 gap-2">
                <ExternalLink className="h-4 w-4" />
                View Full Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
