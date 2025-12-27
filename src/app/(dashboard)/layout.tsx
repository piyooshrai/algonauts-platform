"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Trophy,
  Briefcase,
  FileText,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Building2,
  GraduationCap,
  Users,
  BarChart3,
  PlusCircle,
  UserSearch,
  CheckSquare,
  ShieldCheck,
  Award,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Avatar, Badge } from "@/components/ui";
import { api } from "@/lib/trpc/client";

// Tabs for different user roles
const studentTabs = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Opportunities", href: "/opportunities", icon: Briefcase },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Badges", href: "/badges", icon: Award },
  { name: "Placements", href: "/placements", icon: PartyPopper },
];

const companyTabs = [
  { name: "Dashboard", href: "/company", icon: LayoutDashboard },
  { name: "Post Opportunity", href: "/company/post", icon: PlusCircle },
  { name: "Manage", href: "/company/opportunities", icon: Briefcase },
  { name: "Candidates", href: "/company/candidates", icon: UserSearch },
  { name: "Applications", href: "/company/applications", icon: FileText },
];

const collegeTabs = [
  { name: "Dashboard", href: "/college", icon: LayoutDashboard },
  { name: "Students", href: "/college/students", icon: Users },
  { name: "Placements", href: "/college/placements", icon: CheckSquare },
  { name: "Analytics", href: "/college/analytics", icon: BarChart3 },
];

const adminTabs = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Companies", href: "/admin/companies", icon: Building2 },
  { name: "Colleges", href: "/admin/colleges", icon: GraduationCap },
  { name: "Verification", href: "/admin/verification", icon: ShieldCheck },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch real data
  const { data: notificationsData } = api.notifications.getUnread.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const { data: profileData } = api.profile.get.useQuery();

  const unreadCount = notificationsData?.notifications?.length || 0;
  const notifications = notificationsData?.notifications || [];

  // Mark notification as read
  const markAsReadMutation = api.notifications.markAsRead.useMutation();

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationId });
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  // Get user data from session and profile
  const userRole = (session?.user as any)?.role || "STUDENT";
  const profile = profileData?.profile;

  const user = {
    name: session?.user?.name || session?.user?.email?.split("@")[0] || "User",
    email: session?.user?.email || "",
    college: profile?.collegeName || "Complete your profile",
    graduationYear: profile?.graduationYear || new Date().getFullYear() + 1,
    role: userRole,
  };

  // Select tabs based on user role and current path
  const getTabs = () => {
    if (pathname?.startsWith("/admin")) return adminTabs;
    if (pathname?.startsWith("/company")) return companyTabs;
    if (pathname?.startsWith("/college")) return collegeTabs;

    // Default based on role
    if (userRole === "ADMIN") return adminTabs;
    if (userRole === "COMPANY") return companyTabs;
    if (userRole === "COLLEGE") return collegeTabs;
    return studentTabs;
  };

  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo with Algonauts text */}
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex-shrink-0">
                <Logo size="sm" showSubtext={false} showText={true} />
              </Link>
            </div>

            {/* Center: Search (hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search opportunities, companies..."
                  className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right: Notifications & Avatar */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  className="relative p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-[#EF4444] text-white rounded-full px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setNotificationsOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 rounded-lg border border-[#E5E7EB] bg-white shadow-lg z-50 max-h-[400px] overflow-hidden"
                      >
                        <div className="p-3 border-b border-[#E5E7EB] flex items-center justify-between">
                          <h3 className="font-semibold text-[#1F2937]">Notifications</h3>
                          {unreadCount > 0 && (
                            <Badge variant="info" className="text-xs">{unreadCount} new</Badge>
                          )}
                        </div>
                        <div className="overflow-y-auto max-h-[320px]">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-[#6B7280]">
                              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No new notifications</p>
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((notification) => (
                              <div
                                key={notification.id}
                                className="p-3 hover:bg-[#F9FAFB] border-b border-[#E5E7EB] last:border-0 cursor-pointer"
                                onClick={() => {
                                  handleMarkAsRead(notification.id);
                                  setNotificationsOpen(false);
                                }}
                              >
                                <p className="text-sm font-medium text-[#1F2937]">{notification.title}</p>
                                <p className="text-xs text-[#6B7280] mt-0.5">{notification.body}</p>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <Link
                            href="/notifications"
                            className="block p-3 text-center text-sm text-[#0EA5E9] hover:bg-[#F9FAFB] border-t border-[#E5E7EB]"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            View all notifications
                          </Link>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <Avatar fallback={user.name} size="sm" />
                  <ChevronDown className="h-4 w-4 text-[#6B7280] hidden sm:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 rounded-lg border border-[#E5E7EB] bg-white shadow-lg z-50"
                      >
                        <div className="p-4 border-b border-[#E5E7EB]">
                          <p className="font-semibold text-[#1F2937]">{user.name}</p>
                          <p className="text-sm text-[#6B7280]">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                            {userRole === "STUDENT" && (
                              <>
                                <span className="text-xs text-[#6B7280]">•</span>
                                <span className="text-xs text-[#6B7280]">Class of {user.graduationYear}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1F2937] rounded-md hover:bg-[#F3F4F6] transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4 text-[#6B7280]" />
                            View Profile
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1F2937] rounded-md hover:bg-[#F3F4F6] transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 text-[#6B7280]" />
                            Settings
                          </Link>
                        </div>
                        <div className="p-1 border-t border-[#E5E7EB]">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#EF4444] rounded-md hover:bg-[#FEF2F2] transition-colors w-full"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="border-t border-[#E5E7EB] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href ||
                  (tab.href !== "/dashboard" && tab.href !== "/company" && tab.href !== "/college" && tab.href !== "/admin" && pathname?.startsWith(tab.href));
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                      isActive
                        ? "border-[#0EA5E9] text-[#0EA5E9]"
                        : "border-transparent text-[#6B7280] hover:text-[#1F2937] hover:border-[#E5E7EB]"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#E5E7EB] bg-white"
            >
              <div className="p-4">
                {/* Mobile Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
