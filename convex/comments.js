import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.user.getCurrentUser);

    const post = await ctx.db.get(args.postId);

    if (!post || post.status !== "published") {
      throw new Error("Post not found or not published");
    }

    if (!args.content.trim() || args.content.length > 1000) {
      throw new Error("comment must be between 1-1000 characters");
    }

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: user._id,
      authorName: user.name,
      authorEmail: user.email,
      content: args.content.trim(),
      status: "approved",
      createdAt: Date.now(),
    });

    return commentId;
  },
});

export const getPostComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .filter((q) =>
        q.and(
          q.eq(q.field("postId"), args.postId),
          q.eq(q.field("status"), "approved"),
        ),
      )
      .order("asc")
      .collect();

    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          author: user
            ? {
                _id: user._id,
                name: user.name,
                username: user.username,
                imageUrl: user.imageUrl,
              }
            : null,
        };
      }),
    );

    return commentsWithUsers.filter((comment) => comment.author !== null);
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.user.getCurrentUser);
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    const post = await ctx.db.get(comment.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const canDelete =
      comment.authorId === user._id || post.authorId === user._id;

    if (!canDelete) {
      throw new Error("Not authorized to delete this comment");
    }

    await ctx.db.delete(args.commentId);
    return { success: true };
  },
});
