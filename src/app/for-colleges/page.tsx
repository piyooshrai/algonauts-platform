"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  FileSpreadsheet,
  GraduationCap,
  LineChart,
  Target,
  TrendingUp,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Logo } from "@/components/logo";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: Upload,
    title: "Bulk Student Upload",
    description: "Upload your entire student database in minutes with CSV import. No manual data entry required.",
  },
  {
    icon: BarChart3,
    title: "Cohort Tracking",
    description: "Monitor performance across graduation years. Compare cohorts and identify trends over time.",
  },
  {
    icon: LineChart,
    title: "Placement Analytics",
    description: "Real-time dashboards showing placement rates, company interest, and student progress.",
  },
  {
    icon: Building2,
    title: "Company Visibility",
    description: "See which companies are viewing and inviting your students. Track hiring outcomes.",
  },
];

const faqs = [
  {
    question: "Is Algonauts free for colleges?",
    answer:
      "Yes! Algonauts is completely free for colleges. We believe in democratizing access to quality placement opportunities. Colleges can upload students, track progress, and access analytics at no cost.",
  },
  {
    question: "How do students sign up?",
    answer:
      "Once you upload students via CSV, they receive an email invitation to complete their profile and take assessments. Students can also sign up directly and link their account to your college.",
  },
  {
    question: "What data do we get access to?",
    answer:
      "You get access to aggregated cohort analytics, individual student progress (with their consent), placement statistics, company engagement metrics, and assessment completion rates. All data is handled in compliance with privacy regulations.",
  },
  {
    question: "How long does onboarding take?",
    answer:
      "Most colleges are fully onboarded within a week. CSV upload takes minutes, and students typically complete their profiles within 2-3 days of receiving invitations.",
  },
  {
    question: "Can we customize assessments for our curriculum?",
    answer:
      "Our standard assessments cover Technical, Behavioral, and Contextual dimensions. For enterprise partnerships, we can discuss custom assessment modules aligned with your curriculum.",
  },
];

export default function ForCollegesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/admin/college">
                <Button size="sm" className="gap-2">
                  Partner With Us <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 mb-6"
            >
              <GraduationCap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                For Colleges
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-display-lg sm:text-display-xl lg:text-display-2xl font-bold tracking-tight mb-6"
            >
              Your Students Deserve{" "}
              <span className="gradient-text">Better Placements</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Track student progress, improve placement rates, and connect your best talent with top companies. Free for colleges.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/admin/college">
                <Button size="xl" variant="gradient" className="w-full sm:w-auto gap-2">
                  Partner With Us <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2">
                  See How It Works
                </Button>
              </a>
            </motion.div>

            {/* Free Badge */}
            <motion.div
              variants={fadeInUp}
              className="mt-6"
            >
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-success-600" />
                100% free for colleges — no hidden fees
              </span>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative mx-auto max-w-4xl">
              <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                <div className="border-b border-border bg-muted/50 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-error-500" />
                    <div className="w-3 h-3 rounded-full bg-warning-500" />
                    <div className="w-3 h-3 rounded-full bg-success-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-muted-foreground">college.algonauts.io</span>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Students", value: "2,847" },
                      { label: "Assessments Completed", value: "89%" },
                      { label: "Avg. Rank", value: "#312" },
                      { label: "Placement Rate", value: "78%" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-card rounded-lg border border-border p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-display-sm sm:text-display-md font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your college on board in three simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: FileSpreadsheet,
                title: "Upload Students",
                description: "Upload your student database via CSV. Include names, emails, and graduation year. We handle the rest.",
              },
              {
                step: "02",
                icon: Target,
                title: "Students Take Assessments",
                description: "Students receive invitations and complete assessments across Technical, Behavioral, and Contextual dimensions.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Track Placements",
                description: "Monitor student progress, see company interest, and track placement outcomes through your dashboard.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-purple-300" />
                )}
                <div className="relative bg-card border border-border rounded-lg p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white font-bold mb-4">
                    {item.step}
                  </div>
                  <div className="mb-3 flex justify-center">
                    <item.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-display-sm sm:text-display-md font-bold mb-4">
              Everything You Need to Boost Placements
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for placement cells.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <feature.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-display-sm sm:text-display-md font-bold mb-6">
                Your Command Center for Placements
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Everything you need to track student progress and placement outcomes in one dashboard.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Users, text: "View all students and their assessment status" },
                  { icon: BarChart3, text: "Compare cohort performance year over year" },
                  { icon: Building2, text: "See which companies are engaging with your students" },
                  { icon: Zap, text: "Get real-time placement notifications" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <item.icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-lg p-6 shadow-xl">
                <h3 className="font-semibold mb-4">College Dashboard</h3>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Students", value: "2,847" },
                    { label: "Avg. Rank", value: "#312" },
                    { label: "Placed", value: "78%" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mini Student Table */}
                <div className="border border-border rounded-lg overflow-hidden mb-4">
                  <div className="bg-muted/50 px-3 py-2 border-b border-border">
                    <span className="text-xs font-medium">Top Performers</span>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { name: "Priya S.", rank: "#45", status: "Placed" },
                      { name: "Rahul K.", rank: "#112", status: "Interviewing" },
                      { name: "Ananya M.", rank: "#203", status: "Active" },
                    ].map((student) => (
                      <div key={student.name} className="px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-[10px] font-medium text-primary">{student.name.charAt(0)}</span>
                          </div>
                          <span className="text-xs font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-primary font-medium">{student.rank}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-success-100 dark:bg-success-900/30 text-success-600">{student.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cohort Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">2025 Cohort Completion</span>
                    <span className="text-xs font-medium">67%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "67%" }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium mb-6">
              &ldquo;Algonauts transformed our placement process. We went from manually tracking
              spreadsheets to having real-time visibility into every student&apos;s progress.
              Our placement rate improved by 23% in the first year.&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold">Dr. Rajesh Kumar</p>
              <p className="text-sm text-muted-foreground">Placement Director, XYZ Engineering College</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-display-sm sm:text-display-md font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about partnering with Algonauts.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="border border-border rounded-lg overflow-hidden bg-card"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 p-8 sm:p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-display-xs sm:text-display-sm font-bold text-white mb-4">
                Get Your College On Board
              </h2>
              <p className="text-lg text-purple-100 mb-8 max-w-xl mx-auto">
                Join 100+ colleges already using Algonauts to improve placement rates and connect students with top companies.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/admin/college">
                  <Button
                    size="xl"
                    className="bg-white text-purple-600 hover:bg-purple-50 gap-2"
                  >
                    Partner With Us <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-purple-200">
                Free for colleges — no credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; 2025 <a href="https://www.the-algo.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">The Algorithm</a>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
