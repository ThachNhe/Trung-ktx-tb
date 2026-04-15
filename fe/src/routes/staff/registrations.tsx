import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { ConfirmDialog } from '@/features/dormitory/components/confirm-dialog'
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
import {
    useApproveRegistration,
    useRejectRegistration,
    useRegistrations,
} from '@/hooks/useDormitory'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { REGISTRATION_STATUS_LABELS, getRoomDisplayName } from '@/lib/dormitory'
import { PAGINATION } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Registration } from '@/types/common.types'

export const Route = createFileRoute('/staff/registrations')({
    component: StaffRegistrations,
})

function StaffRegistrations() {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [confirmAction, setConfirmAction] = useState<{
        type: 'approve' | 'reject'
        registration: Registration
    } | null>(null)

    const { data, isPending, error } = useRegistrations({ page, limit })
    const { mutate: approve, isPending: isApproving } = useApproveRegistration()
    const { mutate: reject, isPending: isRejecting } = useRejectRegistration()
    const toast = useToast()

    const allItems = data?.items ?? []
    const filtered = statusFilter === 'all' ? allItems : allItems.filter((r) => r.status === statusFilter)

    const handleConfirm = () => {
        if (!confirmAction) return
        const { type, registration } = confirmAction

        if (type === 'approve') {
            approve(registration.id, {
                onSuccess: () => {
                    toast.success('Đã duyệt đơn', `Đơn của ${registration.student.full_name} đã được duyệt.`)
                    setConfirmAction(null)
                },
                onError: (err) => {
                    toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể duyệt đơn.')
                },
            })
        } else {
            reject(registration.id, {
                onSuccess: () => {
                    toast.success('Đã từ chối đơn', `Đơn của ${registration.student.full_name} đã bị từ chối.`)
                    setConfirmAction(null)
                },
                onError: (err) => {
                    toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể từ chối đơn.')
                },
            })
        }
    }

    const columns: TableColumn<Registration>[] = [
        {
            key: 'student',
            header: 'Sinh viên',
            render: (reg) => (
                <div>
                    <p className="font-medium text-slate-900">{reg.student.full_name}</p>
                    <p className="text-xs text-slate-500">{reg.student.student_code}</p>
                </div>
            ),
        },
        {
            key: 'room',
            header: 'Phòng',
            render: (reg) => <span>{getRoomDisplayName(reg.room)}</span>,
        },
        {
            key: 'period',
            header: 'Thời gian',
            render: (reg) => (
                <div className="text-xs">
                    <p>{formatDate(reg.start_date)}</p>
                    <p className="text-slate-500">→ {formatDate(reg.end_date)}</p>
                </div>
            ),
        },
        {
            key: 'submitted',
            header: 'Ngày gửi',
            render: (reg) => <span>{formatDate(reg.created_at)}</span>,
        },
        {
            key: 'status',
            header: 'Trạng thái',
            render: (reg) => <StatusBadge status={reg.status} label={REGISTRATION_STATUS_LABELS[reg.status]} />,
        },
        {
            key: 'actions',
            header: '',
            render: (reg) =>
                reg.status === 'pending' ? (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => setConfirmAction({ type: 'approve', registration: reg })}
                        >
                            Duyệt
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-300 text-rose-700 hover:bg-rose-50"
                            onClick={() => setConfirmAction({ type: 'reject', registration: reg })}
                        >
                            Từ chối
                        </Button>
                    </div>
                ) : null,
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Cán bộ quản lý"
                title="Duyệt đơn đăng ký"
                description="Xem xét và phê duyệt các đơn đăng ký ký túc xá của sinh viên."
            />

            <SectionCard
                title="Danh sách đơn đăng ký"
                action={
                    <Select
                        className="h-9 w-44"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả</option>
                        {Object.entries(REGISTRATION_STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </Select>
                }
            >
                {error ? (
                    <ErrorState description={error.message} />
                ) : isPending ? (
                    <LoadingState />
                ) : (
                    <div className="space-y-4">
                        <DataTable
                            columns={columns}
                            data={filtered}
                            getRowKey={(r) => r.id}
                            emptyTitle="Không có đơn nào"
                            emptyDescription="Hiện chưa có đơn đăng ký nào phù hợp."
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

            <ConfirmDialog
                open={!!confirmAction}
                onOpenChange={(open) => !open && setConfirmAction(null)}
                title={confirmAction?.type === 'approve' ? 'Xác nhận duyệt đơn' : 'Xác nhận từ chối đơn'}
                description={
                    confirmAction?.type === 'approve'
                        ? `Duyệt đơn đăng ký phòng ${getRoomDisplayName(confirmAction.registration.room)} của sinh viên ${confirmAction?.registration.student.full_name}?`
                        : `Từ chối đơn đăng ký của sinh viên ${confirmAction?.registration.student.full_name}?`
                }
                confirmLabel={confirmAction?.type === 'approve' ? 'Duyệt đơn' : 'Từ chối'}
                tone={confirmAction?.type === 'approve' ? 'default' : 'destructive'}
                isPending={isApproving || isRejecting}
                onConfirm={handleConfirm}
            />
        </div>
    )
}
