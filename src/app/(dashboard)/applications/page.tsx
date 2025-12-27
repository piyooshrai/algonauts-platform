"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// Mock applications data
const applications = [
  {
    id: "app_001",
    opportunityId: "opp_swe_intern_001",
    company: "TechCorp India",
    role: "Software Engineer Intern",
    location: "Bangalore",
    appliedAt: "Dec 20, 2025",
    status: "under_review",
    statusLabel: "Under Review",
    logo: "TC",
    logoColor: "bg-teal-500",
  },
  {
    id: "app_002",
    opportunityId: "opp_fullstack_001",
    company: "TechCorp India",
    role: "Full Stack Developer",
    location: "Remote",
    appliedAt: "Dec 18, 2025",
    status: "shortlisted",
    statusLabel: "Shortlisted",
    logo: "TC",
    logoColor: "bg-teal-500",
  },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string; bgColor: string }> = {
  submitted: { icon: Clock, color: "text-[#6B7280]", bgColor: "bg-[#F3F4F6]" },
  under_review: { icon: AlertCircle, color: "text-[#F59E0B]", bgColor: "bg-[#FEF3C7]" },
  shortlisted: { icon: CheckCircle2, color: "text-[#10B981]", bgColor: "bg-[#D1FAE5]" },
  rejected: { icon: XCircle, color: "text-[#EF4444]", bgColor: "bg-[#FEE2E2]" },
};

export default function ApplicationsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">My Applications</h1>
        <p className="text-[#6B7280] mt-1">Track and manage your job applications</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#1F2937]">{applications.length}</p>
          <p className="text-sm text-[#6B7280]">Total Applications</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#F59E0B]">
            {applications.filter(a => a.status === "under_review").length}
          </p>
          <p className="text-sm text-[#6B7280]">Under Review</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#10B981]">
            {applications.filter(a => a.status === "shortlisted").length}
          </p>
          <p className="text-sm text-[#6B7280]">Shortlisted</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#EF4444]">
            {applications.filter(a => a.status === "rejected").length}
          </p>
          <p className="text-sm text-[#6B7280]">Rejected</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
        <div className="p-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#2A9D8F]" />
            <h2 className="text-lg font-semibold text-[#1F2937]">Applications</h2>
          </div>
        </div>

        {applications.length > 0 ? (
          <div className="divide-y divide-[#E5E7EB]">
            {applications.map((app) => {
              const status = statusConfig[app.status] || statusConfig.submitted;
              const StatusIcon = status.icon;
              return (
                <Link
                  key={app.id}
                  href={`/opportunities/${app.opportunityId}`}
                  className="block p-5 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className={`w-12 h-12 rounded-lg ${app.logoColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {app.logo}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[#1F2937]">{app.role}</h3>
                          <p className="text-sm text-[#6B7280]">{app.company}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 ${status.bgColor} ${status.color} text-sm font-medium rounded-full`}>
                          <StatusIcon className="h-4 w-4" />
                          {app.statusLabel}
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {app.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Applied {app.appliedAt}
                        </span>
                      </div>
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
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2A9D8F] text-white text-sm font-medium rounded-lg hover:bg-[#238b7e] transition-colors"
            >
              Browse Opportunities
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
