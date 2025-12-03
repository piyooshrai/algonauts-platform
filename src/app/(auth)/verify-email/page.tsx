"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or the next empty one
    const nextEmpty = newOtp.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Replace with actual verification
    // For demo, accept any 6-digit code
    router.push("/onboarding");
  };

  const handleResend = async () => {
    setIsResending(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsResending(false);
    setResendCooldown(60);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
        <Mail className="h-8 w-8 text-blue-600" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Check your email</h1>
      <p className="text-muted-foreground mb-8">
        We sent a verification code to<br />
        <span className="font-medium text-foreground">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className={`
                  w-12 h-14 text-center text-xl font-semibold rounded-lg border
                  transition-all duration-200 outline-none
                  ${error
                    ? "border-error-500 focus:ring-2 focus:ring-error-500/20"
                    : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              />
            ))}
          </div>
          {error && (
            <p className="mt-2 text-sm text-error-500">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || otp.some((d) => !d)}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify Email
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          {resendCooldown > 0 ? (
            <span className="text-muted-foreground">
              Resend in {resendCooldown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Resend code
                </>
              )}
            </button>
          )}
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Go back
        </Link>
      </p>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
