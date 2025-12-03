"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  showSubtext?: boolean;
}

export function Logo({ size = "md", className, showText = true, showSubtext = true }: LogoProps) {
  const sizes = {
    sm: { icon: "h-6 w-6", text: "text-lg", subtext: "text-[10px]" },
    md: { icon: "h-8 w-8", text: "text-xl", subtext: "text-xs" },
    lg: { icon: "h-10 w-10", text: "text-2xl", subtext: "text-sm" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon - Abstract "A" made of layers */}
      <div className={cn("relative", sizes[size].icon)}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Bottom layer */}
          <path
            d="M20 36L4 26V14L20 4L36 14V26L20 36Z"
            className="fill-blue-600/20"
          />
          {/* Middle layer */}
          <path
            d="M20 30L8 22V16L20 8L32 16V22L20 30Z"
            className="fill-blue-600/40"
          />
          {/* Top layer */}
          <path
            d="M20 24L12 19V15L20 10L28 15V19L20 24Z"
            className="fill-blue-600"
          />
          {/* Center dot */}
          <circle cx="20" cy="17" r="3" className="fill-white" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-semibold tracking-tight leading-tight", sizes[size].text)}>
            Algonauts
          </span>
          {showSubtext && (
            <span className={cn("text-muted-foreground leading-tight", sizes[size].subtext)}>
              by The Algorithm
            </span>
          )}
        </div>
      )}
    </div>
  );
}
