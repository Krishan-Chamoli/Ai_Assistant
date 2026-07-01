"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FileText,
  MessageSquare,
  Mail,
  Megaphone,
  Box,
  Sparkles,
} from "lucide-react";

const formSchema = z.object({
  contentType: z.enum(
    [
      "Blog Post",
      "Social Media Post",
      "Email Draft",
      "Marketing Ad",
      "Product Description",
    ],
    {
      message: "Please select a content type",
    },
  ),
  topic: z
    .string()
    .min(3, "Topic/Keyword must be at least 3 characters")
    .max(100, "Topic/Keyword must be under 100 characters"),
  tone: z.enum(
    ["Professional", "Witty", "Casual", "Informative", "Persuasive"],
    {
      message: "Please select a tone style",
    },
  ),
});

const contentTypes = [
  {
    id: "Blog Post",
    label: "Blog Post",
    icon: FileText,
    desc: "Articles & summaries",
  },
  {
    id: "Social Media Post",
    label: "Social Media Post",
    icon: MessageSquare,
    desc: "Captions & threads",
  },
  {
    id: "Email Draft",
    label: "Email Draft",
    icon: Mail,
    desc: "Emails & newsletters",
  },
  {
    id: "Marketing Ad",
    label: "Marketing Ad",
    icon: Megaphone,
    desc: "Ad copy & headlines",
  },
  {
    id: "Product Description",
    label: "Product Description",
    icon: Box,
    desc: "Features & benefits",
  },
];

const tones = ["Professional", "Witty", "Casual", "Informative", "Persuasive"];

export default function DashboardForm({ onGenerate, isLoading }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: "Blog Post",
      topic: "",
      tone: "Professional",
    },
  });

  const selectedType = watch("contentType");
  const selectedTone = watch("tone");

  const onSubmit = async (data) => {
    await onGenerate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 select-none">
      {/* 1. Select content type */}
      <div>
        <label className="block text-xs font-bold text-foreground mb-3 text-muted-foreground uppercase tracking-wider">
          1. Select content type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  setValue("contentType", type.id, { shouldValidate: true })
                }
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card hover:bg-secondary/40"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {type.label}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal truncate">
                    {type.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        {errors.contentType && (
          <p className="mt-1.5 text-xs text-destructive">
            {errors.contentType.message}
          </p>
        )}
      </div>

      {/* 2. Topic or keywords */}
      <div>
        <label
          htmlFor="topic"
          className="block text-xs font-bold mb-2 text-muted-foreground uppercase tracking-wider"
        >
          2. Topic or keywords
        </label>
        <input
          id="topic"
          type="text"
          placeholder="e.g. Remote work productivity tips, Modern JavaScript patterns..."
          className={`w-full px-4 py-2.5 rounded-xl border bg-input text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 ${
            errors.topic
              ? "border-destructive/50 focus:ring-destructive"
              : "border-border"
          }`}
          {...register("topic")}
        />
        {errors.topic ? (
          <p className="mt-1.5 text-xs text-destructive">
            {errors.topic.message}
          </p>
        ) : (
          <p className="mt-1.5 text-[10px] text-muted-foreground/75 leading-none">
            Be specific to get better results.
          </p>
        )}
      </div>

      {/* 3. Choose tone */}
      <div>
        <label className="block text-xs font-bold text-foreground mb-3 text-muted-foreground uppercase tracking-wider">
          3. Choose tone
        </label>
        <div className="flex flex-wrap gap-2">
          {tones.map((tone) => {
            const isSelected = selectedTone === tone;
            return (
              <button
                key={tone}
                type="button"
                onClick={() => setValue("tone", tone, { shouldValidate: true })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tone}
              </button>
            );
          })}
        </div>
        {errors.tone && (
          <p className="mt-1.5 text-xs text-destructive">
            {errors.tone.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        <span>{isLoading ? "Generating Content..." : "Generate Content"}</span>
      </button>
    </form>
  );
}
