'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
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
    Flame,
    ThermometerSun,
    Snowflake,
    CheckCircle2,
    Clock,
    XCircle,
    Bold,
    Italic,
    UnderlineIcon,
    List,
    ListOrdered,
    Send,
} from 'lucide-react';

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

interface Lead {
    id: string;
    category: 'hot' | 'warm' | 'cold';
    status: 'new' | 'replied' | 'closed';
    confidence_score: number;
    summary: string;
    recommended_reply: string | null;
    final_reply: string | null;
    replied_at: string | null;
}

const DUMMY_LEAD = {
    category: 'warm' as const,
    status: 'new' as const,
    confidence_score: 0.74,
    summary: 'Potential client showing moderate interest. Inquiry suggests a specific need that aligns with core service offerings.',
    recommended_reply: null,
    final_reply: null,
    replied_at: null,
};

const DEFAULT_DRAFT = (firstName: string) =>
    `<p>Hi ${firstName},</p><p>Thank you for reaching out to us! We've received your inquiry and our team is reviewing it.</p><p>Based on what you've shared, we believe we can help you achieve your goals. We'd love to schedule a quick call to better understand your needs and walk you through our solutions.</p><p>Would you be available for a 15-minute call this week? Feel free to reply to this email with a time that works best for you.</p><p>Looking forward to connecting,<br>The Team</p>`;

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
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

function ConfidenceBar({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
                <span className="text-muted">Confidence</span>
                <span className="font-medium text-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary">
                <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function ToolbarButton({
    onClick, active, disabled, children, title,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded transition-colors disabled:opacity-40 ${active
                ? 'bg-accent text-white'
                : 'text-muted hover:text-foreground hover:bg-secondary'
                }`}
        >
            {children}
        </button>
    );
}

export default function ReplyPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [initialContent, setInitialContent] = useState<string | null>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({ placeholder: 'Write your reply here…' }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[400px] text-foreground text-sm leading-relaxed',
            },
        },
    });

    useEffect(() => {
        const supabase = createClient();
        Promise.all([
            supabase
                .from('inquiries')
                .select('id, name, email, phone, message, attachments, source, created_at')
                .eq('id', id)
                .single(),
            supabase
                .from('leads')
                .select('id, category, status, confidence_score, summary, recommended_reply, final_reply, replied_at')
                .eq('inquiry_id', id)
                .maybeSingle(),
        ]).then(([inquiryRes, leadRes]) => {
            if (!inquiryRes.error) {
                setInquiry(inquiryRes.data);
                const fetchedLead = leadRes.data ?? null;
                setLead(fetchedLead);

                const firstName = inquiryRes.data?.name.split(' ')[0] ?? '';
                const content =
                    fetchedLead?.final_reply ??
                    fetchedLead?.recommended_reply ??
                    DEFAULT_DRAFT(firstName);

                setInitialContent(content);
            }
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        if (editor && initialContent !== null) {
            editor.commands.setContent(initialContent);
        }
    }, [editor, initialContent]);

    const handleSend = async () => {
        if (!inquiry || !editor) return;
        const html = editor.getHTML();
        setSaving(true);
        setSaveError(null);

        const supabase = createClient();
        let err = null;

        if (lead?.id) {
            const { error } = await supabase
                .from('leads')
                .update({
                    final_reply: html,
                    replied_at: new Date().toISOString(),
                    status: 'replied',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', lead.id);
            err = error;
        } else {
            const { error } = await supabase
                .from('leads')
                .insert({
                    inquiry_id: inquiry.id,
                    category: DUMMY_LEAD.category,
                    confidence_score: DUMMY_LEAD.confidence_score,
                    summary: DUMMY_LEAD.summary,
                    final_reply: html,
                    replied_at: new Date().toISOString(),
                    status: 'replied',
                });
            err = error;
        }

        if (err) {
            setSaveError(err.message);
        } else {
            setSaved(true);
            setTimeout(() => router.push(`/dashboard/inquiries/${id}`), 800);
        }

        if (!err) {
            // Send email to customer
            await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: inquiry.email,
                    subject: "Re: Your Inquiry",
                    replyBody: html,
                    recipientName: inquiry.name,
                    originalMessage: inquiry.message,
                    originalDate: formatDate(inquiry.created_at),
                }),
            }).catch(() => {}); // Silent fail - dont block save
        }
        setSaving(false);
    };

    const activeLead = lead ?? DUMMY_LEAD;
    const category = categoryConfig[activeLead.category];
    const CategoryIcon = category.icon;
    const status = statusConfig[activeLead.status];
    const StatusIcon = status.icon;

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-full gap-2 text-muted">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Loading...</span>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* Top bar */}
                            <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => router.back()}
                                        className="p-2 rounded-md hover:bg-secondary text-muted hover:text-foreground transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <div>
                                        <h1 className="text-lg font-semibold text-foreground">Edit Reply</h1>
                                        {inquiry && (
                                            <p className="text-xs text-muted">to {inquiry.name} &lt;{inquiry.email}&gt;</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                                    <button
                                        onClick={handleSend}
                                        disabled={saving || saved}
                                        className="h-9 px-4 rounded-md bg-accent text-white text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : saved ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Send Reply'}
                                    </button>
                                </div>
                            </div>

                            {/* Two-column body */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Left column */}
                                <div className="w-96 shrink-0 flex flex-col gap-4 p-4 overflow-y-auto border-r border-border">
                                    {/* Detail Inquiry */}
                                    {inquiry && (
                                        <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-accent" />
                                                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Detail Inquiry</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-accent" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{inquiry.name}</p>
                                                    <p className="text-xs text-muted truncate">{inquiry.email}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 text-xs text-muted">
                                                <span className="flex items-center gap-1.5">
                                                    <Mail className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{inquiry.email}</span>
                                                </span>
                                                {inquiry.phone && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3 shrink-0" />
                                                        {inquiry.phone}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3 shrink-0" />
                                                    {formatDate(inquiry.created_at)}
                                                </span>
                                                {inquiry.attachments && (
                                                    <a
                                                        href={inquiry.attachments}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-accent hover:underline"
                                                    >
                                                        <Paperclip className="w-3 h-3 shrink-0" />
                                                        Attachment
                                                    </a>
                                                )}
                                            </div>
                                            <div className="rounded bg-secondary p-2.5">
                                                <p className="text-xs text-muted leading-relaxed">{inquiry.message}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Detail Lead */}
                                    <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-accent" />
                                            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Detail Lead</p>
                                            {!lead && <span className="ml-auto text-xs text-muted italic">placeholder</span>}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${category.className}`}>
                                                <CategoryIcon className="w-2.5 h-2.5" />
                                                {category.label}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                                                <StatusIcon className="w-2.5 h-2.5" />
                                                {status.label}
                                            </span>
                                        </div>
                                        <ConfidenceBar score={activeLead.confidence_score} />
                                        <p className="text-xs text-muted leading-relaxed">{activeLead.summary}</p>
                                    </div>
                                </div>

                                {/* Right: WYSIWYG editor */}
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {/* Toolbar */}
                                    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-border shrink-0">
                                        <ToolbarButton
                                            onClick={() => editor?.chain().focus().toggleBold().run()}
                                            active={editor?.isActive('bold')}
                                            title="Bold"
                                        >
                                            <Bold className="w-4 h-4" />
                                        </ToolbarButton>
                                        <ToolbarButton
                                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                                            active={editor?.isActive('italic')}
                                            title="Italic"
                                        >
                                            <Italic className="w-4 h-4" />
                                        </ToolbarButton>
                                        <ToolbarButton
                                            onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                            active={editor?.isActive('underline')}
                                            title="Underline"
                                        >
                                            <UnderlineIcon className="w-4 h-4" />
                                        </ToolbarButton>
                                        <div className="w-px h-5 bg-border mx-1" />
                                        <ToolbarButton
                                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                            active={editor?.isActive('bulletList')}
                                            title="Bullet List"
                                        >
                                            <List className="w-4 h-4" />
                                        </ToolbarButton>
                                        <ToolbarButton
                                            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                            active={editor?.isActive('orderedList')}
                                            title="Ordered List"
                                        >
                                            <ListOrdered className="w-4 h-4" />
                                        </ToolbarButton>
                                    </div>

                                    {/* Editor area */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <EditorContent editor={editor} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
