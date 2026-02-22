'use client';

import { MoreVertical } from 'lucide-react';

interface ActivityItem {
  id: string;
  avatar: string;
  name: string;
  action: string;
  timestamp: string;
}

interface ActivityCardProps {
  items: ActivityItem[];
}

export function ActivityCard({ items }: ActivityCardProps) {
  return (
    <div className="p-6 rounded-xl bg-background border border-border h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4 text-muted" />
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-accent">
              {item.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted truncate">{item.action}</p>
            </div>
            <p className="text-xs text-muted whitespace-nowrap">{item.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
