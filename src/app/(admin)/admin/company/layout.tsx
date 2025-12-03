"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search as SearchIcon,
  Mail,
  Briefcase,
  CreditCard,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Building,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Avatar, Badge } from "@/components/ui";

const navigation = [
  { name: "Dashboard", href: "/admin/company", icon: LayoutDashboard },
  { name: "Discover Candidates", href: "/admin/company/discover", icon: SearchIcon },
  { name: "Invitations", href: "/admin/company/invitations", icon: Mail },
  { name: "Job Postings", href: "/admin/company/jobs", icon: Briefcase },
  { name: "Billing", href: "/admin/company/billing", icon: CreditCard },
];

export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = () => {
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin/company") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Dark Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
            <Link href="/admin/company" className="flex items-center gap-3">
              <Logo />
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                Company
              </Badge>
            </Link>
            <button
              className="lg:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Company Info */}
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">TechCorp Inc.</p>
                <p className="text-xs text-slate-400">Enterprise Plan</p>
              </div>
            </div>
          </div>

          {/* Credits Info */}
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Invite Credits</span>
              <Badge variant="info" className="text-xs">47 remaining</Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {item.name === "Invitations" && (
                    <Badge variant="warning" className="ml-auto text-xs">5 pending</Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <Avatar
                fallback="HR Manager"
                size="sm"
                status="online"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Sarah Johnson</p>
                <p className="text-xs text-slate-400 truncate">
                  HR Manager
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Search */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border w-64">
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-xs text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <Avatar fallback="Sarah Johnson" size="sm" />
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg z-50"
                      >
                        <div className="p-3 border-b border-border">
                          <p className="font-medium">Sarah Johnson</p>
                          <p className="text-sm text-muted-foreground">
                            hr@techcorp.com
                          </p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/admin/company/billing"
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <CreditCard className="h-4 w-4" />
                            Billing & Plan
                          </Link>
                          <Link
                            href="/admin/company/billing"
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                        </div>
                        <div className="p-1 border-t border-border">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors w-full text-error-600"
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
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
