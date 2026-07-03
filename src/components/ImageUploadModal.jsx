"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import {
  Check,
  Crop,
  ImageIcon,
  Loader2,
  RefreshCw,
  Type,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { buildTransformationUrl, uploadToImageKit } from "@/lib/imagekit";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";

const transformationSchema = z.object({
  aspectRatio: z.string().default("original"),
  customWidth: z.number().min(100).max(2000).default(800),
  customHeight: z.number().min(100).max(2000).default(600),
  smartCropFocus: z.string().default("auto"),
  textOverlay: z.string().optional(),
  textFontSize: z.number().min(12).max(200).default(50),
  textColor: z.string().default("#ffffff"),
  textPosition: z.string().default("center"),
  backgroundRemoved: z.boolean().default(false),
  dropShadow: z.boolean().default(false),
});

const ASPECT_RATIOS = [
  { label: "Original", value: "original" },
  { label: "Square (1:1)", value: "1:1", width: 400, height: 400 },
  { label: "Landscape (16:9)", value: "16:9", width: 800, height: 450 },
  { label: "Portrait (4:5)", value: "4:5", width: 400, height: 500 },
  { label: "Story (9:16)", value: "9:16", width: 450, height: 800 },
  { label: "Custom", value: "custom" },
];

const SMART_CROP_OPTIONS = [
  { label: "Auto", value: "auto" },
  { label: "Face", value: "face" },
  { label: "Center", value: "center" },
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
];

const TEXT_POSITIONS = [
  { label: "Center", value: "center" },
  { label: "Top Left", value: "north_west" },
  { label: "Top Right", value: "north_east" },
  { label: "Bottom Left", value: "south_west" },
  { label: "Bottom Right", value: "south_east" },
  { label: "top", value: "north" },
  { label: "bottom", value: "south" },
  { label: "left", value: "west" },
  { label: "right", value: "east" },
];

function ImageUploadModal({
  isOpen,
  onClose,
  onImageSelect,
  title = "Upload & Transform image",
}) {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [transformImag, settransformImage] = useState(null);
  const [isTransforming, setIsTransforming] = useState(false);

  const { watch, setValue, reset } = useForm({
    resolver: zodResolver(transformationSchema),
    defaultValues: {
      aspectRatio: "original",
      customHeight: 600,
      customWidth: 800,
      smartCropFocus: "auto",
      textOverlay: "",
      textFontSize: 50,
      textColor: "#ffffff",
      textPosition: "center",
      backgroundRemoved: false,
      dropShadow: false,
    },
  });

  const watchedValues = watch();
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File siaze must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileName = `post-image-${Date.now()}-${file.name}`;
      const result = await uploadToImageKit(file, fileName);

      if (result.success) {
        setUploadedImage(result.data);
        settransformImage(result.data.url);
        setActiveTab("transform");
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error : ", error);
      toast.error("Upload failed. Please try again");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
  });

  const handleSelectImage = () => {
    if (transformImag) {
      onImageSelect({
        url: transformImag,
        originalUrl: uploadedImage?.url,
        fieldId: uploadedImage?.fieldId,
        name: uploadedImage?.name,
        width: uploadedImage?.width,
        height: uploadedImage?.height,
      });

      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setUploadedImage(null);
    settransformImage(null);
    setActiveTab("upload");
    reset();
  };
  const handleclose = () => {
    onClose();
    resetForm();
  };

  const applyTransformations = async () => {
    if (!uploadedImage) {
      return;
    }

    setIsTransforming(true);

    try {
      let transformationChain = [];

      if (watchedValues.aspectRatio !== "original") {
        const ratio = ASPECT_RATIOS.find(
          (r) => r.value === watchedValues.aspectRatio,
        );

        if (ratio && ratio.width && ratio.height) {
          transformationChain.push({
            width: ratio.width,
            height: ratio.height,
            focus: watchedValues.smartCropFocus,
          });
        } else if (watchedValues.aspectRatio === "custom") {
          transformationChain.push({
            width: watchedValues.customWidth,
            height: watchedValues.customHeight,
            focus: watchedValues.smartCropFocus,
          });
        }
      }

      if (watchedValues.backgroundRemoved) {
        transformationChain.push({ effect: "removebg" });
      }

      if (watchedValues.dropShadow && watchedValues.backgroundRemoved) {
        transformationChain.push({ effect: "dropshadow" });
      }

      if (watchedValues.textOverlay?.trim()) {
        transformationChain.push({
          overlayText: watchedValues.textOverlay.trim(),
          overlayTextFontSize: watchedValues.textFontSize,
          overlayTextColor: watchedValues.textColor.replace("#", ""),
          gravity: watchedValues.textPosition,
          overlayTextPadding: 20,
        });
      }

      const transformedUrl = buildTransformationUrl(
        uploadedImage.url,
        transformationChain,
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log(transformedUrl);
      settransformImage(transformedUrl);
      toast.success("Transformations applied");
    } catch (error) {
      console.error("Transformation error : ", error);
      toast.error("Failed to apply trnasformations");
    } finally {
      setIsTransforming(false);
    }
  };

  const resetTransformations = async () => {
    reset();
    settransformImage(uploadedImage?.url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleclose}>
      <DialogContent className="max-w-6xl! h-[90vh]! overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription>
            Upload an image and apply AI-powered transformations
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="transform" disabled={!uploadedImage}>
              Transform
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors`}
            >
              <input {...getInputProps()} />

              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-purple-400" />
                  <p className="text-slate-300">Uploading image...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-slate-400" />
                  <div>
                    <p className="text-lg text-white">
                      {isDragActive
                        ? "Drop the image here"
                        : "Drag & Drop an image here"}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      or click to select a file (JPG, PNG,WebP,GIF - Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {uploadedImage && (
              <div className="text-center space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-green-300/20 border-green-500/30"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Image uploaded successfully!
                </Badge>

                <div className="text-sm text-slate-400">
                  {uploadedImage.width} x {uploadedImage.height} .{""}
                  {Math.round(uploadedImage.size / 1024)}KB
                </div>

                <Button
                  onClick={() => setActiveTab("transform")}
                  className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Starting Transforming
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="transform" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white items-center">
                    <Wand2 className="h-5 w-5 mr-2" /> AI Transformations
                  </h3>

                  {/* backgronud removal */}
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white font-medium">
                        Remove Background
                      </Label>
                      <Button
                        type="button"
                        variant={
                          watchedValues.backgroundRemoved
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setValue(
                            "backgroundRemoved",
                            !watchedValues.backgroundRemoved,
                          )
                        }
                      >
                        {watchedValues.backgroundRemoved ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-400">
                      AI-powered background removal
                    </p>
                  </div>
                </div>
                {/* Drop Shadow */}
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white font-medium">
                      Drop Shadow
                    </Label>
                    <Button
                      type="button"
                      variant={watchedValues.dropShadow ? "default" : "outline"}
                      size="sm"
                      disabled={!watchedValues.backgroundRemoved}
                      onClick={() =>
                        setValue("dropShadow", !watchedValues.dropShadow)
                      }
                    >
                      {watchedValues.dropShadow ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-400">
                    {watchedValues.backgroundRemoved
                      ? "Add realistic shadow"
                      : "Requres background removal"}
                  </p>
                </div>

                {/* Aspect Ratio & Croping */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Crop className="h-5 w-5 mr-2" /> Resize & Crop
                  </h3>

                  <div className="space-y-3">
                    <Label className={"text-white"}>Aspect Ratio</Label>
                    <Select
                      value={watchedValues.aspectRatio}
                      onValueChange={(value) => setValue("aspectRatio", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {watchedValues.aspectRatio === "custom" && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="">
                        <Label className={"text-white"}>Width</Label>
                        <Input
                          type="number"
                          value={watchedValues.customWidth}
                          onChange={(e) =>
                            setValue(
                              "customWidth",
                              parseInt(e.target.value) || 800,
                            )
                          }
                          min="100"
                          max="2000"
                        />
                      </div>

                      <div className="">
                        <Label className={"text-white"}>Heigth</Label>
                        <Input
                          type="number"
                          value={watchedValues.customHeight}
                          onChange={(e) =>
                            setValue(
                              "customWidth",
                              parseInt(e.target.value) || 800,
                            )
                          }
                          min="100"
                          max="2000"
                        />
                      </div>
                    </div>
                  )}

                  {watchedValues.aspectRatio !== "original" && (
                    <div className="space-y-3">
                      <Label className={"text-white"}>Aspect Ratio</Label>
                      <Select
                        value={watchedValues.smartCropFocus}
                        onValueChange={(value) =>
                          setValue("smartCropFocus", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SMART_CROP_OPTIONS.map((ratio) => (
                            <SelectItem key={ratio.value} value={ratio.value}>
                              {ratio.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Text overlay */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Type className="h-5 w-5 mr-2" />
                    Text Overlay
                  </h3>

                  <div className="space-y-3">
                    <Label className={"text-white"}>Text</Label>
                    <Textarea
                      value={watchedValues.textOverlay}
                      onChange={(e) => setValue("textOverlay", e.target.value)}
                      placeholder="Enter text ot overlay..."
                      rows={3}
                    />
                  </div>
                  {watchedValues.textOverlay && (
                    <>
                      <div className="space-y-3">
                        <Label className={"text-white"}>
                          Font Size : {watchedValues.textFontSize}px
                        </Label>
                        <Slider
                          value={[watchedValues.textFontSize]}
                          onValueChange={(value) =>
                            setValue("textFontSize", value[0])
                          }
                          max={200}
                          min={12}
                          step={2}
                          className={"w-full"}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className={"text-white"}>Text Color</Label>
                          <Input
                            type="color"
                            value={watchedValues.textColor}
                            onChange={(e) =>
                              setValue("textColor", e.target.value)
                            }
                          />
                        </div>

                        <div className="">
                          <Label className="text-white">Position</Label>
                          <Select
                            value={watchedValues.textPosition}
                            onValueChange={(value) =>
                              setValue("textPosition", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TEXT_POSITIONS.map((ratio) => (
                                <SelectItem
                                  key={ratio.value}
                                  value={ratio.value}
                                >
                                  {ratio.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Active Button */}
                <div className="flex gap-3">
                  <Button
                    onClick={applyTransformations}
                    disabled={isTransforming}
                    variant={"primary"}
                  >
                    {isTransforming ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Apply Trnasformations
                  </Button>

                  <Button onClick={resetTransformations} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Preview
                </h3>

                {transformImag && (
                  <div className="relative">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <img
                        src={transformImag}
                        alt="Transform image"
                        className="w-full max-h-96 object-contain rounded-lg mx-auto"
                        onError={() => {
                          toast.error("failed to load transformed image");
                          settransformImage(uploadedImage?.url);
                        }}
                      />
                    </div>
                    {isTransforming && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="bg-slate-800 rounded-lg p-4 flex items-center space-x-3">
                          <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                          <span className="text-white">
                            Applying transformations
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {uploadedImage && transformImag && (
                  <div className="text-center space-y-4">
                    <div className="text-sm text-slate-400">
                      Current image URL ready for use
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handleSelectImage}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Use This Image
                      </Button>

                      <Button
                        onClick={handleclose}
                        variant="outline"
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ImageUploadModal;
