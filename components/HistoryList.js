"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Copy,
  Check,
  Star,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function HistoryList({
  history,
  onDelete,
  isLoading,
  onSelectPreview,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [copiedId, setCopiedId] = useState(null);
  const [starredIds, setStarredIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const itemsPerPage = 4;
  const filterOptions = [
    "All",
    "Blog Post",
    "Social Media Post",
    "Email Draft",
    "Marketing Ad",
    "Product Description",
  ];

  // Toggle favorite star
  const toggleStar = (id, e) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Copy helper
  const handleCopy = async (id, text, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy history text:", err);
    }
  };

  // Filter and search history
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.output.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || item.contentType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const date = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const time = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { date, time };
    } catch (e) {
      return { date: dateStr, time: "" };
    }
  };

  // Type pills CSS mapping
  const getTypePillClass = (type) => {
    switch (type) {
      case "Blog Post":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/10";
      case "Marketing Ad":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/10";
      case "Email Draft":
        return "bg-red-400 text-black/70 border-amber-500/10";
      case "Social Media Post":
        return "bg-rose-500/10 text-rose-500 border-rose-500/10";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/10";
    }
  };

  // Tone pills CSS mapping
  const getTonePillClass = (tone) => {
    switch (tone) {
      case "Professional":
        return "bg-primary/10 text-primary border-primary/10";
      case "Persuasive":
        return "bg-teal-500/10 text-teal-600 border-teal-500/10";
      case "Informative":
        return "bg-blue-500/10 text-blue-500 border-blue-500/10";
      case "Casual":
        return "bg-orange-500/10 text-orange-500 border-orange-500/10";
      default:
        return "bg-purple-500/10 text-purple-600 border-purple-500/10";
    }
  };

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setExpandedId(null);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Table Header Filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">
          Recent Generations
        </h3>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8.5 pr-4 py-2 w-full sm:w-56 rounded-xl border border-border bg-input text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          {/* All Types selector dropdown */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8.5 pr-8 py-2 w-full sm:w-44 rounded-xl border border-border bg-input text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent appearance-none cursor-pointer transition-all"
            >
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "All" ? "All Types" : opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid view / Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-12 rounded-xl bg-muted/40 border border-border animate-pulse-subtle"
            />
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-2xl bg-card text-center p-6">
          <h4 className="text-xs font-bold text-foreground">
            No recent generations found
          </h4>
          <p className="text-[10px] text-muted-foreground/80 mt-1">
            {history.length > 0
              ? "Try searching another keyword."
              : "Saves will populate inside this list."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/15 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Tone</th>
                  <th className="px-6 py-3.5">Created On</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {paginatedHistory.map((item) => {
                  const { date, time } = formatDate(item.createdAt);
                  const isItemCopied = copiedId === item.id;
                  const isStarred = starredIds.has(item.id);
                  const isExpanded = expandedId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() =>
                          setExpandedId(isExpanded ? null : item.id)
                        }
                        className={`hover:bg-secondary/35 cursor-pointer transition-colors ${isExpanded ? "bg-secondary/20" : ""}`}
                      >
                        {/* Title */}
                        <td className="px-6 py-3.5 font-bold text-foreground max-w-xs truncate">
                          {item.topic}
                        </td>

                        {/* Type */}
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 border text-[10px] font-bold rounded-full ${getTypePillClass(item.contentType)}`}
                          >
                            {item.contentType}
                          </span>
                        </td>

                        {/* Tone */}
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 border text-[10px] font-bold rounded-full ${getTonePillClass(item.tone)}`}
                          >
                            {item.tone}
                          </span>
                        </td>

                        {/* Created On */}
                        <td className="px-6 py-3.5 leading-normal">
                          <div className="font-semibold text-foreground">
                            {date}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {time}
                          </div>
                        </td>

                        {/* Actions */}
                        <td
                          className="px-6 py-3.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* View Detail Eye */}
                            <button
                              onClick={() => {
                                setExpandedId(isExpanded ? null : item.id);
                                if (onSelectPreview) onSelectPreview(item);
                              }}
                              className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                              title="Toggle expand / preview"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Copy content */}
                            <button
                              onClick={(e) =>
                                handleCopy(item.id, item.output, e)
                              }
                              className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                              title="Copy content"
                            >
                              {isItemCopied ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>

                            {/* Star / Favorite */}
                            <button
                              onClick={(e) => toggleStar(item.id, e)}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                isStarred
                                  ? "text-amber-500 hover:text-amber-600"
                                  : "text-muted-foreground/80 hover:text-foreground hover:bg-secondary"
                              }`}
                              title={isStarred ? "Unfavorite" : "Favorite"}
                            >
                              <Star
                                className={`h-4 w-4 ${isStarred ? "fill-amber-500" : ""}`}
                              />
                            </button>

                            {/* Delete context dots menu */}
                            <div className="relative group/menu">
                              <button
                                className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                                title="More options"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {/* Overlay actions dropdown menu on hover */}
                              <div className="absolute right-0 top-full mt-0.5 w-24 rounded-lg border border-border bg-card shadow-lg p-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-150 z-50 pointer-events-none group-hover/menu:pointer-events-auto">
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Delete this generation permanently?",
                                      )
                                    )
                                      onDelete(item.id);
                                  }}
                                  className="w-full flex items-center justify-center py-1 rounded text-[10px] text-destructive hover:bg-destructive/5 hover:font-bold font-semibold transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded View */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 bg-muted/15 border-t border-b border-border"
                          >
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                  Generated Prompt
                                </h4>
                                <p className="text-[10px] text-foreground bg-input/40 p-2.5 rounded-lg border border-border leading-relaxed font-mono">
                                  {item.prompt}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                  Generated Output Preview
                                </h4>
                                <div className="text-xs text-foreground bg-card p-4 rounded-lg border border-border leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line font-sans">
                                  {item.output}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls footer */}
          <div className="h-14 flex items-center justify-center bg-muted/10 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs">
              {/* Back Page Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border bg-input hover:bg-secondary text-muted-foreground disabled:opacity-40 disabled:hover:bg-input cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Number Pages mapping */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-8 w-8 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-input hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              {/* Next Page Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border bg-input hover:bg-secondary text-muted-foreground disabled:opacity-40 disabled:hover:bg-input cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
