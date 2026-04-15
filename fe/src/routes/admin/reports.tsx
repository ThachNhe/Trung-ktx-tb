import { createFileRoute } from '@tanstack/react-router'
import {
  Banknote,
  Building2,
  Download,
  ReceiptText,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  DataTable,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHeader,
  SectionCard,
  type TableColumn,
} from '@/features/dormitory/components/dormitory-ui'
import { useMonthlyReport } from '@/hooks/useDormitory'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import type { MonthlyReportBuildingItem } from '@/types/api.types'

export const Route = createFileRoute('/admin/reports')({
  component: AdminReports,
})

const MONTH_OPTIONS = [
  { value: 1, label: 'Tháng 1' },
  { value: 2, label: 'Tháng 2' },
  { value: 3, label: 'Tháng 3' },
  { value: 4, label: 'Tháng 4' },
  { value: 5, label: 'Tháng 5' },
  { value: 6, label: 'Tháng 6' },
  { value: 7, label: 'Tháng 7' },
  { value: 8, label: 'Tháng 8' },
  { value: 9, label: 'Tháng 9' },
  { value: 10, label: 'Tháng 10' },
  { value: 11, label: 'Tháng 11' },
  { value: 12, label: 'Tháng 12' },
] as const

function AdminReports() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)

  const { data, isPending, error } = useMonthlyReport({ month, year })

  const report = data
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

  const handleExport = () => {
    if (!report || typeof window === 'undefined') return

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `bao-cao-thang-${report.year}-${String(report.month).padStart(2, '0')}.json`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  const columns: TableColumn<MonthlyReportBuildingItem>[] = [
    {
      key: 'building',
      header: 'Tòa nhà',
      render: (item) => <span className="font-semibold text-slate-900">{item.building_name}</span>,
    },
    {
      key: 'rooms',
      header: 'Phòng',
      render: (item) => <span>{item.total_rooms}</span>,
    },
    {
      key: 'capacity',
      header: 'Sức chứa',
      render: (item) => <span>{item.occupied_beds}/{item.total_capacity}</span>,
    },
    {
      key: 'rate',
      header: 'Tỷ lệ lấp đầy',
      render: (item) => <span className="font-semibold text-emerald-700">{item.occupancy_rate}%</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản trị viên"
        title="Báo cáo tháng"
        description="Theo dõi tổng thu và tỷ lệ lấp đầy phòng theo từng tòa nhà trong tháng đã chọn."
        action={
          <Button onClick={handleExport} disabled={!report}>
            <Download className="size-4" />
            Xuất báo cáo
          </Button>
        }
      />

      <SectionCard title="Bộ lọc báo cáo" description="Chọn tháng và năm để xem số liệu tổng hợp.">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tháng</label>
            <Select className="h-9 w-36" value={String(month)} onChange={(event) => setMonth(Number(event.target.value))}>
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Năm</label>
            <Select className="h-9 w-28" value={String(year)} onChange={(event) => setYear(Number(event.target.value))}>
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <div className="ml-auto text-sm text-slate-500">
            {report ? `Dữ liệu tháng ${report.month}/${report.year}` : 'Đang chờ dữ liệu báo cáo'}
          </div>
        </div>
      </SectionCard>

      {error ? (
        <ErrorState description={error.message} />
      ) : isPending || !report ? (
        <LoadingState label="Đang tổng hợp báo cáo tháng..." rows={3} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Tổng thu"
              value={formatCurrency(Number(report.total_revenue))}
              description="Chỉ tính các hóa đơn đã thanh toán"
              icon={Banknote}
            />
            <MetricCard
              title="Hóa đơn đã thu"
              value={String(report.paid_invoices)}
              description={`${report.unpaid_invoices} hóa đơn chưa thu`}
              icon={ReceiptText}
            />
            <MetricCard
              title="Tỷ lệ lấp đầy"
              value={`${report.occupancy_rate}%`}
              description={`${report.occupied_beds}/${report.total_capacity} chỗ đã sử dụng`}
              icon={TrendingUp}
            />
            <MetricCard
              title="Tòa nhà có dữ liệu"
              value={String(report.building_reports.length)}
              description="Tổng số tòa được đưa vào báo cáo"
              icon={Building2}
            />
          </div>

          <SectionCard
            title={`Tỷ lệ lấp đầy theo tòa nhà - Tháng ${report.month}/${report.year}`}
            description="Biểu đồ cho biết mức độ sử dụng sức chứa của từng tòa nhà."
          >
            {report.building_reports.length === 0 ? (
              <div className="py-8">
                <p className="text-sm text-slate-500">Chưa có tòa nhà nào để hiển thị biểu đồ.</p>
              </div>
            ) : (
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.building_reports} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="building_name" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Tỷ lệ lấp đầy']}
                      labelFormatter={(label) => `Tòa ${label}`}
                    />
                    <Bar dataKey="occupancy_rate" fill="#15803d" radius={[12, 12, 0, 0]}>
                      <LabelList dataKey="occupancy_rate" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Chi tiết theo tòa nhà" description="Số phòng, sức chứa và tỷ lệ lấp đầy của từng tòa.">
            <DataTable
              columns={columns}
              data={report.building_reports}
              getRowKey={(item) => item.building_id}
              emptyTitle="Chưa có dữ liệu"
              emptyDescription="Không có tòa nhà nào trong báo cáo tháng này."
            />
          </SectionCard>
        </>
      )}
    </div>
  )
}
