"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Check,
  ChevronDown,
  Filter,
  Mail,
  Search,
  Shield,
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

const pricingPlans = [
  {
    name: "Starter",
    price: "₹9,999",
    period: "/month",
    description: "For small teams",
    features: [
      "25 candidate invites per month",
      "Filter by LayersRank, skills, location",
      "Email support",
    ],
    cta: "Get Started",
    ctaLink: "/admin/company",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₹24,999",
    period: "/month",
    description: "For growing companies",
    features: [
      "75 candidate invites per month",
      "Advanced filters (dimension scores, confidence levels)",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Get Started",
    ctaLink: "/admin/company",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "₹49,999",
    period: "/month",
    description: "For scaling organizations",
    features: [
      "200 candidate invites per month",
      "Everything in Growth",
      "API access",
      "ATS integration",
      "Dedicated account manager",
    ],
    cta: "Get Started",
    ctaLink: "/admin/company",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited invites",
      "White-label options",
      "Custom SLA",
      "Onboarding support",
    ],
    cta: "Contact Sales",
    ctaLink: "https://www.the-algo.com/contact",
    highlighted: false,
    external: true,
  },
];

const faqs = [
  {
    question: "How is LayersRank calculated?",
    answer:
      "LayersRank is a composite score based on three dimensions: Technical (coding, problem-solving), Behavioral (communication, teamwork), and Contextual (industry knowledge, adaptability). Each dimension is scored through verified assessments, and the final rank includes a confidence interval showing how reliable the score is.",
  },
  {
    question: "How do invites work?",
    answer:
      "When you find a candidate you're interested in, you can send them an invite to apply to your company. The candidate receives a notification and can choose to accept or decline. If they accept, you'll get access to their full profile and can proceed with your hiring process.",
  },
  {
    question: "Can I integrate with my ATS?",
    answer:
      "Yes! Our Pro and Enterprise plans include ATS integration. We support popular platforms like Greenhouse, Lever, Workday, and more. Contact our team for custom integration requirements.",
  },
  {
    question: "What makes LayersRank different from other assessments?",
    answer:
      "Unlike traditional assessments that give you a single score, LayersRank provides confidence-weighted scoring. This means you know not just the score, but how reliable that score is. Our multi-dimensional approach evaluates candidates holistically, not just on technical skills.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! All paid plans come with a 14-day free trial. You can explore all features and send invites without any commitment. No credit card required to start.",
  },
];

export default function ForCompaniesPage() {
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
              <Link href="/admin/company">
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
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                For Companies
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-display-lg sm:text-display-xl lg:text-display-2xl font-bold tracking-tight mb-6"
            >
              Hire{" "}
              <span className="gradient-text">Smarter</span>
              , Not Harder
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Access pre-vetted candidates ranked by verified assessments. Filter by skills, scores, and location. Invite the best to apply. No job postings. No resume spam.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/admin/company">
                <Button size="xl" variant="gradient" className="w-full sm:w-auto gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2">
                  See Pricing
                </Button>
              </a>
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
                    <span className="text-xs text-muted-foreground">company.algonauts.io</span>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stats */}
                    {[
                      { label: "Matching Candidates", value: "127" },
                      { label: "Invites Sent", value: "24" },
                      { label: "Response Rate", value: "89%" },
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
              Three simple steps to find your next great hire.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Filter,
                title: "Set Your Filters",
                description: "Define your ideal candidate: minimum LayersRank, required skills, location preferences, and score thresholds across Technical, Behavioral, and Contextual dimensions.",
              },
              {
                step: "02",
                icon: Search,
                title: "See Matching Candidates",
                description: "Browse anonymized candidate profiles that match your criteria. See their scores, confidence intervals, and how they compare to other candidates.",
              },
              {
                step: "03",
                icon: Mail,
                title: "Send Invites",
                description: "Found someone great? Send them an invite to apply. Candidates who accept give you access to their full profile for your hiring process.",
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

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-display-sm sm:text-display-md font-bold mb-6">
                Why Companies Choose Algonauts
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Confidence-weighted scoring — know how reliable each score is" },
                  { icon: BarChart3, text: "Multi-dimensional evaluation across Technical, Behavioral, and Contextual skills" },
                  { icon: Zap, text: "Reduce time-to-hire by 60% — skip the resume pile" },
                  { icon: Brain, text: "Built on assessment science, not keyword matching" },
                  { icon: Users, text: "Access 50,000+ pre-vetted candidates" },
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-lg p-6 shadow-xl">
                <h3 className="font-semibold mb-4">Sample Candidate Card</h3>
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-semibold text-primary">#247</span>
                      <span className="text-sm text-muted-foreground"> · Top Engineering College</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Technical", score: 82, confidence: 3, percent: 82 },
                      { label: "Behavioral", score: 88, confidence: 2, percent: 88 },
                      { label: "Contextual", score: 71, confidence: 4, percent: 71 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">{item.label}</span>
                        <span className="text-xs font-medium w-6">{item.score}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-6">±{item.confidence}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <span className="text-xs font-medium text-success-600">High (94%)</span>
                    </div>
                    <Button size="sm">Send Invite</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-display-sm sm:text-display-md font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your hiring needs. Scale up anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-card border rounded-lg p-6 ${
                  plan.highlighted
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.external ? (
                  <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </a>
                ) : (
                  <Link href={plan.ctaLink}>
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            All plans include unlimited job postings and team members. No per-seat fees. Cancel anytime.
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
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
              Everything you need to know about hiring on Algonauts.
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
                className="border border-border rounded-lg overflow-hidden"
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
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 sm:p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-display-xs sm:text-display-sm font-bold text-white mb-4">
                Start Hiring Better Talent
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                Join 500+ companies already using Algonauts to find pre-vetted, verified candidates.
              </p>
              <Link href="/admin/company">
                <Button
                  size="xl"
                  className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
                >
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
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
