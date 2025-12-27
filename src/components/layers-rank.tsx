"use client";

import { cn } from "@/lib/utils";
import { formatRank } from "@/lib/utils";

interface LayersRankProps {
  rank: number;
  totalUsers?: number;
  size?: "sm" | "md" | "lg";
  showPercentile?: boolean;
  className?: string;
}

export function LayersRank({
  rank,
  totalUsers,
  size = "md",
  showPercentile = true,
  className,
}: LayersRankProps) {
  const percentile = totalUsers
    ? Math.round(((totalUsers - rank) / totalUsers) * 100)
    : null;

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const getTier = (rank: number) => {
    if (rank <= 100) return { name: "Elite", color: "from-amber-400 to-amber-600" };
    if (rank <= 500) return { name: "Diamond", color: "from-cyan-400 to-sky-600" };
    if (rank <= 1000) return { name: "Platinum", color: "from-violet-400 to-purple-600" };
    if (rank <= 5000) return { name: "Gold", color: "from-yellow-400 to-orange-500" };
    if (rank <= 10000) return { name: "Silver", color: "from-slate-300 to-slate-500" };
    return { name: "Bronze", color: "from-orange-400 to-orange-600" };
  };

  const tier = getTier(rank);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <span className={cn(labelSizes[size], "text-muted-foreground uppercase tracking-wider font-medium")}>
        LayersRank
      </span>
      <div
        className={cn(
          "font-display font-bold bg-gradient-to-r bg-clip-text text-transparent",
          tier.color,
          sizeClasses[size]
        )}
      >
        #{formatRank(rank).replace(/\D/g, "")}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r",
            tier.color
          )}
        >
          {tier.name}
        </span>
        {showPercentile && percentile !== null && (
          <span className={cn(labelSizes[size], "text-muted-foreground")}>
            Top {100 - percentile}%
          </span>
        )}
      </div>
    </div>
  );
}
