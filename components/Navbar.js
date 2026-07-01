"use client";

import React from "react";
import { useAuth } from "@/store/auth-context";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, ChevronDown, LogOut, Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const userInitial = user ? user.name.charAt(0).toUpperCase() : "K";
  const userName = user ? user.name : "Krishan Chamoli";
  const userEmail = user ? user.email : "krishan@gmail.com";

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-border bg-card/90 backdrop-blur-md flex items-center px-6 justify-between select-none">
      {/* Left branding & mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden cursor-pointer"
          title="Toggle menu"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Branding Logo + Text */}
        <div className="flex items-center gap-2 md:hidden select-none">
          <img src="/logo.png" alt="Nebuloid Logo" className="h-7 w-7 object-contain rounded" />
          <span className="text-xs font-bold text-foreground tracking-wider uppercase">
            AI Studio
          </span>
        </div>

        {/* Desktop Branding Banner */}
        <div className="hidden md:flex items-center gap-3 select-none">
          <div className="flex flex-col text-left justify-center">
            <span className="text-[14px] font-medium tracking-wider text-foreground leading-none">
              NEBULOID TECH STUDIO LLP
            </span>
            <span className="text-[8px] font-bold tracking-wider text-muted-foreground mt-1 leading-none uppercase">
              YOUR VISION, OUR MISSION!
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors relative"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5" />
          ) : (
            <Moon className="h-4.5 w-4.5" />
          )}
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-border" />

        {/* User Dropdown Profiler */}
        {user && (
          <div className="relative group">
            <button className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-secondary/60 transition-all cursor-pointer text-left">
              {/* Avatar Initial */}
              <div className="h-8 w-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center ring-1 ring-primary/20">
                {userInitial}
              </div>

              {/* Name and Email */}
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-foreground leading-none">
                  {userName}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {userEmail}
                </span>
              </div>

              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/80 hidden sm:block" />
            </button>

            {/* Simple dropdown options on hover */}
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-card shadow-lg p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none group-hover:pointer-events-auto">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
