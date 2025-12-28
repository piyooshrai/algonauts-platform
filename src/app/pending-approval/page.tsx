"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { Logo } from "@/components/logo";
import { signOut, useSession } from "next-auth/react";

export default function PendingApprovalPage() {
  const { data: session } = useSession();
  const userType = session?.user?.userType;

  const getMessage = () => {
    if (userType === "COMPANY") {
      return {
        title: "Company Verification Pending",
        description:
          "Your company account is currently under review. Our team is verifying your business details to ensure a secure platform for all users.",
        timeline: "This typically takes 24-48 business hours.",
      };
    }
    if (userType === "COLLEGE_ADMIN") {
      return {
        title: "College Admin Verification Pending",
        description:
          "Your college administrator account is currently under review. We're verifying your institutional credentials to grant you full access.",
        timeline: "This typically takes 24-48 business hours.",
      };
    }
    return {
      title: "Account Verification Pending",
      description:
        "Your account is currently under review. Our team will verify your details shortly.",
      timeline: "This typically takes 24-48 business hours.",
    };
  };

  const message = getMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-8">
          <Logo size="lg" className="mx-auto" />
        </div>

        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <Clock className="h-10 w-10 text-amber-600" />
        </div>

        <h1 className="text-3xl font-bold font-display mb-4">{message.title}</h1>

        <p className="text-muted-foreground mb-4">{message.description}</p>

        <p className="text-sm text-amber-600 font-medium mb-8">{message.timeline}</p>

        {session?.user?.email && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              We&apos;ll send a confirmation email to:
            </p>
            <p className="font-medium mt-1">{session.user.email}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Link href="mailto:support@algonauts.com">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="gap-2 text-muted-foreground hover:text-foreground w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Need immediate assistance?{" "}
          <a href="mailto:support@algonauts.com" className="text-primary hover:underline">
            Reach out to our support team
          </a>
        </p>
      </motion.div>
    </div>
  );
}
