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
        title: 'Quản lý phòng thông minh',
        description: 'Theo dõi tình trạng phòng, sức chứa và danh sách sinh viên theo từng khu nhà.',
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
        <div className="surface-grid min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(21,128,61,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(234,179,8,0.14),transparent_22%),linear-gradient(180deg,#f7fcf7_0%,#edf7ef_100%)]">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
                {/* ── Left panel ── */}
                <section className="animate-fade-in-up relative flex flex-col overflow-hidden bg-[linear-gradient(140deg,#052e16_0%,#14532d_55%,#166534_100%)] p-8 text-white lg:w-[52%] lg:min-h-screen lg:p-14 xl:p-16">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(163,230,53,0.22),transparent_26%)] pointer-events-none" />

                    <div className="relative flex flex-1 flex-col justify-between gap-12">
                        {/* Header copy */}
                        <div>
                            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/80 backdrop-blur">
                                Đại học Tây Bắc
                            </div>
                            <h1 className="mt-6 font-display text-3xl font-bold leading-[1.15] text-pretty sm:text-4xl lg:text-[2.6rem] xl:text-5xl">
                                {APP_NAME}
                            </h1>
                            <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
                                Nền tảng quản lý ký túc xá tập trung cho đăng ký phòng, phê duyệt đơn, vận hành hóa đơn và xử lý yêu cầu bảo trì theo vai trò.
                            </p>
                        </div>

                        {/* Feature highlight cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {highlights.map((item) => {
                                const Icon = item.icon
                                return (
                                    <div key={item.title} className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-lime-200">
                                            <Icon className="size-4" />
                                        </div>
                                        <h2 className="mt-3 text-sm font-semibold leading-snug text-white">{item.title}</h2>
                                        <p className="mt-1.5 text-xs leading-5 text-white/65">{item.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* ── Right panel ── */}
                <section className="flex flex-1 items-center justify-center px-6 py-12 lg:px-10">
                    <div className="w-full max-w-md animate-fade-in-up">{children}</div>
                </section>
            </div>
        </div>
    )
}