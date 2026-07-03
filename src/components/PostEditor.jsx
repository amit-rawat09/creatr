"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useConvexMutation } from "../../Hooks/useConvex";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import PostEditorHeader from "./PostEditorHeader";
import PostEditorContent from "./PostEditorContent";
import PostEditorSettings from "./PostEditorSettings";
import { toast } from "sonner";
import ImageUploadModal from "./ImageUploadModal";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(2000, "Title too long"),
  content: z.string().min(1, "Content is required"),
  category: z.string().optional(),
  tags: z.array(z.string().max(10, "Maximum 10 tags allowed.")),
  featuredImage: z.string().optional(),
  scheduledFor: z.string().optional(),
});

function PostEditor({ initialData = null, mode = "create" }) {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModelType, setImageModelType] = useState("featured");
  const [qillRef, setQillRef] = useState(null);

  const router = useRouter();

  const { mutate: createPost, isLoading: isCreateLoading } = useConvexMutation(
    api.posts.create,
  );

  const { mutate: updatePost, isLoading: isUpdating } = useConvexMutation(
    api.posts.update,
  );

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      category: initialData?.category || "",
      tags: initialData?.tags || [],
      featuredImage: initialData?.featuredImage || "",
      scheduledFor: initialData?.scheduledFor
        ? new Date(initialData.scheduledFor).toISOString().slice(0, 16)
        : "",
    },
  });

  const { handleSubmit, watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (!watchedValues.title && !watchedValues.content) {
      return;
    }

    const autoSave = setInterval(() => {
      if (watchedValues.title || watchedValues.content) {
        if (mode === "create") {
          handleSave(true);
        }
      }
    }, 30000);
    return () => clearInterval(autoSave);
  }, [watchedValues.title, watchedValues.content]);

  const onSubmit = async (data, action, silent = false) => {
    try {
      const postData = {
        title: data.title,
        content: data.content,
        category: data.category || undefined,
        tags: data.tags,
        featuredImage: data.featuredImage || undefined,
        status: action === "publish" ? "published" : "draft",
        scheduledFor: data.scheduledFor
          ? new Date(data.scheduledFor).getTime()
          : undefined,
      };

      let resultId;
      if (mode === "edit" && initialData?._id) {
        resultId = await updatePost({
          id: initialData._id,
          ...postData,
        });
      } else if (initialData?._id && action === "draft") {
        resultId = await updatePost({
          id: initialData._id,
          ...postData,
        });
      } else {
        resultId = await createPost(postData);
      }

      if (!silent) {
        const message =
          action === "publish" ? "Post Published!" : "Draft saved!";
        toast.success(message);

        if (action === "publish") {
          router.push("/dashboard/posts");
        }
      }
      
      return resultId;
    } catch (error) {
      if (!silent) {
        toast.error(error.message || "failed to save post");
        throw error;
      }
    }
  };

  const handleSave = (silent = false) => {
    handleSubmit((data) => onSubmit(data, "draft", silent))();
  };

  const handlePublish = () => {
    handleSubmit((data) => onSubmit(data, "publish"))();
  };

  const handleSchedule = () => {
    if (!watchedValues.scheduledFor) {
      toast.error("Please select a date and time to schedule");
      return;
    }

    handleSubmit((data) => onSubmit(data, "schedule"))();
  };

  const handleImageSelect = (imageData) => {
    if (imageModelType === "featured") {
      setValue("featuredImage", imageData.url);
      toast.success("Featured image added!");
    } else if (imageModelType === "content" && qillRef) {
      const quill = qillRef.getEditor();
      const range = quill.getSelection();

      const index = range ? range.index : quill.getLength();

      quill.insertEmbed(index, "image", imageData.url);
      quill.setSelection(index + 1);
      toast.success("Image inserted");
    }
    setIsImageModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* header */}
      <PostEditorHeader
        mode={mode}
        initialData={initialData}
        isPublishing={isCreateLoading || isUpdating}
        onSave={handleSave}
        onPublish={handlePublish}
        onSchedule={handleSchedule}
        onSettingsOpen={() => setIsSettingOpen(true)}
        onBack={() => router.push("/dashboard")}
      />

      {/* editor */}
      <PostEditorContent
        form={form}
        setQillRef={setQillRef}
        onImageUpload={(type) => {
          setImageModelType(type);
          setIsImageModalOpen(true);
        }}
      />

      {/* setting dialog */}
      <PostEditorSettings
        isOpen={isSettingOpen}
        onClose={() => setIsSettingOpen(false)}
        form={form}
        mode={mode}
      />

      {/* image upload dialog */}

      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSelect={handleImageSelect}
        title={
          imageModelType === "featured"
            ? "Upload Featured Image"
            : "Insert Image"
        }
      />
    </div>
  );
}

export default PostEditor;
