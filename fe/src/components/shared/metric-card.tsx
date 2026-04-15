import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
    label: string
    value: string
    helper: string
    icon: LucideIcon
}

export function MetricCard({ label, value, helper, icon: Icon }: MetricCardProps) {
    return (
        <Card className="border-white/70 bg-white/92 shadow-[0_24px_60px_-42px_rgba(20,83,45,0.55)]">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-700">
                        {label}
                    </p>
                    <CardTitle className="mt-3 font-display text-4xl text-slate-950">{value}</CardTitle>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                    <Icon className="size-5" />
                </div>
            </CardHeader>
            <CardContent className="pt-4 text-sm leading-6 text-slate-600">{helper}</CardContent>
        </Card>
    )
}