import { createFileRoute } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
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
    useCheckoutRegistration,
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
        type: 'approve' | 'reject' | 'checkout'
        registration: Registration
    } | null>(null)

    const { data, isPending, error } = useRegistrations({ page, limit })
    const { mutate: approve, isPending: isApproving } = useApproveRegistration()
    const { mutate: reject, isPending: isRejecting } = useRejectRegistration()
    const { mutate: checkout, isPending: isCheckingOut } = useCheckoutRegistration()
    const toast = useToast()

    const allItems = data?.items ?? []
    const filtered = statusFilter === 'all' ? allItems : allItems.filter((r) => r.status === statusFilter)

    const getConfirmContent = () => {
        if (!confirmAction) {
            return {
                title: '',
                description: '',
                confirmLabel: '',
            }
        }

        const { type, registration } = confirmAction
        const studentName = registration.student.full_name
        const roomName = getRoomDisplayName(registration.room)

        switch (type) {
            case 'approve':
                return {
                    title: 'Xác nhận duyệt đơn',
                    description: `Duyệt đơn đăng ký phòng ${roomName} của sinh viên ${studentName}?`,
                    confirmLabel: 'Duyệt đơn',
                }
            case 'reject':
                return {
                    title: 'Xác nhận từ chối đơn',
                    description: `Từ chối đơn đăng ký của sinh viên ${studentName}?`,
                    confirmLabel: 'Từ chối',
                }
            case 'checkout':
                return {
                    title: 'Xác nhận trả phòng',
                    description: `Xác nhận sinh viên ${studentName} trả phòng ${roomName}?`,
                    confirmLabel: 'Trả phòng',
                }
        }
    }

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
            return
        }

        if (type === 'reject') {
            reject(registration.id, {
                onSuccess: () => {
                    toast.success('Đã từ chối đơn', `Đơn của ${registration.student.full_name} đã bị từ chối.`)
                    setConfirmAction(null)
                },
                onError: (err) => {
                    toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể từ chối đơn.')
                },
            })
            return
        }

        checkout(registration.id, {
            onSuccess: () => {
                toast.success('Đã trả phòng', `${registration.student.full_name} đã được cập nhật trả phòng.`)
                setConfirmAction(null)
            },
            onError: (err) => {
                toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể trả phòng.')
            },
        })
    }

    const confirmContent = getConfirmContent()

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
            render: (reg) => {
                if (reg.status === 'pending') {
                    return (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() =>
                                    setConfirmAction({
                                        type: 'approve',
                                        registration: reg,
                                    })
                                }
                            >
                                Duyệt
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-rose-300 text-rose-700 hover:bg-rose-50"
                                onClick={() =>
                                    setConfirmAction({
                                        type: 'reject',
                                        registration: reg,
                                    })
                                }
                            >
                                Từ chối
                            </Button>
                        </div>
                    )
                }

                if (reg.status === 'approved') {
                    return (
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-sky-300 text-sky-700 hover:bg-sky-50"
                            onClick={() =>
                                setConfirmAction({
                                    type: 'checkout',
                                    registration: reg,
                                })
                            }
                        >
                            <LogOut className="size-4" />
                            Trả phòng
                        </Button>
                    )
                }

                return null
            },
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Cán bộ quản lý"
                title="Quản lý đăng ký phòng"
                description="Xem xét đơn đăng ký ký túc xá và xử lý trả phòng cho sinh viên."
            />

            <SectionCard
                title="Danh sách đơn đăng ký"
                action={
                    <Select className="h-9 w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        {Object.entries(REGISTRATION_STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>
                                {v}
                            </option>
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
                                onLimitChange={(l) => {
                                    setLimit(l)
                                    setPage(1)
                                }}
                            />
                        )}
                    </div>
                )}
            </SectionCard>

            <ConfirmDialog
                open={!!confirmAction}
                onOpenChange={(open) => !open && setConfirmAction(null)}
                title={confirmContent.title}
                description={confirmContent.description}
                confirmLabel={confirmContent.confirmLabel}
                tone={confirmAction?.type === 'reject' ? 'destructive' : 'default'}
                isPending={isApproving || isRejecting || isCheckingOut}
                onConfirm={handleConfirm}
            />
        </div>
    )
}
