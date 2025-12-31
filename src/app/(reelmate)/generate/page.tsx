"use client";

import { useState, useCallback } from "react";
import { VideoGenerationPanel } from "@/components/reelmate/VideoGenerationPanel";
import { GenerationResultsPanel } from "@/components/reelmate/GenerationResultsPanel";
import { toast } from "sonner";

interface GeneratedItem {
  id: string;
  type: "video" | "image" | "audio";
  thumbnail?: string;
  title: string;
  createdAt: Date;
  isFavorite: boolean;
  status: "completed" | "in_progress" | "failed";
}

export default function GeneratePage() {
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);

  const handleGenerate = useCallback(
    (formData: {
      mode: string;
      prompt: string;
      model: string;
      duration: string;
      resolution: string;
      uploadedImage: File | null;
    }) => {
      // Validate form data
      if (!formData.prompt.trim()) {
        toast.error("Please enter a prompt to generate video");
        return;
      }

      if (formData.mode === "image-to-video" && !formData.uploadedImage) {
        toast.error("Please upload an image for Image to Video mode");
        return;
      }

      // Create a new generation item (simulating the generation process)
      const newItem: GeneratedItem = {
        id: `gen-${Date.now()}`,
        type: "video",
        title: formData.prompt.slice(0, 30) + (formData.prompt.length > 30 ? "..." : ""),
        createdAt: new Date(),
        isFavorite: false,
        status: "in_progress",
      };

      setGeneratedItems((prev) => [newItem, ...prev]);
      toast.success("Generation started! This may take a few moments.");

      // Simulate generation completion after 3 seconds
      setTimeout(() => {
        setGeneratedItems((prev) =>
          prev.map((item) =>
            item.id === newItem.id
              ? { ...item, status: "completed" as const }
              : item
          )
        );
        toast.success("Video generation completed!");
      }, 3000);
    },
    []
  );

  return (
    <div className="h-full flex">
      <VideoGenerationPanel onGenerate={handleGenerate} />
      <GenerationResultsPanel items={generatedItems} />
    </div>
  );
}
