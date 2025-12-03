"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  MessageSquare,
  Layers,
  Clock,
  Calendar,
  CheckCircle2,
  Play,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button, Card, CardContent, Badge, Progress, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { cn } from "@/lib/utils";

const assessmentTypes = [
  {
    id: "technical",
    name: "Technical",
    icon: Brain,
    color: "blue",
    description: "Coding, algorithms, system design",
    totalQuestions: 40,
    duration: "90 min",
  },
  {
    id: "behavioral",
    name: "Behavioral",
    icon: MessageSquare,
    color: "purple",
    description: "Communication, leadership, teamwork",
    totalQuestions: 25,
    duration: "45 min",
  },
  {
    id: "contextual",
    name: "Contextual",
    icon: Layers,
    color: "green",
    description: "Case studies, situational judgment",
    totalQuestions: 30,
    duration: "60 min",
  },
];

const upcomingAssessments = [
  {
    id: 1,
    title: "Q4 Technical Assessment",
    type: "technical",
    date: "2025-12-15",
    time: "10:00 AM",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Behavioral Evaluation",
    type: "behavioral",
    date: "2025-12-18",
    time: "2:00 PM",
    status: "upcoming",
  },
];

const completedAssessments = [
  {
    id: 3,
    title: "Q3 Technical Assessment",
    type: "technical",
    date: "2025-09-15",
    score: 847,
    maxScore: 1000,
    percentile: 92,
  },
  {
    id: 4,
    title: "Q3 Behavioral Evaluation",
    type: "behavioral",
    date: "2025-09-18",
    score: 78,
    maxScore: 100,
    percentile: 85,
  },
  {
    id: 5,
    title: "Q3 Contextual Assessment",
    type: "contextual",
    date: "2025-09-22",
    score: 156,
    maxScore: 200,
    percentile: 88,
  },
];

const practiceTests = [
  {
    id: 1,
    title: "Data Structures Basics",
    type: "technical",
    questions: 20,
    duration: "30 min",
    difficulty: "Easy",
    completed: true,
  },
  {
    id: 2,
    title: "Advanced Algorithms",
    type: "technical",
    questions: 15,
    duration: "45 min",
    difficulty: "Hard",
    completed: false,
  },
  {
    id: 3,
    title: "System Design Fundamentals",
    type: "technical",
    questions: 10,
    duration: "60 min",
    difficulty: "Medium",
    completed: false,
  },
  {
    id: 4,
    title: "Communication Skills",
    type: "behavioral",
    questions: 15,
    duration: "25 min",
    difficulty: "Easy",
    completed: true,
  },
];

export default function AssessmentsPage() {

  const getTypeConfig = (type: string) => {
    return assessmentTypes.find((t) => t.id === type) || assessmentTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">
            Take quarterly assessments to improve your LayersRank
          </p>
        </div>
      </div>

      {/* Assessment Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assessmentTypes.map((type) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card hover className="cursor-pointer">
              <CardContent className="p-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                    type.color === "blue" && "bg-blue-100 dark:bg-blue-900/30",
                    type.color === "purple" && "bg-purple-100 dark:bg-purple-900/30",
                    type.color === "green" && "bg-green-100 dark:bg-green-900/30"
                  )}
                >
                  <type.icon
                    className={cn(
                      "h-6 w-6",
                      type.color === "blue" && "text-blue-600",
                      type.color === "purple" && "text-purple-600",
                      type.color === "green" && "text-green-600"
                    )}
                  />
                </div>
                <h3 className="font-semibold mb-1">{type.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {type.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {type.totalQuestions} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {type.duration}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="practice">Practice Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {upcomingAssessments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Upcoming Assessments</h3>
                  <p className="text-muted-foreground">
                    Check back later for new assessment schedules.
                  </p>
                </CardContent>
              </Card>
            ) : (
              upcomingAssessments.map((assessment) => {
                const typeConfig = getTypeConfig(assessment.type);
                return (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center",
                                typeConfig.color === "blue" && "bg-blue-100 dark:bg-blue-900/30",
                                typeConfig.color === "purple" && "bg-purple-100 dark:bg-purple-900/30",
                                typeConfig.color === "green" && "bg-green-100 dark:bg-green-900/30"
                              )}
                            >
                              <typeConfig.icon
                                className={cn(
                                  "h-6 w-6",
                                  typeConfig.color === "blue" && "text-blue-600",
                                  typeConfig.color === "purple" && "text-purple-600",
                                  typeConfig.color === "green" && "text-green-600"
                                )}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">{assessment.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(assessment.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {assessment.time}
                                </span>
                                <span>{typeConfig.duration}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{typeConfig.name}</Badge>
                            <Link href={`/assessments/${assessment.id}/start`}>
                              <Button>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {completedAssessments.map((assessment) => {
              const typeConfig = getTypeConfig(assessment.type);
              const percentage = (assessment.score / assessment.maxScore) * 100;
              return (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center",
                              typeConfig.color === "blue" && "bg-blue-100 dark:bg-blue-900/30",
                              typeConfig.color === "purple" && "bg-purple-100 dark:bg-purple-900/30",
                              typeConfig.color === "green" && "bg-green-100 dark:bg-green-900/30"
                            )}
                          >
                            <CheckCircle2 className="h-6 w-6 text-success-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{assessment.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Completed on{" "}
                              {new Date(assessment.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold font-display">
                              {assessment.score}
                              <span className="text-sm text-muted-foreground font-normal">
                                /{assessment.maxScore}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold font-display text-success-600">
                              {assessment.percentile}%
                            </p>
                            <p className="text-xs text-muted-foreground">Percentile</p>
                          </div>
                          <Link href={`/assessments/${assessment.id}/results`}>
                            <Button variant="outline">
                              View Results
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress value={percentage} size="sm" variant="success" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="practice" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practiceTests.map((test) => {
              const typeConfig = getTypeConfig(test.type);
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card hover className="cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            typeConfig.color === "blue" && "bg-blue-100 dark:bg-blue-900/30",
                            typeConfig.color === "purple" && "bg-purple-100 dark:bg-purple-900/30",
                            typeConfig.color === "green" && "bg-green-100 dark:bg-green-900/30"
                          )}
                        >
                          <typeConfig.icon
                            className={cn(
                              "h-5 w-5",
                              typeConfig.color === "blue" && "text-blue-600",
                              typeConfig.color === "purple" && "text-purple-600",
                              typeConfig.color === "green" && "text-green-600"
                            )}
                          />
                        </div>
                        <Badge
                          variant={
                            test.difficulty === "Easy"
                              ? "success"
                              : test.difficulty === "Medium"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {test.difficulty}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{test.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span>{test.questions} questions</span>
                        <span>{test.duration}</span>
                      </div>
                      <Link href={`/assessments/${test.id}/start`}>
                        <Button
                          className="w-full"
                          variant={test.completed ? "outline" : "default"}
                        >
                          {test.completed ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Retake
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start Practice
                            </>
                          )}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
