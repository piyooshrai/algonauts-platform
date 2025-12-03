"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
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

        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-medium text-white leading-relaxed">
            &ldquo;Algonauts helped me land my dream job at a top tech company.
            The LayersRank system truly showcases your abilities.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
              PS
            </div>
            <div>
              <p className="text-white font-medium">Priya Sharma</p>
              <p className="text-blue-200 text-sm">Software Engineer at Google</p>
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

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <Logo size="lg" />
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
