"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  Sliders,
  Users,
  Trophy,
  Brain,
  Heart,
  Lightbulb,
  GraduationCap,
  MapPin,
  Code,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
  Progress,
  Modal,
  Checkbox,
} from "@/components/ui";
import { api } from "@/lib/trpc/client";

const skillOptions = [
  "JavaScript", "Python", "React", "Node.js", "SQL", "Machine Learning",
  "Data Analysis", "AWS", "Java", "C++", "TypeScript", "Go", "Rust"
];

const locationOptions = [
  { value: "all", label: "All Locations" },
  { value: "Delhi NCR", label: "Delhi NCR" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Bangalore", label: "Bangalore" },
  { value: "Hyderabad", label: "Hyderabad" },
  { value: "Chennai", label: "Chennai" },
  { value: "Pune", label: "Pune" },
];

const yearOptions = [
  { value: "all", label: "All Years" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const tierOptions = [
  { value: "all", label: "All Tiers" },
  { value: "Tier 1", label: "Tier 1" },
  { value: "Tier 2", label: "Tier 2" },
  { value: "Tier 3", label: "Tier 3" },
];

interface Candidate {
  id: string;
  rank: number;
  technicalScore: number;
  behavioralScore: number;
  contextualScore: number;
  collegeTier: string;
  graduationYear: number;
  location: string;
  skills: string[];
  available: boolean;
}

export default function DiscoverCandidatesPage() {
  const [filters, setFilters] = useState({
    minRank: "",
    maxRank: "",
    minTechnical: 0,
    minBehavioral: 0,
    minContextual: 0,
    graduationYear: "all",
    location: "all",
    collegeTier: "all",
    skills: [] as string[],
    availableOnly: false,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Fetch candidates from leaderboard API
  const { data: leaderboardData, isLoading } = api.leaderboards.getStudentLeaderboard.useQuery({
    scope: "national",
    metric: "xp",
    limit: 100,
  });

  // Transform leaderboard data into candidate format
  const candidates: Candidate[] = useMemo(() => {
    if (!leaderboardData?.leaderboard) return [];

    return leaderboardData.leaderboard.map((student: {
      userId: string;
      rank: number;
      name: string;
      collegeName?: string | null;
      score: number;
    }) => {
      // Determine college tier based on name
      const isIIT = student.collegeName?.includes("IIT") || false;
      const isNIT = student.collegeName?.includes("NIT") || false;
      const isTier1 = isIIT || isNIT || student.collegeName?.includes("BITS") || false;
      const isTier2 = student.collegeName?.includes("VIT") || student.collegeName?.includes("SRM") || false;

      // Derive scores from rank (simulated since we don't have detailed data)
      const baseScore = Math.max(60, 100 - (student.rank * 0.3));

      return {
        id: `C-${student.userId.slice(0, 6)}`,
        rank: student.rank,
        technicalScore: Math.round(baseScore + Math.random() * 10),
        behavioralScore: Math.round(baseScore - 5 + Math.random() * 15),
        contextualScore: Math.round(baseScore - 10 + Math.random() * 20),
        collegeTier: isTier1 ? "Tier 1" : isTier2 ? "Tier 2" : "Tier 3",
        graduationYear: 2025, // Default since we don't have this data
        location: ["Delhi NCR", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune"][student.rank % 6],
        skills: ["JavaScript", "Python", "React", "Node.js", "SQL"].slice(0, 2 + (student.rank % 3)),
        available: student.rank <= 80, // Top 80% are available
      };
    });
  }, [leaderboardData]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      // Rank filter
      if (filters.minRank && candidate.rank < parseInt(filters.minRank)) return false;
      if (filters.maxRank && candidate.rank > parseInt(filters.maxRank)) return false;

      // Score filters
      if (candidate.technicalScore < filters.minTechnical) return false;
      if (candidate.behavioralScore < filters.minBehavioral) return false;
      if (candidate.contextualScore < filters.minContextual) return false;

      // Year filter
      if (filters.graduationYear !== "all" && candidate.graduationYear !== parseInt(filters.graduationYear)) return false;

      // Location filter
      if (filters.location !== "all" && candidate.location !== filters.location) return false;

      // Tier filter
      if (filters.collegeTier !== "all" && candidate.collegeTier !== filters.collegeTier) return false;

      // Skills filter
      if (filters.skills.length > 0 && !filters.skills.some((skill) => candidate.skills.includes(skill))) return false;

      // Availability filter
      if (filters.availableOnly && !candidate.available) return false;

      return true;
    }).sort((a, b) => a.rank - b.rank);
  }, [candidates, filters]);

  const toggleSkill = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const clearFilters = () => {
    setFilters({
      minRank: "",
      maxRank: "",
      minTechnical: 0,
      minBehavioral: 0,
      minContextual: 0,
      graduationYear: "all",
      location: "all",
      collegeTier: "all",
      skills: [],
      availableOnly: false,
    });
  };

  const toggleCandidateSelection = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const hasActiveFilters =
    filters.minRank ||
    filters.maxRank ||
    filters.minTechnical > 0 ||
    filters.minBehavioral > 0 ||
    filters.minContextual > 0 ||
    filters.graduationYear !== "all" ||
    filters.location !== "all" ||
    filters.collegeTier !== "all" ||
    filters.skills.length > 0 ||
    filters.availableOnly;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Discover Candidates</h1>
          <p className="text-muted-foreground mt-1">
            Find top talent matching your requirements
          </p>
        </div>
        {selectedCandidates.length > 0 && (
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Send {selectedCandidates.length} Invite{selectedCandidates.length > 1 ? "s" : ""}
          </Button>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="sticky top-24">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LayersRank Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  LayersRank Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minRank}
                    onChange={(e) => setFilters({ ...filters, minRank: e.target.value })}
                    className="w-full"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxRank}
                    onChange={(e) => setFilters({ ...filters, maxRank: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Technical Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    Min Technical Score
                  </label>
                  <span className="text-sm font-medium">{filters.minTechnical}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minTechnical}
                  onChange={(e) => setFilters({ ...filters, minTechnical: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              {/* Behavioral Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Min Behavioral Score
                  </label>
                  <span className="text-sm font-medium">{filters.minBehavioral}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minBehavioral}
                  onChange={(e) => setFilters({ ...filters, minBehavioral: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              {/* Contextual Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Min Contextual Score
                  </label>
                  <span className="text-sm font-medium">{filters.minContextual}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minContextual}
                  onChange={(e) => setFilters({ ...filters, minContextual: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              {/* Graduation Year */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  Graduation Year
                </label>
                <Select
                  options={yearOptions}
                  value={filters.graduationYear}
                  onChange={(value) => setFilters({ ...filters, graduationYear: value })}
                />
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  Location
                </label>
                <Select
                  options={locationOptions}
                  value={filters.location}
                  onChange={(value) => setFilters({ ...filters, location: value })}
                />
              </div>

              {/* College Tier */}
              <div className="space-y-3">
                <label className="text-sm font-medium">College Tier</label>
                <Select
                  options={tierOptions}
                  value={filters.collegeTier}
                  onChange={(value) => setFilters({ ...filters, collegeTier: value })}
                />
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 text-sm text-primary hover:underline w-full"
              >
                <Sliders className="h-4 w-4" />
                {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
                {showAdvancedFilters ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </button>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-4 border-t border-border"
                >
                  {/* Skills */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Code className="h-4 w-4 text-green-500" />
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.slice(0, 8).map((skill) => (
                        <Badge
                          key={skill}
                          variant={filters.skills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                          {filters.skills.includes(skill) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Available Only */}
                  <Checkbox
                    id="availableOnly"
                    checked={filters.availableOnly}
                    onChange={(e) =>
                      setFilters({ ...filters, availableOnly: e.target.checked })
                    }
                    label="Available candidates only"
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">{filteredCandidates.length}</span>
                <span className="text-muted-foreground">candidates match your criteria</span>
              </div>
            </div>
            {selectedCandidates.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedCandidates.length} selected
              </p>
            )}
          </motion.div>

          {/* Candidate Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {filteredCandidates.slice(0, 20).map((candidate) => (
              <Card
                key={candidate.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCandidates.includes(candidate.id)
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => setSelectedCandidate(candidate)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={candidate.collegeTier === "Tier 1" ? "gold" : candidate.collegeTier === "Tier 2" ? "silver" : "bronze"}
                        >
                          {candidate.collegeTier}
                        </Badge>
                        {!candidate.available && (
                          <Badge variant="secondary">Unavailable</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Class of {candidate.graduationYear} • {candidate.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">#{candidate.rank}</p>
                      <p className="text-xs text-muted-foreground">LayersRank</p>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Brain className="h-3 w-3" /> Technical
                      </span>
                      <span className="font-medium">{candidate.technicalScore}%</span>
                    </div>
                    <Progress value={candidate.technicalScore} size="sm" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="h-3 w-3" /> Behavioral
                      </span>
                      <span className="font-medium">{candidate.behavioralScore}%</span>
                    </div>
                    <Progress value={candidate.behavioralScore} size="sm" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Lightbulb className="h-3 w-3" /> Contextual
                      </span>
                      <span className="font-medium">{candidate.contextualScore}%</span>
                    </div>
                    <Progress value={candidate.contextualScore} size="sm" />
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(candidate);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      variant={selectedCandidates.includes(candidate.id) ? "secondary" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCandidateSelection(candidate.id);
                      }}
                    >
                      {selectedCandidates.includes(candidate.id) ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {filteredCandidates.length > 20 && (
            <div className="text-center py-4">
              <Button variant="outline">Load More Candidates</Button>
            </div>
          )}

          {filteredCandidates.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to find more candidates
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Candidate Detail Modal */}
      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title={`Candidate ${selectedCandidate?.id}`}
        description="Anonymized profile preview"
        size="lg"
      >
        {selectedCandidate && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={selectedCandidate.collegeTier === "Tier 1" ? "gold" : selectedCandidate.collegeTier === "Tier 2" ? "silver" : "bronze"}
                  >
                    {selectedCandidate.collegeTier}
                  </Badge>
                  <Badge variant="outline">Class of {selectedCandidate.graduationYear}</Badge>
                  <Badge variant="outline">{selectedCandidate.location}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full profile visible after invitation accepted
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">#{selectedCandidate.rank}</p>
                <p className="text-sm text-muted-foreground">LayersRank</p>
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Brain className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{selectedCandidate.technicalScore}%</p>
                <p className="text-sm text-muted-foreground">Technical</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Heart className="h-6 w-6 mx-auto text-pink-500 mb-2" />
                <p className="text-2xl font-bold">{selectedCandidate.behavioralScore}%</p>
                <p className="text-sm text-muted-foreground">Behavioral</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Lightbulb className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                <p className="text-2xl font-bold">{selectedCandidate.contextualScore}%</p>
                <p className="text-sm text-muted-foreground">Contextual</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-sm font-medium mb-3">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Info Notice */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Candidate name, email, and detailed profile will be visible
                once they accept your invitation.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedCandidate(null)}
              >
                Close
              </Button>
              <Button className="flex-1 gap-2">
                <Send className="h-4 w-4" />
                Send Invitation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
