"use client";

import { motion } from "framer-motion";
import {
  Users,
  ClipboardCheck,
  Trophy,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { StatCard } from "@/components";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  Progress,
} from "@/components/ui";

// Mock data for dashboard
const topPerformers = [
  { id: 1, name: "Priya Sharma", rank: 12, branch: "Computer Science", year: 2025, score: 94 },
  { id: 2, name: "Rahul Verma", rank: 28, branch: "Electronics", year: 2025, score: 91 },
  { id: 3, name: "Ananya Patel", rank: 45, branch: "Computer Science", year: 2024, score: 89 },
  { id: 4, name: "Vikram Singh", rank: 67, branch: "Mechanical", year: 2025, score: 87 },
  { id: 5, name: "Neha Gupta", rank: 89, branch: "Information Technology", year: 2024, score: 85 },
];

const recentAssessments = [
  { id: 1, name: "Technical Assessment Q4", completionRate: 78, totalStudents: 245, date: "2024-01-15" },
  { id: 2, name: "Behavioral Skills Test", completionRate: 92, totalStudents: 312, date: "2024-01-10" },
  { id: 3, name: "Problem Solving Challenge", completionRate: 65, totalStudents: 189, date: "2024-01-05" },
];

const cohortStats = [
  { year: 2025, students: 312, avgRank: 245, completionRate: 82 },
  { year: 2024, students: 287, avgRank: 312, completionRate: 94 },
  { year: 2023, students: 254, avgRank: 456, completionRate: 98 },
];

export default function CollegeAdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            College Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of student performance and assessments
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Last updated: Today at 9:30 AM</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Students"
          value="853"
          icon={Users}
          change={{ value: 12, positive: true }}
          description="Enrolled students"
        />
        <StatCard
          title="Assessment Completion"
          value="84%"
          icon={ClipboardCheck}
          change={{ value: 5, positive: true }}
          description="Average completion rate"
        />
        <StatCard
          title="Average LayersRank"
          value="#312"
          icon={Trophy}
          change={{ value: 8, positive: true }}
          description="National average position"
        />
        <StatCard
          title="Top 100 Students"
          value="23"
          icon={TrendingUp}
          change={{ value: 3, positive: true }}
          description="In national rankings"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top Performers
              </CardTitle>
              <a
                href="/admin/college/students"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold text-sm">
                      {index + 1}
                    </div>
                    <Avatar fallback={student.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.branch} • Class of {student.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">#{student.rank}</p>
                      <p className="text-xs text-muted-foreground">{student.score}% score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cohort Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Cohort Overview
              </CardTitle>
              <a
                href="/admin/college/cohorts"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Details
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cohortStats.map((cohort) => (
                  <div key={cohort.year} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Class of {cohort.year}</span>
                        {cohort.year === 2025 && (
                          <Badge variant="info">Current</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {cohort.students} students
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Avg Rank</p>
                        <p className="font-semibold">#{cohort.avgRank}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completion</p>
                        <p className="font-semibold">{cohort.completionRate}%</p>
                      </div>
                    </div>
                    <Progress value={cohort.completionRate} size="sm" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Assessments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Recent Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assessment</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Students</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Completion Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{assessment.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(assessment.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">{assessment.totalStudents}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Progress value={assessment.completionRate} size="sm" className="w-24" />
                          <span className="text-sm font-medium">{assessment.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={assessment.completionRate >= 80 ? "success" : assessment.completionRate >= 60 ? "warning" : "destructive"}>
                          {assessment.completionRate >= 80 ? "Good" : assessment.completionRate >= 60 ? "Moderate" : "Low"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
