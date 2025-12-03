"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Trash2,
  Send,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  Progress,
} from "@/components/ui";

interface ParsedStudent {
  name: string;
  email: string;
  year: number;
  branch: string;
  valid: boolean;
  error?: string;
}

interface InviteRecord {
  id: number;
  name: string;
  email: string;
  year: number;
  branch: string;
  status: "pending" | "sent" | "signed_up" | "completed" | "failed";
  sentAt?: string;
  signedUpAt?: string;
  completedAt?: string;
}

// Mock invite history
const mockInviteHistory: InviteRecord[] = [
  { id: 1, name: "Amit Kumar", email: "amit.kumar@college.edu", year: 2025, branch: "CS", status: "completed", sentAt: "2024-01-10", signedUpAt: "2024-01-11", completedAt: "2024-01-12" },
  { id: 2, name: "Priya Singh", email: "priya.singh@college.edu", year: 2025, branch: "ECE", status: "signed_up", sentAt: "2024-01-12", signedUpAt: "2024-01-13" },
  { id: 3, name: "Rahul Sharma", email: "rahul.sharma@college.edu", year: 2024, branch: "ME", status: "sent", sentAt: "2024-01-14" },
  { id: 4, name: "Neha Gupta", email: "neha.gupta@college.edu", year: 2025, branch: "CS", status: "pending" },
  { id: 5, name: "Karan Malhotra", email: "karan.malhotra@college.edu", year: 2026, branch: "IT", status: "failed", sentAt: "2024-01-13" },
];

export default function BulkUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [inviteHistory, setInviteHistory] = useState<InviteRecord[]>(mockInviteHistory);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const parseCSV = (content: string): ParsedStudent[] => {
    const lines = content.trim().split("\n");
    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());

    const nameIndex = headers.indexOf("name");
    const emailIndex = headers.indexOf("email");
    const yearIndex = headers.indexOf("year");
    const branchIndex = headers.indexOf("branch");

    if (nameIndex === -1 || emailIndex === -1 || yearIndex === -1 || branchIndex === -1) {
      return [];
    }

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const student: ParsedStudent = {
        name: values[nameIndex] || "",
        email: values[emailIndex] || "",
        year: parseInt(values[yearIndex]) || 0,
        branch: values[branchIndex] || "",
        valid: true,
      };

      // Validation
      if (!student.name) {
        student.valid = false;
        student.error = "Name is required";
      } else if (!student.email || !validateEmail(student.email)) {
        student.valid = false;
        student.error = "Invalid email";
      } else if (!student.year || student.year < 2020 || student.year > 2030) {
        student.valid = false;
        student.error = "Invalid year";
      } else if (!student.branch) {
        student.valid = false;
        student.error = "Branch is required";
      }

      return student;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const parsed = parseCSV(content);
          setParsedData(parsed);
        };
        reader.readAsText(droppedFile);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const parsed = parseCSV(content);
        setParsedData(parsed);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSendInvites = async () => {
    setUploading(true);
    setUploadProgress(0);

    const validStudents = parsedData.filter((s) => s.valid);

    // Simulate sending invites
    for (let i = 0; i < validStudents.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUploadProgress(((i + 1) / validStudents.length) * 100);
    }

    // Add to invite history
    const newInvites: InviteRecord[] = validStudents.map((s, idx) => ({
      id: inviteHistory.length + idx + 1,
      name: s.name,
      email: s.email,
      year: s.year,
      branch: s.branch,
      status: "sent" as const,
      sentAt: new Date().toISOString().split("T")[0],
    }));

    setInviteHistory([...newInvites, ...inviteHistory]);
    setFile(null);
    setParsedData([]);
    setUploading(false);
    setUploadProgress(0);
  };

  const handleClear = () => {
    setFile(null);
    setParsedData([]);
  };

  const validCount = parsedData.filter((s) => s.valid).length;
  const invalidCount = parsedData.filter((s) => !s.valid).length;

  const getStatusBadge = (status: InviteRecord["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "signed_up":
        return <Badge variant="info">Signed Up</Badge>;
      case "sent":
        return <Badge variant="warning">Invite Sent</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getStatusIcon = (status: InviteRecord["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success-500" />;
      case "signed_up":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "sent":
        return <Clock className="h-4 w-4 text-warning-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-error-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-display tracking-tight">Bulk Upload</h1>
        <p className="text-muted-foreground mt-1">
          Upload a CSV file to invite multiple students at once
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CSV File
              </CardTitle>
              <CardDescription>
                Upload a CSV with columns: name, email, year, branch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Download Template */}
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download CSV Template
              </Button>

              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />

                {file ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <Button variant="ghost" size="sm" onClick={handleClear}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium">Drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse
                    </p>
                  </label>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sending invites...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} animated />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                {parsedData.length > 0
                  ? `${validCount} valid, ${invalidCount} invalid entries`
                  : "Upload a file to preview the data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parsedData.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success-500" />
                      <span>{validCount} valid</span>
                    </div>
                    {invalidCount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-error-500" />
                        <span>{invalidCount} invalid</span>
                      </div>
                    )}
                  </div>

                  {/* Preview Table */}
                  <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium">Name</th>
                          <th className="text-left py-2 px-3 font-medium">Email</th>
                          <th className="text-left py-2 px-3 font-medium">Year</th>
                          <th className="text-left py-2 px-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 10).map((student, idx) => (
                          <tr key={idx} className="border-t border-border">
                            <td className="py-2 px-3">{student.name}</td>
                            <td className="py-2 px-3 text-muted-foreground">{student.email}</td>
                            <td className="py-2 px-3">{student.year}</td>
                            <td className="py-2 px-3">
                              {student.valid ? (
                                <CheckCircle2 className="h-4 w-4 text-success-500" />
                              ) : (
                                <div className="flex items-center gap-1">
                                  <XCircle className="h-4 w-4 text-error-500" />
                                  <span className="text-xs text-error-500">{student.error}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 10 && (
                      <p className="text-center py-2 text-sm text-muted-foreground bg-muted/50">
                        + {parsedData.length - 10} more entries
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={handleClear} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendInvites}
                      disabled={validCount === 0 || uploading}
                      className="flex-1 gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send {validCount} Invites
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileSpreadsheet className="h-12 w-12 mb-4" />
                  <p>No file uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Invite History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Invite History</CardTitle>
              <CardDescription>Track the status of all sent invitations</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Year</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Branch</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sent At</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inviteHistory.map((invite) => (
                    <tr key={invite.id} className="border-b border-border hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invite.status)}
                          <div>
                            <p className="font-medium">{invite.name}</p>
                            <p className="text-sm text-muted-foreground">{invite.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{invite.year}</td>
                      <td className="py-3 px-4">{invite.branch}</td>
                      <td className="py-3 px-4">{getStatusBadge(invite.status)}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {invite.sentAt
                          ? new Date(invite.sentAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(invite.status === "pending" || invite.status === "failed") && (
                          <Button variant="ghost" size="sm">
                            Resend
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
