import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

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
import { useRegistrations } from '@/hooks/useDormitory'
import {
  GENDER_LABELS,
  NATIONALITY_LABELS,
  REGISTRATION_STATUS_LABELS,
  getRoomDisplayName,
  uniqueApprovedRegistrations,
} from '@/lib/dormitory'
import { PAGINATION } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Registration } from '@/types/common.types'

export const Route = createFileRoute('/admin/students')({
  component: AdminStudents,
})

function AdminStudents() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT)
  const [search, setSearch] = useState('')

  const { data, isPending, error } = useRegistrations({ page: 1, limit: 100 })

  const approved = uniqueApprovedRegistrations(data?.items ?? [])
  const filtered = approved.filter((reg) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      reg.student.full_name.toLowerCase().includes(q) ||
      reg.student.student_code.toLowerCase().includes(q) ||
      reg.student.email.toLowerCase().includes(q)
    )
  })

  // Client-side pagination
  const paginated = filtered.slice((page - 1) * limit, page * limit)
  const pagination = {
    page,
    limit,
    total: filtered.length,
    total_pages: Math.max(1, Math.ceil(filtered.length / limit)),
  }

  const columns: TableColumn<Registration>[] = [
    {
      key: 'student',
      header: 'Sinh viên',
      render: (reg) => (
        <div>
          <p className="font-semibold text-slate-900">{reg.student.full_name}</p>
          <p className="text-xs text-slate-500">{reg.student.student_code}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (reg) => <span className="text-slate-600">{reg.student.email}</span>,
    },
    {
      key: 'gender',
      header: 'Giới tính',
      render: (reg) => <span>{GENDER_LABELS[reg.student.gender]}</span>,
    },
    {
      key: 'nationality',
      header: 'Quốc tịch',
      render: (reg) => <span>{NATIONALITY_LABELS[reg.student.nationality]}</span>,
    },
    {
      key: 'room',
      header: 'Phòng',
      render: (reg) => <span>{getRoomDisplayName(reg.room)}</span>,
    },
    {
      key: 'period',
      header: 'Thời gian ở',
      render: (reg) => (
        <div className="text-xs">
          <p>{formatDate(reg.start_date)}</p>
          <p className="text-slate-500">→ {formatDate(reg.end_date)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (reg) => <StatusBadge status={reg.status} label={REGISTRATION_STATUS_LABELS[reg.status]} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản trị viên"
        title="Sinh viên nội trú"
        description={`Danh sách ${approved.length} sinh viên đang ở ký túc xá.`}
      />

      <SectionCard title="Danh sách sinh viên nội trú">
        <div className="mb-4">
          <input
            type="text"
            className="h-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-0 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            placeholder="Tìm theo tên, mã SV hoặc email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        {error ? (
          <ErrorState description={error.message} />
        ) : isPending ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={paginated}
              getRowKey={(r) => r.id}
              emptyTitle="Không tìm thấy sinh viên"
              emptyDescription="Không có sinh viên nội trú nào phù hợp với từ khóa tìm kiếm."
            />
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1) }}
            />
          </div>
        )}
      </SectionCard>
    </div>
  )
}
