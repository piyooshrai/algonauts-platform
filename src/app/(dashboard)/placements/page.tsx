"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Share2,
  MapPin,
  DollarSign,
  AlertCircle,
  PartyPopper,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Textarea,
} from "@/components/ui";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

export default function PlacementsPage() {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [stillEmployed, setStillEmployed] = useState(true);

  // Fetch placements
  const { data: placementsData, isLoading, refetch } = api.placements.getMyPlacements.useQuery();

  // Fetch pending verifications
  const { data: pendingData } = api.placements.getPendingVerifications.useQuery();

  // Verification mutations
  const verify30Mutation = api.placements.complete30DayVerification.useMutation({
    onSuccess: () => {
      setVerifyingId(null);
      refetch();
    },
  });

  const verify90Mutation = api.placements.complete90DayVerification.useMutation({
    onSuccess: () => {
      setVerifyingId(null);
      refetch();
    },
  });

  // Share mutation
  const shareMutation = api.placements.trackShare.useMutation();

  const placements = placementsData || [];
  const pendingVerifications = pendingData || [];

  const handleVerify = (placementId: string, type: "30" | "90") => {
    if (type === "30") {
      verify30Mutation.mutate({
        placementId,
        stillEmployed,
        notes: verificationNotes,
      });
    } else {
      verify90Mutation.mutate({
        placementId,
        stillEmployed,
        notes: verificationNotes,
      });
    }
  };

  const handleShare = async (placementId: string, platform: "whatsapp" | "linkedin" | "twitter" | "copy") => {
    await shareMutation.mutateAsync({ placementId, platform });
    if (platform === "copy") {
      navigator.clipboard.writeText(`https://algonauts.in/placement/${placementId}`);
      alert("Link copied to clipboard!");
    } else {
      const urls: Record<string, string> = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent("Check out my placement on Algonauts! https://algonauts.in/placement/" + placementId)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://algonauts.in/placement/" + placementId)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent("https://algonauts.in/placement/" + placementId)}`,
      };
      window.open(urls[platform], "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <Award className="h-6 w-6 text-[#F59E0B]" />
            My Placements
          </h1>
          <p className="text-[#6B7280] mt-1">Track and verify your placements</p>
        </div>
        <Link href="/placements/report">
          <Button className="gap-2">
            <PartyPopper className="h-4 w-4" />
            Report Placement
          </Button>
        </Link>
      </div>

      {/* Pending Verifications Alert */}
      {pendingVerifications.length > 0 && (
        <Card className="border-[#F59E0B] bg-[#FEF3C7]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-[#F59E0B]" />
              <div className="flex-1">
                <p className="font-medium text-[#1F2937]">
                  {pendingVerifications.length} verification{pendingVerifications.length > 1 ? "s" : ""} pending
                </p>
                <p className="text-sm text-[#6B7280]">
                  Complete your verifications to earn XP and maintain verified status
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placements List */}
      {placements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <PartyPopper className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No placements yet</h3>
            <p className="text-[#6B7280] mb-4">
              Report your placement when you get an offer to start tracking
            </p>
            <Link href="/placements/report">
              <Button className="gap-2">
                <PartyPopper className="h-4 w-4" />
                Report Placement
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {placements.map((placement: any) => (
            <Card key={placement.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Placement Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-lg bg-[#E0F2FE] flex items-center justify-center text-[#0EA5E9] font-bold text-xl">
                        {placement.companyName?.substring(0, 2).toUpperCase() || "CO"}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F2937]">
                          {placement.companyName}
                        </h3>
                        <p className="text-[#6B7280]">{placement.jobTitle}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {placement.location && (
                        <div className="flex items-center gap-2 text-[#6B7280]">
                          <MapPin className="h-4 w-4" />
                          {placement.location}
                        </div>
                      )}
                      {placement.salaryOffered && (
                        <div className="flex items-center gap-2 text-[#10B981] font-medium">
                          <DollarSign className="h-4 w-4" />
                          {(placement.salaryOffered / 100000).toFixed(1)} LPA
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[#6B7280]">
                        <Calendar className="h-4 w-4" />
                        Started {new Date(placement.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-[#6B7280]">
                        <Clock className="h-4 w-4" />
                        Day {placement.daysSinceStart}
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                      <p className="text-sm font-medium text-[#1F2937] mb-2">Verification Status</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              placement.verification30CompletedAt
                                ? "bg-[#D1FAE5] text-[#10B981]"
                                : placement.is30DayDue
                                ? "bg-[#FEF3C7] text-[#F59E0B] animate-pulse"
                                : "bg-[#F3F4F6] text-[#6B7280]"
                            )}
                          >
                            {placement.verification30CompletedAt ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              "30"
                            )}
                          </div>
                          <span className="text-xs text-[#6B7280]">30-day</span>
                        </div>

                        <div className="flex-1 h-1 bg-[#E5E7EB] rounded">
                          <div
                            className={cn(
                              "h-full rounded transition-all",
                              placement.verification30CompletedAt
                                ? "bg-[#10B981]"
                                : "bg-[#F59E0B]"
                            )}
                            style={{
                              width: `${Math.min(100, (placement.daysSinceStart / 30) * 100)}%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              placement.verification90CompletedAt
                                ? "bg-[#D1FAE5] text-[#10B981]"
                                : placement.is90DayDue
                                ? "bg-[#FEF3C7] text-[#F59E0B] animate-pulse"
                                : "bg-[#F3F4F6] text-[#6B7280]"
                            )}
                          >
                            {placement.verification90CompletedAt ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              "90"
                            )}
                          </div>
                          <span className="text-xs text-[#6B7280]">90-day</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    {/* Verification Button */}
                    {(placement.is30DayDue || placement.is90DayDue) && (
                      <Button
                        className="gap-2"
                        onClick={() => setVerifyingId(placement.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete {placement.is90DayDue ? "90" : "30"}-Day Verification
                      </Button>
                    )}

                    {/* Share Button */}
                    {placement.verification30CompletedAt && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleShare(placement.id, "whatsapp")}
                        >
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleShare(placement.id, "linkedin")}
                        >
                          LinkedIn
                        </Button>
                      </div>
                    )}

                    {/* Status Badge */}
                    <Badge
                      variant={
                        placement.verification90CompletedAt
                          ? "success"
                          : placement.verification30CompletedAt
                          ? "info"
                          : "warning"
                      }
                      className="justify-center"
                    >
                      {placement.verification90CompletedAt
                        ? "Fully Verified"
                        : placement.verification30CompletedAt
                        ? "30-Day Verified"
                        : "Pending Verification"}
                    </Badge>
                  </div>
                </div>

                {/* Verification Modal */}
                <AnimatePresence>
                  {verifyingId === placement.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-[#E5E7EB]"
                    >
                      <h4 className="font-semibold text-[#1F2937] mb-4">
                        {placement.is90DayDue ? "90-Day" : "30-Day"} Verification
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-[#1F2937] mb-2">
                            Are you still employed at {placement.companyName}?
                          </p>
                          <div className="flex gap-3">
                            <Button
                              variant={stillEmployed ? "default" : "outline"}
                              onClick={() => setStillEmployed(true)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Yes, still employed
                            </Button>
                            <Button
                              variant={!stillEmployed ? "destructive" : "outline"}
                              onClick={() => setStillEmployed(false)}
                            >
                              No, I've left
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[#1F2937] block mb-2">
                            Additional notes (optional)
                          </label>
                          <Textarea
                            placeholder="Any updates about your role, promotion, etc..."
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() =>
                              handleVerify(
                                placement.id,
                                placement.is90DayDue ? "90" : "30"
                              )
                            }
                            disabled={verify30Mutation.isPending || verify90Mutation.isPending}
                          >
                            {(verify30Mutation.isPending || verify90Mutation.isPending) ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Submit Verification
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setVerifyingId(null);
                              setVerificationNotes("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>

                        <div className="p-3 bg-[#E0F2FE] rounded-lg text-sm text-[#0EA5E9]">
                          <strong>XP Reward:</strong> Complete this verification to earn{" "}
                          {placement.is90DayDue ? "100" : "75"} XP!
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* How Verification Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#6B7280]" />
            How Verification Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[#F9FAFB] rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center font-bold mb-2">
                1
              </div>
              <p className="font-medium text-[#1F2937]">Report Placement</p>
              <p className="text-[#6B7280]">Submit your offer details when you get placed</p>
            </div>
            <div className="p-4 bg-[#F9FAFB] rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0EA5E9] flex items-center justify-center font-bold mb-2">
                2
              </div>
              <p className="font-medium text-[#1F2937]">30-Day Check</p>
              <p className="text-[#6B7280]">Confirm you're still employed after 30 days (+75 XP)</p>
            </div>
            <div className="p-4 bg-[#F9FAFB] rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#10B981] flex items-center justify-center font-bold mb-2">
                3
              </div>
              <p className="font-medium text-[#1F2937]">90-Day Verified</p>
              <p className="text-[#6B7280]">Final verification after 90 days (+100 XP)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
