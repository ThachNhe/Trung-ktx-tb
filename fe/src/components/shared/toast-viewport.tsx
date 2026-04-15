import { CheckCircle2, Info, OctagonAlert, TriangleAlert, X } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/useUIStore'

const toneMap = {
    success: {
        wrapper: 'border-green-200 bg-white text-slate-900',
        icon: 'bg-green-100 text-green-700',
        Icon: CheckCircle2,
    },
    error: {
        wrapper: 'border-rose-200 bg-white text-slate-900',
        icon: 'bg-rose-100 text-rose-700',
        Icon: OctagonAlert,
    },
    warning: {
        wrapper: 'border-amber-200 bg-white text-slate-900',
        icon: 'bg-amber-100 text-amber-700',
        Icon: TriangleAlert,
    },
    info: {
        wrapper: 'border-sky-200 bg-white text-slate-900',
        icon: 'bg-sky-100 text-sky-700',
        Icon: Info,
    },
} as const

function ToastItem({
    id,
    title,
    description,
    type,
}: {
    id: string
    title: string
    description?: string
    type: 'success' | 'error' | 'warning' | 'info'
}) {
    const removeToast = useUIStore((state) => state.removeToast)
    const tone = toneMap[type]

    useEffect(() => {
        const timeoutId = window.setTimeout(() => removeToast(id), 4200)
        return () => window.clearTimeout(timeoutId)
    }, [id, removeToast])

    return (
        <div
            className={cn(
                'animate-slide-in-right flex w-full items-start gap-3 rounded-[1.25rem] border px-4 py-4 shadow-lg shadow-slate-900/5',
                tone.wrapper,
            )}
        >
            <div className={cn('mt-0.5 flex size-10 items-center justify-center rounded-2xl', tone.icon)}>
                <tone.Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">{title}</p>
                {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
            </div>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-slate-500 hover:bg-slate-100"
                onClick={() => removeToast(id)}
            >
                <X className="size-4" />
            </Button>
        </div>
    )
}

export function ToastViewport() {
    const toasts = useUIStore((state) => state.toasts)

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem {...toast} />
                </div>
            ))}
        </div>
    )
}