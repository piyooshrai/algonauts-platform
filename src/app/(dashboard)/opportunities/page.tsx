"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Building2,
  ChevronDown,
  ExternalLink,
  IndianRupee,
  Users,
  Zap,
  Loader2,
  X,
} from "lucide-react";
import { Button, Input, Card, CardContent, Badge, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc/client";
import Link from "next/link";

const filterOptions = {
  type: [
    { value: "all", label: "All Types" },
    { value: "FULL_TIME", label: "Full-time" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "CONTRACT", label: "Contract" },
    { value: "PART_TIME", label: "Part-time" },
  ],
  location: [
    { value: "all", label: "All Locations" },
    { value: "Bangalore", label: "Bangalore" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Delhi", label: "Delhi" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Remote", label: "Remote" },
  ],
  salary: [
    { value: "all", label: "Any Salary" },
    { value: "500000", label: "5+ LPA" },
    { value: "1000000", label: "10+ LPA" },
    { value: "1500000", label: "15+ LPA" },
    { value: "2000000", label: "20+ LPA" },
  ],
};

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    location: "all",
    salary: "all",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch opportunities from backend
  const {
    data: opportunitiesData,
    isLoading,
    refetch,
  } = api.opportunities.search.useQuery({
    query: debouncedSearch || undefined,
    type: filters.type !== "all" ? (filters.type as "FULL_TIME" | "INTERNSHIP" | "CONTRACT" | "PART_TIME") : undefined,
    location: filters.location !== "all" ? filters.location : undefined,
    salaryMin: filters.salary !== "all" ? parseInt(filters.salary) : undefined,
    limit: 20,
  });

  // TODO: Add getMyInvites endpoint to invites router
  const invitesCount = 0;

  const opportunities = opportunitiesData?.opportunities || [];

  const hasActiveFilters = filters.type !== "all" || filters.location !== "all" || filters.salary !== "all" || debouncedSearch;

  const clearFilters = () => {
    setFilters({ type: "all", location: "all", salary: "all" });
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Opportunities
          </h1>
          <p className="text-muted-foreground">
            Companies that match your profile are waiting to connect
          </p>
        </div>
        {invitesCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="info" className="gap-1">
              <span className="font-bold">{invitesCount}</span> invites
            </Badge>
          </div>
        )}
      </div>

      {/* Invited Section */}
      {invitesCount > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">You have {invitesCount} company invite{invitesCount > 1 ? "s" : ""}!</p>
                  <p className="text-sm text-muted-foreground">
                    These companies want you to apply based on your LayersRank
                  </p>
                </div>
              </div>
              <Link href="/invites">
                <Button size="sm">View Invites</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by company, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            options={filterOptions.type}
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value })}
            placeholder="Type"
          />
          <Select
            options={filterOptions.location}
            value={filters.location}
            onChange={(value) => setFilters({ ...filters, location: value })}
            placeholder="Location"
          />
          <Select
            options={filterOptions.salary}
            value={filters.salary}
            onChange={(value) => setFilters({ ...filters, salary: value })}
            placeholder="Salary"
          />
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && opportunities.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "No opportunities are available right now. Check back soon!"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Opportunities List */}
      {!isLoading && opportunities.length > 0 && (
        <div className="space-y-4">
          {opportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/opportunities/${opportunity.id}`}>
                <Card hover className="overflow-hidden cursor-pointer">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Main Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-xl flex-shrink-0 text-[#1F2937]">
                            {opportunity.company?.companyName?.substring(0, 2).toUpperCase() || "CO"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">
                                    {opportunity.title}
                                  </h3>
                                  {opportunity.scarcity?.demandLevel === "very_high" && (
                                    <Badge variant="destructive" className="text-xs gap-1">
                                      <Zap className="h-3 w-3" />
                                      Hot
                                    </Badge>
                                  )}
                                  {opportunity.company?.isVerified && (
                                    <Badge variant="success" className="text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground">
                                  {opportunity.company?.companyName}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {opportunity.isRemote ? "Remote" : opportunity.locations?.[0] || "Location TBD"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {opportunity.type?.replace("_", " ")}
                              </span>
                              <span className="flex items-center gap-1 text-success-600 font-medium">
                                <IndianRupee className="h-4 w-4" />
                                {opportunity.salaryMin && opportunity.salaryMax
                                  ? `${(opportunity.salaryMin / 100000).toFixed(0)}-${(opportunity.salaryMax / 100000).toFixed(0)} LPA`
                                  : "Competitive"}
                              </span>
                              {opportunity.publishedAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {formatTimeAgo(new Date(opportunity.publishedAt))}
                                </span>
                              )}
                            </div>

                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                              {opportunity.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                              {opportunity.requiredSkills?.slice(0, 4).map((skill: string) => (
                                <Badge key={skill} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                              {(opportunity.requiredSkills?.length || 0) > 4 && (
                                <Badge variant="secondary">
                                  +{(opportunity.requiredSkills?.length || 0) - 4} more
                                </Badge>
                              )}
                            </div>

                            {/* Scarcity signals */}
                            {opportunity.scarcity && (
                              <div className="flex items-center gap-4 mt-4 text-sm">
                                {opportunity.scarcity.totalApplications > 0 && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    {opportunity.scarcity.totalApplications} applied
                                  </span>
                                )}
                                {opportunity.scarcity.applicationsFromYourCollege > 0 && (
                                  <span className="text-primary font-medium">
                                    {opportunity.scarcity.applicationsFromYourCollege} from your college
                                  </span>
                                )}
                                {opportunity.scarcity.closingIn?.urgency !== "low" && (
                                  <span className="text-destructive font-medium">
                                    {opportunity.scarcity.closingIn?.type === "time"
                                      ? `${opportunity.scarcity.closingIn.value}h left`
                                      : `${opportunity.scarcity.closingIn?.value} spots left`}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Actions */}
                      <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-4 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-border bg-muted/30 lg:w-48">
                        <div className="text-center">
                          <div
                            className={cn(
                              "text-3xl font-bold font-display",
                              opportunity.scarcity?.demandLevel === "very_high"
                                ? "text-success-600"
                                : opportunity.scarcity?.demandLevel === "high"
                                ? "text-blue-600"
                                : "text-warning-600"
                            )}
                          >
                            {opportunity.scarcity?.demandLevel === "very_high"
                              ? "High"
                              : opportunity.scarcity?.demandLevel === "high"
                              ? "Good"
                              : "Open"}
                          </div>
                          <p className="text-xs text-muted-foreground">Demand</p>
                        </div>
                        <Button className="w-full lg:w-auto gap-2">
                          View Details
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {opportunitiesData?.nextCursor && (
        <div className="text-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => refetch()}
          >
            Load More Opportunities
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}
