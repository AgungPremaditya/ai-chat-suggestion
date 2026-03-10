'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import {
    Inbox,
    MailCheck,
    Flame,
    Clock,
    Loader2,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';

interface Inquiry {
    id: string;
    created_at: string;
}

interface Lead {
    id: string;
    inquiry_id: string;
    category: 'hot' | 'warm' | 'cold';
    status: 'new' | 'replied' | 'closed';
    replied_at: string | null;
}

function formatDayLabel(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getLast30Days(): string[] {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
}

const STATUS_COLORS: Record<string, string> = {
    new: '#3b82f6',
    replied: '#10b981',
    closed: '#6b7280',
};

const CATEGORY_COLORS: Record<string, string> = {
    hot: '#ef4444',
    warm: '#f59e0b',
    cold: '#60a5fa',
};

export default function AnalyticsPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();

        Promise.all([
            supabase
                .from('inquiries')
                .select('id, created_at')
                .order('created_at', { ascending: true }),
            supabase
                .from('leads')
                .select('id, inquiry_id, category, status, replied_at'),
        ]).then(([inquiriesRes, leadsRes]) => {
            if (inquiriesRes.error) {
                setError(inquiriesRes.error.message);
            } else if (leadsRes.error) {
                setError(leadsRes.error.message);
            } else {
                setInquiries(inquiriesRes.data ?? []);
                setLeads(leadsRes.data ?? []);
            }
            setLoading(false);
        });
    }, []);

    // Stat: Total Inquiries
    const totalInquiries = inquiries.length;

    // Stat: Reply Rate (% of leads with status=replied)
    const repliedLeads = leads.filter((l) => l.status === 'replied').length;
    const replyRate = leads.length > 0 ? Math.round((repliedLeads / leads.length) * 100) : 0;

    // Stat: Hot Leads
    const hotLeads = leads.filter((l) => l.category === 'hot').length;

    // Stat: Avg Response Time (hours from inquiry created_at to lead replied_at)
    const inquiryMap = new Map(inquiries.map((i) => [i.id, i.created_at]));
    const responseTimes: number[] = [];
    for (const lead of leads) {
        if (lead.replied_at) {
            const inquiryCreatedAt = inquiryMap.get(lead.inquiry_id);
            if (inquiryCreatedAt) {
                const diffHours =
                    (new Date(lead.replied_at).getTime() - new Date(inquiryCreatedAt).getTime()) /
                    (1000 * 60 * 60);
                if (diffHours >= 0) responseTimes.push(diffHours);
            }
        }
    }
    const avgResponseTime =
        responseTimes.length > 0
            ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
            : null;

    // Line chart: inquiry volume per day (last 30 days)
    const days = getLast30Days();
    const inquiryCountByDay = new Map<string, number>(days.map((d) => [d, 0]));
    for (const inq of inquiries) {
        const day = inq.created_at.slice(0, 10);
        if (inquiryCountByDay.has(day)) {
            inquiryCountByDay.set(day, (inquiryCountByDay.get(day) ?? 0) + 1);
        }
    }
    const lineData = days.map((day) => ({
        date: formatDayLabel(day),
        count: inquiryCountByDay.get(day) ?? 0,
    }));

    // Donut chart: lead status breakdown
    const statusCounts = { new: 0, replied: 0, closed: 0 };
    for (const lead of leads) {
        if (lead.status in statusCounts) statusCounts[lead.status as keyof typeof statusCounts]++;
    }
    const donutData = [
        { name: 'New', value: statusCounts.new, color: STATUS_COLORS.new },
        { name: 'Replied', value: statusCounts.replied, color: STATUS_COLORS.replied },
        { name: 'Closed', value: statusCounts.closed, color: STATUS_COLORS.closed },
    ].filter((d) => d.value > 0);

    // Bar chart: lead category
    const categoryCounts = { hot: 0, warm: 0, cold: 0 };
    for (const lead of leads) {
        if (lead.category in categoryCounts) categoryCounts[lead.category as keyof typeof categoryCounts]++;
    }
    const barData = [
        { name: 'Hot', value: categoryCounts.hot, color: CATEGORY_COLORS.hot },
        { name: 'Warm', value: categoryCounts.warm, color: CATEGORY_COLORS.warm },
        { name: 'Cold', value: categoryCounts.cold, color: CATEGORY_COLORS.cold },
    ];

    const stats = [
        { label: 'Total Inquiries', value: String(totalInquiries), icon: Inbox, color: 'text-accent' },
        { label: 'Reply Rate', value: `${replyRate}%`, icon: MailCheck, color: 'text-emerald-500' },
        { label: 'Hot Leads', value: String(hotLeads), icon: Flame, color: 'text-red-500' },
        {
            label: 'Avg Response Time',
            value: avgResponseTime ? `${avgResponseTime}h` : '—',
            icon: Clock,
            color: 'text-amber-500',
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
                <Header />

                <main className="flex-1 overflow-auto">
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
                            <p className="text-muted">Overview of inquiry and lead performance</p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-24 gap-2 text-muted">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Loading analytics...</span>
                            </div>
                        ) : error ? (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-500">Failed to load data: {error}</p>
                            </div>
                        ) : (
                            <>
                                {/* Stat Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    {stats.map((stat) => {
                                        const Icon = stat.icon;
                                        return (
                                            <div key={stat.label} className="p-4 rounded-lg border border-border bg-background">
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`w-5 h-5 shrink-0 ${stat.color}`} />
                                                    <div>
                                                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                                        <p className="text-xs text-muted">{stat.label}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Line Chart: Inquiry Volume */}
                                <div className="rounded-lg border border-border bg-background p-6 mb-6">
                                    <h2 className="text-base font-semibold text-foreground mb-1">Inquiry Volume</h2>
                                    <p className="text-xs text-muted mb-5">Last 30 days</p>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="currentColor"
                                                strokeOpacity={0.1}
                                            />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 11 }}
                                                tickLine={false}
                                                axisLine={false}
                                                interval={4}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fontSize: 11 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    border: '1px solid',
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#6366f1"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4 }}
                                                name="Inquiries"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Bottom Row: Donut + Bar */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Donut Chart: Lead Status */}
                                    <div className="rounded-lg border border-border bg-background p-6">
                                        <h2 className="text-base font-semibold text-foreground mb-1">Lead Status</h2>
                                        <p className="text-xs text-muted mb-4">Breakdown by status</p>
                                        {donutData.length === 0 ? (
                                            <div className="flex items-center justify-center h-[180px] text-muted text-sm">
                                                No lead data yet
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-6">
                                                <ResponsiveContainer width="50%" height={180}>
                                                    <PieChart>
                                                        <Pie
                                                            data={donutData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={75}
                                                            paddingAngle={3}
                                                            dataKey="value"
                                                        >
                                                            {donutData.map((entry) => (
                                                                <Cell key={entry.name} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{
                                                                borderRadius: '8px',
                                                                fontSize: '12px',
                                                                border: '1px solid',
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="flex flex-col gap-2.5">
                                                    {donutData.map((entry) => (
                                                        <div key={entry.name} className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full shrink-0"
                                                                style={{ background: entry.color }}
                                                            />
                                                            <span className="text-sm font-medium text-foreground">
                                                                {entry.value}
                                                            </span>
                                                            <span className="text-xs text-muted">{entry.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bar Chart: Lead Category */}
                                    <div className="rounded-lg border border-border bg-background p-6">
                                        <h2 className="text-base font-semibold text-foreground mb-1">Lead Categories</h2>
                                        <p className="text-xs text-muted mb-4">Hot, warm, and cold counts</p>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart
                                                data={barData}
                                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="currentColor"
                                                    strokeOpacity={0.1}
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{ fontSize: 11 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        border: '1px solid',
                                                    }}
                                                    cursor={{ fill: 'transparent' }}
                                                />
                                                <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]}>
                                                    {barData.map((entry) => (
                                                        <Cell key={entry.name} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
