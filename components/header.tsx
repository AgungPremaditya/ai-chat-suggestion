'use client';

import { ThemeToggle } from './theme-toggle';
import { Bell, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
          <Input
            type="text"
            placeholder="Search..."
            className="bg-secondary border-border text-foreground placeholder-muted focus:ring-accent"
          />
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <HelpCircle className="w-5 h-5 text-muted" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-secondary relative">
            <Bell className="w-5 h-5 text-muted" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <Settings className="w-5 h-5 text-muted" />
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
