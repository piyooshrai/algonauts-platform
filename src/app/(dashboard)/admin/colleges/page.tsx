"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  MapPin,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Button, Input, Card, CardContent, Badge, Select } from "@/components/ui";
import { api } from "@/lib/trpc/client";

const statusFilters = [
  { value: "all", label: "All Colleges" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminCollegesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = api.admin.listColleges.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? (statusFilter as "pending" | "verified" | "rejected") : "all",
  });

  const verifyMutation = api.admin.verifyCollege.useMutation({
    onSuccess: () => refetch(),
  });

  const rejectMutation = api.admin.rejectCollege.useMutation({
    onSuccess: () => refetch(),
  });

  const colleges = data?.colleges || [];
  const pagination = data?.pagination || { page: 1, total: 0, pages: 1 };

  const handleVerify = (collegeId: string, tier?: "TIER_1" | "TIER_2" | "TIER_3") => {
    verifyMutation.mutate({ collegeId, tier });
  };

  const handleReject = (collegeId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectMutation.mutate({ collegeId, reason });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  const getTierBadge = (tier: string | null) => {
    if (!tier) return null;
    const tierConfig: Record<string, { variant: "success" | "info" | "secondary"; label: string }> = {
      TIER_1: { variant: "success", label: "Tier 1" },
      TIER_2: { variant: "info", label: "Tier 2" },
      TIER_3: { variant: "secondary", label: "Tier 3" },
    };
    const config = tierConfig[tier];
    if (!config) return null;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-[#0EA5E9]" />
          College Management
        </h1>
        <p className="text-[#6B7280] mt-1">{pagination.total} total colleges</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by college name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          options={statusFilters}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />
      </div>

      {/* Colleges Grid */}
      {colleges.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No colleges found</h3>
            <p className="text-[#6B7280]">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleges.map((college: any) => (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#D1FAE5] flex items-center justify-center text-[#10B981] font-bold text-xl flex-shrink-0">
                      {college.name?.substring(0, 2).toUpperCase() || "CL"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1F2937] truncate">{college.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            college.isVerified
                              ? "success"
                              : college.isRejected
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {college.isVerified
                            ? "Verified"
                            : college.isRejected
                            ? "Rejected"
                            : "Pending"}
                        </Badge>
                        {getTierBadge(college.tier)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#6B7280]">
                    {college.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{college.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{college._count?.students || 0} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>{college._count?.placements || 0} placements</span>
                    </div>
                  </div>

                  {/* Actions for pending colleges */}
                  {!college.isVerified && !college.isRejected && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-[#6B7280]">Select tier and verify:</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleVerify(college.id, "TIER_1")}
                          disabled={verifyMutation.isPending}
                        >
                          Tier 1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleVerify(college.id, "TIER_2")}
                          disabled={verifyMutation.isPending}
                        >
                          Tier 2
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleVerify(college.id, "TIER_3")}
                          disabled={verifyMutation.isPending}
                        >
                          Tier 3
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-1 text-[#EF4444] border-[#EF4444] hover:bg-[#FEE2E2]"
                        onClick={() => handleReject(college.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
                    Registered {new Date(college.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6B7280]">
            Page {page} of {pagination.pages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
