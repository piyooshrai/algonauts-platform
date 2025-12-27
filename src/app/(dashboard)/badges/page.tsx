"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Trophy,
  Loader2,
  Lock,
  Share2,
  Star,
  Flame,
  CheckCircle2,
  Briefcase,
  Users,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", label: "All", icon: Award },
  { value: "profile", label: "Profile", icon: CheckCircle2 },
  { value: "activity", label: "Activity", icon: Briefcase },
  { value: "streak", label: "Streaks", icon: Flame },
  { value: "placement", label: "Placement", icon: Trophy },
  { value: "social", label: "Social", icon: Users },
  { value: "skill", label: "Skills", icon: GraduationCap },
  { value: "elite", label: "Elite", icon: Star },
];

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600" },
  uncommon: { bg: "bg-green-100", border: "border-green-400", text: "text-green-700" },
  rare: { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-700" },
  epic: { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-700" },
  legendary: { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-700" },
};

export default function BadgesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch all badges
  const { data: badgesData, isLoading: badgesLoading } = api.badges.getAll.useQuery({
    category: selectedCategory !== "all" ? (selectedCategory as any) : undefined,
  });

  // Fetch progress towards badges
  const { data: progressData, isLoading: progressLoading } = api.badges.getProgress.useQuery();

  // Share mutation
  const shareMutation = api.badges.share.useMutation();

  const badges = badgesData?.badges || [];
  const stats = badgesData?.stats || { total: 0, earned: 0, completion: 0 };
  const progress = progressData || [];

  const isLoading = badgesLoading;

  const handleShare = async (badgeId: string, platform: "whatsapp" | "linkedin" | "twitter" | "copy") => {
    const result = await shareMutation.mutateAsync({ badgeId, platform });
    if (platform === "copy") {
      navigator.clipboard.writeText(result.shareUrl);
      alert("Link copied to clipboard!");
    } else {
      window.open(result.shareLink, "_blank");
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
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
          <Award className="h-6 w-6 text-[#F59E0B]" />
          Badge Collection
        </h1>
        <p className="text-[#6B7280] mt-1">Earn badges by completing activities and milestones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-4xl font-bold text-[#F59E0B]">{stats.earned}</div>
            <p className="text-sm text-[#6B7280] mt-1">Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-4xl font-bold text-[#1F2937]">{stats.total}</div>
            <p className="text-sm text-[#6B7280] mt-1">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-4xl font-bold text-[#10B981]">{stats.completion}%</div>
            <p className="text-sm text-[#6B7280] mt-1">Complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Towards Next Badges */}
      {progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#8B5CF6]" />
              Almost There!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.slice(0, 3).map((p: any) => (
                <div key={p.badge.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-[#1F2937]">
                      {p.badge.icon} {p.badge.name}
                    </span>
                    <span className="text-[#6B7280]">
                      {p.current}/{p.target}
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] h-2 rounded-full transition-all"
                      style={{ width: `${p.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setSelectedCategory(cat.value)}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {badges.map((badge: any, index: number) => {
          const rarity = rarityColors[badge.rarity] || rarityColors.common;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card
                className={cn(
                  "relative overflow-hidden transition-all hover:shadow-lg",
                  badge.earned ? rarity.border : "border-gray-200 opacity-60",
                  badge.earned ? "border-2" : ""
                )}
              >
                <CardContent className="p-4 text-center">
                  {/* Rarity indicator */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs capitalize", rarity.bg, rarity.text)}
                    >
                      {badge.rarity}
                    </Badge>
                  </div>

                  {/* Badge Icon */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-3",
                      badge.earned ? rarity.bg : "bg-gray-100"
                    )}
                  >
                    {badge.earned ? (
                      badge.icon
                    ) : (
                      <Lock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  {/* Badge Name */}
                  <h3 className={cn(
                    "font-semibold text-sm",
                    badge.earned ? "text-[#1F2937]" : "text-gray-400"
                  )}>
                    {badge.name}
                  </h3>

                  {/* Badge Description */}
                  <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                    {badge.description}
                  </p>

                  {/* XP Reward */}
                  <div className={cn(
                    "mt-2 text-xs font-medium",
                    badge.earned ? "text-[#F59E0B]" : "text-gray-400"
                  )}>
                    +{badge.xpReward} XP
                  </div>

                  {/* Earned Date or Share Button */}
                  {badge.earned && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-[#10B981]">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs gap-1"
                        onClick={() => handleShare(badge.id, "copy")}
                        disabled={shareMutation.isPending}
                      >
                        <Share2 className="h-3 w-3" />
                        Share
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {badges.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No badges in this category</h3>
            <p className="text-[#6B7280]">Try selecting a different category</p>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Badge Rarity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(rarityColors).map(([rarity, colors]) => (
              <div key={rarity} className="flex items-center gap-2">
                <div className={cn("w-4 h-4 rounded-full border-2", colors.bg, colors.border)} />
                <span className={cn("text-sm capitalize", colors.text)}>{rarity}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
