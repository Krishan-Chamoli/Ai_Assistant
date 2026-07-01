"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-context";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardForm from "@/components/DashboardForm";
import ResultDisplay from "@/components/ResultDisplay";
import HistoryList from "@/components/HistoryList";
import axios from "axios";
import { AlertCircle, CheckCircle2, X, Play, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State Management
  const [currentGeneration, setCurrentGeneration] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast helper
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch History from DB
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setIsHistoryLoading(true);
    try {
      const response = await axios.get(`/api/history?userId=${user.id}`);
      if (response.data?.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
      showToast("Could not load history database records.", "error");
    } finally {
      setIsHistoryLoading(false);
    }
  }, [user, showToast]);

  // Handle Authentication Redirects
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Load history on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  // Trigger Content Generation
  const handleGenerate = async (values) => {
    setIsGenerating(true);
    setHasSaved(false);
    try {
      const response = await axios.post("/api/generate", values);
      if (response.data?.success) {
        setCurrentGeneration(response.data.data);
        showToast("AI Content generated successfully!");
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.error || "Generation failed. Please try again.";
      showToast(errMsg, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Content to DB
  const handleSave = async () => {
    if (!user || !currentGeneration) return;
    setIsSaving(true);
    try {
      const response = await axios.post("/api/save", {
        userId: user.id,
        ...currentGeneration,
      });

      if (response.data?.success) {
        setHasSaved(true);
        showToast("Generation saved to database history!");
        fetchHistory();
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to save to database.";
      showToast(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete History Record
  const handleDeleteHistory = async (contentId) => {
    try {
      const response = await axios.delete(
        `/api/history?contentId=${contentId}`,
      );
      if (response.data?.success) {
        setHistory((prev) => prev.filter((item) => item.id !== contentId));
        showToast("Record deleted successfully.");
      }
    } catch (err) {
      showToast("Failed to delete history record.", "error");
    }
  };

  // Clear current generation workspace
  const handleClearWorkspace = () => {
    setCurrentGeneration(null);
    setHasSaved(false);
    showToast("Workspace cleared.");
  };

  // Load selected history item back into generated output for preview
  const handleSelectHistoryPreview = (item) => {
    setCurrentGeneration({
      contentType: item.contentType,
      topic: item.topic,
      tone: item.tone,
      prompt: item.prompt,
      output: item.output,
      modelUsed: "Loaded from history",
    });
    setHasSaved(true);
    showToast("Loaded history generation preview.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">
            Authenticating user session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Desktop visible */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar Drawer - Mobile drawer toggle */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex flex-col max-w-xs w-full bg-card border-r border-border animate-fade-in">
            <div className="absolute right-4 top-4">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Area right side */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Dashboard Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                Create Content
              </h1>
              <p className="text-xs text-muted-foreground mt-1 leading-none">
                Generate high quality, engaging content tailored to your
                audience in seconds.
              </p>
            </div>
          </div>

          {/* Form parameters & Output container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Parameters form panel */}
            <div className="lg:col-span-5 glass border border-border rounded-2xl p-6 bg-card shadow-sm">
              <DashboardForm
                onGenerate={handleGenerate}
                isLoading={isGenerating}
              />
            </div>

            {/* Right Output view panel */}
            <div className="lg:col-span-7">
              <ResultDisplay
                generation={currentGeneration}
                onSave={handleSave}
                isSaving={isSaving}
                hasSaved={hasSaved}
                onClear={handleClearWorkspace}
              />
            </div>
          </div>

          {/* Bottom Table view Panel */}
          <div className="glass border border-border rounded-2xl p-6 bg-card shadow-sm">
            <HistoryList
              history={history}
              onDelete={handleDeleteHistory}
              isLoading={isHistoryLoading}
              onSelectPreview={handleSelectHistoryPreview}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
