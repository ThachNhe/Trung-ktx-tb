import { type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { PAGINATION } from '@/lib/constants'
import { STATUS_TONE_MAP } from '@/lib/dormitory'
import { cn, formatNumber } from '@/lib/utils'
import type { PaginationMeta } from '@/types/common.types'

interface PageHeaderProps {
    title: string
    description: string
    action?: ReactNode
    eyebrow?: string
}

export function PageHeader({
    title,
    description,
    action,
    eyebrow,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/88 px-6 py-6 shadow-[0_24px_80px_-40px_rgba(21,128,61,0.38)] backdrop-blur sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
                {eyebrow ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-700">
                        {eyebrow}
                    </p>
                ) : null}
                <h1 className="mt-2 font-display text-3xl text-slate-950 sm:text-4xl">
                    {title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                    {description}
                </p>
            </div>

            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    )
}

interface MetricCardProps {
    title: string
    value: string
    description: string
    icon: LucideIcon
}

export function MetricCard({
    title,
    value,
    description,
    icon: Icon,
}: MetricCardProps) {
    return (
        <Card className="overflow-hidden border-white/70 bg-white/90 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.22)] backdrop-blur">
            <CardHeader className="gap-4 pb-0">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardDescription className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">
                            {title}
                        </CardDescription>
                        <CardTitle className="mt-3 text-3xl font-semibold text-slate-950">
                            {value}
                        </CardTitle>
                    </div>

                    <div className="flex size-12 items-center justify-center rounded-2xl bg-green-100 text-green-800 ring-1 ring-green-200">
                        <Icon className="size-5" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm leading-6 text-slate-600">{description}</p>
            </CardContent>
        </Card>
    )
}

interface SectionCardProps {
    title: string
    description?: string
    action?: ReactNode
    children: ReactNode
    className?: string
}

export function SectionCard({
    title,
    description,
    action,
    children,
    className,
}: SectionCardProps) {
    return (
        <Card className={cn('border-white/70 bg-white/90 backdrop-blur', className)}>
            <CardHeader>
                <div>
                    <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
                    {description ? (
                        <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                            {description}
                        </CardDescription>
                    ) : null}
                </div>
                {action ? <CardAction>{action}</CardAction> : null}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}

interface EmptyStateProps {
    title: string
    description: string
    action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="rounded-[1.5rem] border border-dashed border-green-200 bg-green-50/60 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-slate-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
        </div>
    )
}

interface LoadingStateProps {
    label?: string
}

export function LoadingState({
    label = 'Đang tải dữ liệu từ hệ thống...',
}: LoadingStateProps) {
    return (
        <Card className="border-white/70 bg-white/90">
            <CardContent className="py-10 text-center text-sm text-slate-600">
                {label}
            </CardContent>
        </Card>
    )
}

interface StatusBadgeProps {
    status: string
    label?: string
    className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                STATUS_TONE_MAP[status] ?? 'bg-slate-100 text-slate-700 ring-slate-200',
                className,
            )}
        >
            {label ?? status}
        </span>
    )
}

export interface TableColumn<T> {
    key: string
    header: string
    className?: string
    cellClassName?: string
    render: (item: T) => ReactNode
}

interface DataTableProps<T> {
    columns: TableColumn<T>[]
    data: T[]
    getRowKey: (item: T) => string | number
    emptyTitle?: string
    emptyDescription?: string
}

export function DataTable<T>({
    columns,
    data,
    getRowKey,
    emptyTitle = 'Chưa có dữ liệu',
    emptyDescription = 'Không có bản ghi phù hợp với điều kiện hiện tại.',
}: DataTableProps<T>) {
    return (
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200/80 text-left">
                    <thead className="bg-slate-50/90">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500',
                                        column.className,
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 bg-white">
                        {data.length ? (
                            data.map((item) => (
                                <tr key={getRowKey(item)} className="align-top">
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={cn('px-4 py-4 text-sm text-slate-700', column.cellClassName)}
                                        >
                                            {column.render(item)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10">
                                    <EmptyState title={emptyTitle} description={emptyDescription} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

interface PaginationControlsProps {
    pagination: PaginationMeta
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
}

export function PaginationControls({
    pagination,
    onPageChange,
    onLimitChange,
}: PaginationControlsProps) {
    const hasItems = pagination.total > 0
    const startIndex = hasItems ? (pagination.page - 1) * pagination.limit + 1 : 0
    const endIndex = hasItems
        ? Math.min(pagination.page * pagination.limit, pagination.total)
        : 0

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-600">
                Hiển thị <span className="font-semibold text-slate-900">{startIndex}-{endIndex}</span>
                {' / '}
                <span className="font-semibold text-slate-900">{formatNumber(pagination.total)}</span>
                {' bản ghi'}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Số dòng</span>
                    <Select
                        className="h-9 w-24 bg-white"
                        value={String(pagination.limit)}
                        onChange={(event) => onLimitChange(Number(event.target.value))}
                    >
                        {PAGINATION.LIMIT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => onPageChange(pagination.page - 1)}
                    >
                        <ChevronLeft className="size-4" />
                        Trước
                    </Button>

                    <span className="min-w-24 text-center text-sm font-medium text-slate-700">
                        Trang {pagination.page}/{Math.max(pagination.total_pages, 1)}
                    </span>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.total_pages || pagination.total_pages === 0}
                        onClick={() => onPageChange(pagination.page + 1)}
                    >
                        Sau
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface OccupancyItem {
    building: string
    occupiedBeds: number
    totalCapacity: number
    rate: number
}

interface OccupancyChartProps {
    items: OccupancyItem[]
}

export function OccupancyChart({ items }: OccupancyChartProps) {
    if (!items.length) {
        return (
            <EmptyState
                title="Chưa có dữ liệu công suất"
                description="Hãy thêm tòa nhà và phòng để biểu đồ tỷ lệ lấp đầy xuất hiện."
            />
        )
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.building} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-slate-950">{item.building}</p>
                            <p className="text-slate-500">
                                {item.occupiedBeds}/{item.totalCapacity} chỗ đã sử dụng
                            </p>
                        </div>
                        <span className="font-semibold text-green-800">{item.rate}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#166534_0%,#22c55e_100%)] transition-[width] duration-500"
                            style={{ width: `${Math.min(item.rate, 100)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}