'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastData {
    id: string;
    icon?: string;
    title: string;
    message?: string;
    href?: string;
}

interface ToastItemProps {
    toast: ToastData;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger slide-in on mount
        const enterTimer = requestAnimationFrame(() => setVisible(true));

        // Auto-dismiss after 5s
        const dismissTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 5000);

        return () => {
            cancelAnimationFrame(enterTimer);
            clearTimeout(dismissTimer);
        };
    }, [toast.id, onDismiss]);

    const content = (
        <div
            className={cn(
                'flex items-start gap-3 w-80 p-4 rounded-lg border border-border bg-background shadow-lg',
                'transition-all duration-300 ease-out',
                visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            )}
        >
            {toast.icon && (
                <span className="text-lg shrink-0 mt-0.5">{toast.icon}</span>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-muted mt-0.5 truncate">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => onDismiss(toast.id), 300);
                }}
                className="p-0.5 rounded text-muted hover:text-foreground transition-colors shrink-0"
                aria-label="Dismiss"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );

    if (toast.href) {
        return (
            <Link href={toast.href} className="block hover:opacity-90 transition-opacity">
                {content}
            </Link>
        );
    }

    return content;
}

interface ToastContainerProps {
    toasts: ToastData[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastItem toast={t} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
}
