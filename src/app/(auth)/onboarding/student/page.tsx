"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  GraduationCap,
  Code,
  Upload,
  CheckCircle2,
  Sparkles,
  Phone,
  X,
} from "lucide-react";
import { Button, Input, Select, Progress } from "@/components/ui";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc/client";

const steps = [
  { id: "basic", title: "Basic Info", icon: User },
  { id: "education", title: "Education", icon: GraduationCap },
  { id: "skills", title: "Skills", icon: Code },
  { id: "resume", title: "Resume", icon: Upload },
];

const skillOptions = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C", "Go", "Rust",
  "React", "Vue", "Angular", "Next.js", "Node.js", "Express", "Django", "Spring Boot",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "MongoDB", "PostgreSQL", "MySQL", "Redis",
  "Machine Learning", "Data Science", "Deep Learning", "NLP", "Computer Vision",
  "DevOps", "CI/CD", "System Design", "Microservices", "REST API", "GraphQL",
  "Git", "Linux", "Agile", "Scrum",
];

const degreeOptions = [
  { value: "btech", label: "B.Tech / B.E." },
  { value: "bsc", label: "B.Sc." },
  { value: "bca", label: "BCA" },
  { value: "mtech", label: "M.Tech / M.E." },
  { value: "msc", label: "M.Sc." },
  { value: "mca", label: "MCA" },
  { value: "phd", label: "Ph.D." },
  { value: "other", label: "Other" },
];

const majorOptions = [
  { value: "cs", label: "Computer Science" },
  { value: "it", label: "Information Technology" },
  { value: "ece", label: "Electronics & Communication" },
  { value: "ee", label: "Electrical Engineering" },
  { value: "me", label: "Mechanical Engineering" },
  { value: "civil", label: "Civil Engineering" },
  { value: "data_science", label: "Data Science" },
  { value: "ai_ml", label: "AI & Machine Learning" },
  { value: "other", label: "Other" },
];

const graduationYears = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028" },
  { value: "graduated", label: "Already Graduated" },
];

function StudentOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const focusRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: "",
    lastName: "",
    phone: "",
    // Education
    college: "",
    degree: "",
    major: "",
    graduationYear: "",
    // Skills
    skills: [] as string[],
    customSkill: "",
    // Resume
    resume: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusField, setFocusField] = useState<string | null>(null);

  // Handle query params for deep linking from dashboard
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const focusParam = searchParams.get("focus");

    if (stepParam) {
      const stepNum = parseInt(stepParam, 10);
      if (!isNaN(stepNum) && stepNum >= 0 && stepNum < steps.length) {
        setCurrentStep(stepNum);
      }
    }

    if (focusParam) {
      setFocusField(focusParam);
    }
  }, [searchParams]);

  // Focus the relevant field when focusField changes
  useEffect(() => {
    if (focusField && focusRef.current) {
      focusRef.current.focus();
      focusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusField, currentStep]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.phone.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.phone)) {
          newErrors.phone = "Please enter a valid phone number";
        }
        break;
      case 1: // Education
        if (!formData.college.trim()) newErrors.college = "College name is required";
        if (!formData.degree) newErrors.degree = "Degree is required";
        if (!formData.major) newErrors.major = "Major is required";
        if (!formData.graduationYear) newErrors.graduationYear = "Graduation year is required";
        break;
      case 2: // Skills
        if (formData.skills.length === 0) newErrors.skills = "Please select at least one skill";
        break;
      // Step 3 (Resume) is optional
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
    setErrors((prev) => ({ ...prev, skills: "" }));
  };

  const handleAddCustomSkill = () => {
    if (formData.customSkill.trim() && !formData.skills.includes(formData.customSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.customSkill.trim()],
        customSkill: "",
      }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: "File size must be less than 5MB" }));
        return;
      }
      if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
        setErrors((prev) => ({ ...prev, resume: "Please upload a PDF or Word document" }));
        return;
      }
      setFormData((prev) => ({ ...prev, resume: file }));
      setErrors((prev) => ({ ...prev, resume: "" }));
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  // Profile update mutation
  const updateProfileMutation = api.profile.update.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Failed to save profile:", error);
      setErrors({ submit: error.message || "Failed to save profile. Please try again." });
      setIsLoading(false);
    },
  });

  const handleComplete = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Upload resume if provided
      let resumeUrl: string | undefined;
      if (formData.resume) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.resume);

        const uploadResponse = await fetch("/api/upload/resume", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload resume");
        }

        const uploadResult = await uploadResponse.json();
        resumeUrl = uploadResult.url;
      }

      // Parse graduation year
      const gradYear = formData.graduationYear === "graduated"
        ? new Date().getFullYear()
        : parseInt(formData.graduationYear);

      // Save profile data via tRPC
      updateProfileMutation.mutate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        collegeName: formData.college,
        degree: degreeOptions.find(d => d.value === formData.degree)?.label || formData.degree,
        branch: majorOptions.find(m => m.value === formData.major)?.label || formData.major,
        graduationYear: gradYear,
        skills: formData.skills,
        ...(resumeUrl && { resumeUrl }),
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to complete onboarding. Please try again."
      });
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">Tell us about yourself</h2>
              <p className="text-muted-foreground text-sm">
                This helps companies get to know you better.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    error={errors.firstName}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    error={errors.lastName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  icon={Phone}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={errors.phone}
                />
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Education</h2>
              <p className="text-muted-foreground text-sm">
                Help us understand your academic background.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">College/University *</label>
                <Input
                  placeholder="Search for your college..."
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  error={errors.college}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Degree *</label>
                  <Select
                    options={degreeOptions}
                    value={formData.degree}
                    onChange={(value) => setFormData({ ...formData, degree: value })}
                    placeholder="Select degree"
                    error={errors.degree}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Major *</label>
                  <Select
                    options={majorOptions}
                    value={formData.major}
                    onChange={(value) => setFormData({ ...formData, major: value })}
                    placeholder="Select major"
                    error={errors.major}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Graduation Year *</label>
                <Select
                  options={graduationYears}
                  value={formData.graduationYear}
                  onChange={(value) => setFormData({ ...formData, graduationYear: value })}
                  placeholder="Select year"
                  error={errors.graduationYear}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Skills</h2>
              <p className="text-muted-foreground text-sm">
                Select skills you&apos;re proficient in. This helps match you with relevant opportunities.
              </p>
            </div>

            {/* Selected Skills */}
            {formData.skills.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Skills ({formData.skills.length})</label>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Skill */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Custom Skill</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Add"
                  value={formData.customSkill}
                  onChange={(e) => setFormData({ ...formData, customSkill: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddCustomSkill}>
                  Add
                </Button>
              </div>
            </div>

            {/* Skill Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Common Skills</label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
                {skillOptions.filter(s => !formData.skills.includes(s)).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {errors.skills && (
              <p className="text-sm text-red-500">{errors.skills}</p>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">Upload Your Resume</h2>
              <p className="text-muted-foreground text-sm">
                Upload your resume to help companies learn more about you. This step is optional.
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  formData.resume ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
              >
                {formData.resume ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{formData.resume.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(formData.resume.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, resume: null })}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-3 block">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">
                        PDF or Word document (max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {errors.resume && (
                <p className="text-sm text-red-500">{errors.resume}</p>
              )}

              <p className="text-xs text-muted-foreground">
                Your resume will be visible to companies when they view your profile.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            Skip for now
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps[currentStep].title}
            </span>
          </div>
          <Progress value={progress} size="sm" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5",
                      isCompleted ? "bg-emerald-500" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Complete Profile
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StudentOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <StudentOnboardingContent />
    </Suspense>
  );
}
