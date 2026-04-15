import { LoaderCircle } from 'lucide-react'

import { APP_NAME } from '@/lib/constants'

export function AppLoader() {
    return (
        <div className="surface-grid flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(21,128,61,0.12),transparent_26%),linear-gradient(180deg,#f8fdf8_0%,#eff8f0_100%)] px-6">
            <div className="animate-fade-in-up max-w-md px-8 py-10 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-green-700 text-white shadow-lg shadow-green-700/25">
                    <LoaderCircle className="size-6 animate-spin" />
                </div>
                <h1 className="mt-5 font-display text-3xl text-slate-950">{APP_NAME}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                    Đang khởi tạo phiên làm việc, đồng bộ trạng thái đăng nhập và nạp dữ liệu cần thiết.
                </p>
            </div>
        </div>
    )
}