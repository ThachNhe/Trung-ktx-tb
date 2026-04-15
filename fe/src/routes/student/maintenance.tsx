import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

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
import { useCreateMaintenance, useMaintenance, useRegistrations } from '@/hooks/useDormitory'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MAINTENANCE_STATUS_LABELS, getCurrentRegistration, getRoomDisplayName } from '@/lib/dormitory'
import {
  createMaintenanceSchema,
  type CreateMaintenanceFormValues,
} from '@/lib/validations/dormitory.schema'
import { PAGINATION } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { MaintenanceRequest } from '@/types/common.types'

export const Route = createFileRoute('/student/maintenance')({
  component: StudentMaintenance,
})

const columns: TableColumn<MaintenanceRequest>[] = [
  {
    key: 'title',
    header: 'Tiêu đề',
    render: (m) => (
      <div>
        <p className="font-medium text-slate-900">{m.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{m.description}</p>
      </div>
    ),
  },
  {
    key: 'room',
    header: 'Phòng',
    render: (m) => <span>{getRoomDisplayName(m.room)}</span>,
  },
  {
    key: 'created_at',
    header: 'Ngày gửi',
    render: (m) => <span>{formatDate(m.created_at)}</span>,
  },
  {
    key: 'resolved_at',
    header: 'Ngày hoàn tất',
    render: (m) => <span>{m.resolved_at ? formatDate(m.resolved_at) : '—'}</span>,
  },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (m) => <StatusBadge status={m.status} label={MAINTENANCE_STATUS_LABELS[m.status]} />,
  },
]

function StudentMaintenance() {
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT)

  const { data: registrationsData, error: registrationsError } = useRegistrations({ page: 1, limit: 100 })
  const { data, isPending, error } = useMaintenance({ page, limit })
  const { mutate: createMaintenance, isPending: isCreating } = useCreateMaintenance()
  const toast = useToast()

  const currentRegistration = getCurrentRegistration(registrationsData?.items ?? [])

  const form = useForm<CreateMaintenanceFormValues>({
    resolver: zodResolver(createMaintenanceSchema) as any,
    defaultValues: {
      room_id: currentRegistration?.room.id ?? 0,
      title: '',
      description: '',
    },
  })

  const handleOpen = () => {
    if (!currentRegistration) {
      toast.warning('Chưa có phòng', 'Bạn cần được duyệt đơn đăng ký phòng trước.')
      return
    }
    form.reset({ room_id: currentRegistration.room.id, title: '', description: '' })
    setIsOpen(true)
  }

  const onSubmit = (values: CreateMaintenanceFormValues) => {
    createMaintenance(values, {
      onSuccess: () => {
        toast.success('Gửi yêu cầu thành công', 'Yêu cầu bảo trì của bạn đã được gửi đi.')
        setIsOpen(false)
        form.reset()
      },
      onError: (err) => {
        toast.error('Gửi thất bại', err instanceof Error ? err.message : 'Vui lòng thử lại.')
      },
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sinh viên"
        title="Yêu cầu bảo trì"
        description="Gửi và theo dõi yêu cầu bảo trì phòng ở của bạn."
        action={
          <Button onClick={handleOpen}>
            <Plus className="size-4" />
            Gửi yêu cầu mới
          </Button>
        }
      />

      <SectionCard title="Danh sách yêu cầu">
        {error || registrationsError ? (
          <ErrorState description={(error ?? registrationsError)?.message} />
        ) : isPending ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={data?.items ?? []}
              getRowKey={(m) => m.id}
              emptyTitle="Chưa có yêu cầu bảo trì"
              emptyDescription="Bạn chưa gửi yêu cầu bảo trì nào."
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gửi yêu cầu bảo trì</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {currentRegistration && (
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200">
                  Phòng: <span className="font-semibold">{getRoomDisplayName(currentRegistration.room)}</span>
                </div>
              )}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Đèn phòng bị hỏng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả vấn đề cần bảo trì..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
