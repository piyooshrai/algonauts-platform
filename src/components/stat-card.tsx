"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    positive?: boolean;
  };
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-6", className)} hover>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  change.positive ? "text-success-600" : "text-error-600"
                )}
              >
                {change.positive ? "+" : ""}
                {change.value}%
              </span>
              <span className="text-sm text-muted-foreground">from last month</span>
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
