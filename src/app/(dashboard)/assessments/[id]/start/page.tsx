"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Play,
  Video,
  FileText,
  CircleDot,
  Shield,
  Wifi,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Checkbox,
} from "@/components/ui";

// Sample assessment data
const assessmentData = {
  id: 1,
  title: "Q4 Technical Assessment",
  type: "technical",
  description: "Test your knowledge of data structures, algorithms, and system design concepts.",
  duration: 90,
  totalQuestions: 8,
  questionTypes: {
    mcq: 4,
    text: 2,
    video: 2,
  },
  instructions: [
    "Ensure you have a stable internet connection throughout the assessment.",
    "You cannot pause the assessment once started - the timer will continue running.",
    "For video questions, ensure your camera and microphone are working properly.",
    "You can flag questions to review later before submitting.",
    "Once submitted, you cannot change your answers.",
  ],
  requirements: [
    { id: "camera", label: "Camera access for video responses", icon: Video },
    { id: "mic", label: "Microphone access for video responses", icon: Video },
    { id: "browser", label: "Modern browser (Chrome, Firefox, Safari)", icon: Shield },
    { id: "internet", label: "Stable internet connection", icon: Wifi },
  ],
};

export default function AssessmentStartPage() {
  const router = useRouter();
  const params = useParams();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    // Small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push(`/assessments/${params.id}/take`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/assessments"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Assessments
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Brain className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{assessmentData.title}</h1>
                  <Badge variant="info">Technical</Badge>
                </div>
                <p className="text-muted-foreground">{assessmentData.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-lg font-bold">{assessmentData.duration} min</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <CircleDot className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-lg font-bold">{assessmentData.questionTypes.mcq}</p>
                <p className="text-xs text-muted-foreground">MCQ Questions</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <FileText className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-lg font-bold">{assessmentData.questionTypes.text}</p>
                <p className="text-xs text-muted-foreground">Written Questions</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Video className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-lg font-bold">{assessmentData.questionTypes.video}</p>
                <p className="text-xs text-muted-foreground">Video Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Instructions</h2>
            <ul className="space-y-3">
              {assessmentData.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{instruction}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assessmentData.requirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <req.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{req.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-3 p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
          <AlertCircle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning-700 dark:text-warning-300">
              Important Notice
            </p>
            <p className="text-sm text-warning-600 dark:text-warning-400 mt-1">
              Once you start the assessment, the timer cannot be paused. Make sure you have
              enough time to complete all {assessmentData.totalQuestions} questions within{" "}
              {assessmentData.duration} minutes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Terms and Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Checkbox
                label="I have read and understood the instructions. I confirm that my device meets all the requirements."
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />

              <div className="flex items-center gap-3">
                <Link href="/assessments" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  className="flex-1"
                  disabled={!acceptedTerms || isStarting}
                  onClick={handleStart}
                >
                  {isStarting ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Assessment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
