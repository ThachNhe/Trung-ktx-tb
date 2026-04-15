import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Filter } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
    DataTable,
    ErrorState,
    LoadingState,
    PageHeader,
    SectionCard,
    StatusBadge,
    type TableColumn,
} from '@/features/dormitory/components/dormitory-ui'
import { useAvailableRooms, useBuildings, useCreateRegistration } from '@/hooks/useDormitory'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ROOM_STATUS_LABELS, ROOM_TYPE_LABELS, getRoomDisplayName } from '@/lib/dormitory'
import {
    createRegistrationSchema,
    type CreateRegistrationFormValues,
} from '@/lib/validations/dormitory.schema'
import { formatCurrency } from '@/lib/utils'
import type { Room } from '@/types/common.types'

export const Route = createFileRoute('/student/rooms')({
    component: StudentRooms,
})

function StudentRooms() {
    const [selectedBuildingId, setSelectedBuildingId] = useState<number | 'all'>('all')
    const [registerRoom, setRegisterRoom] = useState<Room | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { data: availableRoomsData, isPending: isLoadingRooms, error: roomsError } =
        useAvailableRooms({ page: 1, limit: 100 })
    const { data: buildingsData, isPending: isLoadingBuildings, error: buildingsError } = useBuildings({
        page: 1,
        limit: 100,
    })
    const rooms = availableRoomsData?.items ?? []
    const buildings = buildingsData?.items ?? []
    const { mutate: createRegistration, isPending } = useCreateRegistration()
    const toast = useToast()

    const form = useForm<CreateRegistrationFormValues>({
        resolver: zodResolver(createRegistrationSchema) as any,
        defaultValues: { room_id: 0, start_date: '', end_date: '' },
    })

    const filteredRooms = rooms.filter((room) =>
        selectedBuildingId === 'all' ? true : room.building_id === selectedBuildingId,
    )

    if (roomsError || buildingsError) {
        return (
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Sinh viên"
                    title="Danh sách phòng còn trống"
                    description="Chọn phòng phù hợp và gửi đơn đăng ký. Hệ thống chỉ hiển thị phòng hợp lệ với giới tính và quốc tịch của bạn."
                />
                <ErrorState description={roomsError?.message ?? buildingsError?.message} />
            </div>
        )
    }

    const handleRegister = (room: Room) => {
        setRegisterRoom(room)
        form.reset({ room_id: room.id, start_date: '', end_date: '' })
        setIsDialogOpen(true)
    }

    const onSubmit = (values: CreateRegistrationFormValues) => {
        createRegistration(values, {
            onSuccess: () => {
                toast.success('Đăng ký thành công', 'Đơn đăng ký của bạn đang chờ xét duyệt.')
                setIsDialogOpen(false)
                form.reset()
            },
            onError: (err) => {
                toast.error('Đăng ký thất bại', err instanceof Error ? err.message : 'Vui lòng thử lại.')
            },
        })
    }

    const columns: TableColumn<Room>[] = [
        {
            key: 'room',
            header: 'Phòng',
            render: (room) => (
                <div>
                    <p className="font-semibold text-slate-900">{getRoomDisplayName(room, buildings)}</p>
                    <p className="text-xs text-slate-500">Tầng {room.floor}</p>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Loại phòng',
            render: (room) => <span>{ROOM_TYPE_LABELS[room.room_type]}</span>,
        },
        {
            key: 'capacity',
            header: 'Sức chứa',
            render: (room) => (
                <span>
                    {room.current_occupancy}/{room.capacity} chỗ
                </span>
            ),
        },
        {
            key: 'price',
            header: 'Giá/tháng',
            render: (room) => <span className="font-medium">{formatCurrency(Number(room.price_per_month))}</span>,
        },
        {
            key: 'status',
            header: 'Trạng thái',
            render: (room) => <StatusBadge status={room.status} label={ROOM_STATUS_LABELS[room.status]} />,
        },
        {
            key: 'action',
            header: '',
            render: (room) => (
                <Button size="sm" onClick={() => handleRegister(room)} disabled={room.status !== 'available'}>
                    Đăng ký
                </Button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Sinh viên"
                title="Danh sách phòng còn trống"
                description="Chọn phòng phù hợp và gửi đơn đăng ký. Hệ thống chỉ hiển thị phòng hợp lệ với giới tính và quốc tịch của bạn."
            />

            <SectionCard
                title="Bộ lọc"
                action={
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Filter className="size-4" />
                        <span>{filteredRooms.length} phòng</span>
                    </div>
                }
            >
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tòa nhà</label>
                        <Select
                            className="h-9 w-40"
                            value={selectedBuildingId === 'all' ? 'all' : String(selectedBuildingId)}
                            onChange={(e) =>
                                setSelectedBuildingId(e.target.value === 'all' ? 'all' : Number(e.target.value))
                            }
                        >
                            <option value="all">Tất cả tòa</option>
                            {buildings.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                </div>
            </SectionCard>

            <SectionCard title="Phòng còn trống">
                {isLoadingRooms || isLoadingBuildings ? (
                    <LoadingState />
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredRooms}
                        getRowKey={(r) => r.id}
                        emptyTitle="Không có phòng trống"
                        emptyDescription="Hiện tại không có phòng nào phù hợp với bộ lọc của bạn."
                    />
                )}
            </SectionCard>

            {/* Register dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Đăng ký phòng {registerRoom ? getRoomDisplayName(registerRoom, buildings) : ''}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày bắt đầu</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày kết thúc</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
