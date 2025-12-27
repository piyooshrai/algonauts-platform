"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  Edit,
  Award,
  Share2,
  Download,
  Loader2,
  Flame,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Avatar, Badge } from "@/components/ui";
import { LayersRank } from "@/components/layers-rank";
import { api } from "@/lib/trpc/client";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session } = useSession();

  // Fetch real profile data
  const { data: profileData, isLoading: profileLoading } = api.profile.get.useQuery();
  const { data: statsData, isLoading: statsLoading } = api.profile.getStats.useQuery();
  const { data: rankingSummary } = api.leaderboards.getUserRankingSummary.useQuery();
  const { data: badgesData } = api.badges.getMyBadges.useQuery();
  const { data: streakData } = api.streaks.getCurrent.useQuery();

  const isLoading = profileLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  const profile = profileData?.profile;
  const stats = statsData?.stats;
  const badges = badgesData?.badges || [];
  const recentBadges = badges.slice(0, 4);

  // User data from profile and session
  const user = {
    name: session?.user?.name || profile?.user?.name || "User",
    email: session?.user?.email || profile?.user?.email || "",
    title: profile?.headline || "Student",
    phone: profile?.phone || "",
    location: profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : profile?.city || profile?.state || "",
    bio: profile?.bio || "Complete your profile to let companies know more about you.",
    avatarUrl: profile?.avatarUrl,
    education: {
      degree: profile?.degree || "Degree",
      college: profile?.collegeName || "College",
      year: profile?.graduationYear || new Date().getFullYear() + 1,
    },
    experience: profile?.experienceYears ? `${profile.experienceYears} years` : "0-1 years",
    skills: profile?.skills || [],
    links: {
      github: profile?.githubUrl || "",
      linkedin: profile?.linkedinUrl || "",
      portfolio: profile?.portfolioUrl || "",
    },
    resumeUrl: profile?.resumeUrl,
    rank: rankingSummary?.rankings?.national?.rank || 0,
    totalUsers: rankingSummary?.rankings?.national?.total || 0,
    percentile: rankingSummary?.rankings?.national?.percentile || 0,
    xpTotal: profile?.totalXp || rankingSummary?.xpTotal || 0,
    currentStreak: streakData?.currentCount || profile?.currentStreak || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Profile
        </Button>
        {user.resumeUrl && (
          <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download Resume
            </Button>
          </a>
        )}
        <Link href="/onboarding/student">
          <Button size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar
                  fallback={user.name}
                  src={user.avatarUrl}
                  size="xl"
                  className="mx-auto mb-4 w-24 h-24"
                />
                <h1 className="text-xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.title}</p>

                {/* Streak Badge */}
                {user.currentStreak > 0 && (
                  <div className="flex justify-center mt-3">
                    <Badge variant="warning" className="gap-1">
                      <Flame className="h-3 w-3" />
                      {user.currentStreak} day streak
                    </Badge>
                  </div>
                )}

                <div className="my-6">
                  {user.rank > 0 ? (
                    <LayersRank
                      rank={user.rank}
                      totalUsers={user.totalUsers}
                      size="sm"
                    />
                  ) : (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Complete assessments to get ranked</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm text-left">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {(user.links.github || user.links.linkedin || user.links.portfolio) && (
                  <div className="flex justify-center gap-4 mt-6">
                    {user.links.github && (
                      <a
                        href={user.links.github.startsWith("http") ? user.links.github : `https://${user.links.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {user.links.linkedin && (
                      <a
                        href={user.links.linkedin.startsWith("http") ? user.links.linkedin : `https://${user.links.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {user.links.portfolio && (
                      <a
                        href={user.links.portfolio.startsWith("http") ? user.links.portfolio : `https://${user.links.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold font-display">{stats?.applications || 0}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold font-display">{user.xpTotal}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold font-display">{stats?.badges || badges.length}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold font-display text-success-600">
                    {user.percentile > 0 ? `Top ${100 - user.percentile}%` : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Percentile</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Completion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Profile Completion
                  <span className="text-[#0EA5E9]">{profile?.profileCompletionPct || 0}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={profile?.profileCompletionPct || 0} size="sm" />
                {(profile?.profileCompletionPct || 0) < 100 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Complete your profile to unlock more opportunities and improve your match score.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Education & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{user.education.degree}</p>
                  <p className="text-muted-foreground">{user.education.college}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Expected: {user.education.year}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{user.experience}</p>
                  <p className="text-muted-foreground">Professional Experience</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="py-1.5 px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet. Edit your profile to add skills.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges / Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    Badges
                  </CardTitle>
                  {badges.length > 4 && (
                    <Link href="/badges" className="text-sm text-[#0EA5E9] hover:underline">
                      View all
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {recentBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <span className="text-2xl">{badge.badge?.icon || "🏆"}</span>
                        <div>
                          <p className="font-medium">{badge.badge?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {badge.badge?.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">No badges earned yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete activities to earn badges and XP
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border border-border text-center">
                    <p className="text-2xl font-bold text-[#1F2937]">{stats?.applications || 0}</p>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border text-center">
                    <p className="text-2xl font-bold text-[#10B981]">{stats?.placements || 0}</p>
                    <p className="text-sm text-muted-foreground">Placements</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border text-center">
                    <p className="text-2xl font-bold text-[#F59E0B]">{user.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border text-center">
                    <p className="text-2xl font-bold text-[#0EA5E9]">{badges.length}</p>
                    <p className="text-sm text-muted-foreground">Badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
