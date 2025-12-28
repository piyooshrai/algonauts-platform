/**
 * Posts Router - Launchpad Knowledge Sharing
 *
 * Features:
 * - Create/read/delete posts
 * - Upvote/unvote posts
 * - Comments (1 level deep threading)
 * - Feed with sorting and filtering
 *
 * Gamification:
 * - +10 XP for creating a post
 * - +2 XP for receiving an upvote
 * - +5 XP for commenting
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  studentProcedure,
} from "../trpc/trpc";
import { queueEvent, EventTypes } from "@/lib/events";

// ============================================================================
// SCHEMAS
// ============================================================================

const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(5000),
  tags: z.array(z.string()).min(1).max(3),
});

const feedSchema = z.object({
  sort: z.enum(["trending", "newest", "top"]).default("trending"),
  tag: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

const createCommentSchema = z.object({
  postId: z.string(),
  body: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

// ============================================================================
// HELPERS
// ============================================================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

// ============================================================================
// ROUTER
// ============================================================================

export const postsRouter = createTRPCRouter({
  /**
   * Get feed of posts
   */
  getFeed: protectedProcedure
    .input(feedSchema.optional())
    .query(async ({ ctx, input }) => {
      const sort = input?.sort || "trending";
      const limit = input?.limit || 20;
      const cursor = input?.cursor;
      const tag = input?.tag;

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = { isPublished: true };
      if (tag) {
        where.tags = { has: tag };
      }

      // Build order by
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let orderBy: any = { createdAt: "desc" };
      if (sort === "top") {
        orderBy = { upvoteCount: "desc" };
      } else if (sort === "trending") {
        // Trending = recent + upvotes (simplified)
        orderBy = [{ upvoteCount: "desc" }, { createdAt: "desc" }];
      }

      const posts = await ctx.prisma.post.findMany({
        where,
        orderBy,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          title: true,
          slug: true,
          body: true,
          tags: true,
          upvoteCount: true,
          commentCount: true,
          viewCount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  collegeName: true,
                  totalXp: true,
                },
              },
            },
          },
          upvotes: {
            where: { userId: ctx.session.user.id },
            select: { id: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      // Log feed view (non-blocking)
      queueEvent(EventTypes.LAUNCHPAD_FEED_VIEWED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "launchpad",
        metadata: {
          sort,
          tag,
          count: posts.length,
        },
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        posts: posts.map((post: any) => ({
          ...post,
          preview: post.body.substring(0, 200) + (post.body.length > 200 ? "..." : ""),
          hasUpvoted: post.upvotes.length > 0,
          author: {
            id: post.user.id,
            name: post.user.profile?.displayName ||
              `${post.user.profile?.firstName || ""} ${post.user.profile?.lastName || ""}`.trim() ||
              "Anonymous",
            avatarUrl: post.user.profile?.avatarUrl,
            collegeName: post.user.profile?.collegeName,
            xp: post.user.profile?.totalXp || 0,
          },
        })),
        nextCursor,
      };
    }),

  /**
   * Get single post by ID or slug
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().optional(), slug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!input.id && !input.slug) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "ID or slug required" });
      }

      const post = await ctx.prisma.post.findFirst({
        where: input.id ? { id: input.id } : { slug: input.slug },
        select: {
          id: true,
          title: true,
          slug: true,
          body: true,
          tags: true,
          upvoteCount: true,
          commentCount: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  collegeName: true,
                  totalXp: true,
                  layersRankOverall: true,
                },
              },
              badges: {
                take: 4,
                orderBy: { earnedAt: "desc" },
                select: {
                  badge: {
                    select: {
                      name: true,
                      icon: true,
                    },
                  },
                },
              },
            },
          },
          upvotes: {
            where: { userId: ctx.session.user.id },
            select: { id: true },
          },
          comments: {
            where: { parentId: null },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              body: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      displayName: true,
                      firstName: true,
                      lastName: true,
                      avatarUrl: true,
                      collegeName: true,
                    },
                  },
                },
              },
              replies: {
                orderBy: { createdAt: "asc" },
                select: {
                  id: true,
                  body: true,
                  createdAt: true,
                  user: {
                    select: {
                      id: true,
                      profile: {
                        select: {
                          displayName: true,
                          firstName: true,
                          lastName: true,
                          avatarUrl: true,
                          collegeName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // Increment view count
      await ctx.prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });

      // Log view (non-blocking)
      queueEvent(EventTypes.POST_VIEWED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "post",
        entityId: post.id,
        metadata: {
          postId: post.id,
          authorId: post.userId,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatComment = (comment: any) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        author: {
          id: comment.user.id,
          name: comment.user.profile?.displayName ||
            `${comment.user.profile?.firstName || ""} ${comment.user.profile?.lastName || ""}`.trim() ||
            "Anonymous",
          avatarUrl: comment.user.profile?.avatarUrl,
          collegeName: comment.user.profile?.collegeName,
        },
        replies: comment.replies?.map(formatComment) || [],
      });

      return {
        ...post,
        hasUpvoted: post.upvotes.length > 0,
        isAuthor: post.userId === ctx.session.user.id,
        author: {
          id: post.user.id,
          name: post.user.profile?.displayName ||
            `${post.user.profile?.firstName || ""} ${post.user.profile?.lastName || ""}`.trim() ||
            "Anonymous",
          avatarUrl: post.user.profile?.avatarUrl,
          collegeName: post.user.profile?.collegeName,
          xp: post.user.profile?.totalXp || 0,
          rank: post.user.profile?.layersRankOverall,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          badges: post.user.badges.map((b: any) => ({
            name: b.badge.name,
            icon: b.badge.icon,
          })),
        },
        comments: post.comments.map(formatComment),
      };
    }),

  /**
   * Create a new post
   */
  create: studentProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Generate unique slug
      let slug = generateSlug(input.title);
      const existing = await ctx.prisma.post.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const post = await ctx.prisma.post.create({
        data: {
          userId,
          title: input.title,
          slug,
          body: input.body,
          tags: input.tags,
        },
      });

      // Award XP for creating post
      await ctx.prisma.profile.update({
        where: { userId },
        data: { totalXp: { increment: 10 } },
      });

      // Log event
      queueEvent(EventTypes.POST_CREATED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "post",
        entityId: post.id,
        metadata: {
          postId: post.id,
          title: input.title,
          tags: input.tags,
          xpAwarded: 10,
        },
      });

      return { post, xpAwarded: 10 };
    }),

  /**
   * Delete a post (author only)
   */
  delete: studentProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await ctx.prisma.post.delete({ where: { id: input.postId } });

      // Log event
      queueEvent(EventTypes.POST_DELETED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "post",
        entityId: input.postId,
      });

      return { success: true };
    }),

  /**
   * Toggle upvote on a post
   */
  toggleUpvote: studentProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if already upvoted
      const existingUpvote = await ctx.prisma.postUpvote.findUnique({
        where: { postId_userId: { postId: input.postId, userId } },
      });

      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        select: { userId: true },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (existingUpvote) {
        // Remove upvote
        await ctx.prisma.$transaction([
          ctx.prisma.postUpvote.delete({
            where: { id: existingUpvote.id },
          }),
          ctx.prisma.post.update({
            where: { id: input.postId },
            data: { upvoteCount: { decrement: 1 } },
          }),
        ]);

        queueEvent(EventTypes.POST_UNVOTED, {
          userId,
          userType: ctx.session.user.userType,
          entityType: "post",
          entityId: input.postId,
        });

        return { upvoted: false };
      } else {
        // Add upvote
        await ctx.prisma.$transaction([
          ctx.prisma.postUpvote.create({
            data: { postId: input.postId, userId },
          }),
          ctx.prisma.post.update({
            where: { id: input.postId },
            data: { upvoteCount: { increment: 1 } },
          }),
          // Award XP to post author (not self-upvotes)
          ...(post.userId !== userId
            ? [
                ctx.prisma.profile.update({
                  where: { userId: post.userId },
                  data: { totalXp: { increment: 2 } },
                }),
              ]
            : []),
        ]);

        queueEvent(EventTypes.POST_UPVOTED, {
          userId,
          userType: ctx.session.user.userType,
          entityType: "post",
          entityId: input.postId,
          metadata: {
            postAuthorId: post.userId,
            xpAwarded: post.userId !== userId ? 2 : 0,
          },
        });

        return { upvoted: true };
      }
    }),

  /**
   * Create a comment
   */
  createComment: studentProcedure
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify post exists
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // If parentId provided, verify it exists and is a top-level comment
      if (input.parentId) {
        const parent = await ctx.prisma.comment.findUnique({
          where: { id: input.parentId },
        });
        if (!parent || parent.parentId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only reply to top-level comments",
          });
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comment = await ctx.prisma.$transaction(async (tx: any) => {
        const newComment = await tx.comment.create({
          data: {
            postId: input.postId,
            userId,
            parentId: input.parentId,
            body: input.body,
          },
        });

        // Increment comment count
        await tx.post.update({
          where: { id: input.postId },
          data: { commentCount: { increment: 1 } },
        });

        // Award XP for commenting
        await tx.profile.update({
          where: { userId },
          data: { totalXp: { increment: 5 } },
        });

        return newComment;
      });

      queueEvent(EventTypes.COMMENT_CREATED, {
        userId,
        userType: ctx.session.user.userType,
        entityType: "comment",
        entityId: comment.id,
        metadata: {
          postId: input.postId,
          parentId: input.parentId,
          xpAwarded: 5,
        },
      });

      return { comment, xpAwarded: 5 };
    }),

  /**
   * Delete a comment (author only)
   */
  deleteComment: studentProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: input.commentId },
        select: { userId: true, postId: true },
      });

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }

      if (comment.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await ctx.prisma.$transaction([
        ctx.prisma.comment.delete({ where: { id: input.commentId } }),
        ctx.prisma.post.update({
          where: { id: comment.postId },
          data: { commentCount: { decrement: 1 } },
        }),
      ]);

      queueEvent(EventTypes.COMMENT_DELETED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "comment",
        entityId: input.commentId,
      });

      return { success: true };
    }),

  /**
   * Share a post (log event)
   */
  share: studentProcedure
    .input(z.object({
      postId: z.string(),
      platform: z.enum(["whatsapp", "linkedin", "twitter", "copy"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        select: { slug: true, title: true },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      const shareUrl = `https://algonauts.in/launchpad/${post.slug}`;

      queueEvent(EventTypes.POST_SHARED, {
        userId: ctx.session.user.id,
        userType: ctx.session.user.userType,
        entityType: "post",
        entityId: input.postId,
        metadata: {
          platform: input.platform,
        },
      });

      const shareText = `Check out this post on Algonauts: "${post.title}"`;

      let shareLink = shareUrl;
      if (input.platform === "whatsapp") {
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
      } else if (input.platform === "linkedin") {
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      } else if (input.platform === "twitter") {
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      }

      return { shareUrl, shareLink };
    }),

  /**
   * Get available tags
   */
  getTags: protectedProcedure.query(async () => {
    return {
      tags: [
        { value: "interviews", label: "Interviews", count: 0 },
        { value: "dsa", label: "DSA", count: 0 },
        { value: "resume", label: "Resume", count: 0 },
        { value: "placements", label: "Placements", count: 0 },
        { value: "company-reviews", label: "Company Reviews", count: 0 },
        { value: "skills", label: "Skills", count: 0 },
        { value: "advice", label: "Advice", count: 0 },
      ],
    };
  }),

  /**
   * Get related posts
   */
  getRelated: protectedProcedure
    .input(z.object({ postId: z.string(), limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        select: { tags: true },
      });

      if (!post || post.tags.length === 0) {
        return { posts: [] };
      }

      const relatedPosts = await ctx.prisma.post.findMany({
        where: {
          id: { not: input.postId },
          isPublished: true,
          tags: { hasSome: post.tags },
        },
        orderBy: { upvoteCount: "desc" },
        take: input.limit,
        select: {
          id: true,
          title: true,
          slug: true,
          tags: true,
          upvoteCount: true,
          commentCount: true,
          createdAt: true,
          user: {
            select: {
              profile: {
                select: {
                  displayName: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        posts: relatedPosts.map((p: any) => ({
          ...p,
          author: {
            name: p.user.profile?.displayName ||
              `${p.user.profile?.firstName || ""} ${p.user.profile?.lastName || ""}`.trim() ||
              "Anonymous",
          },
        })),
      };
    }),
});
