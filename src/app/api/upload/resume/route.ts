/**
 * Resume Upload API Route
 * POST /api/upload/resume
 * Uploads resume to Supabase Storage and returns the public URL
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import {
  getSupabaseAdmin,
  STORAGE_BUCKETS,
  RESUME_ALLOWED_TYPES,
  RESUME_MAX_SIZE,
} from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!RESUME_ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and Word documents are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > RESUME_MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = getSupabaseAdmin();

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "pdf";
    const filename = `${userId}/${timestamp}.${extension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.RESUMES)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file. Please try again." },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.RESUMES)
      .getPublicUrl(data.path);

    const resumeUrl = urlData.publicUrl;

    // Update profile with resume URL
    await prisma.profile.update({
      where: { userId },
      data: { resumeUrl },
    });

    return NextResponse.json({
      success: true,
      url: resumeUrl,
      filename: file.name,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
