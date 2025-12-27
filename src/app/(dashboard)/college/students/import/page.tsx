"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  Loader2,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export default function CollegeStudentImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    // Simulate upload and processing
    // In production, this would be an API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate result
    setResult({
      total: 50,
      success: 47,
      failed: 3,
      errors: [
        { row: 12, message: "Invalid email format" },
        { row: 28, message: "Missing required field: Name" },
        { row: 45, message: "Duplicate email address" },
      ],
    });

    setIsUploading(false);
  };

  const handleDownloadTemplate = () => {
    const template = "Name,Email,Phone,Department,Year,Roll Number\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/college/students">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <Upload className="h-6 w-6 text-[#0EA5E9]" />
            Bulk Import Students
          </h1>
          <p className="text-[#6B7280] mt-1">Upload a CSV file to add multiple students at once</p>
        </div>
      </div>

      {/* Template Download */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-[#0EA5E9]" />
              </div>
              <div>
                <p className="font-medium text-[#1F2937]">Download Template</p>
                <p className="text-sm text-[#6B7280]">Use our CSV template to ensure correct formatting</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4" />
              Download CSV Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      {!result && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-[#0EA5E9] bg-[#E0F2FE]"
                  : file
                  ? "border-[#10B981] bg-[#D1FAE5]"
                  : "border-[#D1D5DB] hover:border-[#0EA5E9]"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-[#10B981] mx-auto" />
                  <div>
                    <p className="font-medium text-[#1F2937]">{file.name}</p>
                    <p className="text-sm text-[#6B7280]">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={() => setFile(null)}>
                      Remove
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading} className="gap-2">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload & Import
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-[#D1D5DB] mx-auto" />
                  <div>
                    <p className="font-medium text-[#1F2937]">Drag and drop your CSV file here</p>
                    <p className="text-sm text-[#6B7280]">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button as="span" variant="outline" className="cursor-pointer">
                      Browse Files
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {/* Format Guidelines */}
            <div className="mt-6 p-4 bg-[#F9FAFB] rounded-lg">
              <p className="font-medium text-[#1F2937] mb-2">CSV Format Requirements:</p>
              <ul className="text-sm text-[#6B7280] space-y-1">
                <li>• First row should contain headers: Name, Email, Phone, Department, Year, Roll Number</li>
                <li>• Email addresses must be valid and unique</li>
                <li>• Year should be a number (e.g., 2024, 2025)</li>
                <li>• Maximum 500 students per import</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.failed === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
                )}
                Import Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#F3F4F6] rounded-lg">
                  <p className="text-2xl font-bold text-[#1F2937]">{result.total}</p>
                  <p className="text-sm text-[#6B7280]">Total Records</p>
                </div>
                <div className="text-center p-4 bg-[#D1FAE5] rounded-lg">
                  <p className="text-2xl font-bold text-[#10B981]">{result.success}</p>
                  <p className="text-sm text-[#6B7280]">Imported</p>
                </div>
                <div className="text-center p-4 bg-[#FEE2E2] rounded-lg">
                  <p className="text-2xl font-bold text-[#EF4444]">{result.failed}</p>
                  <p className="text-sm text-[#6B7280]">Failed</p>
                </div>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="mt-6">
                  <p className="font-medium text-[#1F2937] mb-3">Errors:</p>
                  <div className="space-y-2">
                    {result.errors.map((error, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-[#FEF2F2] rounded-lg text-sm"
                      >
                        <XCircle className="h-4 w-4 text-[#EF4444] flex-shrink-0" />
                        <span className="text-[#1F2937]">
                          <strong>Row {error.row}:</strong> {error.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                  }}
                >
                  Import More
                </Button>
                <Link href="/college/students">
                  <Button className="gap-2">
                    <Users className="h-4 w-4" />
                    View Students
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#6B7280]" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-[#6B7280]">
            <p>
              If you&apos;re having trouble with the import, here are some common solutions:
            </p>
            <ul className="space-y-2">
              <li>• Ensure your CSV file is saved with UTF-8 encoding</li>
              <li>• Check that all required fields (Name, Email) are filled</li>
              <li>• Remove any special characters from names</li>
              <li>• Verify email addresses are in the correct format</li>
            </ul>
            <p className="pt-2">
              For additional help, contact support at{" "}
              <a href="mailto:support@algonauts.in" className="text-[#0EA5E9] hover:underline">
                support@algonauts.in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
