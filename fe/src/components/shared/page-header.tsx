import type { ReactNode } from 'react'

interface PageHeaderProps {
    eyebrow?: string
    title: string
    description: string
    actions?: ReactNode
}

export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
                {eyebrow ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-700">
                        {eyebrow}
                    </p>
                ) : null}
                <h1 className="mt-2 font-display text-4xl text-slate-950">{title}</h1>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
    )
}