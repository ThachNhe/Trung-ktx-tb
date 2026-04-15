import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  DataTable,
  LoadingState,
  PageHeader,
  PaginationControls,
  SectionCard,
  StatusBadge,
  type TableColumn,
} from '@/features/dormitory/components/dormitory-ui'
import { useCreateNotification, useNotifications } from '@/hooks/useDormitory'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { NOTIFICATION_ROLE_LABELS } from '@/lib/dormitory'
import {
  createNotificationSchema,
  type CreateNotificationFormValues,
} from '@/lib/validations/dormitory.schema'
import { PAGINATION } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { NotificationItem } from '@/types/common.types'

export const Route = createFileRoute('/admin/notifications')({
  component: AdminNotifications,
})

function AdminNotifications() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGINATION.DEFAULT_LIMIT)
  const [isOpen, setIsOpen] = useState(false)

  const { data, isPending } = useNotifications({ page, limit })
  const { mutate: createNotification, isPending: isSending } = useCreateNotification()
  const toast = useToast()

  const form = useForm<CreateNotificationFormValues>({
    resolver: zodResolver(createNotificationSchema),
    defaultValues: {
      title: '',
      content: '',
      target_role: 'all',
    },
  })

  const onSubmit = (values: CreateNotificationFormValues) => {
    createNotification(values, {
      onSuccess: () => {
        toast.success('Gửi thông báo thành công', `Thông báo "${values.title}" đã được gửi đi.`)
        setIsOpen(false)
        form.reset()
      },
      onError: (err) => {
        toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể gửi thông báo.')
      },
    })
  }

  const columns: TableColumn<NotificationItem>[] = [
    {
      key: 'title',
      header: 'Tiêu đề',
      render: (n) => (
        <div>
          <p className="font-semibold text-slate-900">{n.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{n.content}</p>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Đối tượng',
      render: (n) => <StatusBadge status={n.target_role} label={NOTIFICATION_ROLE_LABELS[n.target_role]} />,
    },
    {
      key: 'creator',
      header: 'Người tạo',
      render: (n) => <span>{n.creator_name}</span>,
    },
    {
      key: 'created_at',
      header: 'Ngày gửi',
      render: (n) => <span>{formatDate(n.created_at)}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản trị viên"
        title="Thông báo hệ thống"
        description="Tạo và gửi thông báo đến sinh viên, cán bộ hoặc toàn hệ thống."
        action={
          <Button onClick={() => setIsOpen(true)}>
            <Send className="size-4" />
            Tạo thông báo
          </Button>
        }
      />

      <SectionCard title="Danh sách thông báo đã gửi">
        {isPending ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={data?.items ?? []}
              getRowKey={(n) => n.id}
              emptyTitle="Chưa có thông báo"
              emptyDescription="Hãy tạo thông báo đầu tiên để gửi đến sinh viên và cán bộ."
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo thông báo mới</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="target_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đối tượng nhận</FormLabel>
                    <FormControl>
                      <Select className="h-10 w-full" {...field}>
                        {Object.entries(NOTIFICATION_ROLE_LABELS).map(([k, v]) => (
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề thông báo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nội dung chi tiết của thông báo..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isSending}>
                  <Send className="size-4" />
                  {isSending ? 'Đang gửi...' : 'Gửi thông báo'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
