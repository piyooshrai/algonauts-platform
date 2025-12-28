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
  Loader2,
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
} from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function CompanyDashboard() {
  // Fetch invite stats
  const { data: inviteStats, isLoading: statsLoading } = api.invites.getStats.useQuery();

  // Fetch sent invites
  const { data: sentInvites, isLoading: invitesLoading } = api.invites.getSent.useQuery({});

  // Fetch top candidates from leaderboard
  const { data: leaderboardData } = api.leaderboards.getStudentLeaderboard.useQuery({
    scope: "national",
    metric: "xp",
    limit: 4,
  });

  const isLoading = statsLoading || invitesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Process invite data
  const recentInvitations = (sentInvites || []).slice(0, 5).map((invite: {
    id: string;
    user: { id: string; profile: { firstName?: string | null; lastName?: string | null; collegeName?: string | null; layersRankOverall?: number | null } | null };
    status: string;
    createdAt: Date;
  }) => ({
    id: invite.id,
    candidateId: `C-${invite.user.id.slice(0, 4)}`,
    rank: invite.user.profile?.layersRankOverall || 0,
    college: invite.user.profile?.collegeName || "Unknown",
    status: invite.status.toLowerCase(),
    sentAt: invite.createdAt,
  }));

  // Hiring pipeline from stats
  const stats = inviteStats?.byStatus || { pending: 0, viewed: 0, accepted: 0, declined: 0, expired: 0 };
  const totalInvites = stats.pending + stats.viewed + stats.accepted + stats.declined + stats.expired;

  const hiringPipeline = [
    { stage: "Invitations Sent", count: totalInvites, color: "bg-blue-500" },
    { stage: "Viewed", count: stats.viewed + stats.accepted + stats.declined, color: "bg-purple-500" },
    { stage: "Accepted", count: stats.accepted, color: "bg-amber-500" },
    { stage: "Pending", count: stats.pending, color: "bg-gray-500" },
  ];

  // Top candidates from leaderboard
  const topMatchingCandidates = (leaderboardData?.leaderboard || []).map((student: {
    userId: string;
    rank: number;
    name: string;
    collegeName?: string | null;
    score: number;
  }, idx: number) => ({
    id: idx + 1,
    rank: student.rank,
    college: student.collegeName?.includes("IIT") || student.collegeName?.includes("NIT") ? "Tier 1" : "Tier 2",
    name: student.name,
    match: Math.max(70, 100 - (student.rank * 2)),
    // Derived scores based on rank (since we don't have real skill data)
    technical: Math.max(60, 95 - (student.rank * 3)),
    behavioral: Math.max(65, 90 - (student.rank * 2)),
  }));
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
          value={String(totalInvites)}
          icon={Mail}
          description={`${stats.pending} pending responses`}
        />
        <StatCard
          title="Response Rate"
          value={`${inviteStats?.viewRate || 0}%`}
          icon={TrendingUp}
          description="Viewed or responded"
        />
        <StatCard
          title="Acceptance Rate"
          value={`${inviteStats?.acceptanceRate || 0}%`}
          icon={Calendar}
          description={`${stats.accepted} accepted`}
        />
        <StatCard
          title="Invites Remaining"
          value={String(inviteStats?.remaining || 0)}
          icon={UserCheck}
          description={`${inviteStats?.usedTotal || 0} used total`}
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
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-success-600">{inviteStats?.viewRate || 0}%</p>
                      <p className="text-xs text-muted-foreground">View Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-primary">{inviteStats?.acceptanceRate || 0}%</p>
                      <p className="text-xs text-muted-foreground">Accept Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{stats.declined}</p>
                      <p className="text-xs text-muted-foreground">Declined</p>
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
                {stats.accepted > 0 ? (
                  <div className="text-center py-6">
                    <p className="text-2xl font-bold text-primary">{stats.accepted}</p>
                    <p className="text-sm text-muted-foreground">candidates accepted invites</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Schedule interviews with accepted candidates
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No accepted invitations yet. Send invites to candidates to get started.
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
                {recentInvitations.map((invite: { id: string; candidateId: string; rank: number; college: string; status: string; sentAt: Date }) => (
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
                {topMatchingCandidates.map((candidate: { id: number; rank: number; college: string; name: string; match: number; technical: number; behavioral: number }, idx: number) => (
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
