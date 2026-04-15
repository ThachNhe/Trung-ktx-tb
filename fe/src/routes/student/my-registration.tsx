import { createFileRoute } from '@tanstack/react-router'
import { ClipboardList } from 'lucide-react'

import {
    EmptyState,
    LoadingState,
    PageHeader,
    SectionCard,
    StatusBadge,
} from '@/features/dormitory/components/dormitory-ui'
import { useRegistrations } from '@/hooks/useDormitory'
import { REGISTRATION_STATUS_LABELS, getRoomDisplayName } from '@/lib/dormitory'
import { formatDate } from '@/lib/utils'

export const Route = createFileRoute('/student/my-registration')({
    component: StudentMyRegistration,
})

function StudentMyRegistration() {
    const { data, isPending } = useRegistrations({ page: 1, limit: 100 })
    const registrations = data?.items ?? []

    if (isPending) return <LoadingState />

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Sinh viên"
                title="Đơn đăng ký của tôi"
                description="Theo dõi trạng thái đơn đăng ký ký túc xá của bạn."
                action={
                    <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-800 ring-1 ring-green-200">
                        <ClipboardList className="size-4" />
                        {registrations.length} đơn
                    </div>
                }
            />

            {registrations.length === 0 ? (
                <SectionCard title="Lịch sử đăng ký">
                    <EmptyState
                        title="Chưa có đơn đăng ký"
                        description="Bạn chưa gửi đơn đăng ký phòng nào. Hãy vào trang Phòng còn trống để đăng ký."
                    />
                </SectionCard>
            ) : (
                <div className="space-y-4">
                    {registrations.map((reg) => (
                        <div
                            key={reg.id}
                            className="rounded-[1.5rem] border border-white/60 bg-white/90 p-6 shadow-sm backdrop-blur"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            {getRoomDisplayName(reg.room)}
                                        </h3>
                                        <StatusBadge status={reg.status} label={REGISTRATION_STATUS_LABELS[reg.status]} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-600">
                                        <div>
                                            <span className="font-medium">Ngày bắt đầu:</span>{' '}
                                            {formatDate(reg.start_date)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Ngày kết thúc:</span>{' '}
                                            {formatDate(reg.end_date)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Ngày gửi đơn:</span>{' '}
                                            {formatDate(reg.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {reg.status === 'pending' && (
                                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
                                    Đơn của bạn đang được xem xét. Vui lòng chờ thông báo từ ban quản lý ký túc xá.
                                </div>
                            )}
                            {reg.status === 'approved' && (
                                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
                                    Đơn đã được duyệt. Bạn có thể đến nhận phòng theo lịch đã đăng ký.
                                </div>
                            )}
                            {reg.status === 'rejected' && (
                                <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">
                                    Đơn đăng ký của bạn đã bị từ chối. Vui lòng liên hệ ban quản lý để biết thêm chi tiết.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
