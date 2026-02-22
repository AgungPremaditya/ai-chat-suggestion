'use client';

import { LucideIcon } from 'lucide-react';
import { ArrowUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
}

export function StatCard({ title, value, change, icon: Icon, trend = 'up' }: StatCardProps) {
  return (
    <div className="p-6 rounded-xl bg-background border border-border hover:border-accent transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend === 'up' ? 'text-green-500' : 'text-red-500'
        }`}>
          <ArrowUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
          {Math.abs(change)}%
        </div>
      </div>
      
      <h3 className="text-sm text-muted mb-1">{title}</h3>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
