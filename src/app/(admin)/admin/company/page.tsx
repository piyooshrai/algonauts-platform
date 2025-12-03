"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Users,
  Calendar,
  UserCheck,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Progress,
  Avatar,
} from "@/components/ui";

// Mock data
const recentInvitations = [
  { id: 1, candidateId: "C-2458", rank: 45, college: "IIT Delhi", status: "accepted", sentAt: "2024-01-15" },
  { id: 2, candidateId: "C-1892", rank: 67, college: "IIT Bombay", status: "pending", sentAt: "2024-01-14" },
  { id: 3, candidateId: "C-3215", rank: 89, college: "NIT Trichy", status: "pending", sentAt: "2024-01-14" },
  { id: 4, candidateId: "C-2876", rank: 112, college: "IIT Madras", status: "declined", sentAt: "2024-01-13" },
  { id: 5, candidateId: "C-1654", rank: 34, college: "BITS Pilani", status: "accepted", sentAt: "2024-01-12" },
];

const upcomingInterviews = [
  { id: 1, candidate: "Priya S.", role: "Software Engineer", date: "2024-01-20", time: "10:00 AM" },
  { id: 2, candidate: "Rahul V.", role: "Data Analyst", date: "2024-01-20", time: "2:00 PM" },
  { id: 3, candidate: "Ananya P.", role: "Product Manager", date: "2024-01-21", time: "11:00 AM" },
];

const hiringPipeline = [
  { stage: "Invitations Sent", count: 156, color: "bg-blue-500" },
  { stage: "Accepted", count: 89, color: "bg-purple-500" },
  { stage: "Interviewed", count: 45, color: "bg-amber-500" },
  { stage: "Offers Made", count: 23, color: "bg-green-500" },
  { stage: "Hired", count: 18, color: "bg-primary" },
];

const topMatchingCandidates = [
  { id: 1, rank: 23, college: "Tier 1", technical: 92, behavioral: 88, match: 95 },
  { id: 2, rank: 45, college: "Tier 1", technical: 89, behavioral: 91, match: 92 },
  { id: 3, rank: 67, college: "Tier 1", technical: 87, behavioral: 85, match: 88 },
  { id: 4, rank: 89, college: "Tier 2", technical: 85, behavioral: 82, match: 84 },
];

export default function CompanyDashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge variant="success">Accepted</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-success-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning-500" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-error-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

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
            Company Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your hiring pipeline and candidate engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">Invite Credits</p>
            <p className="text-xl font-bold text-primary">47 remaining</p>
          </div>
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
          title="Active Invitations"
          value="156"
          icon={Mail}
          change={{ value: 23, positive: true }}
          description="Total sent this month"
        />
        <StatCard
          title="Response Rate"
          value="57%"
          icon={TrendingUp}
          change={{ value: 8, positive: true }}
          description="Above industry avg"
        />
        <StatCard
          title="Interviews Scheduled"
          value="12"
          icon={Calendar}
          description="This week"
        />
        <StatCard
          title="Hires Made"
          value="18"
          icon={UserCheck}
          change={{ value: 3, positive: true }}
          description="This quarter"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hiring Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Hiring Pipeline</CardTitle>
              <CardDescription>Track candidates through your hiring process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Pipeline Visualization */}
                <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden">
                  {hiringPipeline.map((stage, idx) => (
                    <div
                      key={idx}
                      className={`h-full ${stage.color} flex items-center justify-center text-white text-xs font-medium transition-all`}
                      style={{ width: `${(stage.count / hiringPipeline[0].count) * 100}%` }}
                    >
                      {stage.count > 20 && stage.count}
                    </div>
                  ))}
                </div>

                {/* Pipeline Details */}
                <div className="grid grid-cols-5 gap-4">
                  {hiringPipeline.map((stage, idx) => (
                    <div key={idx} className="text-center">
                      <div className={`w-3 h-3 rounded-full ${stage.color} mx-auto mb-2`} />
                      <p className="text-2xl font-bold">{stage.count}</p>
                      <p className="text-xs text-muted-foreground">{stage.stage}</p>
                    </div>
                  ))}
                </div>

                {/* Conversion Rates */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-3">Conversion Rates</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-success-600">57%</p>
                      <p className="text-xs text-muted-foreground">Accept Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">51%</p>
                      <p className="text-xs text-muted-foreground">Interview Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">51%</p>
                      <p className="text-xs text-muted-foreground">Offer Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-primary">78%</p>
                      <p className="text-xs text-muted-foreground">Hire Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Interviews
                </CardTitle>
              </div>
              <a
                href="/admin/company/invitations"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <Avatar fallback={interview.candidate} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{interview.candidate}</p>
                      <p className="text-sm text-muted-foreground">{interview.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(interview.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">{interview.time}</p>
                    </div>
                  </div>
                ))}

                {upcomingInterviews.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No upcoming interviews scheduled
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Invitations & Top Candidates */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Recent Invitations
              </CardTitle>
              <a
                href="/admin/company/invitations"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentInvitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {getStatusIcon(invite.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{invite.candidateId}</p>
                      <p className="text-sm text-muted-foreground">
                        Rank #{invite.rank} • {invite.college}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(invite.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(invite.sentAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Matching Candidates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Top Matching Candidates
              </CardTitle>
              <a
                href="/admin/company/discover"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Discover more
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topMatchingCandidates.map((candidate, idx) => (
                  <div
                    key={candidate.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">Candidate #{candidate.rank}</p>
                          <Badge variant="outline" className="text-xs">
                            {candidate.college}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{candidate.match}%</p>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Technical</span>
                          <span className="font-medium">{candidate.technical}%</span>
                        </div>
                        <Progress value={candidate.technical} size="sm" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Behavioral</span>
                          <span className="font-medium">{candidate.behavioral}%</span>
                        </div>
                        <Progress value={candidate.behavioral} size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
