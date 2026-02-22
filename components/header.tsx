'use client';

import { ThemeToggle } from './theme-toggle';
import { Bell, Settings, HelpCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground hidden md:block">Dashboard</h1>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-8">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 text-sm rounded-lg bg-secondary border border-border
              text-foreground placeholder-muted
              focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
              dark:bg-secondary dark:border-border"
          />
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors dark:hover:bg-secondary">
            <HelpCircle className="w-5 h-5 text-muted" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors dark:hover:bg-secondary relative">
            <Bell className="w-5 h-5 text-muted" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors dark:hover:bg-secondary">
            <Settings className="w-5 h-5 text-muted" />
          </button>
          <div className="w-px h-6 bg-border mx-2" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
