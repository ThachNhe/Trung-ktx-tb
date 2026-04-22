import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'

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
import { useRegistrations, useUsers, useCreateUser } from '@/hooks/useDormitory'
import {
  GENDER_LABELS,
  NATIONALITY_LABELS,
  REGISTRATION_STATUS_LABELS,
  getRoomDisplayName,
  uniqueApprovedRegistrations,
} from '@/lib/dormitory'
import { PAGINATION } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Registration, User } from '@/types/common.types'
import type { CreateUserPayload } from '@/types/api.types'

export const Route = createFileRoute('/admin/students')({
  component: AdminStudents,
})

const ROLE_LABELS: Record<string, string> = {
  student: 'Sinh viên',
  staff: 'Nhân viên',
  admin: 'Quản trị viên',
}

// ─── Create User Modal ──────────────────────────────────────────────────────
function CreateUserModal({ onClose }: { onClose: () => void }) {
  const { mutate, isPending, error } = useCreateUser()
  const [form, setForm] = useState<CreateUserPayload>({
    full_name: '',
    student_code: '',
    email: '',
    phone: '',
    role: 'student',
    gender: 'male',
    nationality: 'vietnam',
  })
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(
      { ...form, phone: form.phone || null },
      { onSuccess: () => setSuccess(true) },
    )
  }

  const field = (label: string, key: keyof CreateUserPayload, type = 'text', required = true) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
        value={(form[key] as string) ?? ''}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  )

  const select = (label: string, key: keyof CreateUserPayload, options: { value: string; label: string }[]) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        required
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
        value={(form[key] as string) ?? ''}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Tạo tài khoản mới</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">✉️</span>
            </div>
            <p className="mb-1 font-semibold text-slate-900">Tạo tài khoản thành công!</p>
            <p className="text-sm text-slate-500">
              Thông tin đăng nhập đã được gửi tới{' '}
              <strong className="text-slate-700">{form.email}</strong> qua email.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-xl bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {field('Họ và tên', 'full_name')}
            {field('Mã sinh viên / nhân viên', 'student_code')}
            {field('Email', 'email', 'email')}
            {field('Số điện thoại', 'phone', 'tel', false)}
            <div className="grid grid-cols-2 gap-4">
              {select('Vai trò', 'role', [
                { value: 'student', label: 'Sinh viên' },
                { value: 'staff', label: 'Nhân viên' },
              ])}
              {select('Giới tính', 'gender', [
                { value: 'male', label: 'Nam' },
                { value: 'female', label: 'Nữ' },
                { value: 'other', label: 'Khác' },
              ])}
            </div>
            {select('Quốc tịch', 'nationality', [
              { value: 'vietnam', label: 'Việt Nam' },
              { value: 'laos', label: 'Lào' },
            ])}
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error.message}</p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
              >
                {isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Tab: All Users ─────────────────────────────────────────────────────────
function AllUsersTab() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isPending, error } = useUsers({ page, limit })

  const filtered = (data?.items ?? []).filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.student_code.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

  const columns: TableColumn<User>[] = [
    {
      key: 'full_name',
      header: 'Người dùng',
      render: (u) => (
        <div>
          <p className="font-semibold text-slate-900">{u.full_name}</p>
          <p className="text-xs text-slate-500">{u.student_code}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => <span className="text-sm text-slate-600">{u.email}</span>,
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (u) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
          u.role === 'admin' ? 'bg-purple-100 text-purple-700'
          : u.role === 'staff' ? 'bg-blue-100 text-blue-700'
          : 'bg-green-100 text-green-700'
        }`}>
          {ROLE_LABELS[u.role] ?? u.role}
        </span>
      ),
    },
    {
      key: 'gender',
      header: 'Giới tính',
      render: (u) => <span>{GENDER_LABELS[u.gender]}</span>,
    },
    {
      key: 'nationality',
      header: 'Quốc tịch',
      render: (u) => <span>{NATIONALITY_LABELS[u.nationality]}</span>,
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      render: (u) => <span className="text-sm text-slate-500">{formatDate(u.created_at)}</span>,
    },
  ]

  return (
    <>
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
      <SectionCard
        title="Danh sách tài khoản"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
          >
            <UserPlus size={15} />
            Tạo tài khoản
          </button>
        }
      >
        <div className="mb-4">
          <input
            type="text"
            className="h-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            placeholder="Tìm theo tên, mã hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              data={filtered}
              getRowKey={(u) => u.id}
              emptyTitle="Không có tài khoản"
              emptyDescription="Chưa có tài khoản nào trong hệ thống."
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
    </>
  )
}

// ─── Tab: Dormitory Residents ────────────────────────────────────────────────
function ResidentsTab() {
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
    { key: 'email', header: 'Email', render: (reg) => <span className="text-slate-600">{reg.student.email}</span> },
    { key: 'gender', header: 'Giới tính', render: (reg) => <span>{GENDER_LABELS[reg.student.gender]}</span> },
    { key: 'nationality', header: 'Quốc tịch', render: (reg) => <span>{NATIONALITY_LABELS[reg.student.nationality]}</span> },
    { key: 'room', header: 'Phòng', render: (reg) => <span>{getRoomDisplayName(reg.room)}</span> },
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
    <SectionCard title="Danh sách sinh viên nội trú">
      <div className="mb-4">
        <input
          type="text"
          className="h-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
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
            emptyDescription="Không có sinh viên nội trú nào phù hợp."
          />
          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1) }}
          />
        </div>
      )}
    </SectionCard>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
type Tab = 'accounts' | 'residents'

function AdminStudents() {
  const [tab, setTab] = useState<Tab>('accounts')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản trị viên"
        title="Quản lý Sinh viên & Nhân viên"
        description="Tạo tài khoản và theo dõi sinh viên nội trú."
      />

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit">
        {(
          [
            { key: 'accounts', label: 'Tài khoản hệ thống' },
            { key: 'residents', label: 'Sinh viên nội trú' },
          ] as { key: Tab; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'accounts' ? <AllUsersTab /> : <ResidentsTab />}
    </div>
  )
}
