'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox, Flame, MailCheck, Clock } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Inquiry {
    id: string;
    name: string;
    message: string;
    created_at: string;
}

interface Lead {
    id: string;
    inquiry_id: string;
    category: 'hot' | 'warm' | 'cold';
    status: 'new' | 'replied' | 'closed';
    replied_at: string | null;
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function isToday(iso: string): boolean {
    const d = new Date(iso);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

function getLast7Days(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
}

function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

export default function Home() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [accentColor, setAccentColor] = useState('#6366f1');

    useEffect(() => {
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        if (accent) setAccentColor(accent);
    }, []);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            const fullName = data.user?.user_metadata?.full_name ?? data.user?.email ?? null;
            setUserName(fullName ? fullName.split(' ')[0] : null);
        });
        Promise.all([
            supabase
                .from('inquiries')
                .select('id, name, message, created_at')
                .order('created_at', { ascending: false }),
            supabase.from('leads').select('id, inquiry_id, category, status, replied_at'),
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

        // Live updates: prepend new inquiries without a full refresh
        const channel = supabase
            .channel('home-inquiries-inserts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'inquiries' },
                (payload) => {
                    const newInquiry = payload.new as Inquiry;
                    setInquiries((prev) => [newInquiry, ...prev]);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // Stats
    const totalInquiries = inquiries.length;
    const hotLeads = leads.filter((l) => l.category === 'hot').length;
    const repliedToday = leads.filter(
        (l) => l.status === 'replied' && l.replied_at && isToday(l.replied_at)
    ).length;
    const leadInquiryIds = new Set(leads.map((l) => l.inquiry_id));
    const pendingAI = inquiries.filter((i) => !leadInquiryIds.has(i.id)).length;

    const stats = [
        { label: 'Total Inquiries', value: totalInquiries, icon: Inbox, color: 'text-accent' },
        { label: 'Hot Leads', value: hotLeads, icon: Flame, color: 'text-red-500' },
        { label: 'Replied Today', value: repliedToday, icon: MailCheck, color: 'text-emerald-500' },
        { label: 'Pending AI', value: pendingAI, icon: Clock, color: 'text-amber-500' },
    ];

    // Chart: inquiries per day for last 7 days
    const days7 = getLast7Days();
    const countByDay = new Map(days7.map((d) => [d, 0]));
    for (const inq of inquiries) {
        const day = inq.created_at.slice(0, 10);
        if (countByDay.has(day)) countByDay.set(day, (countByDay.get(day) ?? 0) + 1);
    }
    const chartData = days7.map((day) => ({
        date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        inquiries: countByDay.get(day) ?? 0,
    }));

    // Recent activity: last 5 inquiries
    const recentInquiries = inquiries.slice(0, 5);

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
                <Header />

                <main className="flex-1 overflow-auto">
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back{userName ? `, ${userName}` : ''}</h1>
                            <p className="text-muted">Here's what's happening with your projects today</p>
                        </div>

                        {loading ? (
                            <>
                                {/* Stats skeletons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="p-6 rounded-lg border border-border bg-background"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-5 h-5 rounded shrink-0" />
                                                <div className="flex-1">
                                                    <Skeleton className="h-8 w-16 mb-1.5" />
                                                    <Skeleton className="h-3 w-28" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Content grid skeletons */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 p-6 rounded-lg border border-border bg-background">
                                        <Skeleton className="h-5 w-36 mb-1.5" />
                                        <Skeleton className="h-3 w-20 mb-5" />
                                        <Skeleton className="h-64 w-full" />
                                    </div>
                                    <div className="p-6 rounded-lg border border-border bg-background">
                                        <Skeleton className="h-5 w-32 mb-6" />
                                        <div className="space-y-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-3 pb-4 border-b border-border last:border-b-0 last:pb-0"
                                                >
                                                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                                    <div className="flex-1">
                                                        <Skeleton className="h-4 w-28 mb-1.5" />
                                                        <Skeleton className="h-3 w-40" />
                                                    </div>
                                                    <Skeleton className="h-3 w-12" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : error ? (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-500">Failed to load data: {error}</p>
                            </div>
                        ) : (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    {stats.map((stat) => {
                                        const Icon = stat.icon;
                                        return (
                                            <div
                                                key={stat.label}
                                                className="p-6 rounded-lg border border-border bg-background hover:border-accent transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`w-5 h-5 shrink-0 ${stat.color}`} />
                                                    <div>
                                                        <p className="text-2xl font-bold text-foreground">
                                                            {stat.value}
                                                        </p>
                                                        <p className="text-sm text-muted">{stat.label}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Area Chart */}
                                    <div className="lg:col-span-2 p-6 rounded-lg border border-border bg-background">
                                        <h2 className="text-base font-semibold text-foreground mb-1">
                                            Inquiry Volume
                                        </h2>
                                        <p className="text-xs text-muted mb-5">Last 7 days</p>
                                        <ResponsiveContainer width="100%" height={240}>
                                            <AreaChart
                                                data={chartData}
                                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="inquiryGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor={accentColor}
                                                            stopOpacity={0.3}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor={accentColor}
                                                            stopOpacity={0}
                                                        />
                                                    </linearGradient>
                                                </defs>
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
                                                        border: '1px solid var(--border)',
                                                        background: 'var(--background)',
                                                        color: 'var(--foreground)',
                                                    }}
                                                    labelStyle={{ color: 'var(--foreground)', fontWeight: 500 }}
                                                    itemStyle={{ color: 'var(--muted)' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="inquiries"
                                                    stroke={accentColor}
                                                    strokeWidth={2}
                                                    fill="url(#inquiryGradient)"
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                    name="Inquiries"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="p-6 rounded-lg border border-border bg-background h-full">
                                        <h2 className="text-lg font-semibold text-foreground mb-6">
                                            Recent Activity
                                        </h2>
                                        {recentInquiries.length === 0 ? (
                                            <p className="text-sm text-muted text-center py-8">
                                                No recent inquiries
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentInquiries.map((inq) => (
                                                    <div
                                                        key={inq.id}
                                                        className="flex items-center gap-3 pb-4 border-b border-border last:border-b-0 last:pb-0"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-accent shrink-0">
                                                            {initials(inq.name)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                {inq.name}
                                                            </p>
                                                            <p className="text-xs text-muted truncate">
                                                                {inq.message.length > 50
                                                                    ? inq.message.slice(0, 50) + '…'
                                                                    : inq.message}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-muted whitespace-nowrap">
                                                            {timeAgo(inq.created_at)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
