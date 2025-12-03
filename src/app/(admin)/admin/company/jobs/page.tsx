"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Plus,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Trophy,
  Brain,
  Heart,
  Copy,
} from "lucide-react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Textarea,
  Select,
  Modal,
} from "@/components/ui";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  location: string;
  locationType: "remote" | "hybrid" | "onsite";
  compensation: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: {
    minRank: number;
    minTechnical: number;
    minBehavioral: number;
    graduationYears: number[];
    skills: string[];
  };
  matchingCandidates: number;
  applicants: number;
  status: "active" | "paused" | "closed";
  createdAt: string;
}

// Mock job postings
const mockJobPostings: JobPosting[] = [
  {
    id: "JOB-001",
    title: "Software Engineer",
    description: "Join our engineering team to build scalable web applications using modern technologies.",
    location: "Bangalore, India",
    locationType: "hybrid",
    compensation: { min: 1200000, max: 1800000, currency: "INR" },
    requirements: {
      minRank: 500,
      minTechnical: 75,
      minBehavioral: 70,
      graduationYears: [2024, 2025],
      skills: ["JavaScript", "React", "Node.js"],
    },
    matchingCandidates: 234,
    applicants: 45,
    status: "active",
    createdAt: "2024-01-10",
  },
  {
    id: "JOB-002",
    title: "Data Analyst",
    description: "Analyze large datasets to derive actionable insights for business decisions.",
    location: "Mumbai, India",
    locationType: "onsite",
    compensation: { min: 800000, max: 1200000, currency: "INR" },
    requirements: {
      minRank: 300,
      minTechnical: 80,
      minBehavioral: 65,
      graduationYears: [2024, 2025],
      skills: ["Python", "SQL", "Machine Learning"],
    },
    matchingCandidates: 156,
    applicants: 28,
    status: "active",
    createdAt: "2024-01-08",
  },
  {
    id: "JOB-003",
    title: "Product Manager",
    description: "Lead product development from ideation to launch, working with cross-functional teams.",
    location: "Remote",
    locationType: "remote",
    compensation: { min: 1500000, max: 2500000, currency: "INR" },
    requirements: {
      minRank: 200,
      minTechnical: 70,
      minBehavioral: 85,
      graduationYears: [2023, 2024],
      skills: ["Product Strategy", "Data Analysis"],
    },
    matchingCandidates: 89,
    applicants: 12,
    status: "paused",
    createdAt: "2024-01-05",
  },
  {
    id: "JOB-004",
    title: "DevOps Engineer",
    description: "Build and maintain CI/CD pipelines, infrastructure automation, and cloud deployments.",
    location: "Delhi NCR, India",
    locationType: "hybrid",
    compensation: { min: 1000000, max: 1600000, currency: "INR" },
    requirements: {
      minRank: 400,
      minTechnical: 80,
      minBehavioral: 70,
      graduationYears: [2024, 2025],
      skills: ["AWS", "Docker", "Kubernetes"],
    },
    matchingCandidates: 112,
    applicants: 19,
    status: "closed",
    createdAt: "2024-01-01",
  },
];

const locationTypeOptions = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState(mockJobPostings);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [newJob, setNewJob] = useState<{
    title: string;
    description: string;
    location: string;
    locationType: "remote" | "hybrid" | "onsite";
    compensationMin: string;
    compensationMax: string;
    minRank: string;
    minTechnical: string;
    minBehavioral: string;
    skills: string;
  }>({
    title: "",
    description: "",
    location: "",
    locationType: "hybrid",
    compensationMin: "",
    compensationMax: "",
    minRank: "",
    minTechnical: "70",
    minBehavioral: "70",
    skills: "",
  });

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "INR") {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      }
      return `₹${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: JobPosting["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "paused":
        return <Badge variant="warning">Paused</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
    }
  };

  const toggleJobStatus = (jobId: string) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: job.status === "active" ? "paused" : "active"
        };
      }
      return job;
    }));
  };

  const handleCreateJob = () => {
    const job: JobPosting = {
      id: `JOB-${String(jobs.length + 1).padStart(3, "0")}`,
      title: newJob.title,
      description: newJob.description,
      location: newJob.location,
      locationType: newJob.locationType,
      compensation: {
        min: parseInt(newJob.compensationMin) || 0,
        max: parseInt(newJob.compensationMax) || 0,
        currency: "INR",
      },
      requirements: {
        minRank: parseInt(newJob.minRank) || 500,
        minTechnical: parseInt(newJob.minTechnical) || 70,
        minBehavioral: parseInt(newJob.minBehavioral) || 70,
        graduationYears: [2024, 2025],
        skills: newJob.skills.split(",").map(s => s.trim()).filter(Boolean),
      },
      matchingCandidates: Math.floor(Math.random() * 200) + 50,
      applicants: 0,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setJobs([job, ...jobs]);
    setShowCreateModal(false);
    setNewJob({
      title: "",
      description: "",
      location: "",
      locationType: "hybrid",
      compensationMin: "",
      compensationMax: "",
      minRank: "",
      minTechnical: "70",
      minBehavioral: "70",
      skills: "",
    });
  };

  const activeJobs = jobs.filter(j => j.status === "active").length;
  const totalMatching = jobs.reduce((sum, j) => sum + j.matchingCandidates, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your job listings
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Job Posting
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{jobs.length}</p>
                <p className="text-sm text-muted-foreground">Total Postings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success-500/10">
                <Eye className="h-5 w-5 text-success-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeJobs}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMatching.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Matching Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Job Listings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Main Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <p className="text-muted-foreground line-clamp-2">{job.description}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                      <Badge variant="outline" className="ml-1 text-xs">
                        {job.locationType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(job.compensation.min, job.compensation.currency)} -{" "}
                      {formatCurrency(job.compensation.max, job.compensation.currency)}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Requirements</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Trophy className="h-3 w-3" />
                        Top {job.requirements.minRank}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Brain className="h-3 w-3" />
                        Tech ≥{job.requirements.minTechnical}%
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Heart className="h-3 w-3" />
                        Behavioral ≥{job.requirements.minBehavioral}%
                      </Badge>
                      {job.requirements.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Side Stats */}
                <div className="lg:w-64 p-6 bg-muted/30 border-t lg:border-t-0 lg:border-l border-border">
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">{job.matchingCandidates}</p>
                      <p className="text-sm text-muted-foreground">Matching candidates</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{job.applicants}</p>
                      <p className="text-sm text-muted-foreground">Invites sent</p>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => toggleJobStatus(job.id)}
                      >
                        {job.status === "active" ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => window.location.href = "/admin/company/discover"}
                      >
                        Find Candidates
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Create Job Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Job Posting"
        description="Define the role and requirements"
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Job Title</label>
              <Input
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Describe the role and responsibilities..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="e.g., Bangalore, India"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Work Type</label>
                <Select
                  options={locationTypeOptions}
                  value={newJob.locationType}
                  onChange={(value) => setNewJob({ ...newJob, locationType: value as "remote" | "hybrid" | "onsite" })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Min Compensation (INR)</label>
                <Input
                  type="number"
                  value={newJob.compensationMin}
                  onChange={(e) => setNewJob({ ...newJob, compensationMin: e.target.value })}
                  placeholder="e.g., 1200000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Max Compensation (INR)</label>
                <Input
                  type="number"
                  value={newJob.compensationMax}
                  onChange={(e) => setNewJob({ ...newJob, compensationMax: e.target.value })}
                  placeholder="e.g., 1800000"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="font-medium">LayersRank Requirements</h4>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Trophy className="h-4 w-4 inline mr-1" />
                  Max Rank
                </label>
                <Input
                  type="number"
                  value={newJob.minRank}
                  onChange={(e) => setNewJob({ ...newJob, minRank: e.target.value })}
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Brain className="h-4 w-4 inline mr-1" />
                  Min Technical %
                </label>
                <Input
                  type="number"
                  value={newJob.minTechnical}
                  onChange={(e) => setNewJob({ ...newJob, minTechnical: e.target.value })}
                  placeholder="70"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Heart className="h-4 w-4 inline mr-1" />
                  Min Behavioral %
                </label>
                <Input
                  type="number"
                  value={newJob.minBehavioral}
                  onChange={(e) => setNewJob({ ...newJob, minBehavioral: e.target.value })}
                  placeholder="70"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Required Skills (comma-separated)</label>
              <Input
                value={newJob.skills}
                onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                placeholder="e.g., JavaScript, React, Node.js"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateJob}
              disabled={!newJob.title || !newJob.description}
            >
              Create Posting
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Job Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={`Edit: ${selectedJob?.title}`}
        description="Update job posting details"
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                This job currently has <strong>{selectedJob.matchingCandidates}</strong> matching
                candidates and <strong>{selectedJob.applicants}</strong> invites sent.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button variant="destructive" className="flex-1 gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
