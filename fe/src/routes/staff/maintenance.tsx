import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
    DataTable,
    LoadingState,
    PageHeader,
    PaginationControls,
    SectionCard,
    StatusBadge,
    type TableColumn,
} from '@/features/dormitory/components/dormitory-ui'
import { useMaintenance, useUpdateMaintenanceStatus } from '@/hooks/useDormitory'
import { useToast } from '@/hooks/useToast'
import { Select } from '@/components/ui/select'
import { MAINTENANCE_STATUS_LABELS, getRoomDisplayName } from '@/lib/dormitory'
import { PAGINATION } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { MaintenanceRequest, MaintenanceRequestStatus } from '@/types/common.types'

export const Route = createFileRoute('/staff/maintenance')({
    component: StaffMaintenance,
})

function StaffMaintenance() {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(PAGINATION.DEFAULT_LIMIT)

    const { data, isPending } = useMaintenance({ page, limit })
    const { mutate: updateStatus } = useUpdateMaintenanceStatus()
    const toast = useToast()

    const handleStatusChange = (maintenanceId: number, status: MaintenanceRequestStatus) => {
        updateStatus(
            { maintenanceId, payload: { status } },
            {
                onSuccess: () => {
                    toast.success('Cập nhật thành công', `Trạng thái đã được đổi sang "${MAINTENANCE_STATUS_LABELS[status]}".`)
                },
                onError: (err) => {
                    toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể cập nhật.')
                },
            }
        )
    }

    const columns: TableColumn<MaintenanceRequest>[] = [
        {
            key: 'student',
            header: 'Sinh viên',
            render: (m) => (
                <div>
                    <p className="font-medium text-slate-900">{m.student.full_name}</p>
                    <p className="text-xs text-slate-500">{m.student.student_code}</p>
                </div>
            ),
        },
        {
            key: 'room',
            header: 'Phòng',
            render: (m) => <span>{getRoomDisplayName(m.room)}</span>,
        },
        {
            key: 'title',
            header: 'Nội dung yêu cầu',
            render: (m) => (
                <div>
                    <p className="font-medium text-slate-900">{m.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{m.description}</p>
                </div>
            ),
        },
        {
            key: 'created_at',
            header: 'Ngày gửi',
            render: (m) => <span>{formatDate(m.created_at)}</span>,
        },
        {
            key: 'status',
            header: 'Trạng thái',
            render: (m) => <StatusBadge status={m.status} label={MAINTENANCE_STATUS_LABELS[m.status]} />,
        },
        {
            key: 'actions',
            header: 'Cập nhật',
            render: (m) => (
                <Select
                    className="h-9 w-40"
                    value={m.status}
                    onChange={(e) => handleStatusChange(m.id, e.target.value as MaintenanceRequestStatus)}
                >
                    {Object.entries(MAINTENANCE_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </Select>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Cán bộ quản lý"
                title="Yêu cầu bảo trì"
                description="Xem và cập nhật trạng thái xử lý các yêu cầu bảo trì từ sinh viên."
            />

            <SectionCard title="Danh sách yêu cầu">
                {isPending ? (
                    <LoadingState />
                ) : (
                    <div className="space-y-4">
                        <DataTable
                            columns={columns}
                            data={data?.items ?? []}
                            getRowKey={(m) => m.id}
                            emptyTitle="Chưa có yêu cầu bảo trì"
                            emptyDescription="Không có yêu cầu nào từ sinh viên."
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
