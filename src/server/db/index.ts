/**
 * Database Client
 *
 * NOTE: This is a placeholder until Prisma can be properly configured.
 * When Prisma client is generated, replace this with the real implementation.
 *
 * To generate Prisma client:
 * 1. Set DATABASE_URL in .env
 * 2. Run: npx prisma generate
 * 3. Run: npx prisma db push (or migrate)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Type definitions for the mock client - using any for compatibility
type MockPrismaDelegate = {
  findUnique: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any>;
  findMany: (args: any) => Promise<any[]>;
  create: (args: any) => Promise<any>;
  createMany: (args: any) => Promise<{ count: number }>;
  update: (args: any) => Promise<any>;
  updateMany: (args: any) => Promise<{ count: number }>;
  delete: (args: any) => Promise<any>;
  deleteMany: (args: any) => Promise<{ count: number }>;
  count: (args?: any) => Promise<number>;
  aggregate: (args: any) => Promise<any>;
  groupBy: (args: any) => Promise<any[]>;
};

function createMockDelegate(): MockPrismaDelegate {
  const notImplemented = async (): Promise<never> => {
    console.warn("[Prisma Mock] Database not configured. Set DATABASE_URL and run prisma generate.");
    throw new Error("Database not configured. Please set DATABASE_URL in .env and run 'npx prisma generate'.");
  };

  return {
    findUnique: notImplemented,
    findFirst: notImplemented,
    findMany: async () => [],
    create: notImplemented,
    createMany: async () => ({ count: 0 }),
    update: notImplemented,
    updateMany: async () => ({ count: 0 }),
    delete: notImplemented,
    deleteMany: async () => ({ count: 0 }),
    count: async () => 0,
    aggregate: notImplemented,
    groupBy: async () => [],
  };
}

// Mock Prisma Client
class MockPrismaClient {
  user = createMockDelegate();
  account = createMockDelegate();
  session = createMockDelegate();
  verificationToken = createMockDelegate();
  profile = createMockDelegate();
  experience = createMockDelegate();
  education = createMockDelegate();
  certification = createMockDelegate();
  companyProfile = createMockDelegate();
  college = createMockDelegate();
  collegeAdmin = createMockDelegate();
  bulkImport = createMockDelegate();
  opportunity = createMockDelegate();
  application = createMockDelegate();
  invite = createMockDelegate();
  placement = createMockDelegate();
  assessment = createMockDelegate();
  question = createMockDelegate();
  assessmentAttempt = createMockDelegate();
  questionResponse = createMockDelegate();
  badge = createMockDelegate();
  userBadge = createMockDelegate();
  streak = createMockDelegate();
  levelHistory = createMockDelegate();
  leaderboard = createMockDelegate();
  notification = createMockDelegate();
  feedItem = createMockDelegate();
  referral = createMockDelegate();
  event = createMockDelegate();
  recommendation = createMockDelegate();
  featureSnapshot = createMockDelegate();

  $connect = async () => {
    console.warn("[Prisma Mock] $connect called but database not configured");
  };

  $disconnect = async () => {};

  $transaction = async <T>(fn: (prisma: any) => Promise<T>): Promise<T> => {
    return fn(this);
  };
}

// Check if we should use real Prisma or mock
let prismaInstance: any;

try {
  // Try to import real PrismaClient
  // This will fail if prisma generate hasn't been run
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");

  const globalForPrisma = globalThis as unknown as {
    prisma: InstanceType<typeof PrismaClient> | undefined;
  };

  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
} catch {
  // Fall back to mock client
  console.warn("[Prisma] Using mock client. Run 'npx prisma generate' to use real database.");
  prismaInstance = new MockPrismaClient();
}

export const prisma = prismaInstance;
export default prisma;

// Re-export types
export type { MockPrismaClient as PrismaClient };
