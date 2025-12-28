"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  GraduationCap,
  Code,
  Target,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button, Input, Select, Progress } from "@/components/ui";
import { Logo } from "@/components/logo";

const steps = [
  { id: "profile", title: "Your Profile", icon: User },
  { id: "education", title: "Education", icon: GraduationCap },
  { id: "skills", title: "Skills", icon: Code },
  { id: "goals", title: "Goals", icon: Target },
];

const skillOptions = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "React", "Vue", "Angular", "Node.js", "Django", "Spring Boot",
  "AWS", "Docker", "Kubernetes", "MongoDB", "PostgreSQL", "Redis",
  "Machine Learning", "Data Science", "DevOps", "System Design",
];

const goalOptions = [
  { value: "internship", label: "Land an Internship" },
  { value: "fulltime", label: "Get a Full-time Job" },
  { value: "upskill", label: "Upskill & Learn" },
  { value: "explore", label: "Explore Opportunities" },
];

const experienceOptions = [
  { value: "0", label: "No experience (Student)" },
  { value: "0-1", label: "0-1 years" },
  { value: "1-2", label: "1-2 years" },
  { value: "2+", label: "2+ years" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Profile
    phone: "",
    location: "",
    // Education
    college: "",
    degree: "",
    graduationYear: "",
    experience: "",
    // Skills
    skills: [] as string[],
    // Goals
    primaryGoal: "",
    targetCompanies: "",
    availability: "",
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Save onboarding data
    router.push("/dashboard");
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
                This helps companies find and connect with you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  type="text"
                  placeholder="Bangalore, India"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                <label className="text-sm font-medium">College/University</label>
                <Input
                  type="text"
                  placeholder="IIT Delhi"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Degree</label>
                <Input
                  type="text"
                  placeholder="B.Tech in Computer Science"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Graduation Year</label>
                <Select
                  options={[
                    { value: "2024", label: "2024" },
                    { value: "2025", label: "2025" },
                    { value: "2026", label: "2026" },
                    { value: "2027", label: "2027" },
                    { value: "graduated", label: "Already Graduated" },
                  ]}
                  value={formData.graduationYear}
                  onChange={(value) => setFormData({ ...formData, graduationYear: value })}
                  placeholder="Select year"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Work Experience</label>
                <Select
                  options={experienceOptions}
                  value={formData.experience}
                  onChange={(value) => setFormData({ ...formData, experience: value })}
                  placeholder="Select experience"
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

            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    formData.skills.includes(skill)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {formData.skills.includes(skill) && (
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                  )}
                  {skill}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Selected: {formData.skills.length} skills
            </p>
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
              <h2 className="text-xl font-semibold mb-2">Your Goals</h2>
              <p className="text-muted-foreground text-sm">
                What are you looking to achieve with Algonauts?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Goal</label>
                <Select
                  options={goalOptions}
                  value={formData.primaryGoal}
                  onChange={(value) => setFormData({ ...formData, primaryGoal: value })}
                  placeholder="Select your goal"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dream Companies</label>
                <Input
                  type="text"
                  placeholder="Google, Microsoft, Stripe..."
                  value={formData.targetCompanies}
                  onChange={(e) => setFormData({ ...formData, targetCompanies: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Separate company names with commas
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">When are you available to start?</label>
                <Select
                  options={[
                    { value: "immediate", label: "Immediately" },
                    { value: "1month", label: "Within 1 month" },
                    { value: "3months", label: "Within 3 months" },
                    { value: "6months", label: "Within 6 months" },
                  ]}
                  value={formData.availability}
                  onChange={(value) => setFormData({ ...formData, availability: value })}
                  placeholder="Select availability"
                />
              </div>
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? "bg-success-500 text-white"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      isCompleted ? "bg-success-500" : "bg-muted"
                    }`}
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
                    Complete Setup
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
