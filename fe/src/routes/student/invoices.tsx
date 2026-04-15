import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
    DataTable,
    ErrorState,
    LoadingState,
    PageHeader,
    PaginationControls,
    SectionCard,
    StatusBadge,
    type TableColumn,
} from '@/features/dormitory/components/dormitory-ui'
import { useInvoices } from '@/hooks/useDormitory'
import { INVOICE_STATUS_LABELS, getRoomDisplayName } from '@/lib/dormitory'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PAGINATION } from '@/lib/constants'
import type { Invoice } from '@/types/common.types'

export const Route = createFileRoute('/student/invoices')({
    component: StudentInvoices,
})

const columns: TableColumn<Invoice>[] = [
    {
        key: 'period',
        header: 'Kỳ',
        render: (inv) => (
            <span className="font-medium text-slate-900">
                Tháng {inv.month}/{inv.year}
            </span>
        ),
    },
    {
        key: 'room',
        header: 'Phòng',
        render: (inv) => <span>{getRoomDisplayName(inv.room)}</span>,
    },
    {
        key: 'room_fee',
        header: 'Tiền phòng',
        render: (inv) => <span>{formatCurrency(Number(inv.room_fee))}</span>,
    },
    {
        key: 'electricity',
        header: 'Điện',
        render: (inv) => (
            <div>
                <p>{formatCurrency(Number(inv.electricity_fee))}</p>
                <p className="text-xs text-slate-500">{Number(inv.electricity_used_kwh)} kWh</p>
            </div>
        ),
    },
    {
        key: 'water',
        header: 'Nước',
        render: (inv) => (
            <div>
                <p>{formatCurrency(Number(inv.water_fee))}</p>
                <p className="text-xs text-slate-500">{Number(inv.water_used_m3)} m³</p>
            </div>
        ),
    },
    {
        key: 'total',
        header: 'Tổng tiền',
        render: (inv) => (
            <span className="font-semibold text-slate-900">
                {formatCurrency(Number(inv.total_amount))}
            </span>
        ),
    },
    {
        key: 'due_date',
        header: 'Hạn nộp',
        render: (inv) => <span>{formatDate(inv.due_date)}</span>,
    },
    {
        key: 'status',
        header: 'Trạng thái',
        render: (inv) => <StatusBadge status={inv.status} label={INVOICE_STATUS_LABELS[inv.status]} />,
    },
]

function StudentInvoices() {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT)
    const { data, isPending, error } = useInvoices({ page, limit })

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Sinh viên"
                title="Hóa đơn của tôi"
                description="Danh sách tất cả hóa đơn tiền phòng, điện, nước của bạn."
            />

            <SectionCard title="Danh sách hóa đơn">
                {error ? (
                    <ErrorState description={error.message} />
                ) : isPending ? (
                    <LoadingState />
                ) : (
                    <div className="space-y-4">
                        <DataTable
                            columns={columns}
                            data={data?.items ?? []}
                            getRowKey={(i) => i.id}
                            emptyTitle="Chưa có hóa đơn"
                            emptyDescription="Hóa đơn sẽ xuất hiện ở đây sau khi được ban quản lý tạo."
                        />
                        {data?.pagination && (
                            <PaginationControls
                                pagination={data.pagination}
                                onPageChange={setPage}
                                onLimitChange={(l) => { setLimit(l); setPage(1) }}
                            />
                        )}
                    </div>
                )}
            </SectionCard>
        </div>
    )
}
