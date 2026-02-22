'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import {
    Search,
    Filter,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Inbox,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from 'lucide-react';

type InquiryStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface Inquiry {
    id: string;
    subject: string;
    customer: string;
    email: string;
    status: InquiryStatus;
    priority: 'low' | 'medium' | 'high';
    category: string;
    createdAt: string;
}

const inquiries: Inquiry[] = [
    { id: 'INQ-001', subject: 'Unable to access dashboard', customer: 'John Doe', email: 'john@example.com', status: 'open', priority: 'high', category: 'Technical', createdAt: '2026-02-22' },
    { id: 'INQ-002', subject: 'Billing discrepancy on invoice', customer: 'Sarah Miller', email: 'sarah@example.com', status: 'in_progress', priority: 'medium', category: 'Billing', createdAt: '2026-02-21' },
    { id: 'INQ-003', subject: 'Feature request: Export to CSV', customer: 'Emily Brown', email: 'emily@example.com', status: 'open', priority: 'low', category: 'Feature Request', createdAt: '2026-02-21' },
    { id: 'INQ-004', subject: 'Account password reset issue', customer: 'Alex Paul', email: 'alex@example.com', status: 'resolved', priority: 'medium', category: 'Account', createdAt: '2026-02-20' },
    { id: 'INQ-005', subject: 'Integration API returning 500', customer: 'Maria Garcia', email: 'maria@example.com', status: 'open', priority: 'high', category: 'Technical', createdAt: '2026-02-20' },
    { id: 'INQ-006', subject: 'Subscription upgrade not reflected', customer: 'David Kim', email: 'david@example.com', status: 'in_progress', priority: 'high', category: 'Billing', createdAt: '2026-02-19' },
    { id: 'INQ-007', subject: 'Mobile app crashing on login', customer: 'Lisa Chen', email: 'lisa@example.com', status: 'closed', priority: 'medium', category: 'Technical', createdAt: '2026-02-19' },
    { id: 'INQ-008', subject: 'Data export taking too long', customer: 'James Wilson', email: 'james@example.com', status: 'open', priority: 'low', category: 'Technical', createdAt: '2026-02-18' },
    { id: 'INQ-009', subject: 'Need custom report template', customer: 'Anna Taylor', email: 'anna@example.com', status: 'resolved', priority: 'low', category: 'Feature Request', createdAt: '2026-02-18' },
    { id: 'INQ-010', subject: 'Two-factor auth not working', customer: 'Robert Lee', email: 'robert@example.com', status: 'in_progress', priority: 'high', category: 'Account', createdAt: '2026-02-17' },
];

const statusConfig: Record<InquiryStatus, { label: string; icon: typeof Inbox; className: string }> = {
    open: { label: 'Open', icon: AlertCircle, className: 'text-blue-500 bg-blue-500/10' },
    in_progress: { label: 'In Progress', icon: Clock, className: 'text-amber-500 bg-amber-500/10' },
    resolved: { label: 'Resolved', icon: CheckCircle2, className: 'text-emerald-500 bg-emerald-500/10' },
    closed: { label: 'Closed', icon: XCircle, className: 'text-muted bg-secondary' },
};

const priorityConfig: Record<string, string> = {
    low: 'text-muted bg-secondary',
    medium: 'text-amber-500 bg-amber-500/10',
    high: 'text-red-500 bg-red-500/10',
};

export default function InquiriesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    const filteredInquiries = inquiries.filter((inquiry) => {
        const matchesSearch =
            inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredInquiries.length / rowsPerPage);
    const paginatedInquiries = filteredInquiries.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const toggleSelectAll = () => {
        if (selectedRows.size === paginatedInquiries.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedInquiries.map((i) => i.id)));
        }
    };

    const toggleSelectRow = (id: string) => {
        const next = new Set(selectedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedRows(next);
    };

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
                            <p className="text-muted">Manage and respond to customer inquiries</p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Total', value: inquiries.length, icon: Inbox, color: 'text-accent' },
                                { label: 'Open', value: inquiries.filter((i) => i.status === 'open').length, icon: AlertCircle, color: 'text-blue-500' },
                                { label: 'In Progress', value: inquiries.filter((i) => i.status === 'in_progress').length, icon: Clock, color: 'text-amber-500' },
                                { label: 'Resolved', value: inquiries.filter((i) => i.status === 'resolved').length, icon: CheckCircle2, color: 'text-emerald-500' },
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
                                {/* Search */}
                                <div className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        placeholder="Search inquiries..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full h-9 pl-9 pr-4 text-sm rounded-md border border-border bg-secondary text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                </div>

                                {/* Filters */}
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="h-9 pl-3 pr-8 text-sm rounded-md border border-border bg-secondary text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                    </div>
                                    <button className="h-9 px-3 flex items-center gap-1.5 text-sm rounded-md border border-border bg-secondary text-foreground hover:bg-border transition-colors">
                                        <Filter className="w-4 h-4" />
                                        <span className="hidden sm:inline">Filters</span>
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="w-12 px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.size === paginatedInquiries.length && paginatedInquiries.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 rounded border-border accent-accent"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Subject</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Priority</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden xl:table-cell">Category</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                                            <th className="w-12 px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {paginatedInquiries.map((inquiry) => {
                                            const status = statusConfig[inquiry.status];
                                            const StatusIcon = status.icon;
                                            return (
                                                <tr
                                                    key={inquiry.id}
                                                    className={`hover:bg-secondary/50 transition-colors ${selectedRows.has(inquiry.id) ? 'bg-accent/5' : ''
                                                        }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.has(inquiry.id)}
                                                            onChange={() => toggleSelectRow(inquiry.id)}
                                                            className="w-4 h-4 rounded border-border accent-accent"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-mono text-muted">{inquiry.id}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium text-foreground">{inquiry.subject}</span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        <div>
                                                            <p className="text-sm text-foreground">{inquiry.customer}</p>
                                                            <p className="text-xs text-muted">{inquiry.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${priorityConfig[inquiry.priority]}`}>
                                                            {inquiry.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden xl:table-cell">
                                                        <span className="text-sm text-muted">{inquiry.category}</span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        <span className="text-sm text-muted">{inquiry.createdAt}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button className="p-1.5 rounded-md hover:bg-secondary text-muted hover:text-foreground transition-colors">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {paginatedInquiries.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="px-4 py-12 text-center">
                                                    <Inbox className="w-10 h-10 text-muted mx-auto mb-3" />
                                                    <p className="text-sm text-muted">No inquiries found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                <p className="text-sm text-muted">
                                    Showing {filteredInquiries.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredInquiries.length)} of {filteredInquiries.length}
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
                                            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page === currentPage
                                                    ? 'bg-accent text-white'
                                                    : 'text-muted hover:bg-secondary'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="p-1.5 rounded-md border border-border hover:bg-secondary text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
