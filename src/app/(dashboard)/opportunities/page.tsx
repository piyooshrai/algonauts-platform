"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Building2,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ExternalLink,
  IndianRupee,
  DollarSign,
} from "lucide-react";
import { Button, Input, Card, CardContent, Badge, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

const opportunities = [
  {
    id: 1,
    company: "Google",
    role: "Software Engineer Intern",
    location: "Bangalore, India",
    type: "Internship",
    salary: "₹80K/month",
    match: 95,
    logo: "G",
    posted: "2 days ago",
    skills: ["React", "Python", "Cloud"],
    description: "Join our team to work on cutting-edge products used by billions.",
    saved: false,
    invited: true,
  },
  {
    id: 2,
    company: "Microsoft",
    role: "Full Stack Developer",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "₹18-24 LPA",
    match: 88,
    logo: "M",
    posted: "3 days ago",
    skills: ["TypeScript", "Azure", "Node.js"],
    description: "Build products that empower every person and organization.",
    saved: true,
    invited: true,
  },
  {
    id: 3,
    company: "Stripe",
    role: "Backend Engineer",
    location: "Remote",
    type: "Full-time",
    salary: "$120K-150K",
    match: 82,
    logo: "S",
    posted: "1 week ago",
    skills: ["Go", "PostgreSQL", "APIs"],
    description: "Help us build the economic infrastructure for the internet.",
    saved: false,
    invited: false,
  },
  {
    id: 4,
    company: "Razorpay",
    role: "SDE 1",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "₹15-20 LPA",
    match: 79,
    logo: "R",
    posted: "5 days ago",
    skills: ["Java", "Spring Boot", "Kafka"],
    description: "Power the future of payments in India and beyond.",
    saved: false,
    invited: true,
  },
  {
    id: 5,
    company: "Flipkart",
    role: "Data Engineer",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "₹22-28 LPA",
    match: 75,
    logo: "F",
    posted: "1 week ago",
    skills: ["Python", "Spark", "SQL"],
    description: "Build data infrastructure for India's largest e-commerce platform.",
    saved: true,
    invited: false,
  },
  {
    id: 6,
    company: "Atlassian",
    role: "Frontend Developer Intern",
    location: "Remote",
    type: "Internship",
    salary: "₹60K/month",
    match: 72,
    logo: "A",
    posted: "2 weeks ago",
    skills: ["React", "TypeScript", "Testing"],
    description: "Help teams collaborate better with our suite of products.",
    saved: false,
    invited: false,
  },
];

const filterOptions = {
  type: [
    { value: "all", label: "All Types" },
    { value: "internship", label: "Internship" },
    { value: "fulltime", label: "Full-time" },
  ],
  location: [
    { value: "all", label: "All Locations" },
    { value: "bangalore", label: "Bangalore" },
    { value: "hyderabad", label: "Hyderabad" },
    { value: "remote", label: "Remote" },
  ],
  match: [
    { value: "all", label: "Any Match" },
    { value: "90", label: "90%+ Match" },
    { value: "80", label: "80%+ Match" },
    { value: "70", label: "70%+ Match" },
  ],
};

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [savedOpportunities, setSavedOpportunities] = useState<number[]>([2, 5]);
  const [filters, setFilters] = useState({
    type: "all",
    location: "all",
    match: "all",
  });

  const toggleSave = (id: number) => {
    setSavedOpportunities((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
        <div className="flex items-center gap-2">
          <Badge variant="info" className="gap-1">
            <span className="font-bold">3</span> invites
          </Badge>
        </div>
      </div>

      {/* Invited Section */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">You have 3 company invites!</p>
                <p className="text-sm text-muted-foreground">
                  These companies want you to apply based on your LayersRank
                </p>
              </div>
            </div>
            <Button size="sm">View Invites</Button>
          </div>
        </CardContent>
      </Card>

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
        <div className="flex gap-2">
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
            options={filterOptions.match}
            value={filters.match}
            onChange={(value) => setFilters({ ...filters, match: value })}
            placeholder="Match"
          />
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Main Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
                        {opportunity.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {opportunity.role}
                              </h3>
                              {opportunity.invited && (
                                <Badge variant="success" className="text-xs">
                                  Invited
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground">
                              {opportunity.company}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleSave(opportunity.id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {savedOpportunities.includes(opportunity.id) ? (
                              <BookmarkCheck className="h-5 w-5 text-primary" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {opportunity.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {opportunity.type}
                          </span>
                          <span className="flex items-center gap-1 text-success-600 font-medium">
                            {opportunity.salary.includes("$") ? (
                              <DollarSign className="h-4 w-4" />
                            ) : (
                              <IndianRupee className="h-4 w-4" />
                            )}
                            {opportunity.salary.replace(/[₹$]/g, "")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {opportunity.posted}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {opportunity.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {opportunity.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Match & Actions */}
                  <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-4 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-border bg-muted/30 lg:w-48">
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-3xl font-bold font-display",
                          opportunity.match >= 90
                            ? "text-success-600"
                            : opportunity.match >= 80
                            ? "text-blue-600"
                            : "text-warning-600"
                        )}
                      >
                        {opportunity.match}%
                      </div>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                    <Button className="w-full lg:w-auto gap-2">
                      Apply Now
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="gap-2">
          Load More Opportunities
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
