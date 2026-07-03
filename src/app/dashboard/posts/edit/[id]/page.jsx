"use client";

import { useParams } from "next/navigation";
import React from "react";
import { useConvexQuery } from "../../../../../../Hooks/useConvex";
import { api } from "../../../../../../convex/_generated/api";
import { BarLoader } from "react-spinners";
import PostEditor from "@/components/PostEditor";

function EditPostPage() {
  const params = useParams();
  const postId = params.id;

  const {
    data: post,
    isLoading,
    error,
  } = useConvexQuery(api.posts.getById, { id: postId });

  if (isLoading) {
    return <BarLoader width={"100%"} color="#D8B4FE" />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Post Not Found</h1>
          <p className="text-slate-400">
            The post you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return <PostEditor initialData={post} mode="edit" />;
}

export default EditPostPage;
