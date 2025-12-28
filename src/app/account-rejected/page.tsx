"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, Mail, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";
import { Logo } from "@/components/logo";
import { signOut, useSession } from "next-auth/react";

export default function AccountRejectedPage() {
  const { data: session } = useSession();
  const userType = session?.user?.userType;

  const getMessage = () => {
    if (userType === "COMPANY") {
      return {
        title: "Company Verification Declined",
        description:
          "Unfortunately, we were unable to verify your company account at this time. This could be due to incomplete information or verification issues.",
        suggestion:
          "Please review your registration details and consider reapplying with complete documentation.",
      };
    }
    if (userType === "COLLEGE_ADMIN") {
      return {
        title: "College Admin Verification Declined",
        description:
          "Unfortunately, we were unable to verify your college administrator credentials at this time.",
        suggestion:
          "Please ensure you're registering with an official institutional email address and proper documentation.",
      };
    }
    return {
      title: "Account Verification Declined",
      description: "Unfortunately, we were unable to verify your account at this time.",
      suggestion: "Please contact our support team for more information.",
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

        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold font-display mb-4">{message.title}</h1>

        <p className="text-muted-foreground mb-4">{message.description}</p>

        <p className="text-sm text-muted-foreground mb-8">{message.suggestion}</p>

        {session?.user?.email && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">Account email:</p>
            <p className="font-medium mt-1">{session.user.email}</p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Common reasons for rejection:</strong>
          </p>
          <ul className="text-sm text-amber-700 mt-2 text-left list-disc list-inside space-y-1">
            <li>Incomplete or inaccurate company/institution details</li>
            <li>Unable to verify domain or organization</li>
            <li>Generic email address instead of official domain</li>
            <li>Suspicious activity or duplicate accounts</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="mailto:appeals@algonauts.com?subject=Account%20Verification%20Appeal">
              <Button className="gap-2 w-full sm:w-auto">
                <RefreshCw className="h-4 w-4" />
                Appeal Decision
              </Button>
            </Link>
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
          If you believe this is an error, please{" "}
          <a href="mailto:appeals@algonauts.com" className="text-primary hover:underline">
            submit an appeal
          </a>{" "}
          with supporting documentation.
        </p>
      </motion.div>
    </div>
  );
}
