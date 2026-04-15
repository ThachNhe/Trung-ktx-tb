import type { ReactNode } from 'react'
import { BedDouble, BellRing, Building2, ShieldCheck } from 'lucide-react'

import { APP_NAME } from '@/lib/constants'

interface AuthShellProps {
    children: ReactNode
}

const demoAccounts = [
    { role: 'Admin', email: 'admin@utb.edu.vn', password: 'Admin@123' },
    { role: 'Staff', email: 'staff1@utb.edu.vn', password: 'Staff@123' },
    { role: 'Sinh viên', email: 'sv1@utb.edu.vn', password: 'Student@123' },
]

const highlights = [
    {
        icon: Building2,
        title: 'Quản trị tập trung',
        description: 'Theo dõi phòng, hóa đơn, bảo trì và thông báo từ một giao diện duy nhất.',
    },
    {
        icon: BedDouble,
        title: 'Dữ liệu sẵn sàng',
        description: 'Seed mặc định gồm 2 khu, 20 phòng và nhiều tài khoản mẫu để kiểm thử ngay.',
    },
    {
        icon: BellRing,
        title: 'Nghiệp vụ rõ ràng',
        description: 'Luồng sinh viên, cán bộ quản lý và quản trị viên được tách riêng theo vai trò.',
    },
    {
        icon: ShieldCheck,
        title: 'Phiên đăng nhập bền vững',
        description: 'Token được lưu localStorage và tự động làm mới khi access token hết hạn.',
    },
]

export function AuthShell({ children }: AuthShellProps) {
    return (
        <div className="surface-grid min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(21,128,61,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(234,179,8,0.14),transparent_22%),linear-gradient(180deg,#f7fcf7_0%,#edf7ef_100%)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="animate-fade-in-up relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(140deg,#052e16_0%,#14532d_55%,#166534_100%)] p-8 text-white shadow-[0_40px_120px_-60px_rgba(20,83,45,0.7)] lg:p-12">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(163,230,53,0.22),transparent_26%)]" />
                    <div className="relative flex h-full flex-col justify-between gap-10">
                        <div>
                            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/80 backdrop-blur">
                                Đại học Tây Bắc
                            </div>
                            <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight text-balance sm:text-5xl lg:text-6xl">
                                {APP_NAME}
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
                                Nền tảng quản lý ký túc xá tập trung cho đăng ký phòng, phê duyệt đơn, vận hành hóa đơn và xử lý yêu cầu bảo trì theo vai trò.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {highlights.map((item) => {
                                const Icon = item.icon

                                return (
                                    <div key={item.title} className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5 backdrop-blur-md">
                                        <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-lime-200">
                                            <Icon className="size-5" />
                                        </div>
                                        <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
                                        <p className="mt-2 text-sm leading-6 text-white/72">{item.description}</p>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="rounded-[1.5rem] border border-white/12 bg-black/10 p-5 backdrop-blur-md">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime-200">
                                Tài khoản demo
                            </p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                {demoAccounts.map((account) => (
                                    <div key={account.role} className="rounded-2xl border border-white/12 bg-white/10 p-4 text-sm">
                                        <div className="font-semibold text-white">{account.role}</div>
                                        <div className="mt-2 text-white/80">{account.email}</div>
                                        <div className="text-white/65">{account.password}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center">
                    <div className="w-full max-w-lg animate-fade-in-up">{children}</div>
                </section>
            </div>
        </div>
    )
}