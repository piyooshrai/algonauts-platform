"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  IndianRupee,
  Users,
  Zap,
  Loader2,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Calendar,
  Globe,
  ExternalLink,
  Share2,
  AlertCircle,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { api } from "@/lib/trpc/client";
import Link from "next/link";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as string;

  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  // Fetch opportunity details
  const { data: opportunity, isLoading, error } = api.opportunities.getById.useQuery({
    id: opportunityId,
  });

  // Check if already applied
  const { data: myApplications } = api.applications.getMyApplications.useQuery();
  const existingApplication = myApplications?.applications?.find(
    (app) => app.opportunityId === opportunityId
  );

  // Apply mutation
  const applyMutation = api.applications.start.useMutation({
    onSuccess: (data) => {
      setApplied(true);
      // Submit the application immediately (single-step application)
      submitMutation.mutate({
        applicationId: data.applicationId,
        responses: {},
      });
    },
    onError: (error) => {
      console.error("Failed to start application:", error);
      setIsApplying(false);
    },
  });

  const submitMutation = api.applications.submit.useMutation({
    onSuccess: () => {
      setIsApplying(false);
      router.push("/applications?success=true");
    },
    onError: (error) => {
      console.error("Failed to submit application:", error);
      setIsApplying(false);
    },
  });

  const handleApply = async () => {
    if (existingApplication || applied) return;

    setIsApplying(true);
    applyMutation.mutate({
      opportunityId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Opportunity Not Found</h2>
        <p className="text-muted-foreground mb-4">
          This opportunity may have been removed or is no longer available.
        </p>
        <Link href="/opportunities">
          <Button variant="outline">Back to Opportunities</Button>
        </Link>
      </div>
    );
  }

  const hasApplied = !!existingApplication || applied;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Opportunities
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Company Logo */}
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-2xl flex-shrink-0 text-[#1F2937]">
            {opportunity.company?.companyName?.substring(0, 2).toUpperCase() || "CO"}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-[#1F2937]">{opportunity.title}</h1>
              {opportunity.scarcity?.demandLevel === "very_high" && (
                <Badge variant="destructive" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Hot
                </Badge>
              )}
              {opportunity.company?.isVerified && (
                <Badge variant="success">Verified Company</Badge>
              )}
            </div>

            <p className="text-lg text-muted-foreground mb-4">
              {opportunity.company?.companyName}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {opportunity.isRemote ? "Remote" : opportunity.locations?.join(", ") || "Location TBD"}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {opportunity.type?.replace("_", " ")}
              </span>
              <span className="flex items-center gap-1.5 text-[#10B981] font-medium">
                <IndianRupee className="h-4 w-4" />
                {opportunity.salaryMin && opportunity.salaryMax
                  ? `${(opportunity.salaryMin / 100000).toFixed(0)}-${(opportunity.salaryMax / 100000).toFixed(0)} LPA`
                  : "Competitive Salary"}
              </span>
              {opportunity.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Posted {formatTimeAgo(new Date(opportunity.publishedAt))}
                </span>
              )}
            </div>

            {/* Scarcity Signals */}
            {opportunity.scarcity && (
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                {opportunity.scarcity.totalApplications > 0 && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {opportunity.scarcity.totalApplications} applicants
                  </span>
                )}
                {opportunity.scarcity.applicationsFromYourCollege > 0 && (
                  <span className="text-[#0EA5E9] font-medium">
                    {opportunity.scarcity.applicationsFromYourCollege} from your college
                  </span>
                )}
                {opportunity.scarcity.closingIn?.urgency !== "low" && (
                  <span className="text-destructive font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {opportunity.scarcity.closingIn?.type === "time"
                      ? `Closes in ${opportunity.scarcity.closingIn.value}h`
                      : `Only ${opportunity.scarcity.closingIn?.value} spots left`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Apply Button */}
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="gap-2 min-w-[160px]"
              onClick={handleApply}
              disabled={hasApplied || isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : hasApplied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Applied
                </>
              ) : (
                "Apply Now"
              )}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {opportunity.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{opportunity.requirements}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Required Skills */}
          {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {opportunity.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nice-to-Have Skills */}
          {opportunity.niceToHaveSkills && opportunity.niceToHaveSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nice to Have</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {opportunity.niceToHaveSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-sm py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                About {opportunity.company?.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {opportunity.company?.description && (
                <p className="text-sm text-muted-foreground">
                  {opportunity.company.description}
                </p>
              )}

              <div className="space-y-3 text-sm">
                {opportunity.company?.industry && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                    <span>{opportunity.company.industry}</span>
                  </div>
                )}
                {opportunity.company?.companySize && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>{opportunity.company.companySize} employees</span>
                  </div>
                )}
                {opportunity.company?.headquarters && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{opportunity.company.headquarters}</span>
                  </div>
                )}
                {opportunity.company?.website && (
                  <a
                    href={opportunity.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#0EA5E9] hover:underline"
                  >
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <span>Visit Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Job Type</p>
                  <p className="font-medium">{opportunity.type?.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">
                    {opportunity.experienceMin !== undefined && opportunity.experienceMax !== undefined
                      ? `${opportunity.experienceMin}-${opportunity.experienceMax} years`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Openings</p>
                  <p className="font-medium">{opportunity.spots || "Multiple"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deadline</p>
                  <p className="font-medium">
                    {opportunity.applicationDeadline
                      ? new Date(opportunity.applicationDeadline).toLocaleDateString()
                      : "Rolling"}
                  </p>
                </div>
              </div>

              {opportunity.minLayersRank && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Minimum LayersRank:</span>
                    <span className="font-medium">{opportunity.minLayersRank}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Status */}
          {hasApplied && (
            <Card className="border-[#10B981]/50 bg-[#10B981]/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-[#10B981]" />
                  <div>
                    <p className="font-medium text-[#10B981]">Application Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {existingApplication?.status === "SUBMITTED"
                        ? "Your application is being reviewed"
                        : existingApplication?.status === "SHORTLISTED"
                        ? "You've been shortlisted!"
                        : "Track progress in your applications"}
                    </p>
                  </div>
                </div>
                <Link href="/applications" className="block mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    View My Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
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
