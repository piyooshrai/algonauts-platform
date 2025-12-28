"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  GraduationCap,
  Building2,
  Building,
  Phone,
  Briefcase,
  Clock,
} from "lucide-react";
import { Button, Input, Checkbox } from "@/components/ui";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc/client";

type UserRole = "STUDENT" | "COMPANY" | "COLLEGE_ADMIN";

const roleOptions = [
  {
    value: "STUDENT" as UserRole,
    label: "Student",
    description: "Take assessments, earn your rank, and get discovered by top companies",
    icon: GraduationCap,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500",
    onboardingPath: "/onboarding/student",
  },
  {
    value: "COMPANY" as UserRole,
    label: "Company",
    description: "Discover pre-vetted talent ranked by verified assessments",
    icon: Building,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500",
    onboardingPath: "/onboarding/company",
  },
  {
    value: "COLLEGE_ADMIN" as UserRole,
    label: "College",
    description: "Track student progress and improve placement rates",
    icon: Building2,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500",
    onboardingPath: "/onboarding/college",
  },
];

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    collegeName: "",
    role: "",
    agreeToTerms: false,
  });
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // tRPC mutation for signup
  const signupMutation = api.auth.signup.useMutation({
    onSuccess: async (data) => {
      console.log("[Signup] User created successfully:", data.user.id);

      // If account is pending approval (company/college), show pending message
      if (data.isPendingApproval) {
        setShowPendingMessage(true);
        return;
      }

      // Sign in the user with NextAuth
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error("[Signup] Sign in after signup failed:", signInResult.error);
        setErrors({ form: "Account created but sign in failed. Please try logging in." });
        return;
      }

      // Redirect to appropriate onboarding based on role
      const roleOption = roleOptions.find((r) => r.value === selectedRole);
      router.push(roleOption?.onboardingPath || "/onboarding/student");
      router.refresh();
    },
    onError: (error) => {
      console.error("[Signup] Error:", error.message);
      setErrors({ form: error.message });
    },
  });

  const validateStep1 = () => {
    if (!selectedRole) {
      setErrors({ role: "Please select an account type" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const failedRequirements = passwordRequirements.filter(
        (req) => !req.test(formData.password)
      );
      if (failedRequirements.length > 0) {
        newErrors.password = "Password doesn't meet requirements";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role-specific validations
    if (selectedRole === "COMPANY" && !formData.companyName) {
      newErrors.companyName = "Company name is required";
    }

    if (selectedRole === "COLLEGE_ADMIN") {
      if (!formData.collegeName) {
        newErrors.collegeName = "College name is required";
      }
      if (!formData.role) {
        newErrors.role = "Your role is required";
      }
    }

    if (!formData.agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;
    if (!selectedRole) return;

    setErrors({});

    // Call the tRPC signup mutation
    signupMutation.mutate({
      email: formData.email,
      password: formData.password,
      phone: formData.phone.replace(/[\s\-\(\)]/g, ""),
      userType: selectedRole,
      companyName: selectedRole === "COMPANY" ? formData.companyName : undefined,
      collegeName: selectedRole === "COLLEGE_ADMIN" ? formData.collegeName : undefined,
      role: selectedRole === "COLLEGE_ADMIN" ? formData.role : undefined,
    });
  };

  const isLoading = signupMutation.isPending;

  // Pending approval success screen
  if (showPendingMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-amber-100">
            <Clock className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-3">Application Submitted</h1>
        <p className="text-muted-foreground mb-6">
          {selectedRole === "COMPANY"
            ? "Your company account is pending verification. Our team will review your application and get back to you within 24-48 hours."
            : "Your college admin account is pending verification. Our team will review your application and get back to you within 24-48 hours."}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          We&apos;ll send a confirmation email to <span className="font-medium">{formData.email}</span> once your account is approved.
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Return to Login
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
          step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
        )}>
          {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
        </div>
        <div className={cn(
          "w-16 h-1 rounded-full transition-colors",
          step >= 2 ? "bg-primary" : "bg-muted"
        )} />
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
          step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
        )}>
          2
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Create your account</h1>
              <p className="text-muted-foreground">
                Choose the type of account that fits you best
              </p>
            </div>

            <div className="space-y-3">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(option.value);
                    setErrors({});
                  }}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left",
                    selectedRole === option.value
                      ? `${option.borderColor} ${option.bgColor}`
                      : "border-border hover:border-slate-300 hover:bg-muted/50"
                  )}
                >
                  <div className={cn("p-3 rounded-lg", option.bgColor)}>
                    <option.icon className={cn("h-6 w-6", option.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{option.label}</span>
                      {selectedRole === option.value && (
                        <CheckCircle2 className={cn("h-5 w-5", option.color)} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {errors.role && (
              <p className="text-sm text-red-500 mt-3 text-center">{errors.role}</p>
            )}

            <Button
              onClick={handleNext}
              className="w-full mt-6"
              size="lg"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Set up your credentials</h1>
              <p className="text-muted-foreground">
                Create your {roleOptions.find(r => r.value === selectedRole)?.label.toLowerCase()} account
              </p>
            </div>

            {errors.form && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {selectedRole === "COMPANY" ? "Work Email" : selectedRole === "COLLEGE_ADMIN" ? "Official Email" : "Email"}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={selectedRole === "COMPANY" ? "you@company.com" : selectedRole === "COLLEGE_ADMIN" ? "you@college.edu" : "you@example.com"}
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  icon={Phone}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={errors.phone}
                  disabled={isLoading}
                />
              </div>

              {/* Company Name - only for company signup */}
              {selectedRole === "COMPANY" && (
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium">
                    Company Name
                  </label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Your company name"
                    icon={Briefcase}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    error={errors.companyName}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* College Name and Role - only for college admin signup */}
              {selectedRole === "COLLEGE_ADMIN" && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="collegeName" className="text-sm font-medium">
                      College Name
                    </label>
                    <Input
                      id="collegeName"
                      type="text"
                      placeholder="Your college name"
                      icon={Building2}
                      value={formData.collegeName}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      error={errors.collegeName}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Your Role
                    </label>
                    <Input
                      id="role"
                      type="text"
                      placeholder="e.g., Placement Officer, Faculty"
                      icon={Briefcase}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      error={errors.role}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    icon={Lock}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-xs ${
                          req.test(formData.password)
                            ? "text-emerald-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    icon={Lock}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Checkbox
                  label={
                    <span className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  }
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                />
                {errors.terms && (
                  <p className="text-xs text-red-500">{errors.terms}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Note about pending approval for company/college */}
            {(selectedRole === "COMPANY" || selectedRole === "COLLEGE_ADMIN") && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  {selectedRole === "COMPANY"
                    ? "Company accounts require verification. Our team will review your application within 24-48 hours."
                    : "College admin accounts require verification. Our team will review your application within 24-48 hours."}
                </p>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Badge */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <Image
          src="/images/Algonauts Logo.png"
          alt="Algonauts Verified"
          width={48}
          height={48}
          className="opacity-60"
        />
        <p className="text-xs text-muted-foreground">Verified by Algonauts</p>
      </div>
    </motion.div>
  );
}
