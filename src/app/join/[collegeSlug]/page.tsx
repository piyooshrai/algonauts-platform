"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Users,
  Trophy,
  Building,
  GraduationCap,
} from "lucide-react";
import { Button, Input, Checkbox, Separator } from "@/components/ui";
import { Logo } from "@/components/logo";
import { api } from "@/lib/trpc/client";

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function CollegeJoinPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.collegeSlug as string;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch college data
  const { data: college, isLoading: collegeLoading, error: collegeError } = api.college.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Record visit on page load
  const recordVisit = api.college.recordInviteVisit.useMutation();

  useEffect(() => {
    if (slug) {
      recordVisit.mutate({ slug, source: "direct" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Signup mutation
  const signupMutation = api.auth.signup.useMutation({
    onSuccess: async () => {
      // Sign in the user
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({ form: "Account created but sign in failed. Please try logging in." });
        return;
      }

      // Redirect to student onboarding
      router.push("/onboarding/student");
      router.refresh();
    },
    onError: (error) => {
      setErrors({ form: error.message });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
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

    if (!formData.agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !college) return;

    signupMutation.mutate({
      email: formData.email,
      password: formData.password,
      userType: "STUDENT",
      collegeId: college.id,
    });
  };

  const isLoading = signupMutation.isPending;

  // Loading state
  if (collegeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state - college not found
  if (collegeError || !college) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold mb-4">College Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This invite link is invalid or has expired. Please contact your college for a new link.
          </p>
          <Link href="/signup">
            <Button>Sign up normally</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - College Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-600 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10">
          <Link href="/">
            <Logo size="lg" className="text-white" />
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          {/* College Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              {college.logoUrl ? (
                <Image
                  src={college.logoUrl}
                  alt={college.name}
                  width={64}
                  height={64}
                  className="rounded-lg bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{college.name}</h2>
                {college.city && college.state && (
                  <p className="text-blue-200">{college.city}, {college.state}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5" />
              <span className="text-lg font-semibold">{college.studentCount}+ students</span>
              <span className="text-blue-200">already on Algonauts</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Why join Algonauts?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-yellow-300 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Get your LayersRank</p>
                  <p className="text-blue-200 text-sm">A verified ranking that showcases your true abilities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-emerald-300 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Get discovered by top companies</p>
                  <p className="text-blue-200 text-sm">500+ companies actively hiring from Algonauts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-sky-300 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Track your placements</p>
                  <p className="text-blue-200 text-sm">Report and verify your placement achievements</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-blue-200 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">50K+</span>
            <span>Students</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">500+</span>
            <span>Companies</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">95%</span>
            <span>Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo and College Info */}
          <div className="lg:hidden mb-8">
            <div className="flex justify-center mb-4">
              <Link href="/">
                <Logo size="lg" />
              </Link>
            </div>
            <div className="text-center p-4 rounded-lg bg-sky-50 border border-sky-100">
              <p className="text-sm text-sky-700 font-medium">
                Join {college.studentCount}+ students from
              </p>
              <p className="text-lg font-bold text-sky-900">{college.name}</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Join your classmates</h1>
            <p className="text-muted-foreground">
              Create your account to get started with Algonauts
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
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                disabled={isLoading}
              />
            </div>

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
                  Join Algonauts
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
                onClick={() => signIn("google", { callbackUrl: "/onboarding/student" })}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
                onClick={() => signIn("linkedin", { callbackUrl: "/onboarding/student" })}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>

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
      </div>
    </div>
  );
}
