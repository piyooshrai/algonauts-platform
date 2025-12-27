"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button, Input, Card, CardContent, Badge, Select } from "@/components/ui";
import { api } from "@/lib/trpc/client";

const statusFilters = [
  { value: "all", label: "All Companies" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = api.admin.listCompanies.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? (statusFilter as "pending" | "verified" | "rejected") : "all",
  });

  const verifyMutation = api.admin.verifyCompany.useMutation({
    onSuccess: () => refetch(),
  });

  const rejectMutation = api.admin.rejectCompany.useMutation({
    onSuccess: () => refetch(),
  });

  const companies = data?.companies || [];
  const pagination = data?.pagination || { page: 1, total: 0, pages: 1 };

  const handleVerify = (companyId: string) => {
    verifyMutation.mutate({ companyId });
  };

  const handleReject = (companyId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectMutation.mutate({ companyId, reason });
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
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
          <Building2 className="h-6 w-6 text-[#0EA5E9]" />
          Company Management
        </h1>
        <p className="text-[#6B7280] mt-1">{pagination.total} total companies</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by company name..."
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

      {/* Companies Grid */}
      {companies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies found</h3>
            <p className="text-[#6B7280]">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {companies.map((company: any) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] font-bold text-xl flex-shrink-0">
                      {company.name?.substring(0, 2).toUpperCase() || "CO"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1F2937] truncate">{company.name}</h3>
                      <p className="text-sm text-[#6B7280]">{company.industry || "Technology"}</p>
                      <div className="mt-2">
                        <Badge
                          variant={
                            company.isVerified
                              ? "success"
                              : company.isRejected
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {company.isVerified
                            ? "Verified"
                            : company.isRejected
                            ? "Rejected"
                            : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#6B7280]">
                    {company.domain && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <a
                          href={`https://${company.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0EA5E9] hover:underline flex items-center gap-1"
                        >
                          {company.domain}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {company.size && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{company.size} employees</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>{company._count?.opportunities || 0} opportunities</span>
                    </div>
                  </div>

                  {/* Actions for pending companies */}
                  {!company.isVerified && !company.isRejected && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => handleVerify(company.id)}
                        disabled={verifyMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 text-[#EF4444] border-[#EF4444] hover:bg-[#FEE2E2]"
                        onClick={() => handleReject(company.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
                    Registered {new Date(company.createdAt).toLocaleDateString()}
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
