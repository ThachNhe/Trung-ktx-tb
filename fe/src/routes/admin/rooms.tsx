import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

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
  useAllRooms,
  useCreateRoom,
  useUpdateRoomStatus,
} from '@/hooks/useDormitory'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  ROOM_STATUS_LABELS,
  ROOM_TYPE_LABELS,
  getRoomDisplayName,
} from '@/lib/dormitory'
import {
  createRoomSchema,
  type CreateRoomFormValues,
} from '@/lib/validations/dormitory.schema'
import { PAGINATION } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { Room, RoomStatus } from '@/types/common.types'

export const Route = createFileRoute('/admin/rooms')({
  component: AdminRooms,
})

function AdminRooms() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | 'all'>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<{ room: Room; status: RoomStatus } | null>(null)

  const { buildingsQuery, rooms, isLoading, error } = useAllRooms(selectedBuildingId)
  const buildings = buildingsQuery.data?.items ?? []
  const { mutate: createRoom, isPending: isCreating } = useCreateRoom()
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateRoomStatus()
  const toast = useToast()

  // Client-side pagination
  const [page, setPage] = useState(1)
  const limit = PAGINATION.DEFAULT_LIMIT
  const paginated = rooms.slice((page - 1) * limit, page * limit)
  const pagination = {
    page,
    limit,
    total: rooms.length,
    total_pages: Math.max(1, Math.ceil(rooms.length / limit)),
  }

  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema) as any,
    defaultValues: {
      building_id: 0,
      room_number: '',
      floor: 1,
      capacity: 4,
      room_type: 'male',
      price_per_month: 0,
      status: 'available',
    },
  })

  const onCreateSubmit = (values: CreateRoomFormValues) => {
    createRoom(values, {
      onSuccess: () => {
        toast.success('Tạo phòng thành công', 'Phòng mới đã được thêm vào hệ thống.')
        setIsCreateOpen(false)
        form.reset()
      },
      onError: (err) => {
        toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể tạo phòng.')
      },
    })
  }

  const handleStatusUpdate = () => {
    if (!statusTarget) return
    updateStatus(
      { roomId: statusTarget.room.id, payload: { status: statusTarget.status } },
      {
        onSuccess: () => {
          toast.success('Cập nhật thành công', `Phòng ${getRoomDisplayName(statusTarget.room, buildings)} đã được cập nhật.`)
          setStatusTarget(null)
        },
        onError: (err) => {
          toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể cập nhật.')
        },
      }
    )
  }

  const columns: TableColumn<Room>[] = [
    {
      key: 'name',
      header: 'Phòng',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{getRoomDisplayName(r, buildings)}</p>
          <p className="text-xs text-slate-500">Tầng {r.floor}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loại',
      render: (r) => <span>{ROOM_TYPE_LABELS[r.room_type]}</span>,
    },
    {
      key: 'capacity',
      header: 'Sức chứa',
      render: (r) => <span>{r.current_occupancy}/{r.capacity}</span>,
    },
    {
      key: 'price',
      header: 'Giá/tháng',
      render: (r) => <span>{formatCurrency(Number(r.price_per_month))}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (r) => <StatusBadge status={r.status} label={ROOM_STATUS_LABELS[r.status]} />,
    },
    {
      key: 'actions',
      header: 'Đổi trạng thái',
      render: (r) => (
        <Select
          className="h-9 w-36"
          value={r.status}
          onChange={(e) => setStatusTarget({ room: r, status: e.target.value as RoomStatus })}
        >
          {Object.entries(ROOM_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản trị viên"
        title="Quản lý phòng"
        description="Xem, thêm và cập nhật thông tin phòng ở ký túc xá."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" />
            Thêm phòng
          </Button>
        }
      />

      <SectionCard
        title="Danh sách phòng"
        action={
          <Select
            className="h-9 w-36"
            value={selectedBuildingId === 'all' ? 'all' : String(selectedBuildingId)}
            onChange={(e) =>
              setSelectedBuildingId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
          >
            <option value="all">Tất cả tòa</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        }
      >
        {error ? (
          <ErrorState description={error.message} />
        ) : isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={paginated}
              getRowKey={(r) => r.id}
              emptyTitle="Chưa có phòng"
              emptyDescription="Hãy thêm phòng đầu tiên cho tòa nhà này."
            />
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={() => setPage(1)}
            />
          </div>
        )}
      </SectionCard>

      {/* Create room dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm phòng mới</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="building_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tòa nhà</FormLabel>
                    <FormControl>
                      <Select className="h-10 w-full" value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value))}>
                        <option value="0">Chọn tòa nhà</option>
                        {buildings.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="room_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số phòng</FormLabel>
                      <FormControl>
                        <Input placeholder="101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tầng</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sức chứa</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_per_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá/tháng (VNĐ)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="room_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại phòng</FormLabel>
                      <FormControl>
                        <Select className="h-10 w-full" {...field}>
                          {Object.entries(ROOM_TYPE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <FormControl>
                        <Select className="h-10 w-full" {...field}>
                          {Object.entries(ROOM_STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Đang tạo...' : 'Thêm phòng'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirm status update dialog */}
      <ConfirmDialog
        open={!!statusTarget}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title="Cập nhật trạng thái phòng"
        description={
          statusTarget
            ? `Đổi trạng thái phòng ${getRoomDisplayName(statusTarget.room, buildings)} sang "${ROOM_STATUS_LABELS[statusTarget.status]}"?`
            : ''
        }
        confirmLabel="Xác nhận"
        isPending={isUpdating}
        onConfirm={handleStatusUpdate}
        tone="default"
      />
    </div>
  )
}
