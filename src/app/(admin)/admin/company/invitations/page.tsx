"use client";

import { useState } from "react";
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

type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

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

// Mock invitations data
const mockInvitations: Invitation[] = [
  {
    id: "INV-001",
    candidateId: "C-2458",
    candidateName: "Priya Sharma",
    candidateEmail: "priya.sharma@college.edu",
    rank: 45,
    collegeTier: "Tier 1",
    collegeName: "IIT Delhi",
    role: "Software Engineer",
    status: "accepted",
    sentAt: "2024-01-15",
    respondedAt: "2024-01-16",
    expiresAt: "2024-01-22",
    technicalScore: 92,
    behavioralScore: 88,
  },
  {
    id: "INV-002",
    candidateId: "C-1892",
    rank: 67,
    collegeTier: "Tier 1",
    role: "Data Analyst",
    status: "pending",
    sentAt: "2024-01-14",
    expiresAt: "2024-01-21",
    technicalScore: 85,
    behavioralScore: 82,
  },
  {
    id: "INV-003",
    candidateId: "C-3215",
    rank: 89,
    collegeTier: "Tier 2",
    role: "Software Engineer",
    status: "pending",
    sentAt: "2024-01-14",
    expiresAt: "2024-01-21",
    technicalScore: 78,
    behavioralScore: 84,
  },
  {
    id: "INV-004",
    candidateId: "C-2876",
    rank: 112,
    collegeTier: "Tier 1",
    role: "Product Manager",
    status: "declined",
    sentAt: "2024-01-13",
    respondedAt: "2024-01-14",
    expiresAt: "2024-01-20",
    technicalScore: 81,
    behavioralScore: 79,
  },
  {
    id: "INV-005",
    candidateId: "C-1654",
    candidateName: "Rahul Verma",
    candidateEmail: "rahul.verma@college.edu",
    rank: 34,
    collegeTier: "Tier 1",
    collegeName: "BITS Pilani",
    role: "Software Engineer",
    status: "accepted",
    sentAt: "2024-01-12",
    respondedAt: "2024-01-13",
    expiresAt: "2024-01-19",
    technicalScore: 94,
    behavioralScore: 91,
  },
  {
    id: "INV-006",
    candidateId: "C-4521",
    rank: 156,
    collegeTier: "Tier 2",
    role: "Data Analyst",
    status: "expired",
    sentAt: "2024-01-05",
    expiresAt: "2024-01-12",
    technicalScore: 75,
    behavioralScore: 72,
  },
  {
    id: "INV-007",
    candidateId: "C-3897",
    candidateName: "Ananya Patel",
    candidateEmail: "ananya.patel@college.edu",
    rank: 78,
    collegeTier: "Tier 1",
    collegeName: "IIT Bombay",
    role: "Software Engineer",
    status: "accepted",
    sentAt: "2024-01-10",
    respondedAt: "2024-01-11",
    expiresAt: "2024-01-17",
    technicalScore: 89,
    behavioralScore: 86,
  },
];

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

  const filteredInvitations = mockInvitations.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (roleFilter !== "all" && inv.role !== roleFilter) return false;
    return true;
  });

  const stats = {
    total: mockInvitations.length,
    pending: mockInvitations.filter((i) => i.status === "pending").length,
    accepted: mockInvitations.filter((i) => i.status === "accepted").length,
    declined: mockInvitations.filter((i) => i.status === "declined").length,
    expired: mockInvitations.filter((i) => i.status === "expired").length,
  };

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
                <p className="text-2xl font-bold">{stats.total}</p>
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
            <Button variant="outline" size="sm" className="gap-2">
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
