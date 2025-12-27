"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  PlusCircle,
  Loader2,
  Eye,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function CompanyDashboardPage() {
  // Fetch company data
  const { data: opportunitiesData, isLoading: opportunitiesLoading } = api.opportunities.getMyOpportunities.useQuery();
  const { data: applicationStats, isLoading: statsLoading } = api.applications.getStats.useQuery();

  const isLoading = opportunitiesLoading || statsLoading;

  const opportunities = opportunitiesData?.opportunities || [];
  const activeOpportunities = opportunities.filter((o: any) => o.status === "PUBLISHED");
  const draftOpportunities = opportunities.filter((o: any) => o.status === "DRAFT");

  // Calculate stats
  const stats = {
    activeJobs: activeOpportunities.length,
    totalApplications: applicationStats?.total || 0,
    newApplications: applicationStats?.submitted || 0,
    shortlisted: applicationStats?.interviews || 0,
  };

  // Recent applications from all opportunities
  const recentApplications = opportunities
    .flatMap((opp: any) =>
      (opp.applications || []).map((app: any) => ({
        ...app,
        opportunityTitle: opp.title,
      }))
    )
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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
            <Building2 className="h-6 w-6 text-[#0EA5E9]" />
            Company Dashboard
          </h1>
          <p className="text-[#6B7280] mt-1">Manage your job postings and candidates</p>
        </div>
        <Link href="/company/post">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Post New Opportunity
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Active Jobs</p>
                <p className="text-3xl font-bold text-[#1F2937] mt-1">{stats.activeJobs}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-[#0EA5E9]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Applications</p>
                <p className="text-3xl font-bold text-[#1F2937] mt-1">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">New Applications</p>
                <p className="text-3xl font-bold text-[#F59E0B] mt-1">{stats.newApplications}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-[#EF4444]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Shortlisted</p>
                <p className="text-3xl font-bold text-[#10B981] mt-1">{stats.shortlisted}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#0EA5E9]" />
              Active Opportunities
            </CardTitle>
            <Link href="/company/opportunities" className="text-sm text-[#0EA5E9] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {activeOpportunities.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-[#6B7280]">No active opportunities</p>
                <Link href="/company/post" className="mt-2 inline-block">
                  <Button variant="outline" size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Post your first job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOpportunities.slice(0, 4).map((opp: any) => (
                  <Link
                    key={opp.id}
                    href={`/company/opportunities/${opp.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div>
                      <p className="font-medium text-[#1F2937]">{opp.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {opp._count?.applications || 0} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {opp.clicks || 0} views
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#D1D5DB]" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#F59E0B]" />
              Recent Applications
            </CardTitle>
            <Link href="/company/applications" className="text-sm text-[#0EA5E9] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-[#6B7280]">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app: any) => (
                  <Link
                    key={app.id}
                    href={`/company/applications/${app.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0EA5E9] font-semibold">
                        {app.student?.user?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-[#1F2937]">
                          {app.student?.user?.name || "Candidate"}
                        </p>
                        <p className="text-sm text-[#6B7280]">{app.opportunityTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          app.status === "SHORTLISTED"
                            ? "success"
                            : app.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {app.status}
                      </Badge>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Draft Opportunities */}
      {draftOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#6B7280]" />
              Draft Opportunities ({draftOpportunities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {draftOpportunities.map((opp: any) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]"
                >
                  <div>
                    <p className="font-medium text-[#1F2937]">{opp.title}</p>
                    <p className="text-sm text-[#6B7280]">
                      Created {new Date(opp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/company/opportunities/${opp.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <Link href={`/company/opportunities/${opp.id}`}>
                      <Button size="sm">Publish</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
