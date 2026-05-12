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


                {/* ── Right panel ── */}
                <section className="flex flex-1 items-center justify-center px-6 py-12 lg:px-10">
                    <div className="w-full max-w-md animate-fade-in-up">{children}</div>
                </section>
            </div>
        </div>
    )
}