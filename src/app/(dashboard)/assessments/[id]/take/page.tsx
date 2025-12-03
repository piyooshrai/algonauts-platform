"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Circle,
  Square,
  Send,
  Flag,
  HelpCircle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Progress,
  Textarea,
  Badge,
  Modal,
} from "@/components/ui";
import { cn } from "@/lib/utils";

// Question types
type QuestionType = "mcq" | "text" | "video";

interface MCQOption {
  id: string;
  text: string;
}

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: MCQOption[];
  timeLimit?: number; // in seconds, for video questions
  hint?: string;
}

// Sample assessment data
const sampleAssessment = {
  id: 1,
  title: "Q4 Technical Assessment",
  type: "technical",
  duration: 90, // minutes
  questions: [
    {
      id: 1,
      type: "mcq" as QuestionType,
      question:
        "What is the time complexity of searching for an element in a balanced binary search tree?",
      options: [
        { id: "a", text: "O(1)" },
        { id: "b", text: "O(log n)" },
        { id: "c", text: "O(n)" },
        { id: "d", text: "O(n log n)" },
      ],
      hint: "Think about how many nodes you visit in the worst case.",
    },
    {
      id: 2,
      type: "mcq" as QuestionType,
      question:
        "Which data structure is best suited for implementing a LRU (Least Recently Used) cache?",
      options: [
        { id: "a", text: "Array" },
        { id: "b", text: "Stack" },
        { id: "c", text: "HashMap + Doubly Linked List" },
        { id: "d", text: "Binary Tree" },
      ],
    },
    {
      id: 3,
      type: "text" as QuestionType,
      question:
        "Explain the difference between process and thread. When would you choose one over the other?",
      hint: "Consider memory sharing and context switching costs.",
    },
    {
      id: 4,
      type: "video" as QuestionType,
      question:
        "Walk us through how you would design a URL shortening service like bit.ly. Discuss the system architecture, database schema, and potential scaling challenges.",
      timeLimit: 180, // 3 minutes
    },
    {
      id: 5,
      type: "mcq" as QuestionType,
      question: "What is the output of the following JavaScript code?\n\nconsole.log(typeof null);",
      options: [
        { id: "a", text: '"null"' },
        { id: "b", text: '"undefined"' },
        { id: "c", text: '"object"' },
        { id: "d", text: '"number"' },
      ],
    },
    {
      id: 6,
      type: "text" as QuestionType,
      question:
        "Describe the CAP theorem and explain why it's important in distributed systems design.",
    },
    {
      id: 7,
      type: "mcq" as QuestionType,
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: [
        { id: "a", text: "Bubble Sort - O(n^2)" },
        { id: "b", text: "Merge Sort - O(n log n)" },
        { id: "c", text: "Selection Sort - O(n^2)" },
        { id: "d", text: "Insertion Sort - O(n^2)" },
      ],
    },
    {
      id: 8,
      type: "video" as QuestionType,
      question:
        "Tell us about a challenging technical problem you solved recently. What was your approach and what did you learn?",
      timeLimit: 120, // 2 minutes
    },
  ] as Question[],
};

// Format time as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function AssessmentTakePage() {
  const router = useRouter();
  const params = useParams();

  // Assessment state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(sampleAssessment.duration * 60); // in seconds
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState<Record<number, boolean>>({});
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const currentQuestion = sampleAssessment.questions[currentQuestionIndex];
  const totalQuestions = sampleAssessment.questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Count answered questions
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUpModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Video recording timer
  useEffect(() => {
    let recordingTimer: NodeJS.Timeout;
    if (isRecording) {
      recordingTimer = setInterval(() => {
        setRecordingTime((prev) => {
          const maxTime = currentQuestion.timeLimit || 180;
          if (prev >= maxTime) {
            setIsRecording(false);
            setHasRecording((prev) => ({ ...prev, [currentQuestion.id]: true }));
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(recordingTimer);
  }, [isRecording, currentQuestion.timeLimit, currentQuestion.id]);

  // Navigation handlers
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
      setShowHint(false);
      setRecordingTime(0);
      setIsRecording(false);
    }
  }, [totalQuestions]);

  const goToPrevious = () => goToQuestion(currentQuestionIndex - 1);
  const goToNext = () => goToQuestion(currentQuestionIndex + 1);

  // Answer handlers
  const handleMCQSelect = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleTextChange = (text: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  // Video recording handlers
  const startRecording = () => {
    setIsCameraOn(true);
    setIsMicOn(true);
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecording((prev) => ({ ...prev, [currentQuestion.id]: true }));
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: "video_recorded" }));
  };

  const retakeRecording = () => {
    setHasRecording((prev) => ({ ...prev, [currentQuestion.id]: false }));
    setRecordingTime(0);
  };

  // Submit handlers
  const handleSubmit = () => {
    // In a real app, this would submit to an API
    router.push(`/assessments/${params.id}/results`);
  };

  const isTimeLow = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background -m-4 sm:-m-6 lg:-m-8">
      {/* Header with Timer and Progress */}
      <div className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Top row: Title and Timer */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-semibold text-lg">{sampleAssessment.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>

            {/* Timer */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold",
                isTimeLow
                  ? "bg-error-100 dark:bg-error-900/30 text-error-600 animate-pulse"
                  : "bg-muted"
              )}
            >
              <Clock className={cn("h-5 w-5", isTimeLow && "text-error-600")} />
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {answeredCount} of {totalQuestions} answered
              </span>
            </div>
            <Progress value={progressPercentage} size="md" />
          </div>

          {/* Question navigation pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {sampleAssessment.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => goToQuestion(index)}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full text-sm font-medium transition-all",
                  "flex items-center justify-center relative",
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : answers[q.id]
                    ? "bg-success-100 dark:bg-success-900/30 text-success-600"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {index + 1}
                {flaggedQuestions.has(q.id) && (
                  <Flag className="absolute -top-1 -right-1 h-3 w-3 text-warning-500 fill-warning-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                {/* Question header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        currentQuestion.type === "mcq"
                          ? "info"
                          : currentQuestion.type === "text"
                          ? "default"
                          : "warning"
                      }
                    >
                      {currentQuestion.type === "mcq"
                        ? "Multiple Choice"
                        : currentQuestion.type === "text"
                        ? "Written Response"
                        : "Video Response"}
                    </Badge>
                    {currentQuestion.timeLimit && (
                      <span className="text-sm text-muted-foreground">
                        Time limit: {currentQuestion.timeLimit}s
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {currentQuestion.hint && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHint(!showHint)}
                        className="text-muted-foreground"
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Hint
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFlag}
                      className={cn(
                        flaggedQuestions.has(currentQuestion.id)
                          ? "text-warning-500"
                          : "text-muted-foreground"
                      )}
                    >
                      <Flag
                        className={cn(
                          "h-4 w-4 mr-1",
                          flaggedQuestions.has(currentQuestion.id) && "fill-warning-500"
                        )}
                      />
                      {flaggedQuestions.has(currentQuestion.id) ? "Flagged" : "Flag"}
                    </Button>
                  </div>
                </div>

                {/* Question text */}
                <div className="mb-6">
                  <p className="text-lg font-medium whitespace-pre-wrap">
                    {currentQuestion.question}
                  </p>

                  {/* Hint */}
                  <AnimatePresence>
                    {showHint && currentQuestion.hint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-start gap-2">
                          <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {currentQuestion.hint}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Answer area based on question type */}
                {currentQuestion.type === "mcq" && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleMCQSelect(option.id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                          answers[currentQuestion.id] === option.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                            answers[currentQuestion.id] === option.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {option.id.toUpperCase()}
                        </div>
                        <span className="flex-1">{option.text}</span>
                        {answers[currentQuestion.id] === option.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === "text" && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className="min-h-[200px] resize-y"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {(answers[currentQuestion.id] || "").length} characters
                    </p>
                  </div>
                )}

                {currentQuestion.type === "video" && (
                  <div className="space-y-4">
                    {/* Video preview area */}
                    <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                      {isCameraOn ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* Placeholder for actual video stream */}
                          <div className="text-center text-white">
                            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm opacity-75">Camera Preview</p>
                            <p className="text-xs opacity-50 mt-1">
                              (Video stream would appear here)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-slate-400">
                            <VideoOff className="h-16 w-16 mx-auto mb-4" />
                            <p className="text-sm">Camera is off</p>
                            <p className="text-xs mt-1">
                              Click &quot;Start Recording&quot; to begin
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Recording indicator */}
                      {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-error-600 text-white text-sm">
                          <Circle className="h-3 w-3 fill-white animate-pulse" />
                          REC {formatTime(recordingTime)}
                        </div>
                      )}

                      {/* Recording complete indicator */}
                      {hasRecording[currentQuestion.id] && !isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-600 text-white text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          Recording saved
                        </div>
                      )}

                      {/* Time remaining bar */}
                      {isRecording && currentQuestion.timeLimit && (
                        <div className="absolute bottom-0 left-0 right-0">
                          <Progress
                            value={(recordingTime / currentQuestion.timeLimit) * 100}
                            size="sm"
                            variant={
                              recordingTime > currentQuestion.timeLimit * 0.8
                                ? "error"
                                : "default"
                            }
                            className="rounded-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Video controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCameraOn(!isCameraOn)}
                          disabled={isRecording}
                        >
                          {isCameraOn ? (
                            <>
                              <Video className="h-4 w-4 mr-2" />
                              Camera On
                            </>
                          ) : (
                            <>
                              <VideoOff className="h-4 w-4 mr-2" />
                              Camera Off
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMicOn(!isMicOn)}
                          disabled={isRecording}
                        >
                          {isMicOn ? (
                            <>
                              <Mic className="h-4 w-4 mr-2" />
                              Mic On
                            </>
                          ) : (
                            <>
                              <MicOff className="h-4 w-4 mr-2" />
                              Mic Off
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasRecording[currentQuestion.id] && !isRecording && (
                          <Button variant="outline" size="sm" onClick={retakeRecording}>
                            Retake
                          </Button>
                        )}
                        {!isRecording ? (
                          <Button onClick={startRecording} disabled={hasRecording[currentQuestion.id]}>
                            <Circle className="h-4 w-4 mr-2 fill-error-500 text-error-500" />
                            Start Recording
                          </Button>
                        ) : (
                          <Button variant="destructive" onClick={stopRecording}>
                            <Square className="h-4 w-4 mr-2 fill-current" />
                            Stop Recording
                          </Button>
                        )}
                      </div>
                    </div>

                    {currentQuestion.timeLimit && (
                      <p className="text-sm text-muted-foreground text-center">
                        Maximum recording time: {formatTime(currentQuestion.timeLimit)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {unansweredCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {unansweredCount} unanswered
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => setIsSubmitModalOpen(true)}
              className="border-success-500 text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Assessment
            </Button>
          </div>

          <Button
            onClick={goToNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Question summary */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-success-100 dark:bg-success-900/30 border-2 border-success-500" />
                  <span className="text-muted-foreground">Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-muted border-2 border-muted-foreground/30" />
                  <span className="text-muted-foreground">Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-warning-500 fill-warning-500" />
                  <span className="text-muted-foreground">Flagged ({flaggedQuestions.size})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Assessment?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
            <AlertCircle className="h-5 w-5 text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Review your submission</p>
              <p className="text-sm text-muted-foreground mt-1">
                Once submitted, you cannot change your answers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-success-50 dark:bg-success-900/20">
              <p className="text-2xl font-bold text-success-600">{answeredCount}</p>
              <p className="text-sm text-muted-foreground">Answered</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{unansweredCount}</p>
              <p className="text-sm text-muted-foreground">Unanswered</p>
            </div>
            <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20">
              <p className="text-2xl font-bold text-warning-600">{flaggedQuestions.size}</p>
              <p className="text-sm text-muted-foreground">Flagged</p>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
              <AlertCircle className="h-5 w-5 text-warning-600 flex-shrink-0" />
              <p className="text-sm text-warning-700 dark:text-warning-300">
                You have {unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}.
                Are you sure you want to submit?
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Continue Assessment
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Submit Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Time's Up Modal */}
      <Modal
        isOpen={isTimeUpModalOpen}
        onClose={() => {}}
        title="Time's Up!"
      >
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
            <Clock className="h-10 w-10 text-error-600" />
          </div>
          <div>
            <p className="font-medium text-lg">Your time has expired</p>
            <p className="text-muted-foreground mt-1">
              Your assessment will be automatically submitted with your current answers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-lg bg-success-50 dark:bg-success-900/20">
              <p className="text-2xl font-bold text-success-600">{answeredCount}</p>
              <p className="text-sm text-muted-foreground">Answered</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{unansweredCount}</p>
              <p className="text-sm text-muted-foreground">Unanswered</p>
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            View Results
          </Button>
        </div>
      </Modal>
    </div>
  );
}
