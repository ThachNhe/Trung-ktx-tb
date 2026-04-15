import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface DataColumn<T> {
    header: string
    render: (item: T, index: number) => ReactNode
    className?: string
    headerClassName?: string
}

interface DataTableProps<T> {
    columns: DataColumn<T>[]
    data: T[]
    rowKey: (item: T, index: number) => string | number
    emptyState?: ReactNode
    className?: string
}

export function DataTable<T>({
    columns,
    data,
    rowKey,
    emptyState,
    className,
}: DataTableProps<T>) {
    return (
        <div className={cn('overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90', className)}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50/90 text-xs uppercase tracking-[0.16em] text-slate-500">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.header}
                                    className={cn('px-4 py-3 font-semibold', column.headerClassName)}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {data.length ? (
                            data.map((item, index) => (
                                <tr key={rowKey(item, index)} className="align-top hover:bg-green-50/40">
                                    {columns.map((column) => (
                                        <td key={column.header} className={cn('px-4 py-4', column.className)}>
                                            {column.render(item, index)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10">
                                    {emptyState ?? (
                                        <div className="text-center text-sm text-slate-500">
                                            Chưa có dữ liệu để hiển thị.
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}