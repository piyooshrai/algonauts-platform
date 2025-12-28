"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  Building,
  Globe,
  User,
  Phone,
  Mail,
  Upload,
  Sparkles,
} from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc/client";

const industryOptions = [
  { value: "technology", label: "Technology" },
  { value: "fintech", label: "Fintech" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "healthcare", label: "Healthcare" },
  { value: "edtech", label: "EdTech" },
  { value: "saas", label: "SaaS" },
  { value: "consulting", label: "Consulting" },
  { value: "banking", label: "Banking & Finance" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

const companySizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Company Info
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    // Contact Person
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    designation: "",
    // Logo
    logo: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.companySize) newErrors.companySize = "Company size is required";
    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }
    if (!formData.contactName.trim()) newErrors.contactName = "Contact name is required";
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email";
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required";
    } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, logo: "File size must be less than 2MB" }));
        return;
      }
      if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
        setErrors((prev) => ({ ...prev, logo: "Please upload a PNG, JPG, or SVG file" }));
        return;
      }
      setFormData((prev) => ({ ...prev, logo: file }));
      setErrors((prev) => ({ ...prev, logo: "" }));
    }
  };

  // Company profile update mutation
  const updateCompanyMutation = api.profile.updateCompanyProfile.useMutation({
    onSuccess: () => {
      router.push("/admin/company");
    },
    onError: (error) => {
      console.error("Failed to save company profile:", error);
      setErrors({ submit: error.message || "Failed to save profile. Please try again." });
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Save company profile data via tRPC
    updateCompanyMutation.mutate({
      companyName: formData.companyName,
      industry: industryOptions.find(i => i.value === formData.industry)?.label || formData.industry,
      companySize: formData.companySize,
      website: formData.website || null,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      // Logo upload would need a separate file upload endpoint
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/company")}>
            Skip for now
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Set up your company profile</h1>
            <p className="text-muted-foreground">
              Help students learn about your company
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Company Information
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    placeholder="Acme Inc."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    error={errors.companyName}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry *</label>
                    <Select
                      options={industryOptions}
                      value={formData.industry}
                      onChange={(value) => setFormData({ ...formData, industry: value })}
                      placeholder="Select industry"
                      error={errors.industry}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Size *</label>
                    <Select
                      options={companySizeOptions}
                      value={formData.companySize}
                      onChange={(value) => setFormData({ ...formData, companySize: value })}
                      placeholder="Select size"
                      error={errors.companySize}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    placeholder="https://www.example.com"
                    icon={Globe}
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    error={errors.website}
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Contact Person
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      placeholder="John Doe"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      error={errors.contactName}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Designation</label>
                    <Input
                      placeholder="HR Manager"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    placeholder="hr@company.com"
                    icon={Mail}
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    error={errors.contactEmail}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone *</label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    icon={Phone}
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    error={errors.contactPhone}
                  />
                </div>
              </div>
            </div>

            {/* Company Logo */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Company Logo (Optional)
              </h2>

              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  formData.logo ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
              >
                {formData.logo ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-lg bg-white border border-border flex items-center justify-center mx-auto overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(formData.logo)}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{formData.logo.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, logo: null })}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-2 block">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Click to upload</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, or SVG (max 2MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.svg"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {errors.logo && (
                <p className="text-sm text-red-500 mt-2">{errors.logo}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
