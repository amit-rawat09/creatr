"use client";

import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import { useConvexMutation, useConvexQuery } from "../../../../Hooks/useConvex";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Loader,
  Loader2,
  Sparkle,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BarLoader } from "react-spinners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PostCard from "@/components/PostCard";

function FeedPage() {
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab] = useState("feed");
  const toggleFollow = useConvexMutation(api.follows.toggleFollow);

  const { ref: loadMoreRef } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const { data: feedData, isLoading: feedLoading } = useConvexQuery(
    api.feed.getFeed,
    { limit: 15 },
  );

  const { data: suggestedUser, isLoading: suggestionsLoading } = useConvexQuery(
    api.feed.getSuggestedUsers,
    { limit: 6 },
  );

  const { data: trendingPosts, isLoading: trendingLoading } = useConvexQuery(
    api.feed.getTrendingPosts,
    { limit: 15 },
  );

  const handlefollowToggle = async (userId) => {
    if (!currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }

    try {
      await toggleFollow.mutate({ followingId: userId });
    } catch (err) {
      toast.error(err.message || "Failed to follow user");
    }
  };

  const getCurrentPosts = () => {
    switch (activeTab) {
      case "trending":
        return trendingPosts || [];
      default:
        return feedData?.posts || [];
    }
  };

  const isLoading =
    feedLoading || (activeTab === "trending" && trendingLoading);

  const currentPosts = getCurrentPosts();

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-32 pb-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold gradient-text-primary pb-2">
            Discover Amazing Content
          </h1>
          <p className="text-slate-400">
            Stay up to date with the latest posts from creators you follow
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Left Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex gap-3">
              <Button
                onClick={() => setActiveTab("feed")}
                variant={activeTab === "feed" ? "primary" : "ghost"}
              >
                For You
              </Button>

              <Button
                onClick={() => setActiveTab("trending")}
                variant={activeTab === "trending" ? "primary" : "ghost"}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </Button>
            </div>

            {currentUser && (
              <Link
                href="/dashboard/create"
                className="flex items-center space-x-3 cursor-pointer bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
              >
                <div className="relative w-10 h-10 shrink-0">
                  {currentUser.imageUrl ? (
                    <Image
                      src={currentUser.imageUrl}
                      alt={currentUser.firstName || "User"}
                      fill
                      className="rounded-full object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                      {(currentUser.firstName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="bg-slate-900 border border-slate-600 rounded-full px-4 py-3 text-slate-400 hover:border-slate-500 transition-colors">
                    What's on your mind? Share your thoughts...
                  </div>
                </div>
              </Link>
            )}

            {isLoading ? (
              <BarLoader width={"100%"} color="#D8B4FE" />
            ) : currentPosts.length === 0 ? (
              <Card className={"card-glass"}>
                <CardContent className={"text-center py-12"}>
                  <div className="text-6xl">📄</div>
                  <div className="">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {activeTab === "trending"
                        ? "No trending posts right now"
                        : "No posts to show"}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {activeTab === "trending"
                        ? "Check back later for trending content"
                        : "Follow some creators to see their post here"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-6">
                  {currentPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      showActions={false}
                      showAuthor={true}
                      className="max-w-none"
                    />
                  ))}
                </div>

                {activeTab === "feed" && feedData?.hasMore && (
                  <div className="flex justify-center py-8" ref={loadMoreRef}>
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                  </div>
                )}
              </>
            )}

            {/* Render your posts here */}
          </div>

          <div className="lg:col-span-2 space-y-6 mt-14">
            <Card className={"card-glass"}>
              <CardHeader>
                <CardTitle className={"text-white flex items-center"}>
                  <Sparkle className="h-5 w-5 mr-2" />
                  Suggested Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suggestionsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                  </div>
                ) : !suggestedUser || suggestedUser.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-slate-400 text-sm">
                      No suggestions available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suggestedUser.map((user) => (
                      <div className="space-y-2" key={user._id}>
                        <div className="flex items-center justify-between">
                          <Link href={`/${user.username}`}>
                            <div className="flex items-center space-x-3 cursor-pointer">
                              <div className="relative w-10 h-10">
                                {user.imageUrl ? (
                                  <Image
                                    src={user.imageUrl}
                                    alt={user.name}
                                    fill
                                    className="rounded-full object-cover"
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          </Link>

                          <Button
                            onClick={() => handlefollowToggle(user._id)}
                            variant="outline"
                            size="sm"
                            className={
                              "border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                            }
                          >
                            <UserPlus className="h-3 w-3 mr-1" /> Follow
                          </Button>
                        </div>

                        <div className="text-xs text-slate-500 pl-12">
                          {user.followerCount} followers . {user.postCount}
                          {"  "}posts
                        </div>
                        {user.recentPosts && user.recentPosts.length > 0 && (
                          <div className="text-xs text-slate-400 pl-12">
                            Latest: "{user.recentPosts[0].title.substring(0, 30)}
                            ...."
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>{" "}
      </div>
    </div>
  );
}

export default FeedPage;
