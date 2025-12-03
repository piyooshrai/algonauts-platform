"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Building2,
  Building,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type UserRole = "student" | "college_admin" | "company_admin";

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: typeof GraduationCap;
  href: string;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    value: "student",
    label: "Student",
    description: "Student dashboard",
    icon: GraduationCap,
    href: "/dashboard",
    color: "text-blue-500",
  },
  {
    value: "college_admin",
    label: "College Admin",
    description: "Manage students & placements",
    icon: Building2,
    href: "/admin/college",
    color: "text-purple-500",
  },
  {
    value: "company_admin",
    label: "Company Admin",
    description: "Hire top talent",
    icon: Building,
    href: "/admin/company",
    color: "text-green-500",
  },
];

function getCurrentRole(pathname: string): UserRole {
  if (pathname.startsWith("/admin/college")) return "college_admin";
  if (pathname.startsWith("/admin/company")) return "company_admin";
  return "student";
}

interface RoleSwitcherProps {
  variant?: "default" | "compact";
  className?: string;
}

export function RoleSwitcher({ variant = "default", className }: RoleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentRole = getCurrentRole(pathname);
  const currentOption = roleOptions.find((r) => r.value === currentRole)!;

  const handleRoleChange = (role: RoleOption) => {
    setIsOpen(false);
    if (role.value !== currentRole) {
      router.push(role.href);
    }
  };

  if (variant === "compact") {
    return (
      <div className={cn("relative", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border transition-colors"
        >
          <currentOption.icon className={cn("h-4 w-4", currentOption.color)} />
          <span className="text-sm font-medium hidden sm:inline">{currentOption.label}</span>
          <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-lg z-50"
              >
                <div className="p-2">
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Switch Role (Demo)
                  </p>
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleRoleChange(option)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                        option.value === currentRole
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <option.icon className={cn("h-5 w-5", option.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {option.description}
                        </p>
                      </div>
                      {option.value === currentRole && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border p-2">
                  <p className="px-2 py-1 text-xs text-muted-foreground">
                    For testing purposes only
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted border border-border transition-colors w-full"
      >
        <div className={cn("p-2 rounded-lg", currentRole === "student" ? "bg-blue-500/10" : currentRole === "college_admin" ? "bg-purple-500/10" : "bg-green-500/10")}>
          <currentOption.icon className={cn("h-5 w-5", currentOption.color)} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-sm">{currentOption.label}</p>
          <p className="text-xs text-muted-foreground">{currentOption.description}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 rounded-lg border border-border bg-card shadow-lg z-50"
            >
              <div className="p-2">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleRoleChange(option)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition-colors",
                      option.value === currentRole
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      option.value === "student" ? "bg-blue-500/10" : option.value === "college_admin" ? "bg-purple-500/10" : "bg-green-500/10"
                    )}>
                      <option.icon className={cn("h-5 w-5", option.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {option.value === currentRole && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export role options for use in login page
export { roleOptions };
