import { createFileRoute } from '@tanstack/react-router'
import { BedDouble, Bell, Receipt } from 'lucide-react'

import {
  EmptyState,
  LoadingState,
  MetricCard,
  PageHeader,
  SectionCard,
  StatusBadge,
} from '@/features/dormitory/components/dormitory-ui'
import {
  useInvoices,
  useMaintenance,
  useNotifications,
  useRegistrations,
} from '@/hooks/useDormitory'
import {
  INVOICE_STATUS_LABELS,
  MAINTENANCE_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  getCurrentRegistration,
  getRoomDisplayName,
} from '@/lib/dormitory'
import { formatCurrency, formatDate } from '@/lib/utils'

export const Route = createFileRoute('/student/dashboard')({
  component: StudentDashboard,
})

function StudentDashboard() {
  const { data: registrationsData, isPending: isLoadingRegistrations } = useRegistrations({ page: 1, limit: 100 })
  const { data: invoicesData, isPending: isLoadingInvoices } = useInvoices({ page: 1, limit: 5 })
  const { data: maintenanceData, isPending: isLoadingMaintenance } = useMaintenance({ page: 1, limit: 5 })
  const { data: notificationsData, isPending: isLoadingNotifications } = useNotifications({ page: 1, limit: 5 })

  const registrations = registrationsData?.items ?? []
  const currentRegistration = getCurrentRegistration(registrations)
  const unpaidInvoices = (invoicesData?.items ?? []).filter((inv) => inv.status === 'unpaid')
  const pendingMaintenance = (maintenanceData?.items ?? []).filter((m) => m.status === 'pending')

  if (isLoadingRegistrations) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sinh viên"
        title="Tổng quan"
        description="Xem nhanh thông tin phòng, hóa đơn và yêu cầu bảo trì của bạn."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Phòng hiện tại"
          value={currentRegistration ? getRoomDisplayName(currentRegistration.room) : '—'}
          description={
            currentRegistration
              ? `Đến ${formatDate(currentRegistration.end_date)}`
              : 'Bạn chưa đăng ký phòng nào'
          }
          icon={BedDouble}
        />
        <MetricCard
          title="Hóa đơn chưa thanh toán"
          value={String(unpaidInvoices.length)}
          description={
            unpaidInvoices.length
              ? `Tổng: ${formatCurrency(unpaidInvoices.reduce((s, i) => s + Number(i.total_amount), 0))}`
              : 'Tất cả hóa đơn đã được thanh toán'
          }
          icon={Receipt}
        />
        <MetricCard
          title="Yêu cầu bảo trì đang chờ"
          value={String(pendingMaintenance.length)}
          description={pendingMaintenance.length ? 'Đang chờ xử lý' : 'Không có yêu cầu nào đang chờ'}
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Hóa đơn gần đây" description="5 hóa đơn mới nhất của bạn">
          {isLoadingInvoices ? (
            <LoadingState />
          ) : invoicesData?.items.length ? (
            <div className="divide-y divide-slate-100">
              {invoicesData.items.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Tháng {invoice.month}/{invoice.year}
                    </p>
                    <p className="text-xs text-slate-500">
                      Hạn: {formatDate(invoice.due_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(Number(invoice.total_amount))}
                    </span>
                    <StatusBadge status={invoice.status} label={INVOICE_STATUS_LABELS[invoice.status]} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có hóa đơn" description="Hóa đơn sẽ xuất hiện ở đây khi được tạo." />
          )}
        </SectionCard>

        <SectionCard title="Thông báo mới nhất" description="5 thông báo gần đây từ hệ thống">
          {isLoadingNotifications ? (
            <LoadingState />
          ) : notificationsData?.items.length ? (
            <div className="divide-y divide-slate-100">
              {notificationsData.items.map((note) => (
                <div key={note.id} className="py-3">
                  <p className="text-sm font-semibold text-slate-900">{note.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{note.content}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(note.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có thông báo" description="Thông báo từ nhà trường sẽ hiện ở đây." />
          )}
        </SectionCard>
      </div>

      {registrations.length > 0 && (
        <SectionCard title="Lịch sử đăng ký phòng" description="Toàn bộ lịch sử đăng ký ký túc xá của bạn">
          <div className="divide-y divide-slate-100">
            {registrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{getRoomDisplayName(reg.room)}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(reg.start_date)} → {formatDate(reg.end_date)}
                  </p>
                </div>
                <StatusBadge status={reg.status} label={REGISTRATION_STATUS_LABELS[reg.status]} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
