import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { ConfirmDialog } from '@/features/dormitory/components/confirm-dialog'
import {
  DataTable,
  LoadingState,
  PageHeader,
  PaginationControls,
  SectionCard,
  StatusBadge,
  type TableColumn,
} from '@/features/dormitory/components/dormitory-ui'
import {
  useCreateInvoice,
  useInvoices,
  usePayInvoice,
  useRegistrations,
} from '@/hooks/useDormitory'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { INVOICE_STATUS_LABELS, getRoomDisplayName, uniqueApprovedRegistrations } from '@/lib/dormitory'
import {
  createInvoiceSchema,
  type CreateInvoiceFormValues,
} from '@/lib/validations/dormitory.schema'
import { PAGINATION } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types/common.types'

export const Route = createFileRoute('/staff/invoices')({
  component: StaffInvoices,
})

function StaffInvoices() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGINATION.DEFAULT_LIMIT)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [payTarget, setPayTarget] = useState<Invoice | null>(null)

  const { data, isPending } = useInvoices({ page, limit })
  const { data: registrationsData } = useRegistrations({ page: 1, limit: 100 })
  const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice()
  const { mutate: payInvoice, isPending: isPaying } = usePayInvoice()
  const toast = useToast()

  const approvedRegistrations = uniqueApprovedRegistrations(registrationsData?.items ?? [])

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const form = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      student_id: '',
      room_id: 0,
      month: currentMonth,
      year: currentYear,
      electricity_used_kwh: 0,
      water_used_m3: 0,
      due_date: '',
    },
  })

  const handleStudentChange = (studentId: string) => {
    const reg = approvedRegistrations.find((r) => r.student.id === studentId)
    if (reg) {
      form.setValue('student_id', studentId)
      form.setValue('room_id', reg.room.id)
    }
  }

  const onCreateSubmit = (values: CreateInvoiceFormValues) => {
    createInvoice(values, {
      onSuccess: () => {
        toast.success('Tạo hóa đơn thành công', 'Hóa đơn đã được tạo và gửi đến sinh viên.')
        setIsCreateOpen(false)
        form.reset()
      },
      onError: (err) => {
        toast.error('Lỗi tạo hóa đơn', err instanceof Error ? err.message : 'Vui lòng thử lại.')
      },
    })
  }

  const handleConfirmPay = () => {
    if (!payTarget) return
    payInvoice(payTarget.id, {
      onSuccess: () => {
        toast.success('Xác nhận thanh toán thành công', `Hóa đơn tháng ${payTarget.month}/${payTarget.year} đã được ghi nhận.`)
        setPayTarget(null)
      },
      onError: (err) => {
        toast.error('Lỗi', err instanceof Error ? err.message : 'Không thể xác nhận thanh toán.')
      },
    })
  }

  const columns: TableColumn<Invoice>[] = [
    {
      key: 'student',
      header: 'Sinh viên',
      render: (inv) => (
        <div>
          <p className="font-medium">{inv.student.full_name}</p>
          <p className="text-xs text-slate-500">{inv.student.student_code}</p>
        </div>
      ),
    },
    {
      key: 'room',
      header: 'Phòng',
      render: (inv) => <span>{getRoomDisplayName(inv.room)}</span>,
    },
    {
      key: 'period',
      header: 'Kỳ',
      render: (inv) => <span>T{inv.month}/{inv.year}</span>,
    },
    {
      key: 'total',
      header: 'Tổng tiền',
      render: (inv) => <span className="font-semibold">{formatCurrency(Number(inv.total_amount))}</span>,
    },
    {
      key: 'due_date',
      header: 'Hạn nộp',
      render: (inv) => <span>{formatDate(inv.due_date)}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (inv) => <StatusBadge status={inv.status} label={INVOICE_STATUS_LABELS[inv.status]} />,
    },
    {
      key: 'actions',
      header: '',
      render: (inv) =>
        inv.status === 'unpaid' ? (
          <Button size="sm" onClick={() => setPayTarget(inv)}>
            Xác nhận thu tiền
          </Button>
        ) : (
          <span className="text-xs text-slate-400">{inv.paid_at ? formatDate(inv.paid_at) : '—'}</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cán bộ quản lý"
        title="Quản lý hóa đơn"
        description="Tạo hóa đơn tháng và xác nhận thanh toán từ sinh viên."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" />
            Tạo hóa đơn
          </Button>
        }
      />

      <SectionCard title="Danh sách hóa đơn">
        {isPending ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={data?.items ?? []}
              getRowKey={(i) => i.id}
              emptyTitle="Chưa có hóa đơn"
              emptyDescription="Hãy tạo hóa đơn tháng cho sinh viên đang ở."
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

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo hóa đơn tháng</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sinh viên</FormLabel>
                    <FormControl>
                      <Select
                        className="h-10 w-full"
                        value={field.value}
                        onChange={(e) => handleStudentChange(e.target.value)}
                      >
                        <option value="">Chọn sinh viên</option>
                        {approvedRegistrations.map((reg) => (
                          <option key={reg.student.id} value={reg.student.id}>
                            {reg.student.full_name} ({reg.student.student_code}) — {getRoomDisplayName(reg.room)}
                          </option>
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
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tháng</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm</FormLabel>
                      <FormControl>
                        <Input type="number" min="2000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="electricity_used_kwh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điện (kWh)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="water_used_m3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nước (m³)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hạn thanh toán</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Đang tạo...' : 'Tạo hóa đơn'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirm Pay Dialog */}
      <ConfirmDialog
        open={!!payTarget}
        onOpenChange={(open) => !open && setPayTarget(null)}
        title="Xác nhận thu tiền"
        description={
          payTarget
            ? `Xác nhận sinh viên ${payTarget.student.full_name} đã thanh toán hóa đơn tháng ${payTarget.month}/${payTarget.year} — ${formatCurrency(Number(payTarget.total_amount))}?`
            : ''
        }
        confirmLabel="Xác nhận thanh toán"
        isPending={isPaying}
        onConfirm={handleConfirmPay}
        tone="default"
      />
    </div>
  )
}
