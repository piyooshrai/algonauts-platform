"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Select } from "@/components/ui";
import { api } from "@/lib/trpc/client";

const opportunityTypes = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
  { value: "PART_TIME", label: "Part-time" },
];

const experienceLevels = [
  { value: "0", label: "Entry Level (0-1 years)" },
  { value: "1", label: "Junior (1-3 years)" },
  { value: "3", label: "Mid-Level (3-5 years)" },
  { value: "5", label: "Senior (5+ years)" },
];

export default function PostOpportunityPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    type: "FULL_TIME",
    locations: [""],
    isRemote: false,
    salaryMin: "",
    salaryMax: "",
    experienceMin: "0",
    experienceMax: "1",
    spots: "",
    requiredSkills: [] as string[],
    niceToHaveSkills: [] as string[],
    applicationDeadline: "",
    minLayersRank: "",
  });

  const createMutation = api.opportunities.create.useMutation({
    onSuccess: (data) => {
      router.push(`/company/opportunities/${data.opportunity.id}`);
    },
    onError: (error) => {
      console.error("Failed to create opportunity:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setIsSubmitting(true);

    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements || undefined,
      type: formData.type as "FULL_TIME" | "INTERNSHIP" | "CONTRACT" | "PART_TIME",
      locations: formData.locations.filter((l) => l.trim() !== ""),
      isRemote: formData.isRemote,
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) * 100000 : undefined,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) * 100000 : undefined,
      minExperience: parseInt(formData.experienceMin),
      maxExperience: parseInt(formData.experienceMax),
      spots: formData.spots ? parseInt(formData.spots) : undefined,
      requiredSkills: formData.requiredSkills,
      preferredSkills: formData.niceToHaveSkills,
      expiresAt: formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined,
      minLayersRank: formData.minLayersRank ? parseInt(formData.minLayersRank) : undefined,
    });
  };

  const addSkill = (type: "required" | "niceToHave") => {
    if (!skillInput.trim()) return;
    const key = type === "required" ? "requiredSkills" : "niceToHaveSkills";
    if (!formData[key].includes(skillInput.trim())) {
      setFormData({ ...formData, [key]: [...formData[key], skillInput.trim()] });
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string, type: "required" | "niceToHave") => {
    const key = type === "required" ? "requiredSkills" : "niceToHaveSkills";
    setFormData({ ...formData, [key]: formData[key].filter((s) => s !== skill) });
  };

  const addLocation = () => {
    setFormData({ ...formData, locations: [...formData.locations, ""] });
  };

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...formData.locations];
    newLocations[index] = value;
    setFormData({ ...formData, locations: newLocations });
  };

  const removeLocation = (index: number) => {
    if (formData.locations.length > 1) {
      setFormData({ ...formData, locations: formData.locations.filter((_, i) => i !== index) });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/company" className="text-[#6B7280] hover:text-[#1F2937] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[#0EA5E9]" />
            Post New Opportunity
          </h1>
          <p className="text-[#6B7280] mt-1">Create a job posting to attract top talent</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                Job Title <span className="text-[#EF4444]">*</span>
              </label>
              <Input
                placeholder="e.g. Software Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                Job Type <span className="text-[#EF4444]">*</span>
              </label>
              <Select
                options={opportunityTypes}
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                Description <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent min-h-[150px] text-[#1F2937]"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                Requirements
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent min-h-[100px] text-[#1F2937]"
                placeholder="List the requirements for this role..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRemote"
                checked={formData.isRemote}
                onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                className="w-4 h-4 rounded border-[#E5E7EB] text-[#0EA5E9] focus:ring-[#0EA5E9]"
              />
              <label htmlFor="isRemote" className="text-sm text-[#1F2937]">
                This is a remote position
              </label>
            </div>

            {!formData.isRemote && (
              <div className="space-y-3">
                {formData.locations.map((location, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g. Bangalore, Mumbai"
                      value={location}
                      onChange={(e) => updateLocation(index, e.target.value)}
                    />
                    {formData.locations.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLocation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addLocation} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Compensation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">
                  Minimum Salary (LPA)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">
                  Maximum Salary (LPA)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 15"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience & Openings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Experience & Openings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">
                  Experience Level
                </label>
                <Select
                  options={experienceLevels}
                  value={formData.experienceMin}
                  onChange={(value) => setFormData({ ...formData, experienceMin: value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">
                  Number of Openings
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.spots}
                  onChange={(e) => setFormData({ ...formData, spots: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g. React, Python)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill("required");
                  }
                }}
              />
              <Button type="button" onClick={() => addSkill("required")}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requiredSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 py-1 px-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill, "required")}
                    className="ml-1 hover:text-[#EF4444]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deadline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Application Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/company">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.title || !formData.description}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Create Opportunity
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
