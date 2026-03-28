'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Inbox,
    Paperclip,
    Calendar,
    Users,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Inquiry {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    attachments: string | null;
    source: string;
    created_at: string;
}

const ROWS_PER_PAGE = 8;

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function isToday(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
}

function isThisWeek(iso: string) {
    const d = new Date(iso).getTime();
    const now = Date.now();
    return now - d < 7 * 24 * 60 * 60 * 1000;
}

export default function InquiriesPage() {
    const router = useRouter();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('inquiries')
            .select('id, name, email, phone, message, attachments, source, created_at')
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) {
                    setFetchError(error.message);
                } else {
                    setInquiries(data ?? []);
                }
                setLoadingData(false);
            });

        // Live updates: prepend new inquiries without a full refresh
        const channel = supabase
            .channel('inquiries-page-inserts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'inquiries' },
                (payload) => {
                    const newInquiry = payload.new as Inquiry;
                    setInquiries((prev) => [newInquiry, ...prev]);
                    setCurrentPage(1);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const filtered = inquiries.filter((row) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            row.name.toLowerCase().includes(q) ||
            row.email.toLowerCase().includes(q) ||
            row.message.toLowerCase().includes(q);
        const matchesSource = sourceFilter === 'all' || row.source === sourceFilter;
        return matchesSearch && matchesSource;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const paginated = filtered.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    );

    const toggleSelectAll = () => {
        if (selectedRows.size === paginated.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginated.map((r) => r.id)));
        }
    };

    const toggleSelectRow = (id: string) => {
        const next = new Set(selectedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedRows(next);
    };

    const sources = Array.from(new Set(inquiries.map((i) => i.source)));

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
                <Header />

                <main className="flex-1 overflow-auto">
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground mb-2">Inquiries</h1>
                            <p className="text-muted">Review and manage submitted inquiries</p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Total', value: inquiries.length, icon: Inbox, color: 'text-accent' },
                                { label: 'Today', value: inquiries.filter((i) => isToday(i.created_at)).length, icon: Calendar, color: 'text-blue-500' },
                                { label: 'This Week', value: inquiries.filter((i) => isThisWeek(i.created_at)).length, icon: Users, color: 'text-amber-500' },
                                { label: 'With Attachment', value: inquiries.filter((i) => !!i.attachments).length, icon: Paperclip, color: 'text-emerald-500' },
                            ].map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={stat.label} className="p-4 rounded-lg border border-border bg-background">
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${stat.color}`} />
                                            <div>
                                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                                <p className="text-xs text-muted">{stat.label}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Table Container */}
                        <div className="rounded-lg border border-border bg-background">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-border">
                                <div className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, message..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        className="w-full h-9 pl-9 pr-4 text-sm rounded-md border border-border bg-secondary text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                </div>

                                <div className="relative">
                                    <select
                                        value={sourceFilter}
                                        onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
                                        className="h-9 pl-3 pr-8 text-sm rounded-md border border-border bg-secondary text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                                    >
                                        <option value="all">All Sources</option>
                                        {sources.map((s) => (
                                            <option key={s} value={s} className="capitalize">{s}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                {loadingData ? (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="w-12 px-4 py-3"><Skeleton className="w-4 h-4" /></th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Message</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Source</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                                                <th className="w-12 px-4 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {Array.from({ length: ROWS_PER_PAGE }).map((_, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-3"><Skeleton className="w-4 h-4" /></td>
                                                    <td className="px-4 py-3">
                                                        <Skeleton className="h-4 w-28 mb-1.5" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-40" /></td>
                                                    <td className="px-4 py-3 max-w-xs"><Skeleton className="h-4 w-48" /></td>
                                                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                    <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></td>
                                                    <td className="px-4 py-3"><Skeleton className="w-7 h-7 rounded-md" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : fetchError ? (
                                    <div className="py-12 text-center">
                                        <p className="text-sm text-red-500">Failed to load: {fetchError}</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="w-12 px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={paginated.length > 0 && selectedRows.size === paginated.length}
                                                        onChange={toggleSelectAll}
                                                        className="w-4 h-4 rounded border-border accent-accent"
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Message</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Source</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                                                <th className="w-12 px-4 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paginated.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    onClick={() => router.push(`/dashboard/inquiries/${row.id}`)}
                                                    className={`cursor-pointer hover:bg-secondary/50 transition-colors ${selectedRows.has(row.id) ? 'bg-accent/5' : ''}`}
                                                >
                                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.has(row.id)}
                                                            onChange={() => toggleSelectRow(row.id)}
                                                            className="w-4 h-4 rounded border-border accent-accent"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{row.name}</p>
                                                            {row.phone && (
                                                                <p className="text-xs text-muted">{row.phone}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <span className="text-sm text-muted">{row.email}</span>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-sm text-foreground truncate">
                                                                {row.message.length > 60 ? row.message.slice(0, 60) + '…' : row.message}
                                                            </span>
                                                            {row.attachments && (
                                                                <a
                                                                    href={row.attachments}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="shrink-0 text-muted hover:text-accent transition-colors"
                                                                    title="View attachment"
                                                                >
                                                                    <Paperclip className="w-3.5 h-3.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 hidden sm:table-cell">
                                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize text-muted bg-secondary">
                                                            {row.source}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        <span className="text-sm text-muted">{formatDate(row.created_at)}</span>
                                                    </td>
                                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                        <button className="p-1.5 rounded-md hover:bg-secondary text-muted hover:text-foreground transition-colors">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {paginated.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-12 text-center">
                                                        <Inbox className="w-10 h-10 text-muted mx-auto mb-3" />
                                                        <p className="text-sm text-muted">No inquiries found</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Pagination */}
                            {!loadingData && !fetchError && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                    <p className="text-sm text-muted">
                                        {filtered.length === 0
                                            ? 'No results'
                                            : `Showing ${(currentPage - 1) * ROWS_PER_PAGE + 1}–${Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of ${filtered.length}`}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 rounded-md border border-border hover:bg-secondary text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page === currentPage ? 'bg-accent text-white' : 'text-muted hover:bg-secondary'}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 rounded-md border border-border hover:bg-secondary text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
