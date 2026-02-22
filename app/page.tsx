'use client';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { StatCard } from '@/components/stat-card';
import { ActivityCard } from '@/components/activity-card';
import { Users, TrendingUp, BarChart3, Zap } from 'lucide-react';

const activityData = [
  {
    id: '1',
    avatar: 'JD',
    name: 'John Doe',
    action: 'Updated user dashboard',
    timestamp: '2 mins ago',
  },
  {
    id: '2',
    avatar: 'SM',
    name: 'Sarah Miller',
    action: 'Created new analytics report',
    timestamp: '15 mins ago',
  },
  {
    id: '3',
    avatar: 'EB',
    name: 'Emily Brown',
    action: 'Completed project milestone',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    avatar: 'AP',
    name: 'Alex Paul',
    action: 'Shared team feedback',
    timestamp: '3 hours ago',
  },
];

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
              <p className="text-muted">Here's what's happening with your projects today</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value="12,584"
                change={12}
                icon={Users}
                trend="up"
              />
              <StatCard
                title="Revenue"
                value="$45,231"
                change={8}
                icon={TrendingUp}
                trend="up"
              />
              <StatCard
                title="Conversions"
                value="3.24%"
                change={-2}
                icon={BarChart3}
                trend="down"
              />
              <StatCard
                title="Performance"
                value="98.5%"
                change={5}
                icon={Zap}
                trend="up"
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main chart area */}
              <div className="lg:col-span-2 p-6 rounded-lg border border-border bg-background">
                <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Overview</h2>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-accent mb-2">📊</div>
                    <p className="text-muted">Chart data will be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <ActivityCard items={activityData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
