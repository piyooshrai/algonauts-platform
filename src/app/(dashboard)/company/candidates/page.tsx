"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserSearch,
  Search,
  ChevronRight,
  Loader2,
  Star,
  GraduationCap,
  Send,
} from "lucide-react";
import Link from "next/link";
import { Button, Input, Card, CardContent, Badge, Select, Avatar } from "@/components/ui";
import { api } from "@/lib/trpc/client";

const scoreFilters = [
  { value: "all", label: "Any Score" },
  { value: "80", label: "80+ Score" },
  { value: "70", label: "70+ Score" },
  { value: "60", label: "60+ Score" },
];

const experienceFilters = [
  { value: "all", label: "Any Experience" },
  { value: "0", label: "Freshers" },
  { value: "1", label: "1+ years" },
  { value: "2", label: "2+ years" },
];

export default function CandidatesSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch candidates - using profile search or leaderboard
  const { data: candidatesData, isLoading } = api.leaderboards.getStudentLeaderboard.useQuery({
    scope: "national",
    metric: "xp",
    limit: 50,
  });

  const candidates = candidatesData?.leaderboard || [];

  // Filter candidates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredCandidates = candidates.filter((candidate: any) => {
    const matchesSearch =
      !debouncedSearch ||
      candidate.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      candidate.collegeName?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesScore =
      scoreFilter === "all" || (candidate.score || 0) >= parseInt(scoreFilter);
    return matchesSearch && matchesScore;
  });

  const handleSendInvite = async () => {
    // In a real implementation, you'd show a modal to select the opportunity
    // For now, we'll just show an alert
    alert("Select an opportunity to send invite. This feature requires opportunity selection modal.");
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
          <UserSearch className="h-6 w-6 text-[#0EA5E9]" />
          Candidate Search
        </h1>
        <p className="text-[#6B7280] mt-1">Find and invite top talent to apply</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Search by name, college, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                options={scoreFilters}
                value={scoreFilter}
                onChange={setScoreFilter}
                placeholder="Score"
              />
              <Select
                options={experienceFilters}
                value={experienceFilter}
                onChange={setExperienceFilter}
                placeholder="Experience"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-[#6B7280]">
          Found <span className="font-semibold text-[#1F2937]">{filteredCandidates.length}</span> candidates
        </p>
      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UserSearch className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
            <p className="text-[#6B7280]">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filteredCandidates.map((candidate: any, index: number) => (
            <motion.div
              key={candidate.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card hover className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar
                      fallback={candidate.name || "?"}
                      src={candidate.avatarUrl}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#1F2937] truncate">
                          {candidate.name}
                        </h3>
                        {candidate.rank && candidate.rank <= 10 && (
                          <Badge variant="warning" className="text-xs gap-1">
                            <Star className="h-3 w-3" />
                            Top {candidate.rank}
                          </Badge>
                        )}
                      </div>
                      {candidate.collegeName && (
                        <p className="text-sm text-[#6B7280] flex items-center gap-1 mt-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {candidate.collegeName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">LayersRank Score</span>
                      <span className="text-lg font-bold text-[#0EA5E9]">
                        {candidate.score?.toLocaleString() || "-"}
                      </span>
                    </div>
                    {candidate.rank && (
                      <p className="text-xs text-[#6B7280] mt-1">
                        Rank #{candidate.rank.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/company/candidates/${candidate.userId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        View Profile
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => handleSendInvite(candidate.userId)}
                    >
                      <Send className="h-4 w-4" />
                      Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
