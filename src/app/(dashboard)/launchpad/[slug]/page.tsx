"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronUp,
  MessageSquare,
  Eye,
  Share2,
  Clock,
  Loader2,
  Send,
  Trash2,
  Copy,
  Check,
  Rocket,
} from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Card, Avatar, Button, Textarea } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";

// Tag colors
const tagColors: Record<string, string> = {
  interview: "bg-purple-100 text-purple-700",
  resume: "bg-blue-100 text-blue-700",
  career: "bg-green-100 text-green-700",
  coding: "bg-orange-100 text-orange-700",
  tips: "bg-pink-100 text-pink-700",
  experience: "bg-yellow-100 text-yellow-700",
  default: "bg-gray-100 text-gray-700",
};

const getTagColor = (tag: string) => {
  const lowerTag = tag.toLowerCase();
  for (const [key, value] of Object.entries(tagColors)) {
    if (lowerTag.includes(key)) return value;
  }
  return tagColors.default;
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params?.slug as string;

  const [newComment, setNewComment] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const utils = api.useUtils();

  // Fetch post
  const { data: postData, isLoading, error } = api.posts.getById.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Fetch related posts (only after we have the post ID)
  const postId = postData?.post?.id;
  const { data: relatedData } = api.posts.getRelated.useQuery(
    { postId: postId!, limit: 3 },
    { enabled: !!postId }
  );

  // Mutations
  const toggleUpvoteMutation = api.posts.toggleUpvote.useMutation({
    onSuccess: () => {
      utils.posts.getById.invalidate({ slug });
    },
  });

  const createCommentMutation = api.posts.createComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.posts.getById.invalidate({ slug });
    },
  });

  const deletePostMutation = api.posts.delete.useMutation({
    onSuccess: () => {
      router.push("/launchpad");
    },
  });

  const shareMutation = api.posts.share.useMutation();

  const deleteCommentMutation = api.posts.deleteComment.useMutation({
    onSuccess: () => {
      utils.posts.getById.invalidate({ slug });
    },
  });

  const handleUpvote = () => {
    if (!postData?.post) return;
    toggleUpvoteMutation.mutate({ postId: postData.post.id });
  };

  const handleComment = () => {
    if (!newComment.trim() || !postData?.post) return;
    createCommentMutation.mutate({
      postId: postData.post.id,
      body: newComment,
    });
  };

  const handleDelete = () => {
    if (!postData?.post) return;
    deletePostMutation.mutate({ postId: postData.post.id });
  };

  const handleShare = async (platform: "copy" | "twitter" | "linkedin" | "whatsapp") => {
    if (!postData?.post) return;

    const url = window.location.href;
    const title = postData.post.title;

    if (platform === "copy") {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      let shareUrl = "";
      switch (platform) {
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
          break;
      }
      window.open(shareUrl, "_blank");
    }

    shareMutation.mutate({ postId: postData.post.id, platform });
    setShowShareMenu(false);
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate({ commentId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
      </div>
    );
  }

  if (error || !postData?.post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-[#1F2937] mb-2">Post not found</h2>
        <p className="text-[#6B7280] mb-4">This post may have been deleted or does not exist.</p>
        <Link href="/launchpad">
          <Button>Back to Launchpad</Button>
        </Link>
      </div>
    );
  }

  const post = postData.post;
  const comments = postData.comments || [];
  const relatedPosts = relatedData?.posts || [];
  const isAuthor = session?.user?.email === post.user.email;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/launchpad"
        className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Launchpad
      </Link>

      {/* Main Post */}
      <Card className="p-6">
        <div className="flex gap-6">
          {/* Upvote Section */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleUpvote}
              className={`p-3 rounded-lg transition-colors ${
                post.hasUpvoted
                  ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              disabled={toggleUpvoteMutation.isPending}
            >
              <ChevronUp className="h-6 w-6" />
            </button>
            <span
              className={`text-lg font-bold ${
                post.hasUpvoted ? "text-[#0EA5E9]" : "text-[#6B7280]"
              }`}
            >
              {post.upvoteCount}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-[#1F2937]">{post.title}</h1>
              <div className="flex items-center gap-2">
                {/* Share */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <AnimatePresence>
                    {showShareMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowShareMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5E7EB] z-50 py-1"
                        >
                          <button
                            onClick={() => handleShare("copy")}
                            className="w-full px-4 py-2 text-left text-sm text-[#374151] hover:bg-gray-50 flex items-center gap-2"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {copied ? "Copied!" : "Copy link"}
                          </button>
                          <button
                            onClick={() => handleShare("twitter")}
                            className="w-full px-4 py-2 text-left text-sm text-[#374151] hover:bg-gray-50"
                          >
                            Share on Twitter
                          </button>
                          <button
                            onClick={() => handleShare("linkedin")}
                            className="w-full px-4 py-2 text-left text-sm text-[#374151] hover:bg-gray-50"
                          >
                            Share on LinkedIn
                          </button>
                          <button
                            onClick={() => handleShare("whatsapp")}
                            className="w-full px-4 py-2 text-left text-sm text-[#374151] hover:bg-gray-50"
                          >
                            Share on WhatsApp
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Delete (author only) */}
                {isAuthor && (
                  <div className="relative">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/launchpad?tag=${tag}`}
                    className={`px-3 py-1 text-sm rounded-full ${getTagColor(tag)} hover:opacity-80 transition-opacity`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author and Meta */}
            <div className="flex items-center gap-4 mb-6 text-sm text-[#6B7280]">
              <div className="flex items-center gap-2">
                <Avatar
                  fallback={post.user.name || post.user.email || "U"}
                  size="sm"
                />
                <span className="font-medium text-[#374151]">
                  {post.user.name || post.user.email?.split("@")[0]}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount} views
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {post.commentCount} comments
              </div>
            </div>

            {/* Body */}
            <div className="prose prose-gray max-w-none">
              <p className="text-[#374151] whitespace-pre-wrap leading-relaxed">
                {post.body}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </h2>

        {/* Add Comment */}
        <div className="mb-6">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#6B7280]">
              {newComment.length}/2000 characters
            </span>
            <Button
              size="sm"
              onClick={handleComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
            >
              {createCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-[#6B7280] py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            comments.map((comment: any, index: number) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-[#E5E7EB] last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    fallback={comment.user.name || comment.user.email || "U"}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#374151]">
                          {comment.user.name || comment.user.email?.split("@")[0]}
                        </span>
                        <span className="text-xs text-[#6B7280]">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {session?.user?.email === comment.user.email && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-[#6B7280] hover:text-[#EF4444] transition-colors"
                          disabled={deleteCommentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[#374151] whitespace-pre-wrap">
                      {comment.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-[#0EA5E9]" />
            Related Posts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {relatedPosts.map((relatedPost: any) => (
              <Link key={relatedPost.id} href={`/launchpad/${relatedPost.slug}`}>
                <Card className="p-4 hover:shadow-md transition-shadow h-full">
                  <h3 className="font-medium text-[#1F2937] line-clamp-2 mb-2">
                    {relatedPost.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <ChevronUp className="h-3 w-3" />
                      {relatedPost.upvoteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {relatedPost.commentCount}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 max-w-md mx-auto bg-white rounded-xl shadow-xl z-50 p-6"
            >
              <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
                Delete Post?
              </h3>
              <p className="text-[#6B7280] mb-6">
                This action cannot be undone. All comments will also be deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deletePostMutation.isPending}
                >
                  {deletePostMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
