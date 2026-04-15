import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { PAGINATION } from '@/lib/constants'
import type { PaginationMeta } from '@/types/common.types'

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
    const isFirstPage = pagination.page <= 1
    const isLastPage = pagination.total_pages === 0 || pagination.page >= pagination.total_pages

    return (
        <div className="mt-4 flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div>
                Hiển thị trang <span className="font-semibold text-slate-900">{pagination.page}</span>
                {' / '}
                <span className="font-semibold text-slate-900">
                    {pagination.total_pages || 1}
                </span>
                {' · '}
                Tổng <span className="font-semibold text-slate-900">{pagination.total}</span> bản ghi
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={String(pagination.limit)}
                    className="w-[92px]"
                    onChange={(event) => onLimitChange(Number(event.target.value))}
                >
                    {PAGINATION.LIMIT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}/trang
                        </option>
                    ))}
                </Select>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-200"
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={isFirstPage}
                >
                    <ChevronLeft className="size-4" />
                    Trước
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-200"
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={isLastPage}
                >
                    Sau
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    )
}