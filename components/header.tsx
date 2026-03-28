'use client';

import { ThemeToggle } from './theme-toggle';
import { Bell } from 'lucide-react';
import { useRealtimeContext } from './realtime-provider';

export function Header() {
  const { unreadCount, resetUnread } = useRealtimeContext();
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground hidden md:block">Dashboard</h1>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetUnread}
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          >
            <Bell className="w-5 h-5 text-muted" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none px-0.5">
                {badgeLabel}
              </span>
            )}
          </button>
          <div className="w-px h-6 bg-border mx-2" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
