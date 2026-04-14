import { useMemo, useState } from 'react'
import {
  BedDouble,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME } from '@/lib/constants'
import { useLogout, useMe } from '@/features/auths'
import { LoginForm } from '@/features/auths/components/LoginForm'
import { RegisterForm } from '@/features/auths/components/RegisterForm'
import { useAuthStore } from '@/stores/useAuthStore'

type AuthMode = 'login' | 'register'

const dashboardMetrics = [
  {
    label: 'Khu nhà',
    value: '2',
    hint: 'K1 và K2 đã được seed',
    icon: Building2,
  },
  {
    label: 'Phòng mẫu',
    value: '20',
    hint: 'Mỗi khu 10 phòng',
    icon: BedDouble,
  },
  {
    label: 'Người dùng mẫu',
    value: '8',
    hint: '1 admin, 2 staff, 5 sinh viên',
    icon: Users,
  },
]

const featureList = [
  'JWT lưu trong cookie HttpOnly',
  'FastAPI + SQLAlchemy + Alembic + PostgreSQL',
  'Seed sẵn dữ liệu khu K1, K2 và 20 phòng',
]

function AuthHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(160deg,#07111b_0%,#0f172a_55%,#123524_100%)] p-8 text-white shadow-[0_30px_100px_-40px_rgba(2,6,23,0.75)] lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.32),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.18),transparent_28%)]" />
      <div className="relative space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur">
          <Sparkles className="size-4 text-emerald-300" />
          Hệ thống quản lý ký túc xá dành cho Đại học Tây Bắc
        </div>

        <div className="space-y-4 max-w-2xl">
          <h1 className="font-display text-4xl leading-tight text-balance sm:text-5xl lg:text-6xl">
            {APP_NAME}
          </h1>
          <p className="max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            Một nền tảng vận hành thống nhất cho đăng nhập, quản lý phòng, hóa đơn, bảo trì và thông báo nội bộ. Giao diện này chỉ mới là lớp khởi tạo, nhưng toàn bộ nền backend đã sẵn sàng để mở rộng.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {featureList.map((feature) => (
            <div key={feature} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-white/90 backdrop-blur">
              {feature}
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {dashboardMetrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <Icon className="mb-4 size-5 text-emerald-300" />
                <div className="text-3xl font-semibold text-white">{metric.value}</div>
                <div className="mt-1 text-sm text-white/80">{metric.label}</div>
                <div className="mt-2 text-xs leading-5 text-white/60">{metric.hint}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function DashboardShell() {
  const user = useAuthStore((state) => state.user)
  const { mutate: logout, isPending } = useLogout()

  const cards = useMemo(
    () => [
      {
        title: 'Khu ở',
        description: '2 tòa nhà mẫu đã được seed',
        icon: Building2,
      },
      {
        title: 'Dịch vụ',
        description: 'Hóa đơn điện nước, bảo trì, thông báo',
        icon: BellRing,
      },
      {
        title: 'Vận hành',
        description: 'JWT cookie + refresh tự động',
        icon: ShieldCheck,
      },
    ],
    [],
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#eef6f1_100%)] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:36px_36px] opacity-60" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/70 bg-white/75 px-5 py-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Bảng điều khiển</p>
            <h2 className="mt-1 text-2xl font-display text-slate-950">Xin chào, {user?.full_name ?? 'sinh viên'}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 md:block">
              {user?.student_code ?? 'SV0000'} · {user?.role ?? 'student'}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => logout()}
              disabled={isPending}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="mr-2 size-4" />
              Đăng xuất
            </Button>
          </div>
        </header>

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="border-emerald-200/70 bg-white/90 shadow-lg backdrop-blur">
              <CardHeader className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="size-4" />
                  Phiên đăng nhập hợp lệ
                </div>
                <CardTitle className="font-display text-3xl text-slate-950">Hệ thống sẵn sàng quản lý vận hành</CardTitle>
                <CardDescription className="max-w-2xl text-slate-600">
                  Bạn đã vào được dashboard mẫu. Từ đây có thể mở rộng các màn hình đăng ký phòng, phê duyệt, thanh toán và bảo trì dựa trên schema backend đã tạo sẵn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {cards.map((card) => {
                    const Icon = card.icon
                    return (
                      <div key={card.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <Icon className="mb-4 size-5 text-emerald-700" />
                        <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 shadow-lg backdrop-blur">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-slate-950">Những gì đã được seed</CardTitle>
                <CardDescription>Data mẫu giúp bạn mở app và kiểm tra ngay luồng auth.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {[
                  { label: 'K1', value: '10 phòng · 5 tầng' },
                  { label: 'K2', value: '10 phòng · 5 tầng' },
                  { label: 'Người dùng', value: '1 admin · 2 staff · 5 sinh viên' },
                  { label: 'Auth', value: 'Access cookie + refresh cookie' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{item.label}</div>
                    <div className="mt-2 text-sm text-slate-700">{item.value}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200/80 bg-white/90 shadow-lg backdrop-blur">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-slate-950">Trạng thái tài khoản</CardTitle>
                <CardDescription>Xem nhanh dữ liệu session hiện tại.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Sinh viên</div>
                  <div className="mt-2 text-2xl font-bold text-slate-950">{user?.full_name}</div>
                  <div className="mt-2 text-sm text-slate-600">{user?.email}</div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{user?.student_code}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{user?.gender}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{user?.role}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    'Cookie HttpOnly cho access token',
                    'Refresh token tự động khi access hết hạn',
                    'CORS cho frontend Vite trên cổng 5173',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200/70 bg-gradient-to-br from-amber-50 to-white shadow-lg backdrop-blur">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-slate-950">Mở rộng tiếp theo</CardTitle>
                <CardDescription>Phần dữ liệu đã sẵn, chỉ còn nối các màn hình nghiệp vụ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                {[
                  { icon: Users, text: 'Danh sách phòng và đăng ký theo vai trò' },
                  { icon: Wrench, text: 'Phiếu bảo trì và xử lý trạng thái' },
                  { icon: BellRing, text: 'Thông báo nội bộ cho sinh viên / cán bộ' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white px-4 py-3">
                      <Icon className="size-4 text-amber-600" />
                      <span>{item.text}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function App() {
  const [mode, setMode] = useState<AuthMode>('login')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const meQuery = useMe()

  if (isAuthenticated && user) {
    return <DashboardShell />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_18%),linear-gradient(180deg,#07111b_0%,#f8fafc_34%)] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(248,250,252,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(248,250,252,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-35" />
      <main className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-10">
        <AuthHero />

        <div className="relative flex items-center justify-center py-4">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-white/40 blur-3xl" />

          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </main>

      {meQuery.isFetching && isAuthenticated ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm text-emerald-800 shadow-lg backdrop-blur">
          Đang xác thực phiên đăng nhập...
        </div>
      ) : null}
    </div>
  )
}
