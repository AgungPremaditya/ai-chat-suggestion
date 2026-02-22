'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Inbox,
  LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
  { id: 'inquiries', label: 'Inquiries', icon: Inbox, href: '/dashboard/inquiries' },
  { id: 'leads', label: 'Leads', icon: Users, href: '/dashboard/leads' },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  const userDisplayName = user?.user_metadata?.full_name ?? user?.email ?? 'User';
  const userInitial = (userDisplayName[0] ?? 'U').toUpperCase();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden max-md:flex md:hidden fixed bottom-6 right-6 z-50 items-center justify-center w-12 h-12 bg-accent hover:bg-accent/90 rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-16 md:top-0 left-0 z-40 h-[calc(100vh-4rem)] md:h-screen border-r border-border bg-background transition-all duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <nav className="flex flex-col h-full">
          {/* Main navigation */}
          <div className="flex-1 px-3 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex items-center ${isCollapsed ? 'justify-center w-11 h-11 p-0 mx-none' : 'w-full justify-between px-4 py-3'} rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-accent text-white shadow-lg'
                    : 'text-foreground hover:bg-secondary'
                    }`}
                >
                  {isCollapsed ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-5 h-5" />}
                    </>
                  )}
                  {/* Tooltip on hover when collapsed */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Collapse toggle (desktop only) */}
          <div className="hidden md:block px-3 pb-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`flex items-center justify-center rounded-lg text-muted hover:bg-secondary hover:text-foreground transition-all duration-200 ${isCollapsed ? 'w-11 h-11 p-0 mx-auto' : 'w-full px-4 py-2.5'}`}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <ChevronLeft className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-sm">Collapse</span>
                </div>
              )}
            </button>
          </div>

          {/* Bottom navigation */}
          <div className="px-3 py-6 space-y-2 border-t border-border">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex items-center ${isCollapsed ? 'justify-center w-11 h-11 p-0 mx-auto' : 'w-full gap-3 px-4 py-3'} rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-accent text-white'
                    : 'text-foreground hover:bg-secondary'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {/* Tooltip on hover when collapsed */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User profile */}
          <div className="px-3 py-4 border-t border-border">
            <div className={`flex items-center ${isCollapsed ? 'justify-center w-11 h-11 p-0 mx-auto' : 'gap-3 p-3'} rounded-lg bg-secondary`}>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {userInitial}
              </div>
              <div className={`min-w-0 transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'flex-1 opacity-100'
                }`}>
                <p className="text-sm font-medium text-foreground truncate">{userDisplayName}</p>
                <p className="text-xs text-muted truncate">{user?.email ?? ''}</p>
              </div>
              {!isCollapsed && (
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-background transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
            {isCollapsed && (
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="group relative flex items-center justify-center w-11 h-11 p-0 mx-auto mt-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  Sign out
                </span>
              </button>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
