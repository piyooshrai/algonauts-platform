"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  ChevronRight,
  Loader2,
  Send,
  UserCheck,
  Star,
  Award,
  PartyPopper,
  DollarSign,
  Lock,
  Share2,
  X,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button, Card, CardContent, Badge, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

// Status config for applications
const statusConfig: Record<string, { icon: typeof Clock; color: string; bgColor: string; label: string }> = {
  DRAFT: { icon: FileText, color: "text-[#6B7280]", bgColor: "bg-[#F3F4F6]", label: "Draft" },
  SUBMITTED: { icon: Send, color: "text-[#0EA5E9]", bgColor: "bg-[#E0F2FE]", label: "Submitted" },
  UNDER_REVIEW: { icon: AlertCircle, color: "text-[#F59E0B]", bgColor: "bg-[#FEF3C7]", label: "Under Review" },
  SHORTLISTED: { icon: Star, color: "text-[#8B5CF6]", bgColor: "bg-[#EDE9FE]", label: "Shortlisted" },
  INTERVIEW_SCHEDULED: { icon: Calendar, color: "text-[#3B82F6]", bgColor: "bg-[#DBEAFE]", label: "Interview" },
  OFFER_EXTENDED: { icon: CheckCircle2, color: "text-[#10B981]", bgColor: "bg-[#D1FAE5]", label: "Offer Extended" },
  OFFER_ACCEPTED: { icon: UserCheck, color: "text-[#10B981]", bgColor: "bg-[#D1FAE5]", label: "Offer Accepted" },
  REJECTED: { icon: XCircle, color: "text-[#EF4444]", bgColor: "bg-[#FEE2E2]", label: "Rejected" },
  WITHDRAWN: { icon: XCircle, color: "text-[#6B7280]", bgColor: "bg-[#F3F4F6]", label: "Withdrawn" },
};

// Rarity colors for badges
const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600" },
  uncommon: { bg: "bg-green-100", border: "border-green-400", text: "text-green-700" },
  rare: { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-700" },
  epic: { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-700" },
  legendary: { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-700" },
};

type TabType = "applications" | "placements" | "achievements";

function ActivityContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("applications");
  const [showSuccess, setShowSuccess] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [stillEmployed, setStillEmployed] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const utils = api.useUtils();

  // Withdraw mutation
  const withdrawMutation = api.applications.withdraw.useMutation({
    onSuccess: () => {
      setWithdrawingId(null);
      utils.applications.getMyApplications.invalidate();
    },
  });

  // Check for success message or tab param
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && ["applications", "placements", "achievements"].includes(tab)) {
      setActiveTab(tab);
    }
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      window.history.replaceState({}, "", "/activity");
    }
  }, [searchParams]);

  // Fetch data for all tabs
  const { data: applicationsData, isLoading: applicationsLoading } = api.applications.getMyApplications.useQuery();
  const { data: placementsData, isLoading: placementsLoading, refetch: refetchPlacements } = api.placements.getMyPlacements.useQuery();
  const { data: badgesData, isLoading: badgesLoading } = api.badges.getAll.useQuery({});

  // Verification mutations
  const verify30Mutation = api.placements.complete30DayVerification.useMutation({
    onSuccess: () => {
      setVerifyingId(null);
      refetchPlacements();
    },
  });

  const verify90Mutation = api.placements.complete90DayVerification.useMutation({
    onSuccess: () => {
      setVerifyingId(null);
      refetchPlacements();
    },
  });

  // Share mutation
  const shareMutation = api.badges.share.useMutation();

  const applications = applicationsData?.applications || [];
  const placements = placementsData || [];
  const badges = badgesData?.badges || [];
  const badgeStats = badgesData?.stats || { total: 0, earned: 0, completion: 0 };

  const isLoading = applicationsLoading || placementsLoading || badgesLoading;

  // Calculate application stats
  const appStats = {
    total: applications.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    underReview: applications.filter((a: any) => a.status === "UNDER_REVIEW" || a.status === "SUBMITTED").length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shortlisted: applications.filter((a: any) => a.status === "SHORTLISTED" || a.status === "INTERVIEW_SCHEDULED" || a.status === "OFFER_EXTENDED").length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rejected: applications.filter((a: any) => a.status === "REJECTED").length,
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/activity?tab=${tab}`, { scroll: false });
  };

  const handleVerify = (placementId: string, type: "30" | "90") => {
    if (type === "30") {
      verify30Mutation.mutate({ placementId, stillEmployed, notes: verificationNotes });
    } else {
      verify90Mutation.mutate({ placementId, stillEmployed, notes: verificationNotes });
    }
  };

  const handleBadgeShare = async (badgeId: string, platform: "whatsapp" | "linkedin" | "twitter" | "copy") => {
    const result = await shareMutation.mutateAsync({ badgeId, platform });
    if (platform === "copy") {
      navigator.clipboard.writeText(result.shareUrl);
      alert("Link copied to clipboard!");
    } else {
      window.open(result.shareLink, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  const tabs = [
    { id: "applications" as TabType, label: "Applications", count: applications.length, icon: FileText },
    { id: "placements" as TabType, label: "Placements", count: placements.length, icon: PartyPopper, hide: placements.length === 0 },
    { id: "achievements" as TabType, label: "Achievements", count: badgeStats.earned, icon: Award },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-[#D1FAE5] border border-[#10B981]/30 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
          <div>
            <p className="font-medium text-[#047857]">Application submitted successfully!</p>
            <p className="text-sm text-[#059669]">You&apos;ll be notified when there&apos;s an update.</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">My Activity</h1>
        <p className="text-[#6B7280] mt-1">Track your applications, placements, and achievements</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB]">
        <nav className="flex gap-4">
          {tabs.filter(t => !t.hide).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                activeTab === tab.id
                  ? "border-[#0EA5E9] text-[#0EA5E9]"
                  : "border-transparent text-[#6B7280] hover:text-[#1F2937] hover:border-[#E5E7EB]"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {tab.count}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
              <p className="text-2xl font-bold text-[#1F2937]">{appStats.total}</p>
              <p className="text-sm text-[#6B7280]">Total Applications</p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
              <p className="text-2xl font-bold text-[#F59E0B]">{appStats.underReview}</p>
              <p className="text-sm text-[#6B7280]">In Progress</p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
              <p className="text-2xl font-bold text-[#10B981]">{appStats.shortlisted}</p>
              <p className="text-sm text-[#6B7280]">Shortlisted</p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
              <p className="text-2xl font-bold text-[#EF4444]">{appStats.rejected}</p>
              <p className="text-sm text-[#6B7280]">Rejected</p>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
            <div className="p-5 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0EA5E9]" />
                <h2 className="text-lg font-semibold text-[#1F2937]">Applications</h2>
              </div>
            </div>

            {applications.length > 0 ? (
              <div className="divide-y divide-[#E5E7EB]">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {applications.map((app: any) => {
                  const status = statusConfig[app.status] || statusConfig.SUBMITTED;
                  const StatusIcon = status.icon;

                  const canWithdraw = ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(app.status);

                  return (
                    <div
                      key={app.id}
                      className="p-5 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <div className="flex gap-4">
                        <Link
                          href={`/opportunities/${app.opportunityId}`}
                          className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        >
                          {app.opportunity?.company?.companyName?.substring(0, 2).toUpperCase() || "CO"}
                        </Link>
                        <Link href={`/opportunities/${app.opportunityId}`} className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-[#1F2937]">{app.opportunity?.title || "Position"}</h3>
                              <p className="text-sm text-[#6B7280]">{app.opportunity?.company?.companyName || "Company"}</p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 ${status.bgColor} ${status.color} text-sm font-medium rounded-full`}>
                              <StatusIcon className="h-4 w-4" />
                              {status.label}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-[#6B7280]">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {app.opportunity?.isRemote ? "Remote" : app.opportunity?.locations?.[0] || "Location TBD"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Applied {formatDate(new Date(app.submittedAt || app.createdAt))}
                            </span>
                          </div>
                        </Link>
                        <div className="flex items-start gap-2">
                          {canWithdraw && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#EF4444] hover:text-[#DC2626] hover:bg-red-50"
                              onClick={(e) => {
                                e.preventDefault();
                                setWithdrawingId(app.id);
                              }}
                            >
                              Withdraw
                            </Button>
                          )}
                          <Link href={`/opportunities/${app.opportunityId}`}>
                            <ChevronRight className="h-5 w-5 text-[#D1D5DB] mt-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1F2937] mb-1">No applications yet</h3>
                <p className="text-[#6B7280] mb-4">Start applying to opportunities to track them here</p>
                <Link href="/opportunities">
                  <Button className="gap-2">
                    Browse Jobs
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "placements" && (
        <div className="space-y-6">
          {/* Report Placement Button */}
          <div className="flex justify-end">
            <Link href="/placements/report">
              <Button className="gap-2">
                <PartyPopper className="h-4 w-4" />
                Report Placement
              </Button>
            </Link>
          </div>

          {/* Placements List */}
          {placements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <PartyPopper className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No placements yet</h3>
                <p className="text-[#6B7280] mb-4">Report your placement when you get an offer to start tracking</p>
                <Link href="/placements/report">
                  <Button className="gap-2">
                    <PartyPopper className="h-4 w-4" />
                    Report Placement
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {placements.map((placement: any) => (
                <Card key={placement.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-14 h-14 rounded-lg bg-[#E0F2FE] flex items-center justify-center text-[#0EA5E9] font-bold text-xl">
                            {placement.companyName?.substring(0, 2).toUpperCase() || "CO"}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#1F2937]">{placement.companyName}</h3>
                            <p className="text-[#6B7280]">{placement.jobTitle}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {placement.location && (
                            <div className="flex items-center gap-2 text-[#6B7280]">
                              <MapPin className="h-4 w-4" />
                              {placement.location}
                            </div>
                          )}
                          {placement.salaryOffered && (
                            <div className="flex items-center gap-2 text-[#10B981] font-medium">
                              <DollarSign className="h-4 w-4" />
                              {(placement.salaryOffered / 100000).toFixed(1)} LPA
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[#6B7280]">
                            <Calendar className="h-4 w-4" />
                            Started {new Date(placement.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-[#6B7280]">
                            <Clock className="h-4 w-4" />
                            Day {placement.daysSinceStart}
                          </div>
                        </div>

                        {/* Verification Status */}
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                          <p className="text-sm font-medium text-[#1F2937] mb-2">Verification Status</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                placement.verification30CompletedAt
                                  ? "bg-[#D1FAE5] text-[#10B981]"
                                  : placement.is30DayDue
                                  ? "bg-[#FEF3C7] text-[#F59E0B] animate-pulse"
                                  : "bg-[#F3F4F6] text-[#6B7280]"
                              )}>
                                {placement.verification30CompletedAt ? <CheckCircle2 className="h-4 w-4" /> : "30"}
                              </div>
                              <span className="text-xs text-[#6B7280]">30-day</span>
                            </div>
                            <div className="flex-1 h-1 bg-[#E5E7EB] rounded">
                              <div
                                className={cn("h-full rounded transition-all", placement.verification30CompletedAt ? "bg-[#10B981]" : "bg-[#F59E0B]")}
                                style={{ width: `${Math.min(100, (placement.daysSinceStart / 30) * 100)}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                placement.verification90CompletedAt
                                  ? "bg-[#D1FAE5] text-[#10B981]"
                                  : placement.is90DayDue
                                  ? "bg-[#FEF3C7] text-[#F59E0B] animate-pulse"
                                  : "bg-[#F3F4F6] text-[#6B7280]"
                              )}>
                                {placement.verification90CompletedAt ? <CheckCircle2 className="h-4 w-4" /> : "90"}
                              </div>
                              <span className="text-xs text-[#6B7280]">90-day</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 min-w-[200px]">
                        {(placement.is30DayDue || placement.is90DayDue) && (
                          <Button className="gap-2" onClick={() => setVerifyingId(placement.id)}>
                            <CheckCircle2 className="h-4 w-4" />
                            Complete {placement.is90DayDue ? "90" : "30"}-Day Verification
                          </Button>
                        )}
                        <Badge
                          variant={placement.verification90CompletedAt ? "success" : placement.verification30CompletedAt ? "info" : "warning"}
                          className="justify-center"
                        >
                          {placement.verification90CompletedAt ? "Fully Verified" : placement.verification30CompletedAt ? "30-Day Verified" : "Pending Verification"}
                        </Badge>
                      </div>
                    </div>

                    {/* Verification Modal */}
                    {verifyingId === placement.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 pt-6 border-t border-[#E5E7EB]"
                      >
                        <h4 className="font-semibold text-[#1F2937] mb-4">
                          {placement.is90DayDue ? "90-Day" : "30-Day"} Verification
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-[#1F2937] mb-2">Are you still employed at {placement.companyName}?</p>
                            <div className="flex gap-3">
                              <Button variant={stillEmployed ? "default" : "outline"} onClick={() => setStillEmployed(true)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Yes, still employed
                              </Button>
                              <Button variant={!stillEmployed ? "destructive" : "outline"} onClick={() => setStillEmployed(false)}>
                                No, I&apos;ve left
                              </Button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-[#1F2937] block mb-2">Additional notes (optional)</label>
                            <Textarea
                              placeholder="Any updates about your role, promotion, etc..."
                              value={verificationNotes}
                              onChange={(e) => setVerificationNotes(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleVerify(placement.id, placement.is90DayDue ? "90" : "30")}
                              disabled={verify30Mutation.isPending || verify90Mutation.isPending}
                            >
                              {(verify30Mutation.isPending || verify90Mutation.isPending) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                              )}
                              Submit Verification
                            </Button>
                            <Button variant="outline" onClick={() => { setVerifyingId(null); setVerificationNotes(""); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 text-center">
                <div className="text-4xl font-bold text-[#F59E0B]">{badgeStats.earned}</div>
                <p className="text-sm text-[#6B7280] mt-1">Earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <div className="text-4xl font-bold text-[#1F2937]">{badgeStats.total}</div>
                <p className="text-sm text-[#6B7280] mt-1">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <div className="text-4xl font-bold text-[#10B981]">{badgeStats.completion}%</div>
                <p className="text-sm text-[#6B7280] mt-1">Complete</p>
              </CardContent>
            </Card>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {badges.map((badge: any, index: number) => {
              const rarity = rarityColors[badge.rarity] || rarityColors.common;

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card
                    className={cn(
                      "relative overflow-hidden transition-all hover:shadow-lg",
                      badge.earned ? rarity.border : "border-gray-200 opacity-60",
                      badge.earned ? "border-2" : ""
                    )}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className={cn("text-xs capitalize", rarity.bg, rarity.text)}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      <div className={cn(
                        "w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-3",
                        badge.earned ? rarity.bg : "bg-gray-100"
                      )}>
                        {badge.earned ? badge.icon : <Lock className="h-6 w-6 text-gray-400" />}
                      </div>
                      <h3 className={cn("font-semibold text-sm", badge.earned ? "text-[#1F2937]" : "text-gray-400")}>
                        {badge.name}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{badge.description}</p>
                      <div className={cn("mt-2 text-xs font-medium", badge.earned ? "text-[#F59E0B]" : "text-gray-400")}>
                        +{badge.xpReward} XP
                      </div>
                      {badge.earned && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-[#10B981]">Earned {new Date(badge.earnedAt).toLocaleDateString()}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs gap-1"
                            onClick={() => handleBadgeShare(badge.id, "copy")}
                            disabled={shareMutation.isPending}
                          >
                            <Share2 className="h-3 w-3" />
                            Share
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {badges.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
                <p className="text-[#6B7280]">Complete activities to earn badges and XP</p>
              </CardContent>
            </Card>
          )}

          {/* View All Link */}
          <div className="text-center">
            <Link href="/badges" className="text-[#0EA5E9] hover:underline text-sm">
              View all badges and details
            </Link>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      <AnimatePresence>
        {withdrawingId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setWithdrawingId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 max-w-md mx-auto bg-white rounded-xl shadow-xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1F2937]">Withdraw Application?</h3>
                <button
                  onClick={() => setWithdrawingId(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <p className="text-[#6B7280] mb-6">
                Are you sure you want to withdraw this application? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setWithdrawingId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    withdrawMutation.mutate({ applicationId: withdrawingId });
                  }}
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Withdrawing...
                    </>
                  ) : (
                    "Withdraw"
                  )}
                </Button>
              </div>
              {withdrawMutation.isError && (
                <p className="mt-4 text-sm text-red-500">
                  {withdrawMutation.error?.message || "Failed to withdraw application"}
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" /></div>}>
      <ActivityContent />
    </Suspense>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
