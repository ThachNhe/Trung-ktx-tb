import { createFileRoute } from '@tanstack/react-router'
import { ClipboardList, BedDouble, Receipt } from 'lucide-react'

import {
    LoadingState,
    MetricCard,
    PageHeader,
    SectionCard,
    StatusBadge,
} from '@/features/dormitory/components/dormitory-ui'
import { useAllRooms, useInvoices, useRegistrations } from '@/hooks/useDormitory'
import {
    INVOICE_STATUS_LABELS,
    REGISTRATION_STATUS_LABELS,
    getRoomDisplayName,
} from '@/lib/dormitory'
import { formatCurrency, formatDate } from '@/lib/utils'

export const Route = createFileRoute('/staff/dashboard')({
    component: StaffDashboard,
})

function StaffDashboard() {
    const { rooms, isLoading: isLoadingRooms } = useAllRooms('all')
    const { data: registrationsData, isPending: isLoadingRegistrations } = useRegistrations({ page: 1, limit: 5 })
    const { data: invoicesData, isPending: isLoadingInvoices } = useInvoices({ page: 1, limit: 5 })

    const allRegistrations = registrationsData?.items ?? []
    const allInvoices = invoicesData?.items ?? []

    const availableRooms = rooms.filter((r) => r.status === 'available').length
    const pendingRegistrations = allRegistrations.filter((r) => r.status === 'pending').length
    const unpaidInvoices = allInvoices.filter((i) => i.status === 'unpaid').length

    if (isLoadingRooms || isLoadingRegistrations) return <LoadingState />

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Cán bộ quản lý"
                title="Tổng quan"
                description="Thống kê nhanh về tình hình phòng ở, đơn đăng ký và hóa đơn."
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                    title="Phòng còn trống"
                    value={String(availableRooms)}
                    description={`/ ${rooms.length} phòng đang hoạt động`}
                    icon={BedDouble}
                />
                <MetricCard
                    title="Đơn chờ duyệt"
                    value={String(pendingRegistrations)}
                    description="Đơn đăng ký chưa được xử lý"
                    icon={ClipboardList}
                />
                <MetricCard
                    title="Hóa đơn chưa thu"
                    value={String(unpaidInvoices)}
                    description="Hóa đơn trong trang hiện tại"
                    icon={Receipt}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Đơn đăng ký mới nhất" description="5 đơn gần đây">
                    {isLoadingRegistrations ? (
                        <LoadingState />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {allRegistrations.map((reg) => (
                                <div key={reg.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{reg.student.full_name}</p>
                                        <p className="text-xs text-slate-500">
                                            {getRoomDisplayName(reg.room)} · {formatDate(reg.created_at)}
                                        </p>
                                    </div>
                                    <StatusBadge status={reg.status} label={REGISTRATION_STATUS_LABELS[reg.status]} />
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Hóa đơn gần đây" description="5 hóa đơn mới nhất">
                    {isLoadingInvoices ? (
                        <LoadingState />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {allInvoices.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{inv.student.full_name}</p>
                                        <p className="text-xs text-slate-500">
                                            Tháng {inv.month}/{inv.year} · {formatCurrency(Number(inv.total_amount))}
                                        </p>
                                    </div>
                                    <StatusBadge status={inv.status} label={INVOICE_STATUS_LABELS[inv.status]} />
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    )
}
