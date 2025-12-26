/**
 * tRPC Client Setup
 * Client-side tRPC hooks for React components
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/api/root";

/**
 * tRPC React hooks
 * Usage: api.auth.signup.useMutation(), api.profile.get.useQuery(), etc.
 */
export const api = createTRPCReact<AppRouter>();
