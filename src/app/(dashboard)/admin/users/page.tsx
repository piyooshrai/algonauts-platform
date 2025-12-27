"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Loader2,
  ShieldCheck,
  ShieldX,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button, Input, Card, CardContent, Badge, Select, Avatar } from "@/components/ui";
import { api } from "@/lib/trpc/client";

const roleFilters = [
  { value: "all", label: "All Roles" },
  { value: "STUDENT", label: "Students" },
  { value: "COMPANY_ADMIN", label: "Companies" },
  { value: "COLLEGE_ADMIN", label: "Colleges" },
  { value: "PLATFORM_ADMIN", label: "Admins" },
];

const statusFilters = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "unverified", label: "Unverified" },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = api.admin.listUsers.useQuery({
    page,
    limit: 20,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userType: roleFilter !== "all" ? (roleFilter as any) : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    search: searchQuery || undefined,
  });

  const suspendMutation = api.admin.suspendUser.useMutation({
    onSuccess: () => refetch(),
  });

  const unsuspendMutation = api.admin.unsuspendUser.useMutation({
    onSuccess: () => refetch(),
  });

  const users = data?.users || [];
  const total = data?.pagination?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleSuspend = (userId: string) => {
    if (confirm("Are you sure you want to suspend this user?")) {
      suspendMutation.mutate({ userId, reason: "Admin action" });
    }
  };

  const handleUnsuspend = (userId: string) => {
    unsuspendMutation.mutate({ userId });
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
          <Users className="h-6 w-6 text-[#0EA5E9]" />
          User Management
        </h1>
        <p className="text-[#6B7280] mt-1">{total.toLocaleString()} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          options={roleFilters}
          value={roleFilter}
          onChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
        />
        <Select
          options={statusFilters}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="text-left p-4 font-medium text-[#6B7280]">User</th>
                  <th className="text-left p-4 font-medium text-[#6B7280]">Role</th>
                  <th className="text-left p-4 font-medium text-[#6B7280]">Status</th>
                  <th className="text-left p-4 font-medium text-[#6B7280]">Joined</th>
                  <th className="text-right p-4 font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#6B7280]">
                      No users found
                    </td>
                  </tr>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  users.map((user: any, index: number) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={user.name || user.email} size="sm" />
                          <div>
                            <p className="font-medium text-[#1F2937]">{user.name || "Unnamed"}</p>
                            <p className="text-sm text-[#6B7280]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{user.userType}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={user.isSuspended ? "destructive" : user.emailVerified ? "success" : "warning"}
                        >
                          {user.isSuspended ? "Suspended" : user.emailVerified ? "Active" : "Unverified"}
                        </Badge>
                      </td>
                      <td className="p-4 text-[#6B7280]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          {user.isSuspended ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-[#10B981] border-[#10B981] hover:bg-[#D1FAE5]"
                              onClick={() => handleUnsuspend(user.id)}
                            >
                              <ShieldCheck className="h-4 w-4" />
                              Unsuspend
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-[#EF4444] border-[#EF4444] hover:bg-[#FEE2E2]"
                              onClick={() => handleSuspend(user.id)}
                            >
                              <ShieldX className="h-4 w-4" />
                              Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280]">
                Page {page} of {totalPages}
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
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
