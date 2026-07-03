import { v } from "convex/values";
import { query } from "./_generated/server";

export const getFeed = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const allposts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc")
      .take(limit + 1);

    const hasMore = allposts.length > limit;
    const feedPost = hasMore ? allposts.slice(0, limit) : allposts;

    const postsWithAuthors = await Promise.all(
      feedPost.map(async (post) => {
        const author = await ctx.db.get(post.authorId);

        return {
          ...post,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                username: author.username,
                imageUrl: author.imageUrl,
              }
            : null,
        };
      }),
    );

    return {
      posts: postsWithAuthors.filter((post) => post.author !== null),
      hasMore,
    };
  },
});

export const getSuggestedUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const limit = args.limit || 10;

    let currentUser = null;
    let followedUserIds = [];

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), identity.subject))
        .first();

      if (currentUser) {
        const follows = await ctx.db
          .query("follows")
          .filter((q) => q.eq(q.field("followerId"), currentUser._id))
          .collect();

        followedUserIds = follows.map((follow) => follow.followingId);
      }
    }
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), currentUser?._id || ""))
      .collect();

    const suggestions = await Promise.all(
      allUsers
        .filter((user) => !followedUserIds.includes(user._id) && user.username)
        .map(async (user) => {
          const posts = await ctx.db
            .query("posts")
            .filter((q) =>
              q.and(
                q.eq(q.field("authorId"), user._id),
                q.eq(q.field("status"), "published"),
              ),
            )
            .order("desc")
            .take(5);

          const followers = await ctx.db
            .query("follows")
            .filter((q) => q.eq(q.field("followingId"), user._id))
            .collect();

          const totalViews = posts.reduce(
            (sum, post) => sum + post.viewCount,
            0,
          );

          const totalLikes = posts.reduce(
            (sum, post) => sum + post.likeCount,
            0,
          );

          const engagementScore =
            totalViews + totalLikes * 5 + followers.length * 10;

          return {
            _id: user._id,
            name: user.name,
            username: user.username,
            imageUrl: user.imageUrl,
            followerCount: followers.length,
            postCount: posts.length,
            engagementScore,
            lastPostsAt: posts.length > 0 ? posts[0].publishedAt : null,
            recentPosts: posts.slice(0, 2).map((post) => ({
              _id: post._id,
              title: post.title,
              viewCount: post.viewCount,
              likeCount: post.likeCount,
            })),
          };
        }),
    );

    const rankSuggestion = suggestions
      .filter((user) => user.postCount > 0)
      .sort((a, b) => {
        const aRecent = a.lastPostsAt > Date.now() - 7 * 24 * 60 * 60 * 1000;
        const bRecent = b.lastPostsAt > Date.now() - 7 * 24 * 60 * 60 * 1000;

        if (aRecent && !bRecent) {
          return 1;
        }

        if (!aRecent && bRecent) {
          return 1;
        }

        return b.engagementScore - a.engagementScore;
      })
      .slice(0, limit);
    return rankSuggestion;
  },
});

export const getTrendingPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recentPosts = await ctx.db
      .query("posts")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.gte(q.field("publishedAt"), weekAgo),
        ),
      )
      .collect();

    const trendingPost = recentPosts
      .map((post) => ({
        ...post,
        trendingScore: post.viewCount + post.likeCount * 3,
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    const postsWithAuthors = await Promise.all(
      trendingPost.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                username: author.username,
                imageUrl: author.imageUrl,
              }
            : null,
        };
      }),
    );

    return postsWithAuthors.filter((post) => post.author !== null);
  },
});
