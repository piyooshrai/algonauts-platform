"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  MoreHorizontal,
  Send,
  RefreshCw,
  Filter,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Select,
  Modal,
  Avatar,
  Progress,
} from "@/components/ui";
import { api } from "@/lib/trpc/client";

type InvitationStatus = "pending" | "accepted" | "declined" | "expired" | "viewed";

interface Invitation {
  id: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  rank: number;
  collegeTier: string;
  collegeName?: string;
  role: string;
  status: InvitationStatus;
  sentAt: string;
  respondedAt?: string;
  expiresAt: string;
  technicalScore: number;
  behavioralScore: number;
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
];

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "Data Analyst", label: "Data Analyst" },
  { value: "Product Manager", label: "Product Manager" },
];

export default function InvitationsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  // Fetch invite stats
  const { data: inviteStats, isLoading: statsLoading } = api.invites.getStats.useQuery();

  // Fetch sent invites
  const { data: sentInvites, isLoading: invitesLoading, refetch } = api.invites.getSent.useQuery({});

  const isLoading = statsLoading || invitesLoading;

  // Transform API data to component format
  const invitations: Invitation[] = useMemo(() => {
    if (!sentInvites) return [];

    return sentInvites.map((invite: {
      id: string;
      user: {
        id: string;
        email: string;
        profile: {
          firstName?: string | null;
          lastName?: string | null;
          collegeName?: string | null;
          layersRankOverall?: number | null;
        } | null;
      };
      opportunity?: { title: string } | null;
      status: string;
      createdAt: Date;
      viewedAt?: Date | null;
      respondedAt?: Date | null;
      expiresAt: Date;
    }) => {
      const profile = invite.user.profile;
      const hasName = profile?.firstName && profile?.lastName;
      const collegeName = profile?.collegeName || "";
      const isIIT = collegeName.includes("IIT");
      const isNIT = collegeName.includes("NIT");
      const isTier1 = isIIT || isNIT || collegeName.includes("BITS");

      // Calculate derived scores based on rank
      const rank = profile?.layersRankOverall || 100;
      const baseScore = Math.max(60, 100 - (rank * 0.3));

      return {
        id: invite.id,
        candidateId: `C-${invite.user.id.slice(0, 4)}`,
        candidateName: hasName ? `${profile?.firstName} ${profile?.lastName}` : undefined,
        candidateEmail: invite.status === "ACCEPTED" ? invite.user.email : undefined,
        rank: rank,
        collegeTier: isTier1 ? "Tier 1" : "Tier 2",
        collegeName: invite.status === "ACCEPTED" ? collegeName : undefined,
        role: invite.opportunity?.title || "General Position",
        status: invite.status.toLowerCase() as InvitationStatus,
        sentAt: new Date(invite.createdAt).toISOString(),
        respondedAt: invite.respondedAt ? new Date(invite.respondedAt).toISOString() : undefined,
        expiresAt: new Date(invite.expiresAt).toISOString(),
        technicalScore: Math.round(baseScore + 5),
        behavioralScore: Math.round(baseScore),
      };
    });
  }, [sentInvites]);

  const filteredInvitations = invitations.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (roleFilter !== "all" && inv.role !== roleFilter) return false;
    return true;
  });

  const stats = inviteStats?.byStatus || { pending: 0, viewed: 0, accepted: 0, declined: 0, expired: 0 };
  const totalInvites = stats.pending + stats.viewed + stats.accepted + stats.declined + stats.expired;

  const getStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case "accepted":
        return <Badge variant="success">Accepted</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
    }
  };

  const getStatusIcon = (status: InvitationStatus) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-warning-500" />;
      case "declined":
        return <XCircle className="h-5 w-5 text-error-500" />;
      case "expired":
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Invitations</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all sent invitations
          </p>
        </div>
        <Button className="gap-2" onClick={() => window.location.href = "/admin/company/discover"}>
          <Send className="h-4 w-4" />
          Send New Invites
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter("all")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalInvites}</p>
                <p className="text-sm text-muted-foreground">Total Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter("pending")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning-500/10">
                <Clock className="h-5 w-5 text-warning-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter("accepted")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success-500/10">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.accepted}</p>
                <p className="text-sm text-muted-foreground">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter("declined")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-error-500/10">
                <XCircle className="h-5 w-5 text-error-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.declined}</p>
                <p className="text-sm text-muted-foreground">Declined</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter("expired")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expired}</p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-40"
              />
              <Select
                options={roleOptions}
                value={roleFilter}
                onChange={setRoleFilter}
                className="w-48"
              />
              {(statusFilter !== "all" || roleFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setRoleFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invitations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invitations ({filteredInvitations.length})</CardTitle>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Candidate</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Sent</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Expires</th>
                    <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.map((invitation) => (
                    <tr
                      key={invitation.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedInvitation(invitation)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(invitation.status)}
                          <div>
                            {invitation.candidateName ? (
                              <>
                                <p className="font-medium">{invitation.candidateName}</p>
                                <p className="text-sm text-muted-foreground">
                                  #{invitation.rank} • {invitation.collegeName}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium">{invitation.candidateId}</p>
                                <p className="text-sm text-muted-foreground">
                                  #{invitation.rank} • {invitation.collegeTier}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline">{invitation.role}</Badge>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(invitation.status)}</td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(invitation.sentAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        {invitation.status === "pending" ? (
                          <span
                            className={
                              getDaysRemaining(invitation.expiresAt) <= 2
                                ? "text-error-500 font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {getDaysRemaining(invitation.expiresAt)} days left
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInvitations.length === 0 && (
              <div className="py-12 text-center">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No invitations found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Invitation Detail Modal */}
      <Modal
        isOpen={!!selectedInvitation}
        onClose={() => setSelectedInvitation(null)}
        title={selectedInvitation?.candidateName || selectedInvitation?.candidateId || ""}
        description={selectedInvitation?.status === "accepted" ? "Profile visible" : "Anonymized preview"}
        size="lg"
      >
        {selectedInvitation && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                selectedInvitation.status === "accepted"
                  ? "bg-success-500/10 border border-success-500/20"
                  : selectedInvitation.status === "pending"
                  ? "bg-warning-500/10 border border-warning-500/20"
                  : selectedInvitation.status === "declined"
                  ? "bg-error-500/10 border border-error-500/20"
                  : "bg-muted border border-border"
              }`}
            >
              {getStatusIcon(selectedInvitation.status)}
              <div>
                <p className="font-medium">
                  {selectedInvitation.status === "accepted" && "Invitation Accepted"}
                  {selectedInvitation.status === "pending" && "Awaiting Response"}
                  {selectedInvitation.status === "declined" && "Invitation Declined"}
                  {selectedInvitation.status === "expired" && "Invitation Expired"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedInvitation.respondedAt
                    ? `Responded on ${new Date(selectedInvitation.respondedAt).toLocaleDateString()}`
                    : `Sent on ${new Date(selectedInvitation.sentAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            {/* Candidate Info */}
            {selectedInvitation.status === "accepted" && selectedInvitation.candidateName ? (
              <div className="flex items-center gap-4">
                <Avatar fallback={selectedInvitation.candidateName} size="lg" />
                <div>
                  <h3 className="text-xl font-semibold">{selectedInvitation.candidateName}</h3>
                  <p className="text-muted-foreground">{selectedInvitation.candidateEmail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{selectedInvitation.collegeName}</Badge>
                    <Badge variant="outline">Rank #{selectedInvitation.rank}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">?</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedInvitation.candidateId}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={selectedInvitation.collegeTier === "Tier 1" ? "gold" : "silver"}
                    >
                      {selectedInvitation.collegeTier}
                    </Badge>
                    <Badge variant="outline">Rank #{selectedInvitation.rank}</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Technical Score</span>
                  <span className="font-semibold">{selectedInvitation.technicalScore}%</span>
                </div>
                <Progress value={selectedInvitation.technicalScore} />
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Behavioral Score</span>
                  <span className="font-semibold">{selectedInvitation.behavioralScore}%</span>
                </div>
                <Progress value={selectedInvitation.behavioralScore} />
              </div>
            </div>

            {/* Role */}
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applied For</p>
                  <p className="font-medium">{selectedInvitation.role}</p>
                </div>
                <Badge variant="outline">{selectedInvitation.id}</Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {selectedInvitation.status === "accepted" && (
                <>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Interview
                  </Button>
                  <Button className="flex-1 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Full Profile
                  </Button>
                </>
              )}
              {selectedInvitation.status === "pending" && (
                <>
                  <Button variant="outline" className="flex-1">
                    Cancel Invitation
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Send className="h-4 w-4" />
                    Send Reminder
                  </Button>
                </>
              )}
              {(selectedInvitation.status === "declined" ||
                selectedInvitation.status === "expired") && (
                <Button className="flex-1 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Resend Invitation
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
