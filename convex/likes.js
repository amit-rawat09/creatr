import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post || post.status !== "published") {
      throw new Error("Post not found or not published");
    }

    const user = await ctx.runQuery(internal.user.getCurrentUser);
    let userId = user?._id;

    const existingLike = await ctx.db
      .query("likes")
      .filter((q) =>
        q.and(
          q.eq(q.field("postId"), args.postId),
          q.eq(q.field("userId"), userId),
        ),
      )
      .unique();

    if (existingLike) {
      await ctx.db.delete(existingLike._id);

      await ctx.db.patch(args.postId, {
        likeCount: Math.max(0, post.likeCount - 1),
      });

      return { liked: false, likeCount: Math.max(0, post.likeCount - 1) };
    } else {
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId: userId,
        createdAt: Date.now(),
      });

      await ctx.db.patch(args.postId, {
        likeCount: post.likeCount + 1,
      });

      return { liked: true, likeCount: post.likeCount + 1 };
    }
  },
});

export const hasUserLiked = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.user.getCurrentUser);
    const userId = user._id;

    const like = await ctx.db
      .query("likes")
      .filter((q) =>
        q.and(
          q.eq(q.field("postId"), args.postId),
          q.eq(q.field("userId"), userId),
        ),
      )
      .unique();

    return !!like;
  },
});
  