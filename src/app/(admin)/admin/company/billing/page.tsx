"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  Zap,
  Building,
  Crown,
  Download,
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  Progress,
  Modal,
} from "@/components/ui";

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: string;
  inviteCredits: number;
  features: PlanFeature[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small teams getting started",
    price: 9999,
    currency: "INR",
    period: "month",
    inviteCredits: 20,
    features: [
      { name: "20 invite credits/month", included: true },
      { name: "Basic candidate filters", included: true },
      { name: "Email support", included: true },
      { name: "Job postings", included: true, limit: "2 active" },
      { name: "Analytics dashboard", included: false },
      { name: "Bulk invitations", included: false },
      { name: "Priority support", included: false },
      { name: "Custom branding", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing companies with active hiring needs",
    price: 24999,
    currency: "INR",
    period: "month",
    inviteCredits: 50,
    popular: true,
    features: [
      { name: "50 invite credits/month", included: true },
      { name: "Advanced candidate filters", included: true },
      { name: "Priority email support", included: true },
      { name: "Job postings", included: true, limit: "10 active" },
      { name: "Analytics dashboard", included: true },
      { name: "Bulk invitations", included: true },
      { name: "Priority support", included: false },
      { name: "Custom branding", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Full-featured solution for large organizations",
    price: 74999,
    currency: "INR",
    period: "month",
    inviteCredits: 200,
    features: [
      { name: "200 invite credits/month", included: true },
      { name: "All candidate filters", included: true },
      { name: "24/7 dedicated support", included: true },
      { name: "Unlimited job postings", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Bulk invitations", included: true },
      { name: "Priority support", included: true },
      { name: "Custom branding", included: true },
    ],
  },
];

const usageHistory = [
  { date: "2024-01-15", action: "Invitation sent", credits: -1, candidate: "C-2458" },
  { date: "2024-01-14", action: "Invitation sent", credits: -1, candidate: "C-1892" },
  { date: "2024-01-14", action: "Invitation sent", credits: -1, candidate: "C-3215" },
  { date: "2024-01-13", action: "Invitation sent", credits: -1, candidate: "C-2876" },
  { date: "2024-01-12", action: "Invitation sent", credits: -1, candidate: "C-1654" },
  { date: "2024-01-10", action: "Credits purchased", credits: 50, description: "Monthly renewal" },
  { date: "2024-01-08", action: "Invitation sent", credits: -1, candidate: "C-4521" },
  { date: "2024-01-05", action: "Invitation sent", credits: -1, candidate: "C-3897" },
];

const invoices = [
  { id: "INV-2024-001", date: "2024-01-01", amount: 24999, status: "paid" },
  { id: "INV-2023-012", date: "2023-12-01", amount: 24999, status: "paid" },
  { id: "INV-2023-011", date: "2023-11-01", amount: 24999, status: "paid" },
  { id: "INV-2023-010", date: "2023-10-01", amount: 9999, status: "paid" },
];

export default function BillingPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const currentPlan = plans[1]; // Professional plan
  const creditsUsed = 3;
  const creditsRemaining = 47;
  const creditsTotal = 50;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "starter":
        return <Zap className="h-6 w-6" />;
      case "professional":
        return <Building className="h-6 w-6" />;
      case "enterprise":
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-display tracking-tight">Billing & Plan</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and view usage
        </p>
      </motion.div>

      {/* Current Plan & Credits */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    {getPlanIcon(currentPlan.id)}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {currentPlan.name} Plan
                      <Badge variant="success">Active</Badge>
                    </CardTitle>
                    <CardDescription>{currentPlan.description}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(currentPlan.price)}</p>
                  <p className="text-sm text-muted-foreground">per {currentPlan.period}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Next billing date</p>
                  <p className="font-medium">February 1, 2024</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment method</p>
                  <p className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    •••• 4242
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowUpgradeModal(true)}>
                  Change Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Invite Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-5xl font-bold text-primary">{creditsRemaining}</p>
                <p className="text-muted-foreground">credits remaining</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used this month</span>
                  <span className="font-medium">{creditsUsed} / {creditsTotal}</span>
                </div>
                <Progress value={(creditsUsed / creditsTotal) * 100} />
              </div>

              {creditsRemaining < 10 && (
                <div className="p-3 rounded-lg bg-warning-500/10 border border-warning-500/20">
                  <p className="text-sm text-warning-700 dark:text-warning-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Running low on credits
                  </p>
                </div>
              )}

              <Button className="w-full" variant="outline">
                Buy Additional Credits
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Usage History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage History
              </CardTitle>
              <CardDescription>Recent credit usage and transactions</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.credits > 0 ? "bg-success-500/10" : "bg-muted"
                      }`}
                    >
                      {item.credits > 0 ? (
                        <Zap className="h-5 w-5 text-success-500" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.candidate || item.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        item.credits > 0 ? "text-success-600" : "text-muted-foreground"
                      }`}
                    >
                      {item.credits > 0 ? "+" : ""}
                      {item.credits} credit{Math.abs(item.credits) !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 font-medium text-muted-foreground">Invoice</th>
                    <th className="text-left py-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border">
                      <td className="py-3 font-medium">{invoice.id}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">{formatCurrency(invoice.amount)}</td>
                      <td className="py-3">
                        <Badge variant="success">Paid</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Change Plan"
        description="Select a plan that fits your hiring needs"
        size="full"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                selectedPlan?.id === plan.id
                  ? "ring-2 ring-primary"
                  : "hover:border-primary/50"
              } ${plan.popular ? "border-primary" : ""}`}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-success-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-muted" />
                      )}
                      <span
                        className={feature.included ? "" : "text-muted-foreground"}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-6"
                  variant={currentPlan.id === plan.id ? "outline" : "default"}
                  disabled={currentPlan.id === plan.id}
                >
                  {currentPlan.id === plan.id ? (
                    "Current Plan"
                  ) : (
                    <>
                      {plan.price > currentPlan.price ? "Upgrade" : "Downgrade"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Need a custom plan for your organization?{" "}
            <a href="#" className="text-primary hover:underline">
              Contact our sales team
            </a>
          </p>
        </div>
      </Modal>
    </div>
  );
}
