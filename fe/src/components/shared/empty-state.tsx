import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
    title: string
    description: string
    icon?: LucideIcon
}

export function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
}: EmptyStateProps) {
    return (
        <div className="rounded-[1.5rem] border border-dashed border-green-200 bg-green-50/50 px-6 py-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-green-700 shadow-sm">
                <Icon className="size-5" />
            </div>
            <h3 className="mt-4 font-display text-2xl text-slate-950">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
        </div>
    )
}