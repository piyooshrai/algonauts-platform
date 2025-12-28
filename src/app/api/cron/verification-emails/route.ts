/**
 * Cron Route: Verification Email Triggers
 *
 * This route should be called by a cron job (e.g., daily at 9 AM IST)
 * to send 30-day and 90-day verification reminder emails.
 *
 * Expected to be triggered by:
 * - Vercel Cron Jobs
 * - Railway Cron
 * - GitHub Actions
 * - External cron service
 */

import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sendVerificationRequestEmail } from "@/lib/email";
import { logEvent, EventTypes } from "@/lib/events";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://algonauts.in";
const CRON_SECRET = process.env.CRON_SECRET;

// Type for placement with user relation
interface PlacementWithUser {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  startDate: Date;
  verification30RequestedAt: Date | null;
  verification30CompletedAt: Date | null;
  verification90RequestedAt: Date | null;
  verification90CompletedAt: Date | null;
  user: {
    id: string;
    email: string | null;
    profile: {
      firstName: string | null;
      lastName: string | null;
      collegeName: string | null;
    } | null;
  };
}

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const results = {
    verification30: { sent: 0, errors: 0 },
    verification90: { sent: 0, errors: 0 },
  };

  try {
    const now = new Date();

    // Calculate date ranges
    // 30-day verification: 29-31 days after start (to catch placements that started around 30 days ago)
    const thirtyDaysAgoStart = new Date(now);
    thirtyDaysAgoStart.setDate(thirtyDaysAgoStart.getDate() - 31);

    const thirtyDaysAgoEnd = new Date(now);
    thirtyDaysAgoEnd.setDate(thirtyDaysAgoEnd.getDate() - 29);

    // 90-day verification: 89-91 days after start
    const ninetyDaysAgoStart = new Date(now);
    ninetyDaysAgoStart.setDate(ninetyDaysAgoStart.getDate() - 91);

    const ninetyDaysAgoEnd = new Date(now);
    ninetyDaysAgoEnd.setDate(ninetyDaysAgoEnd.getDate() - 89);

    // Find placements due for 30-day verification
    const placementsDue30 = await prisma.placement.findMany({
      where: {
        startDate: {
          gte: thirtyDaysAgoStart,
          lte: thirtyDaysAgoEnd,
        },
        verification30CompletedAt: null,
        verification30RequestedAt: null, // Only send once
        status: {
          in: ["CONFIRMED", "PENDING_CONFIRMATION"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                collegeName: true,
              },
            },
          },
        },
      },
    }) as unknown as PlacementWithUser[];

    // Find placements due for 90-day verification
    const placementsDue90 = await prisma.placement.findMany({
      where: {
        startDate: {
          gte: ninetyDaysAgoStart,
          lte: ninetyDaysAgoEnd,
        },
        verification30CompletedAt: { not: null }, // Must have completed 30-day first
        verification90CompletedAt: null,
        verification90RequestedAt: null, // Only send once
        status: {
          in: ["CONFIRMED", "VERIFICATION_30_COMPLETE"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                collegeName: true,
              },
            },
          },
        },
      },
    }) as unknown as PlacementWithUser[];

    // Send 30-day verification emails
    for (const placement of placementsDue30) {
      if (!placement.user.email) continue;

      const name = placement.user.profile?.firstName
        ? `${placement.user.profile.firstName} ${placement.user.profile.lastName || ""}`.trim()
        : "Student";

      const verifyUrl = `${APP_URL}/placements/${placement.id}/verify?type=30`;

      try {
        const result = await sendVerificationRequestEmail(
          placement.user.email,
          {
            name,
            companyName: placement.companyName,
            collegeName: placement.user.profile?.collegeName || undefined,
            verifyUrl,
          },
          "30"
        );

        if (result.success) {
          // Mark as requested
          await prisma.placement.update({
            where: { id: placement.id },
            data: { verification30RequestedAt: now },
          });

          await logEvent(EventTypes.VERIFICATION_EMAIL_SENT, {
            userId: placement.userId,
            userType: "STUDENT",
            entityType: "placement",
            entityId: placement.id,
            metadata: {
              type: "30_day",
              companyName: placement.companyName,
              email: placement.user.email,
            },
          });

          results.verification30.sent++;
        } else {
          results.verification30.errors++;
        }
      } catch {
        results.verification30.errors++;
      }
    }

    // Send 90-day verification emails
    for (const placement of placementsDue90) {
      if (!placement.user.email) continue;

      const name = placement.user.profile?.firstName
        ? `${placement.user.profile.firstName} ${placement.user.profile.lastName || ""}`.trim()
        : "Student";

      const verifyUrl = `${APP_URL}/placements/${placement.id}/verify?type=90`;

      try {
        const result = await sendVerificationRequestEmail(
          placement.user.email,
          {
            name,
            companyName: placement.companyName,
            collegeName: placement.user.profile?.collegeName || undefined,
            verifyUrl,
          },
          "90"
        );

        if (result.success) {
          // Mark as requested
          await prisma.placement.update({
            where: { id: placement.id },
            data: { verification90RequestedAt: now },
          });

          await logEvent(EventTypes.VERIFICATION_EMAIL_SENT, {
            userId: placement.userId,
            userType: "STUDENT",
            entityType: "placement",
            entityId: placement.id,
            metadata: {
              type: "90_day",
              companyName: placement.companyName,
              email: placement.user.email,
            },
          });

          results.verification90.sent++;
        } else {
          results.verification90.errors++;
        }
      } catch {
        results.verification90.errors++;
      }
    }

    // Log summary
    await logEvent(EventTypes.CRON_JOB_COMPLETED, {
      entityType: "cron",
      entityId: "verification-emails",
      metadata: {
        results,
        eligibleFor30Day: placementsDue30.length,
        eligibleFor90Day: placementsDue90.length,
      },
    });

    return NextResponse.json({
      success: true,
      results,
      summary: {
        eligibleFor30Day: placementsDue30.length,
        eligibleFor90Day: placementsDue90.length,
        totalSent: results.verification30.sent + results.verification90.sent,
        totalErrors: results.verification30.errors + results.verification90.errors,
      },
    });
  } catch (error) {
    console.error("[Cron] Verification emails error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        results,
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility with different cron services
export async function POST(request: Request) {
  return GET(request);
}
