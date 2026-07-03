import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Watch, X } from "lucide-react";
import { Badge } from "./ui/badge";

const CATEGORIES = [
  "Technology",
  "Design",
  "Marketing",
  "Business",
  "Lifestyle",
  "Education",
  "Health",
  "travel",
  "Food",
  "Entertainment",
];
function PostEditorSettings({ isOpen, onClose, form, mode }) {
  const [tagInput, setTagInput] = useState("");
  const { watch, setValue } = form;
  const watchedValues = watch();

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (
      tag &&
      !watchedValues.tags.includes(tag) &&
      watchedValues.tags.length < 10
    ) {
      setValue("tags", [...watchedValues.tags, tag]);
      setTagInput("");
    }
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setValue(
      "tags",
      watchedValues.tags.filter((tags) => tags !== tagToRemove),
    );
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Post Settings</DialogTitle>
            <DialogDescription>Configure your post details.</DialogDescription>
          </DialogHeader>

          <div className="space-x-6">
            {/* <label className="text-white text-sm font-medium">Tags</label> */}
            <div className="space-x-2">
              <Select
                value={watchedValues.ategory}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue placeholder="Select Category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORIES.map((category, idx) => (
                      <SelectItem key={idx} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-white text-sm font-medium">Tags</label>
              <div className="flex space-y-2  pt-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  placeholder="Add tags..."
                  className="bg-slate-800 border-slate-600"
                />

                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                  className="border-slate-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {watchedValues.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedValues.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-slate-400">
              {watchedValues.tags.length}/10 tags + Press Enter or comma to add
            </p>
          </div>
          {mode === "create" && (
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">
                Schedule Publication
              </label>
              <Input
                value={watchedValues.scheduledFor}
                onChange={(e) => setValue("scheduledFor", e.target.value)}
                type="datetime-local"
                className="bg-slate-800 border-slate-800"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-slate-400">
                Leave empty to publish immediately
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PostEditorSettings;
