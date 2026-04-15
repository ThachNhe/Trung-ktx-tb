import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
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
import { useBuildings, useCreateBuilding } from '@/hooks/useDormitory'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BUILDING_STATUS_LABELS } from '@/lib/dormitory'
import {
  createBuildingSchema,
  type CreateBuildingFormValues,
} from '@/lib/validations/dormitory.schema'
import { PAGINATION } from '@/lib/constants'
import type { Building } from '@/types/common.types'

export const Route = createFileRoute('/admin/buildings')({
  component: AdminBuildings,
})

const BUILDING_CODES = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'] as const

function AdminBuildings() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGINATION.DEFAULT_LIMIT)
  const [isOpen, setIsOpen] = useState(false)

  const { data, isPending } = useBuildings({ page, limit })
  const { mutate: createBuilding, isPending: isCreating } = useCreateBuilding()
  const toast = useToast()

  const form = useForm<CreateBuildingFormValues>({
    resolver: zodResolver(createBuildingSchema),
    defaultValues: {
      name: 'K1',
      total_floors: 1,
      description: '',
      status: 'active',
    },
  })

  const onSubmit = (values: CreateBuildingFormValues) => {
    createBuilding(values, {
      onSuccess: () => {
        toast.success('Tạo tòa nhà thành công', `Tòa ${values.name} đã được thêm vào hệ thống.`)
        setIsOpen(false)
        form.reset()
      },
      onError: (err) => {
        toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể tạo tòa nhà.')
      },
    })
  }

  const columns: TableColumn<Building>[] = [
    {
      key: 'name',
      header: 'Tòa nhà',
      render: (b) => <span className="font-semibold text-slate-900">{b.name}</span>,
    },
    {
      key: 'floors',
      header: 'Số tầng',
      render: (b) => <span>{b.total_floors} tầng</span>,
    },
    {
      key: 'description',
      header: 'Mô tả',
      render: (b) => <span className="text-slate-600">{b.description ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (b) => <StatusBadge status={b.status} label={BUILDING_STATUS_LABELS[b.status]} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản trị viên"
        title="Quản lý tòa nhà"
        description="Thêm và quản lý thông tin các tòa nhà ký túc xá."
        action={
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="size-4" />
            Thêm tòa nhà
          </Button>
        }
      />

      <SectionCard title="Danh sách tòa nhà">
        {isPending ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={data?.items ?? []}
              getRowKey={(b) => b.id}
              emptyTitle="Chưa có tòa nhà"
              emptyDescription="Hãy thêm tòa nhà đầu tiên để bắt đầu quản lý."
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
            <DialogTitle>Thêm tòa nhà mới</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã tòa nhà</FormLabel>
                    <FormControl>
                      <Select className="h-10 w-full" {...field}>
                        {BUILDING_CODES.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_floors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tầng</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
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
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Thông tin thêm về tòa nhà..." rows={3} {...field} />
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
                        {Object.entries(BUILDING_STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Đang tạo...' : 'Tạo tòa nhà'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
