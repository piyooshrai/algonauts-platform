/**
 * College Router
 * Handles college admin operations - dashboard, students, analytics
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  collegeAdminProcedure,
  publicProcedure,
} from "../trpc/trpc";
import { logEvent, EventTypes } from "@/lib/events";
import bcrypt from "bcryptjs";

// ============================================================================
// HELPER: Get college ID for current user
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCollegeId(ctx: { prisma: any; session: { user: { id: string } } }) {
  const collegeAdmin = await ctx.prisma.collegeAdmin.findUnique({
    where: { userId: ctx.session.user.id },
    select: { collegeId: true },
  });

  if (!collegeAdmin?.collegeId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "College not found. Please complete onboarding first.",
    });
  }

  return collegeAdmin.collegeId;
}

// ============================================================================
// SCHEMAS
// ============================================================================

const getStudentsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z.number().optional(),
  status: z.enum(["all", "active", "inactive", "placed"]).default("all"),
  sortBy: z.enum(["name", "rank", "createdAt", "graduationYear"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const bulkImportSchema = z.object({
  students: z.array(
    z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      branch: z.string().optional(),
      graduationYear: z.number().optional(),
      phone: z.string().optional(),
    })
  ).min(1).max(500),
  sendInviteEmail: z.boolean().default(true),
});

// ============================================================================
// COLLEGE ROUTER
// ============================================================================

export const collegeRouter = createTRPCRouter({
  /**
   * Get college dashboard stats
   */
  getDashboardStats: collegeAdminProcedure.query(async ({ ctx }) => {
    const collegeId = await getCollegeId(ctx);

    // Get student counts
    const [totalStudents, activeStudents, placedStudents] = await Promise.all([
      ctx.prisma.profile.count({
        where: { collegeId },
      }),
      ctx.prisma.profile.count({
        where: {
          collegeId,
          user: { isActive: true },
        },
      }),
      ctx.prisma.placement.count({
        where: {
          user: { profile: { collegeId } },
          status: { in: ["CONFIRMED", "VERIFICATION_30_COMPLETE", "VERIFICATION_90_COMPLETE"] },
        },
      }),
    ]);

    // Get placement stats
    const placements = await ctx.prisma.placement.findMany({
      where: {
        user: { profile: { collegeId } },
        status: { in: ["CONFIRMED", "VERIFICATION_30_COMPLETE", "VERIFICATION_90_COMPLETE"] },
      },
      select: { salary: true },
    });

    const salaries = placements.map((p: { salary: number | null }) => p.salary).filter(Boolean) as number[];
    const averagePackage = salaries.length > 0
      ? salaries.reduce((a, b) => a + b, 0) / salaries.length / 100000
      : 0;
    const highestPackage = salaries.length > 0
      ? Math.max(...salaries) / 100000
      : 0;

    // Calculate placement rate
    const placementRate = totalStudents > 0
      ? Math.round((placedStudents / totalStudents) * 100)
      : 0;

    // Get top companies
    const topCompaniesRaw = await ctx.prisma.placement.groupBy({
      by: ["companyName"],
      where: {
        user: { profile: { collegeId } },
        status: { in: ["CONFIRMED", "VERIFICATION_30_COMPLETE", "VERIFICATION_90_COMPLETE"] },
      },
      _count: { companyName: true },
      orderBy: { _count: { companyName: "desc" } },
      take: 5,
    });

    const topCompanies = topCompaniesRaw.map((c: { companyName: string | null }) => c.companyName).filter(Boolean);

    // Get recent activity count (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentApplications = await ctx.prisma.application.count({
      where: {
        user: { profile: { collegeId } },
        createdAt: { gte: weekAgo },
      },
    });

    return {
      totalStudents,
      activeStudents,
      placedStudents,
      placementRate,
      averagePackage: Math.round(averagePackage * 10) / 10,
      highestPackage: Math.round(highestPackage * 10) / 10,
      topCompanies,
      recentApplications,
    };
  }),

  /**
   * Get students list for this college
   */
  getStudents: collegeAdminProcedure
    .input(getStudentsSchema)
    .query(async ({ ctx, input }) => {
      const collegeId = await getCollegeId(ctx);

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = { collegeId };

      if (input.search) {
        where.OR = [
          { firstName: { contains: input.search, mode: "insensitive" } },
          { lastName: { contains: input.search, mode: "insensitive" } },
          { user: { email: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      if (input.branch) {
        where.branch = input.branch;
      }

      if (input.graduationYear) {
        where.graduationYear = input.graduationYear;
      }

      if (input.status === "active") {
        where.user = { ...where.user, isActive: true };
      } else if (input.status === "inactive") {
        where.user = { ...where.user, isActive: false };
      } else if (input.status === "placed") {
        where.user = {
          ...where.user,
          placements: { some: { status: { in: ["CONFIRMED", "VERIFICATION_30_COMPLETE", "VERIFICATION_90_COMPLETE"] } } },
        };
      }

      // Build order by
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let orderBy: any = {};
      if (input.sortBy === "name") {
        orderBy = { firstName: input.sortOrder };
      } else if (input.sortBy === "rank") {
        orderBy = { layersRankOverall: input.sortOrder };
      } else if (input.sortBy === "graduationYear") {
        orderBy = { graduationYear: input.sortOrder };
      } else {
        orderBy = { createdAt: input.sortOrder };
      }

      const [students, total] = await Promise.all([
        ctx.prisma.profile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                isActive: true,
                lastLoginAt: true,
                placements: {
                  where: { status: { in: ["CONFIRMED", "VERIFICATION_30_COMPLETE", "VERIFICATION_90_COMPLETE"] } },
                  take: 1,
                },
              },
            },
          },
          orderBy,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.profile.count({ where }),
      ]);

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        students: students.map((s: any) => ({
          id: s.id,
          name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Unknown",
          email: s.user.email,
          branch: s.branch,
          graduationYear: s.graduationYear,
          rank: s.layersRankOverall,
          isActive: s.user.isActive,
          lastLoginAt: s.user.lastLoginAt,
          isPlaced: s.user.placements.length > 0,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Bulk import students
   */
  bulkImport: collegeAdminProcedure
    .input(bulkImportSchema)
    .mutation(async ({ ctx, input }) => {
      const collegeId = await getCollegeId(ctx);
      const userId = ctx.session.user.id;

      const results = {
        success: 0,
        failed: 0,
        errors: [] as { email: string; error: string }[],
      };

      // Get college name for profile
      const college = await ctx.prisma.college.findUnique({
        where: { id: collegeId },
        select: { name: true },
      });

      // Process each student
      for (const student of input.students) {
        try {
          // Check if user already exists
          const existingUser = await ctx.prisma.user.findUnique({
            where: { email: student.email },
          });

          if (existingUser) {
            results.errors.push({ email: student.email, error: "User already exists" });
            results.failed++;
            continue;
          }

          // Generate random password
          const tempPassword = Math.random().toString(36).slice(-8);
          const passwordHash = await bcrypt.hash(tempPassword, 12);

          // Create user and profile in transaction
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await ctx.prisma.$transaction(async (tx: any) => {
            const newUser = await tx.user.create({
              data: {
                email: student.email,
                passwordHash,
                userType: "STUDENT",
                phone: student.phone,
              },
            });

            await tx.profile.create({
              data: {
                userId: newUser.id,
                firstName: student.firstName,
                lastName: student.lastName,
                collegeId,
                collegeName: college?.name,
                branch: student.branch,
                graduationYear: student.graduationYear,
              },
            });
          });

          results.success++;

          // TODO: Send invite email with temp password if sendInviteEmail is true
          // This would use the email service

        } catch (error) {
          results.errors.push({
            email: student.email,
            error: error instanceof Error ? error.message : "Unknown error"
          });
          results.failed++;
        }
      }

      // Log bulk import event
      await logEvent(EventTypes.BULK_IMPORT_COMPLETE, {
        userId,
        userType: ctx.session.user.userType,
        metadata: {
          collegeId,
          totalAttempted: input.students.length,
          successCount: results.success,
          failedCount: results.failed,
        },
      });

      // Create bulk import record
      await ctx.prisma.bulkImport.create({
        data: {
          collegeId,
          fileName: `import_${new Date().toISOString()}`,
          totalRows: input.students.length,
          successCount: results.success,
          failedCount: results.failed,
          errors: results.errors,
          status: results.failed === 0 ? "completed" : "completed_with_errors",
          importedBy: userId,
        },
      });

      return results;
    }),

  /**
   * Get import history
   */
  getImportHistory: collegeAdminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const collegeId = await getCollegeId(ctx);

      const imports = await ctx.prisma.bulkImport.findMany({
        where: { collegeId },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return { imports };
    }),

  /**
   * Get analytics data
   */
  getAnalytics: collegeAdminProcedure.query(async ({ ctx }) => {
    const collegeId = await getCollegeId(ctx);

    // Get monthly placement trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const placements = await ctx.prisma.placement.findMany({
      where: {
        user: { profile: { collegeId } },
        confirmedAt: { gte: twelveMonthsAgo },
        status: { in: ["CONFIRMED", "VERIFICATION_30_COMPLETE", "VERIFICATION_90_COMPLETE"] },
      },
      select: {
        confirmedAt: true,
        salary: true,
        companyName: true,
        role: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, { count: number; totalSalary: number }> = {};
    placements.forEach((p: { confirmedAt: Date | null; salary: number | null }) => {
      if (p.confirmedAt) {
        const month = p.confirmedAt.toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { count: 0, totalSalary: 0 };
        }
        monthlyData[month].count++;
        if (p.salary) monthlyData[month].totalSalary += p.salary;
      }
    });

    const placementTrend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        placements: data.count,
        avgSalary: data.count > 0 ? Math.round(data.totalSalary / data.count / 100000 * 10) / 10 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Get branch-wise stats
    const branchStats = await ctx.prisma.profile.groupBy({
      by: ["branch"],
      where: { collegeId, branch: { not: null } },
      _count: { id: true },
    });

    // Get graduation year distribution
    const yearStats = await ctx.prisma.profile.groupBy({
      by: ["graduationYear"],
      where: { collegeId, graduationYear: { not: null } },
      _count: { id: true },
    });

    // Get company-wise placements
    const companyStats = await ctx.prisma.placement.groupBy({
      by: ["companyName"],
      where: {
        user: { profile: { collegeId } },
        status: { in: ["CONFIRMED", "VERIFICATION_30_COMPLETE", "VERIFICATION_90_COMPLETE"] },
      },
      _count: { companyName: true },
      _avg: { salary: true },
      orderBy: { _count: { companyName: "desc" } },
      take: 10,
    });

    // Get role distribution
    const roleStats = await ctx.prisma.placement.groupBy({
      by: ["role"],
      where: {
        user: { profile: { collegeId } },
        status: { in: ["CONFIRMED", "VERIFICATION_30_COMPLETE", "VERIFICATION_90_COMPLETE"] },
        role: { not: null },
      },
      _count: { role: true },
      orderBy: { _count: { role: "desc" } },
      take: 10,
    });

    return {
      placementTrend,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      branchStats: branchStats.map((b: any) => ({
        branch: b.branch || "Unknown",
        count: b._count.id,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yearStats: yearStats.map((y: any) => ({
        year: y.graduationYear || 0,
        count: y._count.id,
      })).sort((a: { year: number }, b: { year: number }) => a.year - b.year),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      companyStats: companyStats.map((c: any) => ({
        company: c.companyName || "Unknown",
        count: c._count.companyName,
        avgSalary: c._avg.salary ? Math.round(c._avg.salary / 100000 * 10) / 10 : 0,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roleStats: roleStats.map((r: any) => ({
        role: r.role || "Unknown",
        count: r._count.role,
      })),
    };
  }),

  /**
   * Get unique branches for filters
   */
  getBranches: collegeAdminProcedure.query(async ({ ctx }) => {
    const collegeId = await getCollegeId(ctx);

    const branches = await ctx.prisma.profile.findMany({
      where: { collegeId, branch: { not: null } },
      select: { branch: true },
      distinct: ["branch"],
    });

    return branches.map((b: { branch: string | null }) => b.branch).filter(Boolean) as string[];
  }),

  // ============================================================================
  // INVITE LINK SYSTEM
  // ============================================================================

  /**
   * Get college by slug (public - for invite link page)
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const college = await ctx.prisma.college.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          name: true,
          shortName: true,
          city: true,
          state: true,
          logoUrl: true,
          _count: {
            select: { profiles: true },
          },
        },
      });

      if (!college) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "College not found",
        });
      }

      return {
        id: college.id,
        name: college.name,
        shortName: college.shortName,
        city: college.city,
        state: college.state,
        logoUrl: college.logoUrl,
        studentCount: college._count.profiles,
      };
    }),

  /**
   * Record a visit to the invite link (public)
   */
  recordInviteVisit: publicProcedure
    .input(z.object({
      slug: z.string(),
      source: z.enum(["direct", "whatsapp", "copy"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const college = await ctx.prisma.college.findUnique({
        where: { slug: input.slug },
        select: { id: true },
      });

      if (!college) {
        return { success: false };
      }

      // Upsert invite stats
      await ctx.prisma.collegeInviteStats.upsert({
        where: { collegeId: college.id },
        create: {
          collegeId: college.id,
          totalVisits: 1,
          uniqueVisitors: 1,
          whatsappClicks: input.source === "whatsapp" ? 1 : 0,
          directCopies: input.source === "copy" ? 1 : 0,
        },
        update: {
          totalVisits: { increment: 1 },
          uniqueVisitors: { increment: 1 }, // Simplified - ideally track by IP/session
          whatsappClicks: input.source === "whatsapp" ? { increment: 1 } : undefined,
          directCopies: input.source === "copy" ? { increment: 1 } : undefined,
        },
      });

      return { success: true };
    }),

  /**
   * Record a signup from invite link (public)
   */
  recordInviteSignup: publicProcedure
    .input(z.object({ collegeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.collegeInviteStats.upsert({
        where: { collegeId: input.collegeId },
        create: {
          collegeId: input.collegeId,
          signups: 1,
        },
        update: {
          signups: { increment: 1 },
        },
      });

      return { success: true };
    }),

  /**
   * Get invite link stats for college admin
   */
  getInviteLinkStats: collegeAdminProcedure.query(async ({ ctx }) => {
    const collegeId = await getCollegeId(ctx);

    const college = await ctx.prisma.college.findUnique({
      where: { id: collegeId },
      select: {
        slug: true,
        name: true,
        inviteStats: true,
      },
    });

    if (!college?.slug) {
      return {
        slug: null,
        stats: null,
        message: "Invite link not generated yet. Update your college profile to generate one.",
      };
    }

    return {
      slug: college.slug,
      stats: college.inviteStats ? {
        totalVisits: college.inviteStats.totalVisits,
        uniqueVisitors: college.inviteStats.uniqueVisitors,
        signups: college.inviteStats.signups,
        conversionRate: college.inviteStats.totalVisits > 0
          ? Math.round((college.inviteStats.signups / college.inviteStats.totalVisits) * 100)
          : 0,
        whatsappClicks: college.inviteStats.whatsappClicks,
        directCopies: college.inviteStats.directCopies,
      } : {
        totalVisits: 0,
        uniqueVisitors: 0,
        signups: 0,
        conversionRate: 0,
        whatsappClicks: 0,
        directCopies: 0,
      },
    };
  }),
});
