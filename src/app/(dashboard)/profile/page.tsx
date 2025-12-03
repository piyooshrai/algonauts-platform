"use client";

import { motion } from "framer-motion";
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
  TrendingUp,
  CheckCircle2,
  Share2,
  Download,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Avatar } from "@/components/ui";
import { LayersRank } from "@/components/layers-rank";

const profileData = {
  name: "John Doe",
  title: "Full Stack Developer",
  email: "john.doe@example.com",
  phone: "+91 98765 43210",
  location: "Bangalore, India",
  bio: "Passionate developer with a keen interest in building scalable applications. Looking for opportunities to work with cutting-edge technologies.",
  education: {
    degree: "B.Tech in Computer Science",
    college: "Indian Institute of Technology, Delhi",
    year: "2025",
  },
  experience: "0-1 years",
  skills: [
    { name: "JavaScript", level: 90 },
    { name: "React", level: 85 },
    { name: "Node.js", level: 80 },
    { name: "Python", level: 75 },
    { name: "TypeScript", level: 85 },
    { name: "PostgreSQL", level: 70 },
  ],
  links: {
    github: "github.com/johndoe",
    linkedin: "linkedin.com/in/johndoe",
    portfolio: "johndoe.dev",
  },
  stats: {
    rank: 247,
    totalUsers: 50000,
    assessmentsTaken: 12,
    profileViews: 34,
    invitesReceived: 8,
  },
  achievements: [
    { id: 1, title: "Quick Learner", description: "Completed 5 assessments in first month", icon: "🚀" },
    { id: 2, title: "Top 1%", description: "Achieved top 1% ranking nationally", icon: "🏆" },
    { id: 3, title: "Code Master", description: "Scored 90%+ in Technical Assessment", icon: "💻" },
    { id: 4, title: "Rising Star", description: "Improved rank by 500+ positions", icon: "⭐" },
  ],
};

const assessmentHistory = [
  { id: 1, name: "Q3 Technical", date: "Sep 2025", score: 847, maxScore: 1000, percentile: 92 },
  { id: 2, name: "Q3 Behavioral", date: "Sep 2025", score: 78, maxScore: 100, percentile: 85 },
  { id: 3, name: "Q2 Technical", date: "Jun 2025", score: 756, maxScore: 1000, percentile: 78 },
  { id: 4, name: "Q2 Contextual", date: "Jun 2025", score: 134, maxScore: 200, percentile: 67 },
];

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Profile
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download Resume
        </Button>
        <Button size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
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
                  fallback={profileData.name}
                  size="xl"
                  className="mx-auto mb-4 w-24 h-24"
                />
                <h1 className="text-xl font-bold">{profileData.name}</h1>
                <p className="text-muted-foreground">{profileData.title}</p>

                <div className="my-6">
                  <LayersRank
                    rank={profileData.stats.rank}
                    totalUsers={profileData.stats.totalUsers}
                    size="sm"
                  />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{profileData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profileData.location}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <a
                    href={`https://${profileData.links.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://${profileData.links.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://${profileData.links.portfolio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                </div>
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
                  <p className="text-2xl font-bold font-display">{profileData.stats.assessmentsTaken}</p>
                  <p className="text-xs text-muted-foreground">Assessments</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold font-display">{profileData.stats.profileViews}</p>
                  <p className="text-xs text-muted-foreground">Profile Views</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold font-display">{profileData.stats.invitesReceived}</p>
                  <p className="text-xs text-muted-foreground">Invites</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold font-display text-success-600">Top 1%</p>
                  <p className="text-xs text-muted-foreground">Percentile</p>
                </div>
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
                <p className="text-muted-foreground">{profileData.bio}</p>
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
                  <p className="font-medium">{profileData.education.degree}</p>
                  <p className="text-muted-foreground">{profileData.education.college}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Expected: {profileData.education.year}
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
                  <p className="font-medium">{profileData.experience}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.skills.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} size="sm" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Assessment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  Assessment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessmentHistory.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success-500" />
                        <div>
                          <p className="font-medium">{assessment.name}</p>
                          <p className="text-sm text-muted-foreground">{assessment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="font-semibold">
                            {assessment.score}/{assessment.maxScore}
                          </p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        <div>
                          <p className="font-semibold text-success-600">
                            {assessment.percentile}%
                          </p>
                          <p className="text-xs text-muted-foreground">Percentile</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
