"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Brain,
  Calendar,
  Clock,
  MessageSquare,
  Layers,
  TrendingUp,
  Target,
  Building2,
  ChevronRight,
  Play,
  Award,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from "@/components/ui";
import { LayersRank } from "@/components/layers-rank";

const upcomingAssessments = [
  {
    id: 1,
    title: "Q4 Technical Assessment",
    type: "Technical",
    date: "Dec 15, 2025",
    time: "10:00 AM",
    duration: "90 min",
    icon: Brain,
    color: "blue",
  },
  {
    id: 2,
    title: "Behavioral Evaluation",
    type: "Behavioral",
    date: "Dec 18, 2025",
    time: "2:00 PM",
    duration: "45 min",
    icon: MessageSquare,
    color: "purple",
  },
  {
    id: 3,
    title: "System Design Challenge",
    type: "Contextual",
    date: "Dec 22, 2025",
    time: "11:00 AM",
    duration: "60 min",
    icon: Layers,
    color: "green",
  },
];

const recentOpportunities = [
  {
    id: 1,
    company: "Google",
    role: "Software Engineer Intern",
    location: "Bangalore",
    salary: "₹80K/month",
    match: 95,
    logo: "G",
  },
  {
    id: 2,
    company: "Microsoft",
    role: "Full Stack Developer",
    location: "Hyderabad",
    salary: "₹18 LPA",
    match: 88,
    logo: "M",
  },
  {
    id: 3,
    company: "Stripe",
    role: "Backend Engineer",
    location: "Remote",
    salary: "$120K",
    match: 82,
    logo: "S",
  },
];

const skillProgress = [
  { name: "Data Structures", score: 85, trend: "+5" },
  { name: "System Design", score: 72, trend: "+12" },
  { name: "Algorithms", score: 90, trend: "+3" },
  { name: "Communication", score: 78, trend: "+8" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, John!</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your profile today.
          </p>
        </div>
        <Link href="/assessments">
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Take Assessment
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LayersRank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden" hover>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
            <CardContent className="p-6">
              <LayersRank rank={247} totalUsers={50000} size="sm" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Technical Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <Badge variant="success" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12%
                </Badge>
              </div>
              <p className="text-3xl font-bold font-display">847</p>
              <p className="text-sm text-muted-foreground">Technical Score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assessments Completed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
                  <Target className="h-5 w-5 text-success-600" />
                </div>
                <span className="text-xs text-muted-foreground">This quarter</span>
              </div>
              <p className="text-3xl font-bold font-display">12</p>
              <p className="text-sm text-muted-foreground">Assessments Taken</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Company Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900/30">
                  <Building2 className="h-5 w-5 text-warning-600" />
                </div>
                <Badge variant="warning" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Hot
                </Badge>
              </div>
              <p className="text-3xl font-bold font-display">34</p>
              <p className="text-sm text-muted-foreground">Profile Views</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Assessments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Upcoming Assessments
              </CardTitle>
              <Link href="/assessments">
                <Button variant="ghost" size="sm">
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`p-3 rounded-lg ${
                      assessment.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : assessment.color === "purple"
                        ? "bg-purple-100 dark:bg-purple-900/30"
                        : "bg-green-100 dark:bg-green-900/30"
                    }`}
                  >
                    <assessment.icon
                      className={`h-5 w-5 ${
                        assessment.color === "blue"
                          ? "text-blue-600"
                          : assessment.color === "purple"
                          ? "text-purple-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{assessment.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {assessment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {assessment.time}
                      </span>
                      <span>{assessment.duration}</span>
                    </div>
                  </div>
                  <Badge variant="outline">{assessment.type}</Badge>
                  <Button size="sm">Start</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Skill Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                Skill Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {skillProgress.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{skill.score}%</span>
                      <span className="text-success-600 text-xs">{skill.trend}</span>
                    </div>
                  </div>
                  <Progress value={skill.score} size="sm" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Opportunities Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Matched Opportunities
            </CardTitle>
            <Link href="/opportunities">
              <Button variant="ghost" size="sm">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-lg">
                      {opportunity.logo}
                    </div>
                    <Badge variant="success">{opportunity.match}% match</Badge>
                  </div>
                  <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                    {opportunity.role}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {opportunity.company} · {opportunity.location}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-success-600">
                      {opportunity.salary}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
