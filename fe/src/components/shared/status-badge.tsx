import { STATUS_TONE_MAP } from '@/lib/dormitory'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
    status: string
    label: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                STATUS_TONE_MAP[status] ?? 'bg-slate-100 text-slate-700 ring-slate-200',
            )}
        >
            {label}
        </span>
    )
}