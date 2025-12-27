"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui";

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

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for success message
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      // Clear after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
      // Remove query param
      window.history.replaceState({}, "", "/applications");
    }
  }, [searchParams]);

  // Fetch real applications
  const { data: applicationsData, isLoading } = api.applications.getMyApplications.useQuery();
  const applications = applicationsData?.applications || [];

  // Calculate stats
  const stats = {
    total: applications.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    underReview: applications.filter((a: any) => a.status === "UNDER_REVIEW" || a.status === "SUBMITTED").length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shortlisted: applications.filter((a: any) => a.status === "SHORTLISTED" || a.status === "INTERVIEW_SCHEDULED" || a.status === "OFFER_EXTENDED").length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rejected: applications.filter((a: any) => a.status === "REJECTED").length,
  };

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
        <h1 className="text-2xl font-bold text-[#1F2937]">My Applications</h1>
        <p className="text-[#6B7280] mt-1">Track and manage your job applications</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#1F2937]">{stats.total}</p>
          <p className="text-sm text-[#6B7280]">Total Applications</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#F59E0B]">{stats.underReview}</p>
          <p className="text-sm text-[#6B7280]">In Progress</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#10B981]">{stats.shortlisted}</p>
          <p className="text-sm text-[#6B7280]">Shortlisted</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#EF4444]">{stats.rejected}</p>
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

              return (
                <Link
                  key={app.id}
                  href={`/opportunities/${app.opportunityId}`}
                  className="block p-5 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {app.opportunity?.company?.companyName?.substring(0, 2).toUpperCase() || "CO"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[#1F2937]">
                            {app.opportunity?.title || "Position"}
                          </h3>
                          <p className="text-sm text-[#6B7280]">
                            {app.opportunity?.company?.companyName || "Company"}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 ${status.bgColor} ${status.color} text-sm font-medium rounded-full`}>
                          <StatusIcon className="h-4 w-4" />
                          {status.label}
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {app.opportunity?.isRemote
                            ? "Remote"
                            : app.opportunity?.locations?.[0] || "Location TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Applied {formatDate(new Date(app.submittedAt || app.createdAt))}
                        </span>
                      </div>

                      {/* Interview info if scheduled */}
                      {app.status === "INTERVIEW_SCHEDULED" && app.interviewAt && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-[#3B82F6] font-medium">
                          <Calendar className="h-4 w-4" />
                          Interview scheduled: {formatDate(new Date(app.interviewAt))}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-[#D1D5DB] flex-shrink-0 mt-1" />
                  </div>
                </Link>
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
                Browse Opportunities
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" /></div>}>
      <ApplicationsContent />
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
