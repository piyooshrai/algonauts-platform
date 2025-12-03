"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  GraduationCap,
  Layers,
  Medal,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { Logo } from "@/components/logo";
import { FeatureCard } from "@/components/feature-card";
import { LayersRank } from "@/components/layers-rank";

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

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="#for-companies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                For Companies
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 mb-6"
            >
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                The future of fresher hiring is here
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-display-lg sm:text-display-xl lg:text-display-2xl font-bold tracking-tight mb-6"
            >
              Where{" "}
              <span className="gradient-text">Talent</span>
              {" "}Meets{" "}
              <span className="gradient-text">Opportunity</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Take quarterly assessments across Technical, Behavioral, and Contextual dimensions.
              Earn your LayersRank. Get discovered by top companies. No resume spam.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/signup">
                <Button size="xl" variant="gradient" className="w-full sm:w-auto gap-2">
                  Start Your Journey <Rocket className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#for-companies">
                <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2">
                  <Building2 className="h-5 w-5" />
                  I&apos;m a Company
                </Button>
              </Link>
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
            <div className="relative mx-auto max-w-5xl">
              {/* Mock Dashboard Preview */}
              <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                <div className="border-b border-border bg-muted/50 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-error-500" />
                    <div className="w-3 h-3 rounded-full bg-warning-500" />
                    <div className="w-3 h-3 rounded-full bg-success-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-muted-foreground">dashboard.algonauts.io</span>
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LayersRank Card */}
                    <div className="col-span-1 bg-card rounded-lg border border-border p-6 shadow-sm">
                      <LayersRank rank={247} totalUsers={50000} size="md" />
                    </div>

                    {/* Stats */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                      {[
                        { label: "Technical Score", value: "847", icon: Brain },
                        { label: "Behavioral Score", value: "92%", icon: MessageSquare },
                        { label: "Assessments Taken", value: "12", icon: Target },
                        { label: "Company Views", value: "34", icon: Building2 },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="bg-card rounded-lg border border-border p-4 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <stat.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold font-display">{stat.value}</p>
                              <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -left-4 top-1/4 bg-card border border-border rounded-lg p-3 shadow-lg hidden lg:flex items-center gap-2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="p-1.5 rounded bg-success-100 dark:bg-success-900/30">
                  <CheckCircle2 className="h-4 w-4 text-success-600" />
                </div>
                <span className="text-sm font-medium">Assessment Complete!</span>
              </motion.div>

              <motion.div
                className="absolute -right-4 top-1/3 bg-card border border-border rounded-lg p-3 shadow-lg hidden lg:flex items-center gap-2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Rank improved by 45</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50,000+", label: "Active Students" },
              { value: "500+", label: "Partner Companies" },
              { value: "2,500+", label: "Placements" },
              { value: "95%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold font-display gradient-text">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-display-sm sm:text-display-md font-bold mb-4">
              Three Dimensions. One Rank.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive assessment system evaluates you across three key dimensions,
              giving companies a complete picture of your capabilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Brain}
              title="Technical Assessment"
              description="Coding challenges, system design, and domain-specific problems that test your real-world problem-solving abilities."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Behavioral Assessment"
              description="Video responses and situational judgment tests that reveal your communication, leadership, and teamwork skills."
            />
            <FeatureCard
              icon={Layers}
              title="Contextual Assessment"
              description="Industry-specific scenarios and case studies that measure your ability to apply knowledge in real situations."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-display-sm sm:text-display-md font-bold mb-4">
              How Algonauts Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, transparent process that connects talent with opportunity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: GraduationCap,
                title: "Sign Up",
                description: "Create your profile with your education, skills, and aspirations.",
              },
              {
                step: "02",
                icon: Target,
                title: "Take Assessments",
                description: "Complete quarterly assessments across all three dimensions.",
              },
              {
                step: "03",
                icon: Medal,
                title: "Earn Your Rank",
                description: "Get your national LayersRank based on your performance.",
              },
              {
                step: "04",
                icon: Rocket,
                title: "Get Discovered",
                description: "Companies find you based on rank and invite you to apply.",
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
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-300" />
                )}
                <div className="relative bg-card border border-border rounded-lg p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold mb-4">
                    {item.step}
                  </div>
                  <div className="mb-3 flex justify-center">
                    <item.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section id="for-companies" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-sm font-medium text-blue-700 dark:text-blue-300 mb-4">
                <Building2 className="h-4 w-4" />
                For Companies
              </span>
              <h2 className="text-display-sm sm:text-display-md font-bold mb-6">
                Stop Sifting Through Resumes
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Access pre-vetted talent ranked by verified assessments. Set your filters,
                see matching candidates, and invite the best to apply. No job postings. No resume spam.
              </p>

              <div className="space-y-4">
                {[
                  { icon: BarChart3, text: "Filter by LayersRank, skills, and location" },
                  { icon: Shield, text: "Verified assessment scores you can trust" },
                  { icon: Zap, text: "Reduce time-to-hire by 60%" },
                  { icon: Users, text: "Build diverse, high-quality candidate pools" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
                      <item.icon className="h-5 w-5 text-success-600" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <Link href="/signup">
                <Button size="lg" className="mt-8 gap-2">
                  Partner With Us <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-lg p-6 shadow-xl">
                <h3 className="font-semibold mb-4">Candidate Filters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Minimum LayersRank</label>
                    <div className="h-10 rounded-md bg-muted flex items-center px-3">
                      <span className="font-medium">Top 500</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {["React", "Node.js", "Python", "System Design"].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Location</label>
                    <div className="h-10 rounded-md bg-muted flex items-center px-3">
                      <span className="font-medium">Bangalore, Remote OK</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-2xl font-bold text-foreground font-display">127</span> matching candidates
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 sm:p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-display-xs sm:text-display-sm font-bold text-white mb-4">
                Ready to Prove Your Worth?
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                Join 50,000+ students and freshers who are building their careers through
                merit-based rankings.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 gap-2"
                  >
                    Create Free Account <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="xl"
                    variant="outline"
                    className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Logo className="mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Where talent meets opportunity through verified assessments and transparent rankings.
              </p>
              <Image
                src="/images/Algonauts Logo.png"
                alt="Algonauts Badge"
                width={80}
                height={80}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/assessments" className="hover:text-foreground transition-colors">Assessments</Link></li>
                <li><Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link></li>
                <li><Link href="/opportunities" className="hover:text-foreground transition-colors">Opportunities</Link></li>
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://www.the-algo.com/algonauts" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="https://www.the-algo.com/blog" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="https://www.the-algo.com/contact" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://www.the-algo.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 <a href="https://www.the-algo.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">The Algorithm</a>. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/company/the-algorithm/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
