"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Star,
  Calendar,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { Button, Input, Card, CardContent, Badge, Select, Avatar } from "@/components/ui";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

const statusFilters = [
  { value: "all", label: "All Status" },
  { value: "SUBMITTED", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview" },
  { value: "REJECTED", label: "Rejected" },
];

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  SUBMITTED: { color: "text-[#0EA5E9]", bgColor: "bg-[#E0F2FE]", label: "Pending" },
  UNDER_REVIEW: { color: "text-[#F59E0B]", bgColor: "bg-[#FEF3C7]", label: "Under Review" },
  SHORTLISTED: { color: "text-[#8B5CF6]", bgColor: "bg-[#EDE9FE]", label: "Shortlisted" },
  INTERVIEW_SCHEDULED: { color: "text-[#3B82F6]", bgColor: "bg-[#DBEAFE]", label: "Interview" },
  OFFER_EXTENDED: { color: "text-[#10B981]", bgColor: "bg-[#D1FAE5]", label: "Offer Extended" },
  REJECTED: { color: "text-[#EF4444]", bgColor: "bg-[#FEE2E2]", label: "Rejected" },
};

export default function CompanyApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [opportunityFilter, setOpportunityFilter] = useState("all");

  // Fetch opportunities and their applications
  const { data: opportunitiesData, isLoading: oppsLoading } = api.opportunities.getMyOpportunities.useQuery();

  const isLoading = oppsLoading;
  const opportunities = opportunitiesData?.opportunities || [];

  // Flatten all applications from all opportunities
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allApplications = opportunities.flatMap((opp: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (opp.applications || []).map((app: any) => ({
      ...app,
      opportunity: {
        id: opp.id,
        title: opp.title,
        type: opp.type,
      },
    }))
  );

  // Create opportunity filter options
  const opportunityOptions = [
    { value: "all", label: "All Opportunities" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...opportunities.map((opp: any) => ({ value: opp.id, label: opp.title })),
  ];

  // Filter applications
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredApplications = allApplications.filter((app: any) => {
    const matchesSearch =
      app.student?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.student?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesOpportunity = opportunityFilter === "all" || app.opportunity.id === opportunityFilter;
    return matchesSearch && matchesStatus && matchesOpportunity;
  });

  // Sort by date (newest first)
  filteredApplications.sort(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Update status mutation
  const updateStatusMutation = api.applications.updateStatus.useMutation();

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateStatusMutation.mutate({
      applicationId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: newStatus as any,
    });
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#0EA5E9]" />
          Applications
        </h1>
        <p className="text-[#6B7280] mt-1">Review and manage candidate applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1F2937]">{allApplications.length}</p>
            <p className="text-sm text-[#6B7280]">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#F59E0B]">
              {allApplications.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length}
            </p>
            <p className="text-sm text-[#6B7280]">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#8B5CF6]">
              {allApplications.filter((a) => a.status === "SHORTLISTED").length}
            </p>
            <p className="text-sm text-[#6B7280]">Shortlisted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#10B981]">
              {allApplications.filter((a) => a.status === "OFFER_EXTENDED" || a.status === "OFFER_ACCEPTED").length}
            </p>
            <p className="text-sm text-[#6B7280]">Offers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by candidate name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          options={opportunityOptions}
          value={opportunityFilter}
          onChange={setOpportunityFilter}
        />
        <Select
          options={statusFilters}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
            <p className="text-[#6B7280]">
              {searchQuery || statusFilter !== "all" || opportunityFilter !== "all"
                ? "Try adjusting your filters"
                : "Applications will appear here when candidates apply"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app, index) => {
            const status = statusConfig[app.status] || statusConfig.SUBMITTED;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card hover>
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Candidate Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar
                          fallback={app.student?.user?.name || "?"}
                          src={app.student?.avatarUrl}
                          size="lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link href={`/company/candidates/${app.student?.userId}`}>
                              <h3 className="font-semibold text-[#1F2937] hover:text-[#0EA5E9]">
                                {app.student?.user?.name || "Candidate"}
                              </h3>
                            </Link>
                            {app.student?.layersRankOverall && (
                              <Badge variant="secondary" className="text-xs">
                                Score: {Math.round(app.student.layersRankOverall)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#6B7280]">{app.student?.user?.email}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#6B7280]">
                            {app.student?.collegeName && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {app.student.collegeName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Applied {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Opportunity */}
                      <div className="lg:text-right">
                        <p className="text-sm font-medium text-[#1F2937]">{app.opportunity.title}</p>
                        <p className="text-xs text-[#6B7280]">{app.opportunity.type?.replace("_", " ")}</p>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3">
                        <Badge className={cn("gap-1", status.bgColor, status.color)}>
                          {status.label}
                        </Badge>

                        <div className="flex items-center gap-2">
                          {app.status === "SUBMITTED" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[#8B5CF6] border-[#8B5CF6] hover:bg-[#EDE9FE]"
                                onClick={() => handleStatusChange(app.id, "SHORTLISTED")}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Shortlist
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[#EF4444] border-[#EF4444] hover:bg-[#FEE2E2]"
                                onClick={() => handleStatusChange(app.id, "REJECTED")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {app.status === "SHORTLISTED" && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(app.id, "OFFER_EXTENDED")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Extend Offer
                            </Button>
                          )}
                          <Link href={`/company/candidates/${app.student?.userId}`}>
                            <Button size="sm" variant="outline">
                              View Profile
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
