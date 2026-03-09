'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import {
    ArrowLeft,
    Loader2,
    Mail,
    Phone,
    Calendar,
    Paperclip,
    User,
    TrendingUp,
    MessageSquare,
    Flame,
    ThermometerSun,
    Snowflake,
    CheckCircle2,
    Clock,
    XCircle,
    Sparkles,
    Pencil,
} from 'lucide-react';

interface Inquiry {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    attachments: string | null;
    source: string;
    consent: boolean;
    created_at: string;
}

interface Lead {
    id: string;
    inquiry_id: string;
    category: 'hot' | 'warm' | 'cold';
    status: 'new' | 'replied' | 'closed';
    confidence_score: number;
    summary: string;
    recommended_reply: string | null;
    final_reply: string | null;
    replied_at: string | null;
    processed_at: string | null;
}

const DUMMY_LEAD: Omit<Lead, 'id' | 'inquiry_id'> = {
    category: 'warm',
    status: 'new',
    confidence_score: 0.74,
    summary: 'Potential client showing moderate interest. Inquiry suggests a specific need that aligns with core service offerings.',
    recommended_reply: null,
    final_reply: null,
    replied_at: null,
    processed_at: null,
};

const DEFAULT_DRAFT = `Hi {{name}},

Thank you for reaching out to us! We've received your inquiry and our team is reviewing it.

Based on what you've shared, we believe we can help you achieve your goals. We'd love to schedule a quick call to better understand your needs and walk you through our solutions.

Would you be available for a 15-minute call this week? Feel free to reply to this email with a time that works best for you.

Looking forward to connecting,
The Team`;

const categoryConfig = {
    hot: { label: 'Hot', icon: Flame, className: 'text-red-500 bg-red-500/10' },
    warm: { label: 'Warm', icon: ThermometerSun, className: 'text-amber-500 bg-amber-500/10' },
    cold: { label: 'Cold', icon: Snowflake, className: 'text-blue-500 bg-blue-500/10' },
};

const statusConfig = {
    new: { label: 'New', icon: Clock, className: 'text-blue-500 bg-blue-500/10' },
    replied: { label: 'Replied', icon: CheckCircle2, className: 'text-emerald-500 bg-emerald-500/10' },
    closed: { label: 'Closed', icon: XCircle, className: 'text-muted bg-secondary' },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function ConfidenceBar({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span className="font-medium text-foreground">{pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary">
                <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default function InquiryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reprocessing, setReprocessing] = useState(false);
    const [reprocessError, setReprocessError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        Promise.all([
            supabase
                .from('inquiries')
                .select('id, name, email, phone, message, attachments, source, consent, created_at')
                .eq('id', id)
                .single(),
            supabase
                .from('leads')
                .select('id, inquiry_id, category, status, confidence_score, summary, recommended_reply, final_reply, replied_at, processed_at')
                .eq('inquiry_id', id)
                .maybeSingle(),
        ]).then(([inquiryRes, leadRes]) => {
            if (inquiryRes.error) setError(inquiryRes.error.message);
            else {
                setInquiry(inquiryRes.data);
                setLead(leadRes.data ?? null);
            }
            setLoading(false);
        });
    }, [id]);

    const activeLead = lead ?? { ...DUMMY_LEAD, id: '', inquiry_id: id as string };
    const category = categoryConfig[activeLead.category];
    const CategoryIcon = category.icon;
    const status = statusConfig[activeLead.status];
    const StatusIcon = status.icon;

    async function handleReprocess() {
        setReprocessing(true);
        setReprocessError(null);
        try {
            const res = await fetch(`/api/process-inquiry/${id}`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) setLead(data.lead);
            else setReprocessError(data.error ?? 'Processing failed');
        } catch {
            setReprocessError('Unexpected error');
        } finally {
            setReprocessing(false);
        }
    }

    // What to show in the preview: final_reply → recommended_reply → default draft
    const previewReply = inquiry
        ? (activeLead.final_reply ??
            activeLead.recommended_reply ??
            DEFAULT_DRAFT.replace('{{name}}', inquiry.name.split(' ')[0]))
        : null;

    function htmlToPlainText(html: string) {
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<\/li>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    async function handleSendEmail() {
        if (!inquiry || !previewReply) return;
        setSending(true);
        setSendResult(null);
        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: inquiry.email,
                    subject: 'Re: Your Inquiry',
                    replyBody: activeLead.final_reply ?? `<p>${previewReply.replace(/\n/g, '<br>')}</p>`,
                    recipientName: inquiry.name,
                    originalMessage: inquiry.message,
                    originalDate: new Date(inquiry.created_at).toLocaleString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                    }),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSendResult({ ok: true, message: 'Email sent successfully!' });
                if (lead !== null) {
                    const supabase = createClient();
                    const now = new Date().toISOString();
                    const { error: updateError } = await supabase
                        .from("leads")
                        .update({ status: "replied", replied_at: now })
                        .eq("id", lead.id);
                    if (updateError) {
                        setSendResult({ ok: true, message: "Email sent successfully! (status update failed)" });
                    } else {
                        setLead({ ...lead, status: "replied", replied_at: now });
                    }
                }
            } else {
                setSendResult({ ok: false, message: data.error ?? 'Failed to send email' });
            }
        } catch {
            setSendResult({ ok: false, message: 'Unexpected error sending email' });
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto">
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {/* Back + Title */}
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-md hover:bg-secondary text-muted hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Inquiry Detail</h1>
                                <p className="text-xs text-muted font-mono mt-0.5">{id}</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-24 gap-2 text-muted">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        ) : error ? (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-500">Failed to load inquiry: {error}</p>
                            </div>
                        ) : inquiry && (
                            <div className="space-y-4">
                                {/* Top: Detail Inquiry */}
                                <div className="rounded-lg border border-border bg-background p-6">
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                                <User className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-foreground">{inquiry.name}</h2>
                                                <p className="text-sm text-muted">{inquiry.email}</p>
                                            </div>
                                        </div>
                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize text-muted bg-secondary shrink-0">
                                            {inquiry.source}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-muted">
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" />
                                            {inquiry.email}
                                        </span>
                                        {inquiry.phone && (
                                            <span className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5" />
                                                {inquiry.phone}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(inquiry.created_at)}
                                        </span>
                                        {inquiry.attachments && (
                                            <a
                                                href={inquiry.attachments}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-accent hover:underline"
                                            >
                                                <Paperclip className="w-3.5 h-3.5" />
                                                View attachment
                                            </a>
                                        )}
                                    </div>

                                    <div className="rounded-md bg-secondary p-4">
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Message</p>
                                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                                    </div>
                                </div>

                                {/* Bottom: Detail Leads + Recommended Answer */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {/* Lead Details */}
                                    <div className="md:col-span-2 rounded-lg border border-border bg-background p-6 space-y-5">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-accent" />
                                            <h3 className="font-semibold text-foreground">Lead Details</h3>
                                            {!lead && <span className="ml-auto text-xs text-muted italic">placeholder</span>}
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${category.className}`}>
                                                <CategoryIcon className="w-3 h-3" />
                                                {category.label}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </span>
                                        </div>

                                        <ConfidenceBar score={activeLead.confidence_score} />

                                        <div>
                                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">AI Summary</p>
                                            <p className="text-sm text-muted leading-relaxed">{activeLead.summary}</p>
                                        </div>

                                        {activeLead.final_reply && activeLead.replied_at && (
                                            <div className="rounded-md bg-emerald-500/5 border border-emerald-500/20 p-3">
                                                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">Reply Sent</p>
                                                <p className="text-xs text-muted">{formatDate(activeLead.replied_at)}</p>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                                            <p className="text-xs text-muted">
                                                {activeLead.processed_at
                                                    ? `Processed ${formatDate(activeLead.processed_at)}`
                                                    : 'Not yet processed by AI'}
                                            </p>
                                            <button
                                                onClick={handleReprocess}
                                                disabled={reprocessing}
                                                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                            >
                                                {reprocessing
                                                    ? <><Loader2 className="w-3 h-3 animate-spin" />Processing...</>
                                                    : <><Sparkles className="w-3 h-3" />Re-process</>
                                                }
                                            </button>
                                        </div>
                                        {reprocessError && (
                                            <p className="text-xs text-red-500">{reprocessError}</p>
                                        )}
                                    </div>

                                    {/* Recommended Answer — read-only preview */}
                                    <div className="md:col-span-3 rounded-lg border border-border bg-background p-6 flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-accent" />
                                            <h3 className="font-semibold text-foreground">
                                                {activeLead.final_reply ? 'Final Reply' : 'Recommended Answer'}
                                            </h3>
                                            {!lead && <span className="ml-auto text-xs text-muted italic">placeholder</span>}
                                        </div>

                                        <div className="flex-1 rounded-md bg-secondary p-4 overflow-auto">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MessageSquare className="w-3.5 h-3.5 text-muted" />
                                                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                                                    {activeLead.final_reply ? 'Sent Reply' : 'Draft Reply'}
                                                </p>
                                            </div>
                                            {previewReply && (
                                                activeLead.final_reply
                                                    ? <div
                                                        className="prose prose-sm max-w-none text-foreground"
                                                        dangerouslySetInnerHTML={{ __html: previewReply }}
                                                    />
                                                    : <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{previewReply}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/dashboard/inquiries/${id}/reply`)}
                                                className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-border text-sm text-foreground hover:bg-secondary transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                {activeLead.final_reply ? 'Edit Reply' : 'Write Reply'}
                                            </button>
                                            <button
                                                onClick={handleSendEmail}
                                                disabled={sending || !previewReply}
                                                className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {sending
                                                    ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                                                    : <><Mail className="w-4 h-4" />Send Email</>
                                                }
                                            </button>
                                        </div>
                                        {sendResult && (
                                            <p className={`text-xs ${sendResult.ok ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {sendResult.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
