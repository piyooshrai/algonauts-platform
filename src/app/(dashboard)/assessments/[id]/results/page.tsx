"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  ArrowRight,
  Share2,
  Home,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Progress,
} from "@/components/ui";
import { cn } from "@/lib/utils";

// Sample results data
const resultsData = {
  assessmentTitle: "Q4 Technical Assessment",
  type: "technical",
  completedAt: new Date().toISOString(),
  duration: "78 min", // actual time taken
  score: 72,
  maxScore: 100,
  percentile: 85,
  previousRank: 287,
  newRank: 247,
  breakdown: [
    { category: "Data Structures", score: 85, maxScore: 100, questions: 2 },
    { category: "Algorithms", score: 70, maxScore: 100, questions: 2 },
    { category: "System Design", score: 65, maxScore: 100, questions: 2 },
    { category: "Problem Solving", score: 68, maxScore: 100, questions: 2 },
  ],
  questionResults: [
    { id: 1, type: "mcq", correct: true, category: "Data Structures" },
    { id: 2, type: "mcq", correct: true, category: "Data Structures" },
    { id: 3, type: "text", score: 70, maxScore: 100, category: "Problem Solving" },
    { id: 4, type: "video", score: 65, maxScore: 100, category: "System Design" },
    { id: 5, type: "mcq", correct: true, category: "Algorithms" },
    { id: 6, type: "text", score: 68, maxScore: 100, category: "Problem Solving" },
    { id: 7, type: "mcq", correct: false, category: "Algorithms" },
    { id: 8, type: "video", score: 65, maxScore: 100, category: "System Design" },
  ],
};

export default function AssessmentResultsPage() {
  const rankImprovement = resultsData.previousRank - resultsData.newRank;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 mx-auto rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="h-10 w-10 text-success-600" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Assessment Completed!</h1>
        <p className="text-muted-foreground">
          Great job completing the {resultsData.assessmentTitle}
        </p>
      </motion.div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Your Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-bold font-display">{resultsData.score}</span>
                  <span className="text-blue-200 text-xl">/ {resultsData.maxScore}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Percentile</p>
                <p className="text-3xl font-bold font-display">{resultsData.percentile}th</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-warning-500" />
                <p className="text-2xl font-bold font-display text-success-600">
                  #{resultsData.newRank}
                </p>
                <p className="text-xs text-muted-foreground">New Rank</p>
                {rankImprovement > 0 && (
                  <Badge variant="success" className="mt-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{rankImprovement} positions
                  </Badge>
                )}
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold font-display">{resultsData.duration}</p>
                <p className="text-xs text-muted-foreground">Time Taken</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Target className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold font-display">
                  {resultsData.questionResults.filter(q =>
                    q.correct === true || (q.score && q.score >= 60)
                  ).length}/{resultsData.questionResults.length}
                </p>
                <p className="text-xs text-muted-foreground">Questions Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Score Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Score Breakdown</h2>
            <div className="space-y-4">
              {resultsData.breakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                  <Progress
                    value={item.score}
                    max={item.maxScore}
                    size="md"
                    variant={
                      item.score >= 80
                        ? "success"
                        : item.score >= 60
                        ? "default"
                        : "warning"
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Question Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Question Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {resultsData.questionResults.map((question) => {
                const isCorrect = question.correct === true || (question.score && question.score >= 60);
                return (
                  <div
                    key={question.id}
                    className={cn(
                      "p-4 rounded-lg border-2 text-center",
                      isCorrect
                        ? "border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20"
                        : "border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20"
                    )}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-success-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-error-600" />
                      )}
                    </div>
                    <p className="font-medium">Q{question.id}</p>
                    <Badge
                      variant="outline"
                      className="mt-1 text-xs"
                    >
                      {question.type.toUpperCase()}
                    </Badge>
                    {question.score !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {question.score}/{question.maxScore}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Recommendations</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Brain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-300">
                    Focus on Algorithms
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Your algorithm scores could use some improvement. Consider practicing
                    more sorting and searching problems.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">
                    Strong in Data Structures
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Great performance in data structures! Keep practicing to maintain
                    your edge.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </Link>
        <Link href="/assessments" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full">
            View All Assessments
          </Button>
        </Link>
        <Button variant="outline" className="w-full sm:w-auto">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
        <Link href="/leaderboard" className="w-full sm:w-auto flex-1">
          <Button className="w-full">
            View Leaderboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
