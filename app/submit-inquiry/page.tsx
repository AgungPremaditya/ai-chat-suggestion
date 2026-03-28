'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, ArrowRight, Paperclip, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SubmitInquiryPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [consent, setConsent] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [honeypot, setHoneypot] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setUploading(true);
        setFileName(file.name);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload-attachment', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setAttachmentUrl(data.url);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to upload file');
            setFileName(null);
            setAttachmentUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setAttachmentUrl(null);
        setFileName(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/submit-inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    message,
                    consent,
                    attachments: attachmentUrl,
                    website: honeypot,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');

            setSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setConsent(false);
        setAttachmentUrl(null);
        setFileName(null);
        setError(null);
        setSuccess(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
                        <span className="text-white font-bold text-lg">L</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Submit an Inquiry</CardTitle>
                        <CardDescription>
                            Fill out the form below and we&apos;ll get back to you as soon as possible.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="flex flex-col items-center text-center py-6 gap-4">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                <div>
                                    <p className="text-lg font-semibold text-foreground">Thank you!</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your inquiry has been submitted. We&apos;ll be in touch soon.
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handleReset} className="mt-2">
                                    Submit another inquiry
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <p className="text-sm text-red-500">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                                        Phone Number
                                    </label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="message" className="block text-sm font-medium text-foreground">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell us how we can help you..."
                                        required
                                        rows={4}
                                        className="flex w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    />
                                </div>

                                {/* File Attachment */}
                                <div className="space-y-1.5">
                                    <span className="block text-sm font-medium text-foreground">
                                        Attachment
                                    </span>
                                    {uploading ? (
                                        <div className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-secondary px-3 py-4 text-sm text-muted">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Uploading {fileName}...</span>
                                        </div>
                                    ) : attachmentUrl && fileName ? (
                                        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <span className="truncate text-foreground">{fileName}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="text-muted hover:text-red-500 transition-colors shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="attachment"
                                            className="flex items-center justify-center gap-2 w-full rounded-md border border-dashed border-border bg-secondary px-3 py-4 text-sm text-muted cursor-pointer hover:border-accent hover:text-foreground transition-colors"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                            <span>Click to attach a file</span>
                                            <input
                                                id="attachment"
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                                                className="sr-only"
                                            />
                                        </label>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        JPG, PNG, WebP, PDF, DOC up to 5 MB
                                    </p>
                                </div>

                                {/* Honeypot: hidden from humans, bots fill it */}
                                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                                    <label htmlFor="website">Website</label>
                                    <input
                                        id="website"
                                        type="text"
                                        name="website"
                                        value={honeypot}
                                        onChange={(e) => setHoneypot(e.target.value)}
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="flex items-start gap-3">
                                    <input
                                        id="consent"
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        required
                                        className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
                                    />
                                    <label htmlFor="consent" className="text-sm text-muted-foreground">
                                        I agree to be contacted regarding my inquiry. <span className="text-red-500">*</span>
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || uploading}
                                    size="lg"
                                    className="w-full"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            Submit Inquiry
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
