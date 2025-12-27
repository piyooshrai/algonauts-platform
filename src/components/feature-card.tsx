"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative p-6 rounded-lg border border-border bg-card",
        "transition-all duration-300 hover:shadow-lg hover:border-sky-500/50 hover:-translate-y-1",
        className
      )}
    >
      <div className="mb-4 inline-flex p-3 rounded-lg bg-gradient-to-br from-sky-500/10 to-sky-600/10 group-hover:from-sky-500/20 group-hover:to-sky-600/20 transition-colors">
        <Icon className="h-6 w-6 text-sky-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}
