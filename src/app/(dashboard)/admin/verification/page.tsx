"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Loader2,
  Globe,
  MapPin,
  Users,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function AdminVerificationPage() {
  const [activeTab, setActiveTab] = useState<"companies" | "colleges">("companies");

  // Fetch pending verifications
  const { data: companiesData, isLoading: companiesLoading, refetch: refetchCompanies } =
    api.admin.listCompanies.useQuery({ status: "pending" });
  const { data: collegesData, isLoading: collegesLoading, refetch: refetchColleges } =
    api.admin.listColleges.useQuery({ status: "pending" });

  // Mutations
  const verifyCompanyMutation = api.admin.verifyCompany.useMutation({
    onSuccess: () => refetchCompanies(),
  });

  const rejectCompanyMutation = api.admin.rejectCompany.useMutation({
    onSuccess: () => refetchCompanies(),
  });

  const verifyCollegeMutation = api.admin.verifyCollege.useMutation({
    onSuccess: () => refetchColleges(),
  });

  const rejectCollegeMutation = api.admin.rejectCollege.useMutation({
    onSuccess: () => refetchColleges(),
  });

  const pendingCompanies = companiesData?.companies || [];
  const pendingColleges = collegesData?.colleges || [];

  const isLoading = companiesLoading || collegesLoading;

  const handleVerifyCompany = (companyId: string) => {
    verifyCompanyMutation.mutate({ companyId });
  };

  const handleRejectCompany = (companyId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectCompanyMutation.mutate({ companyId, reason });
    }
  };

  const handleVerifyCollege = (collegeId: string) => {
    verifyCollegeMutation.mutate({ collegeId });
  };

  const handleRejectCollege = (collegeId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectCollegeMutation.mutate({ collegeId, reason });
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
          <ShieldCheck className="h-6 w-6 text-[#0EA5E9]" />
          Verification Requests
        </h1>
        <p className="text-[#6B7280] mt-1">
          Review and approve company and college verification requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">{pendingCompanies.length}</p>
              <p className="text-sm text-[#6B7280]">Pending Companies</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-[#10B981]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937]">{pendingColleges.length}</p>
              <p className="text-sm text-[#6B7280]">Pending Colleges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="companies" value={activeTab} onValueChange={(v) => setActiveTab(v as "companies" | "colleges")}>
        <TabsList>
          <TabsTrigger value="companies" className="gap-2">
            <Building2 className="h-4 w-4" />
            Companies ({pendingCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="colleges" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Colleges ({pendingColleges.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {activeTab === "companies" && (
        <div className="space-y-4">
          {pendingCompanies.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-[#10B981] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-[#6B7280]">No pending company verifications</p>
              </CardContent>
            </Card>
          ) : (
            pendingCompanies.map((company: any) => (
              <Card key={company.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Company Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-lg bg-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] font-bold text-xl">
                          {company.companyName?.substring(0, 2).toUpperCase() || "CO"}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#1F2937]">{company.companyName}</h3>
                          <Badge variant="warning">Pending Verification</Badge>
                        </div>
                      </div>

                      {company.description && (
                        <p className="text-[#6B7280] mb-4">{company.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {company.industry && (
                          <div className="flex items-center gap-2 text-[#6B7280]">
                            <Building2 className="h-4 w-4" />
                            {company.industry}
                          </div>
                        )}
                        {company.companySize && (
                          <div className="flex items-center gap-2 text-[#6B7280]">
                            <Users className="h-4 w-4" />
                            {company.companySize} employees
                          </div>
                        )}
                        {company.headquarters && (
                          <div className="flex items-center gap-2 text-[#6B7280]">
                            <MapPin className="h-4 w-4" />
                            {company.headquarters}
                          </div>
                        )}
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#0EA5E9] hover:underline"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {/* Contact */}
                      {company.user && (
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                          <p className="text-sm font-medium text-[#1F2937] mb-2">Submitted by</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                              <Mail className="h-4 w-4" />
                              {company.user.email}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-3">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => handleVerifyCompany(company.id)}
                        disabled={verifyCompanyMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 text-[#EF4444] border-[#EF4444] hover:bg-[#FEE2E2]"
                        onClick={() => handleRejectCompany(company.id)}
                        disabled={rejectCompanyMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "colleges" && (
        <div className="space-y-4">
          {pendingColleges.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-[#10B981] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-[#6B7280]">No pending college verifications</p>
              </CardContent>
            </Card>
          ) : (
            pendingColleges.map((college: any) => (
              <Card key={college.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* College Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-lg bg-[#D1FAE5] flex items-center justify-center text-[#10B981] font-bold text-xl">
                          {college.collegeName?.substring(0, 2).toUpperCase() || "CL"}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#1F2937]">{college.collegeName}</h3>
                          <Badge variant="warning">Pending Verification</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {college.city && college.state && (
                          <div className="flex items-center gap-2 text-[#6B7280]">
                            <MapPin className="h-4 w-4" />
                            {college.city}, {college.state}
                          </div>
                        )}
                        {college.website && (
                          <a
                            href={college.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#0EA5E9] hover:underline"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {/* Contact */}
                      {college.user && (
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                          <p className="text-sm font-medium text-[#1F2937] mb-2">Submitted by</p>
                          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                            <Mail className="h-4 w-4" />
                            {college.user.email}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-3">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => handleVerifyCollege(college.id)}
                        disabled={verifyCollegeMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 text-[#EF4444] border-[#EF4444] hover:bg-[#FEE2E2]"
                        onClick={() => handleRejectCollege(college.id)}
                        disabled={rejectCollegeMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
