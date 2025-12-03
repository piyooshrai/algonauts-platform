"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Trophy,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  BarChart3,
  Target,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Avatar,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";

// Mock cohort data
const cohortData = [
  {
    year: 2025,
    totalStudents: 312,
    activeStudents: 298,
    avgRank: 245,
    prevAvgRank: 267,
    assessmentCompletion: 82,
    topPerformers: [
      { name: "Priya Sharma", rank: 12, branch: "CS", score: 94 },
      { name: "Rahul Verma", rank: 28, branch: "ECE", score: 91 },
      { name: "Vikram Singh", rank: 67, branch: "ME", score: 87 },
    ],
    branchDistribution: [
      { branch: "Computer Science", count: 98, avgRank: 189 },
      { branch: "Electronics", count: 76, avgRank: 234 },
      { branch: "Mechanical", count: 54, avgRank: 312 },
      { branch: "Information Technology", count: 48, avgRank: 267 },
      { branch: "Civil", count: 36, avgRank: 389 },
    ],
    scoreDistribution: {
      technical: 78,
      behavioral: 82,
      contextual: 71,
    },
    placementStats: {
      placed: 0,
      interviewing: 45,
      invites: 156,
    },
  },
  {
    year: 2024,
    totalStudents: 287,
    activeStudents: 245,
    avgRank: 312,
    prevAvgRank: 356,
    assessmentCompletion: 94,
    topPerformers: [
      { name: "Ananya Patel", rank: 45, branch: "CS", score: 89 },
      { name: "Neha Gupta", rank: 89, branch: "IT", score: 85 },
      { name: "Arjun Desai", rank: 112, branch: "ECE", score: 83 },
    ],
    branchDistribution: [
      { branch: "Computer Science", count: 89, avgRank: 256 },
      { branch: "Electronics", count: 72, avgRank: 298 },
      { branch: "Mechanical", count: 48, avgRank: 378 },
      { branch: "Information Technology", count: 45, avgRank: 312 },
      { branch: "Civil", count: 33, avgRank: 423 },
    ],
    scoreDistribution: {
      technical: 75,
      behavioral: 79,
      contextual: 68,
    },
    placementStats: {
      placed: 156,
      interviewing: 67,
      invites: 289,
    },
  },
  {
    year: 2023,
    totalStudents: 254,
    activeStudents: 12,
    avgRank: 456,
    prevAvgRank: 489,
    assessmentCompletion: 98,
    topPerformers: [
      { name: "Sanjay Kumar", rank: 78, branch: "CS", score: 87 },
      { name: "Meera Nair", rank: 134, branch: "IT", score: 81 },
      { name: "Rohan Joshi", rank: 189, branch: "ME", score: 78 },
    ],
    branchDistribution: [
      { branch: "Computer Science", count: 82, avgRank: 389 },
      { branch: "Electronics", count: 65, avgRank: 434 },
      { branch: "Mechanical", count: 42, avgRank: 512 },
      { branch: "Information Technology", count: 38, avgRank: 467 },
      { branch: "Civil", count: 27, avgRank: 578 },
    ],
    scoreDistribution: {
      technical: 72,
      behavioral: 76,
      contextual: 65,
    },
    placementStats: {
      placed: 234,
      interviewing: 8,
      invites: 312,
    },
  },
];

export default function CohortsPage() {
  const [selectedYear, setSelectedYear] = useState("2025");

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Cohorts</h1>
          <p className="text-muted-foreground mt-1">
            View and compare student performance by graduation year
          </p>
        </div>
      </motion.div>

      {/* Cohort Selector */}
      <Tabs defaultValue="2025" value={selectedYear} onValueChange={setSelectedYear}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="2025">Class of 2025</TabsTrigger>
          <TabsTrigger value="2024">Class of 2024</TabsTrigger>
          <TabsTrigger value="2023">Class of 2023</TabsTrigger>
        </TabsList>

        {cohortData.map((cohort) => (
          <TabsContent key={cohort.year} value={cohort.year.toString()} className="mt-6">
            {/* Overview Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                      <p className="text-3xl font-bold font-display mt-2">{cohort.totalStudents}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cohort.activeStudents} active
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Rank</p>
                      <p className="text-3xl font-bold font-display mt-2">#{cohort.avgRank}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {cohort.avgRank < cohort.prevAvgRank ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-success-500" />
                            <span className="text-sm text-success-600">
                              +{cohort.prevAvgRank - cohort.avgRank} positions
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-error-500" />
                            <span className="text-sm text-error-600">
                              -{cohort.avgRank - cohort.prevAvgRank} positions
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10">
                      <Trophy className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assessment Completion</p>
                      <p className="text-3xl font-bold font-display mt-2">{cohort.assessmentCompletion}%</p>
                      <Progress value={cohort.assessmentCompletion} size="sm" className="mt-2 w-24" />
                    </div>
                    <div className="p-3 rounded-lg bg-success-500/10">
                      <Target className="h-6 w-6 text-success-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Placements</p>
                      <p className="text-3xl font-bold font-display mt-2">{cohort.placementStats.placed}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cohort.placementStats.interviewing} interviewing
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <Award className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3 mt-6">
              {/* Top Performers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Top Performers
                    </CardTitle>
                    <CardDescription>Best ranked students in this cohort</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cohort.topPerformers.map((student, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold text-sm">
                            {idx + 1}
                          </div>
                          <Avatar fallback={student.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.branch}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">#{student.rank}</p>
                            <p className="text-xs text-muted-foreground">{student.score}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Score Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Score Distribution
                    </CardTitle>
                    <CardDescription>Average scores by category</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Technical</span>
                        <span className="text-sm font-semibold">{cohort.scoreDistribution.technical}%</span>
                      </div>
                      <Progress
                        value={cohort.scoreDistribution.technical}
                        variant={cohort.scoreDistribution.technical >= 75 ? "success" : "default"}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Behavioral</span>
                        <span className="text-sm font-semibold">{cohort.scoreDistribution.behavioral}%</span>
                      </div>
                      <Progress
                        value={cohort.scoreDistribution.behavioral}
                        variant={cohort.scoreDistribution.behavioral >= 75 ? "success" : "default"}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Contextual</span>
                        <span className="text-sm font-semibold">{cohort.scoreDistribution.contextual}%</span>
                      </div>
                      <Progress
                        value={cohort.scoreDistribution.contextual}
                        variant={cohort.scoreDistribution.contextual >= 75 ? "success" : "warning"}
                      />
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Overall Average</span>
                        <span className="text-lg font-bold">
                          {Math.round(
                            (cohort.scoreDistribution.technical +
                              cohort.scoreDistribution.behavioral +
                              cohort.scoreDistribution.contextual) /
                              3
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Branch Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      By Branch
                    </CardTitle>
                    <CardDescription>Student distribution and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cohort.branchDistribution.map((branch, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: [
                                  "#2563eb",
                                  "#7c3aed",
                                  "#059669",
                                  "#dc2626",
                                  "#d97706",
                                ][idx],
                              }}
                            />
                            <div>
                              <p className="font-medium">{branch.branch}</p>
                              <p className="text-sm text-muted-foreground">
                                {branch.count} students
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Avg #{branch.avgRank}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Comparison Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Comparison</CardTitle>
                  <CardDescription>Compare performance across graduation years</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            Cohort
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            Students
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            Avg Rank
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            Completion
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            Technical
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            Placements
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cohortData.map((c) => (
                          <tr
                            key={c.year}
                            className={`border-b border-border hover:bg-muted/30 ${
                              c.year.toString() === selectedYear ? "bg-primary/5" : ""
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Class of {c.year}</span>
                                {c.year.toString() === selectedYear && (
                                  <Badge variant="info" className="text-xs">
                                    Selected
                                  </Badge>
                                )}
                                {c.year === 2025 && (
                                  <Badge variant="success" className="text-xs">
                                    Current
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">{c.totalStudents}</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-primary">#{c.avgRank}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Progress value={c.assessmentCompletion} size="sm" className="w-16" />
                                <span className="text-sm">{c.assessmentCompletion}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{c.scoreDistribution.technical}%</td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  c.placementStats.placed > 0 ? "success" : "secondary"
                                }
                              >
                                {c.placementStats.placed} placed
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
