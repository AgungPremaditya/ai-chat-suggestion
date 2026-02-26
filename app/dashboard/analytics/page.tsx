import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const metrics = [
  { label: 'Page Views', value: '128,430', change: 14, trend: 'up' },
  { label: 'Sessions', value: '84,210', change: 9, trend: 'up' },
  { label: 'Bounce Rate', value: '38.2%', change: -3, trend: 'down' },
  { label: 'Avg. Session', value: '3m 42s', change: 5, trend: 'up' },
];

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
              <p className="text-muted">Track performance and growth metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((m) => (
                <div key={m.label} className="p-6 rounded-lg border border-border bg-background">
                  <p className="text-sm text-muted mb-1">{m.label}</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{m.value}</p>
                  <span className={`inline-flex items-center gap-1 text-sm font-medium ${m.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {m.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(m.change)}%
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-border bg-background">
                <h2 className="text-lg font-semibold text-foreground mb-4">Traffic Overview</h2>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-accent mx-auto mb-3" />
                    <p className="text-muted text-sm">Chart data will be displayed here</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border bg-background">
                <h2 className="text-lg font-semibold text-foreground mb-4">Conversion Funnel</h2>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-accent mx-auto mb-3" />
                    <p className="text-muted text-sm">Chart data will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
