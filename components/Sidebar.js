"use client";

import React from "react";
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  BookOpen,
  History,
  Star,
  Trash2,
  ShieldAlert,
  Settings,
  HelpCircle,
  Crown,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { type: "item", label: "Dashboard", icon: LayoutDashboard, active: true },
    { type: "category", label: "CREATE" },
    { type: "item", label: "New Content", icon: PenSquare },
    { type: "item", label: "Templates", icon: FileText },
    { type: "item", label: "Tone Library", icon: BookOpen },
    { type: "category", label: "HISTORY" },
    { type: "item", label: "All Generations", icon: History },
    { type: "item", label: "Favorites", icon: Star },
    { type: "item", label: "Trash", icon: Trash2 },
    { type: "category", label: "SETTINGS" },
    { type: "item", label: "Brand Voice", icon: ShieldAlert },
    { type: "item", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
        <img
          src="/logo.png"
          alt="Nebuloid Logo"
          className="h-16 w-16 rounded-lg object-contain"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {menuItems.map((item, index) => {
          if (item.type === "category") {
            return (
              <div
                key={index}
                className="text-[10px] font-bold text-muted-foreground tracking-wider pt-4 pb-2 px-3"
              >
                {item.label}
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${item.active ? "text-primary" : "text-muted-foreground/80"}`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Upgrade Card & Help Link */}
      <div className="p-4 border-t border-border space-y-4">
        {/* Help & Support Button */}
        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all cursor-pointer text-sm font-medium">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-4 w-4 text-muted-foreground/80" />
            <span>Help & Support</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        </button>
      </div>
    </aside>
  );
}
