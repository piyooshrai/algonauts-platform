/**
 * Health Check Endpoint
 * Phase 5: Production Readiness
 *
 * GET /api/health - Returns health status of the application
 */

import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: "up" | "down";
      latencyMs?: number;
      error?: string;
    };
    memory: {
      status: "ok" | "warning" | "critical";
      usedMB: number;
      totalMB: number;
      percentUsed: number;
    };
  };
  uptime: number;
}

export async function GET() {
  const startTime = Date.now();

  const result: HealthCheckResult = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    checks: {
      database: {
        status: "up",
      },
      memory: {
        status: "ok",
        usedMB: 0,
        totalMB: 0,
        percentUsed: 0,
      },
    },
    uptime: process.uptime(),
  };

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    result.checks.database.latencyMs = Date.now() - dbStart;
  } catch (error) {
    result.checks.database.status = "down";
    result.checks.database.error = String(error);
    result.status = "unhealthy";
  }

  // Check memory
  if (typeof process.memoryUsage === "function") {
    const memory = process.memoryUsage();
    const usedMB = Math.round(memory.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memory.heapTotal / 1024 / 1024);
    const percentUsed = Math.round((usedMB / totalMB) * 100);

    result.checks.memory = {
      status: percentUsed > 90 ? "critical" : percentUsed > 70 ? "warning" : "ok",
      usedMB,
      totalMB,
      percentUsed,
    };

    if (percentUsed > 90) {
      result.status = result.status === "unhealthy" ? "unhealthy" : "degraded";
    }
  }

  // Determine overall status
  if (result.checks.database.status === "down") {
    result.status = "unhealthy";
  } else if (result.checks.memory.status === "critical") {
    result.status = "degraded";
  }

  // Return appropriate status code
  const statusCode =
    result.status === "healthy" ? 200 : result.status === "degraded" ? 200 : 503;

  return NextResponse.json(result, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    },
  });
}

// HEAD request for simple availability check
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
