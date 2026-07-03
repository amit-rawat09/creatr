"use client";

import React, { useEffect, useState } from "react";
import PublicHeader from "../_components/PublicHeader";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../../convex/_generated/api";
import {
  useConvexMutation,
  useConvexQuery,
} from "../../../../../Hooks/useConvex";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

function Page({ params }) {
  const { username, postId } = React.use(params);
  const { user: currentUser } = useUser();

  const { data: currentConvexUser } = useConvexQuery(
    api.user.getCurrentUser,
    currentUser ? {} : "skip",
  );

  const [commentContent, setCommentContent] = useState("");

  const {
    data: posts,
    isLoading: postLoading,
    error: postError,
  } = useConvexQuery(api.public.getPublishedPost, { username, postId });

  const { data: comments, isLoading: commentLoading } = useConvexQuery(
    api.comments.getPostComments,
    { postId },
  );

  const { data: hasLiked } = useConvexQuery(
    api.likes.hasUserLiked,
    currentUser ? { postId } : "skip",
  );

  const toggleLike = useConvexMutation(api.likes.toggleLike);
  const { mutate: addComment, isLoading: isSubmittingComment } =
    useConvexMutation(api.comments.addComment);
  const deleteComment = useConvexMutation(api.comments.deleteComment);
  const incrementView = useConvexMutation(api.public.incrementViewCount);

  useEffect(() => {
    if (posts && !postLoading) {
      incrementView.mutate({ postId });
    }
  }, [postLoading]);

  if (postLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (postError || !posts) {
    notFound();
  }

  const handleLikeToogle = async () => {
    if (!currentUser) {
      toast.error("Please signin to like the posts");
      return;
    }

    try {
      await toggleLike.mutate({ postId });
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await addComment({ postId, content: commentContent.trim() });
      setCommentContent("");
      toast.success("Comment Added!");
    } catch (error) {
      toast.error(error.message || "Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment.mutate({ commentId });
      toast.success("Comment deleted!");
    } catch (error) {
      toast.error(error.message || "Failed to delete comment");
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 text-white ">
      <PublicHeader link={`/${username}`} title={"Back to Profile"} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <article className="space-y-8">
          {posts.featuredImage && (
            <div className="relative w-full h-96 rounded-xl overflow-hidden">
              <Image
                src={posts.featuredImage}
                alt={posts.title}
                fill
                className="object-cover"
                sizes="(max-width : 768px) 100vw,896px"
                priority
              />
            </div>
          )}

          <div className="space-y-4">
            {" "}
            <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
              {posts.title}
            </h1>
            <div className="flex items-center justify-between">
              <Link href={`${username}`}>
                <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="relative w-12 h-12">
                    {posts.author.imageUrl ? (
                      <Image
                        src={posts.author.imageUrl}
                        alt={posts.author.name}
                        fill
                        className="rounded-full object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center text-lg font-bold">
                        {posts.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="">
                    <p className="font-semibold text-white">
                      {posts.author.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      @{posts.author.username}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="text-right text-sm text-slate-400">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(posts.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {posts.viewCount.toLocaleString()} views
                </div>
              </div>
            </div>
          </div>
          <div
            className="prose prose-lg max-w-none prose-invert prose-purple "
            dangerouslySetInnerHTML={{ __html: posts.content }}
          />

          <div className="flex items-center gap-6 pt-4 border-t border-slate-800">
            <Button
              onClick={handleLikeToogle}
              variant="ghost"
              className={`flex items-center gap-2 ${
                hasLiked
                  ? "text-red-400 hover:text-red-300"
                  : "text-slate-400 hover:text-white"
              }`}
              disabled={toggleLike.isLoading}
            >
              <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
              {posts.likeCount.toLocaleString()}
            </Button>

            <div className="flex items-center gap-2 text-slate-400">
              <MessageCircle className="h-5 w-5" />
              {comments?.length || 0} comments
            </div>
          </div>
        </article>

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-white">Comments</h2>
          {currentUser ? (
            <Card className={"card-glass"}>
              <CardContent className={"p-6"}>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <textarea
                    value={commentContent}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none w-full p-3 rounded-lg"
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {commentContent.length}/1000 characters
                    </p>
                    <Button
                      type="submit"
                      disabled={isSubmittingComment || !commentContent.trim()}
                      variant="primary"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Post Comment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className={"card-glass"}>
              <CardContent className={"p-6 text-center"}>
                <p className="text-slate-400 mb-4">
                  Sign in to join the conversation
                </p>
                <Link href={"/sign-in"}>
                  <Button variant="primary">Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {commentLoading ? (
            <BarLoader width={"100%"} color="#D8B4FE" />
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment._id} className={"card-glass"}>
                  <CardContent className={"p-6"}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {/* delete comment */}

                        {currentConvexUser &&
                          comment.author &&
                          (currentConvexUser._id == comment.authorId ||
                            currentConvexUser._id === posts.authorId) && (
                            <Button
                              onClick={() => handleDeleteComment(comment._id)}
                              variant="ghost"
                              size="sm"
                              className={"text-slate-400 hover:text-red-400"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}

                        <div className="relative w-8 h-8">
                          {comment.author?.imageUrl ? (
                            <Image
                              src={comment.author.imageUrl}
                              alt={comment.author.name}
                              fill
                              className="rounded-full object-cover"
                              sizes="32px"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                              {comment.author?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="">
                          <p className="font-medium text-white">
                            {comment.author?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className={"card-glass"}>
              <CardContent className={"text-center py-8"}>
                <MessageCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 ">No comment Yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  Be the first to share your thoughts!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Custom prose styles */}
      <style jsx global>{`
        .prose-invert h1 {
          color: white;
          font-weight: 700;
          font-size: 2.5rem;
          margin: 1.5rem 0;
        }
        .prose-invert h2 {
          color: white;
          font-weight: 600;
          font-size: 2rem;
          margin: 1.25rem 0;
        }
        .prose-invert h3 {
          color: white;
          font-weight: 600;
          font-size: 1.5rem;
          margin: 1rem 0;
        }
        .prose-invert p {
          color: rgb(203, 213, 225);
          line-height: 1.7;
          margin: 1rem 0;
        }
        .prose-invert blockquote {
          border-left: 4px solid rgb(147, 51, 234);
          color: rgb(203, 213, 225);
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
        }
        .prose-invert a {
          color: rgb(147, 51, 234);
        }
        .prose-invert a:hover {
          color: rgb(168, 85, 247);
        }
        .prose-invert code {
          background: rgb(51, 65, 85);
          color: rgb(248, 113, 113);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }
        .prose-invert pre {
          background: rgb(30, 41, 59);
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgb(71, 85, 105);
          overflow-x: auto;
        }
        .prose-invert ul,
        .prose-invert ol {
          color: rgb(203, 213, 225);
          padding-left: 1.5rem;
        }
        .prose-invert li {
          margin: 0.25rem 0;
        }
        .prose-invert img {
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .prose-invert strong {
          color: white;
        }
        .prose-invert em {
          color: rgb(203, 213, 225);
        }
        .prose-invert p,
        .prose-invert h1,
        .prose-invert h2,
        .prose-invert h3,
        .prose-invert li {
          white-space: normal !important;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .prose,
        .prose-invert {
          max-width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}

export default Page;
