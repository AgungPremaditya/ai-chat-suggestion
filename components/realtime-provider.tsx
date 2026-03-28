'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { ToastContainer, type ToastData } from '@/components/ui/toast';

interface RealtimeContextValue {
    unreadCount: number;
    resetUnread: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
    unreadCount: 0,
    resetUnread: () => {},
});

export function useRealtimeContext() {
    return useContext(RealtimeContext);
}

const MAX_TOASTS = 3;

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

    const resetUnread = useCallback(() => setUnreadCount(0), []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts((prev) => {
            const next = [...prev, { ...toast, id }];
            // Keep max 3 toasts — drop oldest if over limit
            return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
        });
    }, []);

    useEffect(() => {
        const supabase = createClient();

        // Check auth first
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setIsAuthenticated(true);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session?.user);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const supabase = createClient();

        const channel = supabase
            .channel('inquiries-inserts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'inquiries' },
                (payload) => {
                    const inquiry = payload.new as {
                        id: string;
                        name: string;
                        message: string;
                    };

                    setUnreadCount((c) => c + 1);

                    addToast({
                        icon: '📥',
                        title: `New inquiry from ${inquiry.name}`,
                        message: inquiry.message?.slice(0, 60) || undefined,
                        href: `/dashboard/inquiries/${inquiry.id}`,
                    });
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [isAuthenticated, addToast]);

    return (
        <RealtimeContext.Provider value={{ unreadCount, resetUnread }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </RealtimeContext.Provider>
    );
}
