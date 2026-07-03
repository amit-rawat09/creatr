"use client";
import React from "react";
import { BarLoader } from "react-spinners";
import { useConvexQuery } from "../../../Hooks/useConvex";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  PlusCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DailyViewsChart from "@/components/DailyViewsChart";

const Dashboard = () => {
  const { data: analytics, isLoading: analyticsLoading } = useConvexQuery(
    api.dashboard.getAnalytics,
  );

  const { data: recentPosts, isLoading: postsLoading } = useConvexQuery(
    api.dashboard.getPostsWithAnalytics,
    { limit: 5 },
  );

  const { data: recentActivity, isLoading: activityLoading } = useConvexQuery(
    api.dashboard.getRecentActivity,
    { limit: 8 },
  );
  const { data: dailyViewsData, isLoading: chartLoading } = useConvexQuery(
    api.dashboard.getDailyViews,
  );

  if (analyticsLoading) {
    return <BarLoader width={"100%"} color="#D8B4FE" />;
  }

  const stats = analytics || {
    totalViews: 0,
    totalLikes: 0,
    totalComment: 0,
    totalFollowers: 0,
    viewsGrowth: 0,
    likesGrowth: 0,
    commentsGrowth: 0,
    followersGrowth: 0,
  };

  function formatTime(date) {
    const now = new Date();
    const targetDate = new Date(date);

    const diffInSeconds = Math.floor(
      (now.getTime() - targetDate.getTime()) / 1000,
    );

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec${diffInSeconds !== 1 ? "s" : ""} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
  }
  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text-primary">
            Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Welcome back! Here's what's happening with your content.
          </p>
        </div>

        <Link href="/dashboard/create">
          <Button variant={"primary"}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Views
            </CardTitle>

            <Eye className="h-4 w-4 text-blue-400" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalViews.toLocaleString()}
            </div>

            {stats.viewsGrowth > 0 && (
              <div className="flex items-center text-xs text-green-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />+{stats.viewsGrowth}%
                from last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Likes
            </CardTitle>

            <Heart className="h-4 w-4 text-red-400" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalLikes.toLocaleString()}
            </div>

            {stats.likesGrowth > 0 && (
              <div className="flex items-center text-xs text-green-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />+{stats.likesGrowth}%
                from last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Comments
            </CardTitle>

            <MessageCircle className="h-4 w-4 text-yellow-400" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalComment.toLocaleString()}
            </div>

            {stats.commentsGrowth > 0 && (
              <div className="flex items-center text-xs text-green-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />+{stats.commentsGrowth}%
                from last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Followers
            </CardTitle>

            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalFollowers.toLocaleString()}
            </div>

            {stats.followersGrowth > 0 && (
              <div className="flex items-center text-xs text-green-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />+{stats.followersGrowth}%
                from last month
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className={"card-glass"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recent Posts</CardTitle>

                <Link href="/dashboard/posts">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <BarLoader width={"100%"} color="#D8B4FE" />
              ) : !recentPosts || recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No posts yet</p>

                  <Link href="/dashboard/create">
                    <Button variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div
                      key={post._id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-700/30 cursor-pointer rounded-lg transition-colors"
                      onClick={() =>
                        window.open(
                          `/dashboard/posts/edit/${post._id}`,
                          "_self",
                        )
                      }
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-white truncate">
                          {post.title || "Untitled Post"}
                        </h3>

                        <div className="flex items-center gap-4 mt-2">
                          <Badge
                            variant={
                              post.status === "published"
                                ? "default"
                                : post.status === "scheduled"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              post.status === "published"
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : post.status === "scheduled"
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                  : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                            }
                          >
                            {post.status}
                          </Badge>

                          <span className="text-sm text-slate-400">
                            {post.status === "published" && post.publishedAt
                              ? `Published ${formatTime(post.publishedAt)}`
                              : post.status === "draft"
                                ? `Updated ${formatTime(post.updatedAt)}`
                                : post.scheduledFor
                                  ? `Scheduled for ${new Date(
                                      post.scheduledFor,
                                    ).toLocaleDateString()}`
                                  : `Updated ${formatTime(post.updatedAt)}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.viewCount || 0}
                        </div>

                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likeCount || 0}
                        </div>

                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.commentCount || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics Overview
              </CardTitle>
              <CardDescription>Views over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <DailyViewsChart data={dailyViewsData} isLoading={chartLoading} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={"card-glass"}>
            <CardHeader>
              <CardTitle className={"text-white"}>Recent Activity</CardTitle>
              <CardDescription>
                Latest interactions with your content
              </CardDescription>
            </CardHeader>

            <CardContent>
              {activityLoading ? (
                <BarLoader width={"100%"} color="#D8B4FE" />
              ) : !recentActivity || recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                          activity.type === "like"
                            ? "bg-red-500/20 text-red-300"
                            : activity.type === "comment"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-green-500/20 text-green-300"
                        }`}
                      >
                        {activity.type === "like" && (
                          <Heart className="h-3 w-3" />
                        )}

                        {activity.type === "comment" && (
                          <MessageCircle className="h-3 w-3" />
                        )}

                        {activity.type === "follow" && (
                          <Users className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.user}</span>

                          {activity.type === "like" &&
                            ` liked your post "${activity.post}"`}

                          {activity.type === "comment" &&
                            ` commented on "${activity.post}"`}

                          {activity.type === "follow" &&
                            " started following you"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {formatTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className={"card-glass"}>
            <CardHeader>
              <CardTitle className={"text-white"}>Quick Actions</CardTitle>
              <Link href="/dashboard/create">
                <Button
                  variant="ghost"
                  className={
                    "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                  }
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Post
                </Button>
              </Link>

              <Link href="/dashboard/posts">
                <Button
                  variant="ghost"
                  className={
                    "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                  }
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Posts
                </Button>
              </Link>

              <Link href="/dashboard/followers">
                <Button
                  variant="ghost"
                  className={
                    "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                  }
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  View Followers
                </Button>
              </Link>
            </CardHeader>
          </Card>
        </div>

        {/* Activity Feed */}
        
      </div>
    </div>
  );
};

export default Dashboard;
