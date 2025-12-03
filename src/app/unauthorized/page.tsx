"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui";
import { Logo } from "@/components/logo";

export default function UnauthorizedPage() {
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

        <div className="w-20 h-20 rounded-full bg-error-500/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-10 w-10 text-error-500" />
        </div>

        <h1 className="text-3xl font-bold font-display mb-4">Access Denied</h1>

        <p className="text-muted-foreground mb-8">
          You don&apos;t have permission to access this page. This area is restricted to
          authorized administrators only.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link href="/">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          If you believe this is an error, please contact your administrator or{" "}
          <a href="mailto:support@algonauts.com" className="text-primary hover:underline">
            reach out to support
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
