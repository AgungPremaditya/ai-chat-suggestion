import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn('bg-secondary animate-pulse rounded', className)} />
    );
}
