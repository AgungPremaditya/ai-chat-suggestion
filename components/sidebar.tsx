'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Inbox
} from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'inquiries', label: 'Inquiries', icon: Inbox },
  { id: 'leads', label: 'Leads', icon: Users },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');

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
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
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
                </button>
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
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
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
                </button>
              );
            })}
          </div>

          {/* User profile */}
          <div className="px-3 py-4 border-t border-border">
            <div className={`flex items-center ${isCollapsed ? 'justify-center w-11 h-11 p-0 mx-auto' : 'gap-3 p-3'} rounded-lg bg-secondary`}>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-semibold shrink-0">
                N
              </div>
              <div className={`min-w-0 transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'flex-1 opacity-100'
                }`}>
                <p className="text-sm font-medium text-foreground truncate">John Doe</p>
                <p className="text-xs text-muted truncate">Admin</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
