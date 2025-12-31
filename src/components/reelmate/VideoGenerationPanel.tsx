"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  Plus,
  Sparkles,
  BookOpen,
  ChevronRight,
  Video,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type GenerationMode = "image-to-video" | "text-to-video" | "reference-to-video";

interface FormState {
  mode: GenerationMode;
  prompt: string;
  model: string;
  cameraMovement: string;
  soundEffects: boolean;
  duration: string;
  resolution: string;
  uploadedImage: File | null;
  startFrame: File | null;
  endFrame: File | null;
}

interface VideoGenerationPanelProps {
  onGenerate: (formData: FormState) => void;
}

export function VideoGenerationPanel({ onGenerate }: VideoGenerationPanelProps) {
  const [formState, setFormState] = useState<FormState>({
    mode: "image-to-video",
    prompt: "",
    model: "tomovice-2.0",
    cameraMovement: "",
    soundEffects: false,
    duration: "5s",
    resolution: "720p",
    uploadedImage: null,
    startFrame: null,
    endFrame: null,
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFormState((prev) => ({ ...prev, uploadedImage: files[0] }));
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setFormState((prev) => ({ ...prev, uploadedImage: files[0] }));
      }
    },
    []
  );

  const handleSubmit = () => {
    onGenerate(formState);
  };

  const modes: { id: GenerationMode; label: string; isNew?: boolean }[] = [
    { id: "image-to-video", label: "Image to Video" },
    { id: "text-to-video", label: "Text to Video" },
    { id: "reference-to-video", label: "Reference to Video", isNew: true },
  ];

  return (
    <div className="w-[360px] bg-[var(--rm-bg-secondary)] border-r border-[var(--rm-border)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--rm-border)]">
        <h2 className="text-[var(--rm-text-primary)] font-semibold text-base flex items-center gap-2">
          <Video className="w-5 h-5" />
          Video Generation
        </h2>
      </div>

      {/* Mode Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 p-1 bg-[var(--rm-bg-tertiary)] rounded-lg">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() =>
                setFormState((prev) => ({ ...prev, mode: mode.id }))
              }
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1",
                formState.mode === mode.id
                  ? "bg-[var(--rm-bg-secondary)] text-[var(--rm-text-primary)] shadow-sm"
                  : "text-[var(--rm-text-muted)] hover:text-[var(--rm-text-secondary)]"
              )}
            >
              {mode.label}
              {mode.isNew && (
                <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px] px-1.5 py-0">
                  NEW
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Upload Image Section */}
        <div>
          <label className="text-[var(--rm-text-secondary)] text-sm font-medium mb-2 block">
            Upload Image
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
              isDragging
                ? "border-[var(--rm-purple-start)] bg-[var(--rm-purple-glow)]"
                : "border-[var(--rm-border)] hover:border-[var(--rm-border-hover)]"
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {formState.uploadedImage ? (
                <div className="text-[var(--rm-text-primary)] text-sm">
                  {formState.uploadedImage.name}
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--rm-text-muted)]" />
                  <p className="text-[var(--rm-text-muted)] text-sm">
                    Click/drag-and-drop/paste or select from{" "}
                    <span className="text-[var(--rm-purple-start)]">
                      My Assets
                    </span>
                  </p>
                </>
              )}
            </label>
          </div>

          {/* Start/End Frame */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-[var(--rm-text-muted)] text-xs">
                Start Frame
              </span>
              <button className="w-8 h-8 rounded-lg border border-[var(--rm-border)] flex items-center justify-center text-[var(--rm-text-muted)] hover:border-[var(--rm-border-hover)] hover:text-[var(--rm-text-secondary)] transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--rm-text-muted)] text-xs">
                End Frame
              </span>
              <button className="w-8 h-8 rounded-lg border border-[var(--rm-border)] flex items-center justify-center text-[var(--rm-text-muted)] hover:border-[var(--rm-border-hover)] hover:text-[var(--rm-text-secondary)] transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Prompt Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[var(--rm-text-secondary)] text-sm font-medium">
              Prompt
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-[var(--rm-text-muted)] hover:text-[var(--rm-text-secondary)] hover:bg-[var(--rm-bg-tertiary)] gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Creative Assistant
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-[var(--rm-text-muted)] hover:text-[var(--rm-text-secondary)] hover:bg-[var(--rm-bg-tertiary)] gap-1"
              >
                <BookOpen className="w-3 h-3" />
                My Prompts
              </Button>
            </div>
          </div>
          <Textarea
            value={formState.prompt}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, prompt: e.target.value }))
            }
            placeholder="Describe the video you want to generate. Refine ideas with Creative Assistant."
            className="min-h-[100px] bg-[var(--rm-bg-tertiary)] border-[var(--rm-border)] text-[var(--rm-text-primary)] placeholder:text-[var(--rm-text-muted)] resize-none focus-visible:ring-[var(--rm-purple-start)]"
          />
        </div>

        {/* Model Section */}
        <div>
          <label className="text-[var(--rm-text-secondary)] text-sm font-medium mb-2 block">
            Model
          </label>
          <button className="w-full p-3 rounded-xl bg-[var(--rm-bg-tertiary)] border border-[var(--rm-border)] hover:border-[var(--rm-border-hover)] transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <div className="text-left">
                <div className="text-[var(--rm-text-primary)] text-sm font-medium">
                  ToMovice 2.0
                </div>
                <div className="text-[var(--rm-text-muted)] text-xs">
                  Efficient Output & Smooth Transitions
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--rm-text-muted)] group-hover:text-[var(--rm-text-secondary)] transition-colors" />
          </button>
        </div>

        {/* Camera Movement Section */}
        <div>
          <label className="text-[var(--rm-text-secondary)] text-sm font-medium mb-2 block">
            Camera Movement
          </label>
          <button className="w-full p-3 rounded-xl bg-[var(--rm-bg-tertiary)] border border-[var(--rm-border)] hover:border-[var(--rm-border-hover)] transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--rm-bg-secondary)] flex items-center justify-center">
                <Video className="w-4 h-4 text-[var(--rm-text-muted)]" />
              </div>
              <span className="text-[var(--rm-text-muted)] text-sm">
                Click to select camera movement
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--rm-text-muted)] group-hover:text-[var(--rm-text-secondary)] transition-colors" />
          </button>
        </div>

        {/* Sound Effects Section */}
        <div>
          <label className="text-[var(--rm-text-secondary)] text-sm font-medium mb-2 block">
            Sound Effects
          </label>
          <div className="p-3 rounded-xl bg-[var(--rm-bg-tertiary)] border border-[var(--rm-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--rm-bg-secondary)] flex items-center justify-center">
                <Music className="w-4 h-4 text-[var(--rm-text-muted)]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--rm-text-primary)] text-sm">
                  Add Sound Effects with Video
                </span>
                <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px] px-1.5 py-0">
                  NEW
                </Badge>
              </div>
            </div>
            <Switch
              checked={formState.soundEffects}
              onCheckedChange={(checked) =>
                setFormState((prev) => ({ ...prev, soundEffects: checked }))
              }
              className="data-[state=checked]:bg-[var(--rm-purple-start)]"
            />
          </div>
        </div>

        {/* Duration and Resolution */}
        <div>
          <label className="text-[var(--rm-text-secondary)] text-sm font-medium mb-2 block">
            Duration and Resolution
          </label>
          <div className="flex gap-3">
            <Select
              value={formState.duration}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, duration: value }))
              }
            >
              <SelectTrigger className="flex-1 bg-[var(--rm-bg-tertiary)] border-[var(--rm-border)] text-[var(--rm-text-primary)] focus:ring-[var(--rm-purple-start)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--rm-bg-tertiary)] border-[var(--rm-border)]">
                <SelectItem value="5s" className="text-[var(--rm-text-primary)]">
                  5s
                </SelectItem>
                <SelectItem
                  value="10s"
                  className="text-[var(--rm-text-primary)]"
                >
                  10s
                </SelectItem>
                <SelectItem
                  value="15s"
                  className="text-[var(--rm-text-primary)]"
                >
                  15s
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={formState.resolution}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, resolution: value }))
              }
            >
              <SelectTrigger className="flex-1 bg-[var(--rm-bg-tertiary)] border-[var(--rm-border)] text-[var(--rm-text-primary)] focus:ring-[var(--rm-purple-start)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--rm-bg-tertiary)] border-[var(--rm-border)]">
                <SelectItem
                  value="480p"
                  className="text-[var(--rm-text-primary)]"
                >
                  480p
                </SelectItem>
                <SelectItem
                  value="720p"
                  className="text-[var(--rm-text-primary)]"
                >
                  720p
                </SelectItem>
                <SelectItem
                  value="1080p"
                  className="text-[var(--rm-text-primary)]"
                >
                  1080p
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="p-4 border-t border-[var(--rm-border)]">
        <Button
          onClick={handleSubmit}
          className="w-full h-11 bg-gradient-to-r from-[var(--rm-purple-start)] to-[var(--rm-purple-end)] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Generate
        </Button>
        <p className="text-[var(--rm-text-muted)] text-[10px] text-center mt-2">
          Content is generated by AI. Use at your own discretion.
        </p>
      </div>
    </div>
  );
}
