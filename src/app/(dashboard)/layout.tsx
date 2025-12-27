"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/ui";

const tabs = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Opportunities", href: "/opportunities", icon: Briefcase },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    router.push("/");
  };

  // Mock user data - in production this would come from session/API
  const user = {
    name: "Rahul Sharma",
    email: "student@test.com",
    college: "IIT Delhi",
    graduationYear: 2025,
    rank: 247,
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex-shrink-0">
                <Logo size="sm" showSubtext={false} />
              </Link>
            </div>

            {/* Center: Search (hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search opportunities, companies..."
                  className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] focus:border-transparent transition-all"
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
              <button className="relative p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
              </button>

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
                            <span className="text-xs text-[#6B7280]">{user.college}</span>
                            <span className="text-xs text-[#6B7280]">•</span>
                            <span className="text-xs text-[#6B7280]">Class of {user.graduationYear}</span>
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
                  (tab.href !== "/dashboard" && pathname?.startsWith(tab.href));
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                      isActive
                        ? "border-[#2A9D8F] text-[#2A9D8F]"
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
                    className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
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
