"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PartyPopper,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Badge } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function ReportPlacementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    location: "",
    startDate: "",
    salaryOffered: "",
    offerLetterUrl: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const createMutation = api.placements.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      companyName: formData.companyName,
      jobTitle: formData.jobTitle,
      location: formData.location || undefined,
      startDate: new Date(formData.startDate),
      salaryOffered: formData.salaryOffered ? parseInt(formData.salaryOffered) * 100000 : undefined,
      offerLetterUrl: formData.offerLetterUrl || undefined,
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
      >
        <Card className="text-center">
          <CardContent className="p-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="h-10 w-10 text-[#10B981]" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold text-[#1F2937] mb-2">
              Congratulations!
            </h2>
            <p className="text-[#6B7280] mb-6">
              Your placement at <strong>{formData.companyName}</strong> has been recorded.
              We'll remind you to complete your verification at 30 and 90 days.
            </p>

            <div className="bg-[#FEF3C7] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-[#F59E0B]">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">+50 XP earned!</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/placements">
                <Button className="w-full gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  View My Placements
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/placements">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <PartyPopper className="h-6 w-6 text-[#F59E0B]" />
            Report Placement
          </h1>
          <p className="text-[#6B7280] mt-1">Tell us about your new job offer!</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#0EA5E9]" />
            Placement Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Company Name <span className="text-[#EF4444]">*</span>
              </label>
              <Input
                icon={Building2}
                placeholder="e.g., Google, Microsoft, TCS"
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                required
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Job Title <span className="text-[#EF4444]">*</span>
              </label>
              <Input
                icon={Briefcase}
                placeholder="e.g., Software Engineer, Data Analyst"
                value={formData.jobTitle}
                onChange={(e) => updateField("jobTitle", e.target.value)}
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Work Location
              </label>
              <Input
                icon={MapPin}
                placeholder="e.g., Bangalore, Hyderabad, Remote"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Start Date <span className="text-[#EF4444]">*</span>
              </label>
              <Input
                type="date"
                icon={Calendar}
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                required
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Annual Package (LPA)
              </label>
              <Input
                type="number"
                icon={DollarSign}
                placeholder="e.g., 12 for 12 LPA"
                value={formData.salaryOffered}
                onChange={(e) => updateField("salaryOffered", e.target.value)}
                min="0"
                step="0.1"
              />
              <p className="text-xs text-[#6B7280] mt-1">
                This helps us track industry trends. It's kept confidential.
              </p>
            </div>

            {/* Offer Letter */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Offer Letter URL (optional)
              </label>
              <Input
                icon={FileText}
                placeholder="Link to your offer letter (Google Drive, Dropbox, etc.)"
                value={formData.offerLetterUrl}
                onChange={(e) => updateField("offerLetterUrl", e.target.value)}
              />
              <p className="text-xs text-[#6B7280] mt-1">
                Upload for faster verification. We keep all documents secure.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-[#E5E7EB]">
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={createMutation.isPending || !formData.companyName || !formData.jobTitle || !formData.startDate}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <PartyPopper className="h-4 w-4" />
                    Report Placement
                  </>
                )}
              </Button>
            </div>

            {createMutation.error && (
              <div className="p-4 bg-[#FEE2E2] rounded-lg text-[#EF4444] text-sm">
                {createMutation.error.message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* XP Reward Info */}
      <Card className="bg-gradient-to-r from-[#F59E0B]/10 to-[#EC4899]/10 border-[#F59E0B]/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[#F59E0B]" />
            </div>
            <div>
              <p className="font-semibold text-[#1F2937]">Earn XP for your placement!</p>
              <p className="text-sm text-[#6B7280]">
                Report: +50 XP • 30-day verification: +75 XP • 90-day verification: +100 XP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
