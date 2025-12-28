"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  Building2,
  MapPin,
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

const stateOptions = [
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "delhi", label: "Delhi" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "madhya_pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar_pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west_bengal", label: "West Bengal" },
];

const collegeTypeOptions = [
  { value: "iit", label: "IIT" },
  { value: "nit", label: "NIT" },
  { value: "iiit", label: "IIIT" },
  { value: "government", label: "Government College" },
  { value: "private", label: "Private College" },
  { value: "deemed", label: "Deemed University" },
  { value: "state", label: "State University" },
  { value: "autonomous", label: "Autonomous Institute" },
  { value: "other", label: "Other" },
];

export default function CollegeOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // College Info
    collegeName: "",
    collegeType: "",
    city: "",
    state: "",
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

    if (!formData.collegeName.trim()) newErrors.collegeName = "College name is required";
    if (!formData.collegeType) newErrors.collegeType = "College type is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
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

  // College setup mutation
  const setupCollegeMutation = api.profile.setupCollege.useMutation({
    onSuccess: () => {
      router.push("/admin/college");
    },
    onError: (error) => {
      console.error("Failed to save college profile:", error);
      setErrors({ submit: error.message || "Failed to save college. Please try again." });
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Save college data via tRPC
    setupCollegeMutation.mutate({
      collegeName: formData.collegeName,
      type: collegeTypeOptions.find(t => t.value === formData.collegeType)?.label || formData.collegeType,
      city: formData.city,
      state: stateOptions.find(s => s.value === formData.state)?.label || formData.state,
      // Logo upload would need a separate file upload endpoint
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/college")}>
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
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Set up your college profile</h1>
            <p className="text-muted-foreground">
              Help companies and students find your institution
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* College Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                College Information
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">College Name *</label>
                  <Input
                    placeholder="Indian Institute of Technology Delhi"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    error={errors.collegeName}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">College Type *</label>
                  <Select
                    options={collegeTypeOptions}
                    value={formData.collegeType}
                    onChange={(value) => setFormData({ ...formData, collegeType: value })}
                    placeholder="Select type"
                    error={errors.collegeType}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City *</label>
                    <Input
                      placeholder="New Delhi"
                      icon={MapPin}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      error={errors.city}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State *</label>
                    <Select
                      options={stateOptions}
                      value={formData.state}
                      onChange={(value) => setFormData({ ...formData, state: value })}
                      placeholder="Select state"
                      error={errors.state}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Placement Officer / Contact Person
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      placeholder="Dr. Rajesh Kumar"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      error={errors.contactName}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Designation</label>
                    <Input
                      placeholder="Training & Placement Officer"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    placeholder="placement@college.edu"
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
                    placeholder="+91 11 2659 1234"
                    icon={Phone}
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    error={errors.contactPhone}
                  />
                </div>
              </div>
            </div>

            {/* College Logo */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                College Logo (Optional)
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
