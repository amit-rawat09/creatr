"use client";
import { useUser } from "@clerk/nextjs";
import React, { use } from "react";
import { useConvexMutation, useConvexQuery } from "../../../../Hooks/useConvex";
import { api } from "../../../../convex/_generated/api";
import { notFound } from "next/navigation";
import PublicHeader from "./_components/PublicHeader";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import PostCard from "@/components/PostCard";

function UsernamePage({ params }) {
  const { username } = React.use(params);
  const { user: currentUser } = useUser();

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useConvexQuery(api.user.getByUsername, { username });

  const { data: postsData, isLoading: postsLoading } = useConvexQuery(
    api.public.getPublishedPostsByUsername,
    {
      username,
      limit: 20,
    },
  );

  const { data: followerCount } = useConvexQuery(
    api.follows.getFollowerCount,
    user ? { userId: user._id } : "skip",
  );

  const { data: isFollowing } = useConvexQuery(
    api.follows.isFollowing,
    currentUser && user ? { followingId: user._id } : "skip",
  );

  const toggleFollow = useConvexMutation(api.follows.toggleFollow);

  if (userLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-purple-500"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    notFound();
  }

  const posts = postsData?.posts || [];

  const isOwnProfile = currentUser?.publicMetadata?.username === user.username;
  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }

    try {
      await toggleFollow.mutate({ followingId: user._id });
    } catch (error) {
      toast.error(error.message || "Failed to update follow status");
    }
  };

  console.log({
    currentUser,
    currentUsername: currentUser?.publicMetadata?.username,
    profileUsername: user.username,
    isOwnProfile,
  });
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PublicHeader link="/" title="Back to Home" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          {/* image */}
          <div className="relative  w-24 h-24 mx-auto mb-6">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.name}
                fill
                className="rounded-full object-cover border-2 border-slate-700"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* username */}
          <h1 className="text-4xl font-bold mb-2 gradient-text-primary">
            {user.name}
          </h1>

          <p className="text-xl text-slate-400 mb-4">@{user.username}</p>

          {/* follow Button */}
          {!isOwnProfile && currentUser && (
            <Button
              onClick={handleFollowToggle}
              disabled={toggleFollow.isLoading}
              variant={isFollowing ? "outline" : "primary"}
              className={"mb-4"}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          )}

          <div className="flex items-center justify-center text-sm text-slate-500">
            <Calendar className="h-4 w-4 mr-2" />
            Joined{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{posts.length}</div>
            <div className="text-sm text-slate-400">Posts</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {followerCount || 0}
            </div>
            <div className="text-sm text-slate-400">Followers</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {posts
                .reduce((acc, post) => acc + post.viewCount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Views</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {posts
                .reduce((acc, post) => acc + post.likeCount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Likes</div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Recent Posts</h2>

          {posts.length === 0 ? (
            <Card className={"card-glass"}>
              <CardContent className={"text-center py-12"}>
                <p className="text-slate-400 text-lg">No post yet</p>
                <p className="text-slate-500 text-sm mt-2">
                  Check back for new content!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  showActions={false}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsernamePage;
