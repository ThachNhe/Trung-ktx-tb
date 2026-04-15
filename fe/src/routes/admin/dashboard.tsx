import { createFileRoute } from '@tanstack/react-router'
import { BedDouble, Building2, Users, TrendingUp } from 'lucide-react'

import {
    ErrorState,
    LoadingState,
    MetricCard,
    OccupancyChart,
    PageHeader,
    SectionCard,
} from '@/features/dormitory/components/dormitory-ui'
import { useAllRooms, useRegistrations } from '@/hooks/useDormitory'
import { buildOccupancyByBuilding, uniqueApprovedRegistrations } from '@/lib/dormitory'

export const Route = createFileRoute('/admin/dashboard')({
    component: AdminDashboard,
})

function AdminDashboard() {
    const { buildingsQuery, rooms, isLoading, error: roomsError } = useAllRooms('all')
    const { data: registrationsData, isPending: isLoadingReg, error: registrationsError } = useRegistrations({ page: 1, limit: 100 })

    const buildings = buildingsQuery.data?.items ?? []
    const allRegistrations = registrationsData?.items ?? []

    const occupiedStudents = uniqueApprovedRegistrations(allRegistrations).length
    const availableRooms = rooms.filter((r) => r.status === 'available').length
    const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0)
    const occupiedBeds = rooms.reduce((s, r) => s + r.current_occupancy, 0)
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0

    const occupancyItems = buildOccupancyByBuilding(buildings, rooms)

    if (roomsError || registrationsError) {
        return (
            <ErrorState
                description={(roomsError ?? registrationsError)?.message}
            />
        )
    }

    if (isLoading || isLoadingReg) return <LoadingState />

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Quản trị viên"
                title="Thống kê tổng quan"
                description="Cái nhìn toàn diện về hoạt động ký túc xá Đại học Tây Bắc."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Tổng tòa nhà"
                    value={String(buildings.length)}
                    description="Tòa nhà đang hoạt động"
                    icon={Building2}
                />
                <MetricCard
                    title="Phòng còn trống"
                    value={String(availableRooms)}
                    description={`/ ${rooms.length} tổng phòng`}
                    icon={BedDouble}
                />
                <MetricCard
                    title="Sinh viên nội trú"
                    value={String(occupiedStudents)}
                    description="Đang ở ký túc xá"
                    icon={Users}
                />
                <MetricCard
                    title="Tỷ lệ lấp đầy"
                    value={`${occupancyRate}%`}
                    description={`${occupiedBeds}/${totalCapacity} chỗ đã sử dụng`}
                    icon={TrendingUp}
                />
            </div>

            <SectionCard
                title="Tỷ lệ lấp đầy theo tòa nhà"
                description="Biểu đồ công suất sử dụng hiện tại của từng tòa nhà"
            >
                <OccupancyChart items={occupancyItems} />
            </SectionCard>
        </div>
    )
}
