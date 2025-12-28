"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  ChevronUp,
  MessageSquare,
  Eye,
  Plus,
  X,
  Loader2,
  Search,
  TrendingUp,
  Clock,
  Hash,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Card, Avatar, Button, Input, Textarea } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";

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

export default function LaunchpadPage() {
  const router = useRouter();
  const [sort, setSort] = useState<"newest" | "trending">("trending");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", body: "", tags: "" });

  const utils = api.useUtils();

  // Fetch posts
  const { data: postsData, isLoading: postsLoading } = api.posts.getFeed.useQuery({
    limit: 20,
    sort,
    tag: selectedTag || undefined,
  });

  // Fetch popular tags
  const { data: tagsData } = api.posts.getTags.useQuery();

  // Create post mutation
  const createPostMutation = api.posts.create.useMutation({
    onSuccess: (data) => {
      setShowCreateModal(false);
      setNewPost({ title: "", body: "", tags: "" });
      utils.posts.getFeed.invalidate();
      router.push(`/launchpad/${data.post.slug}`);
    },
  });

  // Toggle upvote mutation
  const toggleUpvoteMutation = api.posts.toggleUpvote.useMutation({
    onSuccess: () => {
      utils.posts.getFeed.invalidate();
    },
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return;

    const tags = newPost.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    createPostMutation.mutate({
      title: newPost.title,
      body: newPost.body,
      tags,
    });
  };

  const handleUpvote = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleUpvoteMutation.mutate({ postId });
  };

  const posts = postsData?.posts || [];
  const popularTags = tagsData?.tags || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <Rocket className="h-6 w-6 text-[#0EA5E9]" />
            Launchpad
          </h1>
          <p className="text-[#6B7280] mt-1">
            Share knowledge, tips, and experiences with fellow students
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sort === "trending" ? "default" : "secondary"}
            size="sm"
            onClick={() => setSort("trending")}
            className="flex items-center gap-1"
          >
            <TrendingUp className="h-4 w-4" />
            Trending
          </Button>
          <Button
            variant={sort === "newest" ? "default" : "secondary"}
            size="sm"
            onClick={() => setSort("newest")}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Newest
          </Button>
        </div>
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-[#6B7280] flex items-center gap-1">
            <Hash className="h-3.5 w-3.5" />
            Tags:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedTag === null
                ? "bg-[#0EA5E9] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {popularTags.map((tag) => (
            <button
              key={tag.value}
              onClick={() => setSelectedTag(tag.value === selectedTag ? null : tag.value)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTag === tag.value
                  ? "bg-[#0EA5E9] text-white"
                  : `${getTagColor(tag.value)} hover:opacity-80`
              }`}
            >
              {tag.label} ({tag.count})
            </button>
          ))}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0EA5E9]" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
              No posts yet
            </h3>
            <p className="text-[#6B7280] mb-4">
              Be the first to share your knowledge!
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create the first post
            </Button>
          </Card>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          posts.map((post: any, index: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/launchpad/${post.slug}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex gap-4">
                    {/* Upvote Section */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={(e) => handleUpvote(post.id, e)}
                        className={`p-2 rounded-lg transition-colors ${
                          post.hasUpvoted
                            ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        disabled={toggleUpvoteMutation.isPending}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </button>
                      <span
                        className={`text-sm font-semibold ${
                          post.hasUpvoted ? "text-[#0EA5E9]" : "text-[#6B7280]"
                        }`}
                      >
                        {post.upvoteCount}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1F2937] mb-1 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[#6B7280] line-clamp-2 mb-3">
                        {post.body.length > 200
                          ? post.body.substring(0, 200) + "..."
                          : post.body}
                      </p>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 4).map((tag: string) => (
                            <span
                              key={tag}
                              className={`px-2 py-0.5 text-xs rounded-full ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 4 && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
                              +{post.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                        <div className="flex items-center gap-2">
                          <Avatar
                            fallback={post.user.name || post.user.email || "U"}
                            size="sm"
                          />
                          <span>{post.user.name || post.user.email?.split("@")[0]}</span>
                        </div>
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post.commentCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {post.viewCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] max-w-2xl mx-auto bg-white rounded-xl shadow-xl z-50 max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#1F2937]">
                    Create Post
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-140px)]">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Title
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., How I prepared for Google interviews..."
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost((prev) => ({ ...prev, title: e.target.value }))
                    }
                    maxLength={100}
                  />
                  <p className="text-xs text-[#6B7280] mt-1">
                    {newPost.title.length}/100 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Content
                  </label>
                  <Textarea
                    placeholder="Share your knowledge, tips, or experience..."
                    value={newPost.body}
                    onChange={(e) =>
                      setNewPost((prev) => ({ ...prev, body: e.target.value }))
                    }
                    rows={8}
                    maxLength={10000}
                  />
                  <p className="text-xs text-[#6B7280] mt-1">
                    {newPost.body.length}/10000 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Tags
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., interview, resume, tips (comma-separated)"
                    value={newPost.tags}
                    onChange={(e) =>
                      setNewPost((prev) => ({ ...prev, tags: e.target.value }))
                    }
                  />
                  <p className="text-xs text-[#6B7280] mt-1">
                    Add up to 5 tags, separated by commas
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-[#E5E7EB] flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={
                    !newPost.title.trim() ||
                    !newPost.body.trim() ||
                    createPostMutation.isPending
                  }
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Post"
                  )}
                </Button>
              </div>
              {createPostMutation.isError && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-red-500">
                    {createPostMutation.error?.message || "Failed to create post"}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
