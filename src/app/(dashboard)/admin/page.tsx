"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Building2,
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function AdminDashboardPage() {
  // Fetch platform stats
  const { data: usersData, isLoading: usersLoading } = api.admin.listUsers.useQuery({ limit: 5 });
  const { data: companiesData, isLoading: companiesLoading } = api.admin.listCompanies.useQuery({ status: "pending" });
  const { data: collegesData, isLoading: collegesLoading } = api.admin.listColleges.useQuery({ status: "pending" });

  const isLoading = usersLoading || companiesLoading || collegesLoading;

  // Platform stats
  const stats = {
    totalUsers: usersData?.pagination?.total || 0,
    totalCompanies: companiesData?.pagination?.total || 0,
    totalColleges: collegesData?.pagination?.total || 0,
    pendingVerifications: (companiesData?.companies?.length || 0) + (collegesData?.colleges?.length || 0),
    totalApplications: 0,
    totalPlacements: 0,
  };

  const recentUsers = usersData?.users || [];
  const pendingCompanies = companiesData?.companies || [];
  const pendingColleges = collegesData?.colleges || [];

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
          Admin Dashboard
        </h1>
        <p className="text-[#6B7280] mt-1">Platform overview and management</p>
      </div>

      {/* Pending Verifications Alert */}
      {stats.pendingVerifications > 0 && (
        <Card className="border-[#F59E0B]/50 bg-[#FEF3C7]/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
              <div>
                <p className="font-medium text-[#1F2937]">
                  {stats.pendingVerifications} pending verification{stats.pendingVerifications > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-[#6B7280]">Review company and college verification requests</p>
              </div>
            </div>
            <Link href="/admin/verification">
              <Button size="sm" className="gap-1">
                Review
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Users</p>
                <p className="text-3xl font-bold text-[#1F2937] mt-1">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center">
                <Users className="h-6 w-6 text-[#0EA5E9]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Companies</p>
                <p className="text-3xl font-bold text-[#1F2937] mt-1">{stats.totalCompanies}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Colleges</p>
                <p className="text-3xl font-bold text-[#1F2937] mt-1">{stats.totalColleges}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Pending Review</p>
                <p className="text-3xl font-bold text-[#F59E0B] mt-1">{stats.pendingVerifications}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0EA5E9]" />
              Recent Users
            </CardTitle>
            <Link href="/admin/users" className="text-sm text-[#0EA5E9] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-center text-[#6B7280] py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {recentUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0EA5E9] font-semibold">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-[#1F2937]">{user.name || "User"}</p>
                        <p className="text-sm text-[#6B7280]">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#F59E0B]" />
              Pending Verifications
            </CardTitle>
            <Link href="/admin/verification" className="text-sm text-[#0EA5E9] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {pendingCompanies.length === 0 && pendingColleges.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-[#10B981] mx-auto mb-3" />
                <p className="text-[#6B7280]">All verifications complete!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {pendingCompanies.slice(0, 3).map((company: any) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-[#8B5CF6]" />
                      <div>
                        <p className="font-medium text-[#1F2937]">{company.companyName}</p>
                        <p className="text-sm text-[#6B7280]">Company verification</p>
                      </div>
                    </div>
                    <Link href={`/admin/verification?id=${company.id}&type=company`}>
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                ))}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {pendingColleges.slice(0, 3).map((college: any) => (
                  <div
                    key={college.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-[#10B981]" />
                      <div>
                        <p className="font-medium text-[#1F2937]">{college.collegeName}</p>
                        <p className="text-sm text-[#6B7280]">College verification</p>
                      </div>
                    </div>
                    <Link href={`/admin/verification?id=${college.id}&type=college`}>
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <div className="p-4 rounded-lg border border-[#E5E7EB] hover:border-[#0EA5E9] hover:bg-[#F9FAFB] transition-colors cursor-pointer text-center">
                <Users className="h-8 w-8 text-[#0EA5E9] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1F2937]">Manage Users</h3>
              </div>
            </Link>
            <Link href="/admin/companies">
              <div className="p-4 rounded-lg border border-[#E5E7EB] hover:border-[#8B5CF6] hover:bg-[#F9FAFB] transition-colors cursor-pointer text-center">
                <Building2 className="h-8 w-8 text-[#8B5CF6] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1F2937]">Companies</h3>
              </div>
            </Link>
            <Link href="/admin/colleges">
              <div className="p-4 rounded-lg border border-[#E5E7EB] hover:border-[#10B981] hover:bg-[#F9FAFB] transition-colors cursor-pointer text-center">
                <GraduationCap className="h-8 w-8 text-[#10B981] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1F2937]">Colleges</h3>
              </div>
            </Link>
            <Link href="/admin/verification">
              <div className="p-4 rounded-lg border border-[#E5E7EB] hover:border-[#F59E0B] hover:bg-[#F9FAFB] transition-colors cursor-pointer text-center">
                <ShieldCheck className="h-8 w-8 text-[#F59E0B] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1F2937]">Verification</h3>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
