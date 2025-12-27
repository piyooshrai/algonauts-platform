"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  MapPin,
  MoreVertical,
  Loader2,
  CheckCircle2,
  XCircle,
  Pause,
} from "lucide-react";
import Link from "next/link";
import { Button, Input, Card, CardContent, Badge, Select } from "@/components/ui";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

const statusFilters = [
  { value: "all", label: "All Status" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "CLOSED", label: "Closed" },
];

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  PUBLISHED: { color: "text-[#10B981]", bgColor: "bg-[#D1FAE5]", icon: CheckCircle2 },
  DRAFT: { color: "text-[#6B7280]", bgColor: "bg-[#F3F4F6]", icon: Clock },
  CLOSED: { color: "text-[#EF4444]", bgColor: "bg-[#FEE2E2]", icon: XCircle },
  PAUSED: { color: "text-[#F59E0B]", bgColor: "bg-[#FEF3C7]", icon: Pause },
};

export default function ManageOpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch } = api.opportunities.getMyOpportunities.useQuery();

  const closeMutation = api.opportunities.close.useMutation({
    onSuccess: () => refetch(),
  });

  const opportunities = data?.opportunities || [];

  // Filter opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || opp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClose = (id: string) => {
    if (confirm("Are you sure you want to close this opportunity?")) {
      closeMutation.mutate({ opportunityId: id });
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[#0EA5E9]" />
            Manage Opportunities
          </h1>
          <p className="text-[#6B7280] mt-1">View and manage your job postings</p>
        </div>
        <Link href="/company/post">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Post New
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          options={statusFilters}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
            <p className="text-[#6B7280] mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first job posting to start receiving applications"}
            </p>
            <Link href="/company/post">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Post Opportunity
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOpportunities.map((opp, index) => {
            const status = statusConfig[opp.status] || statusConfig.DRAFT;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link href={`/company/opportunities/${opp.id}`}>
                              <h3 className="font-semibold text-lg text-[#1F2937] hover:text-[#0EA5E9] transition-colors">
                                {opp.title}
                              </h3>
                            </Link>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#6B7280]">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {opp.isRemote ? "Remote" : opp.locations?.[0] || "Not specified"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {opp.type?.replace("_", " ")}
                              </span>
                              {opp.publishedAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Posted {new Date(opp.publishedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge className={cn("gap-1", status.bgColor, status.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {opp.status}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-[#6B7280]" />
                            <span className="font-medium">{opp.clicks || 0}</span>
                            <span className="text-[#6B7280]">views</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#6B7280]" />
                            <span className="font-medium">{opp._count?.applications || 0}</span>
                            <span className="text-[#6B7280]">applicants</span>
                          </div>
                          {opp.spots && (
                            <div className="text-[#6B7280]">
                              {opp.spots - (opp._count?.applications || 0)} spots left
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/company/opportunities/${opp.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/company/opportunities/${opp.id}/edit`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        {opp.status === "PUBLISHED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-[#EF4444] hover:bg-[#FEE2E2]"
                            onClick={() => handleClose(opp.id)}
                            disabled={closeMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                            Close
                          </Button>
                        )}
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
