import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import {
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Shield,
} from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { useLogout } from '@/features/auths'
import { useToast } from '@/hooks/useToast'
import { APP_NAME } from '@/lib/constants'
import { ROLE_LABELS } from '@/lib/dormitory'
import { getNavigationItems } from '@/lib/navigation'
import { cn, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'

export function DashboardLayout() {
    const user = useAuthStore((state) => state.user)
    const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
    const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed)
    const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
    const toggleSidebarCollapse = useUIStore((state) => state.toggleSidebarCollapse)
    const { mutate: logout, isPending } = useLogout()
    const toast = useToast()
    const navigate = useNavigate()
    const routerState = useRouterState()
    const pathname = routerState.location.pathname

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false)
        }
    }, [pathname, setSidebarOpen])

    if (!user) {
        return null
    }

    const navigationItems = getNavigationItems(user.role)
    const activeItem = navigationItems.find((item) => pathname === item.path)

    return (
        <div className="surface-grid min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(21,128,61,0.12),transparent_20%),linear-gradient(180deg,#f7fcf8_0%,#eef7f0_100%)] text-slate-900">
            <div
                className={cn(
                    'fixed inset-0 z-30 bg-slate-950/35 transition-opacity lg:hidden',
                    isSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
                )}
                onClick={() => setSidebarOpen(false)}
            />

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/70 bg-[linear-gradient(180deg,#052e16_0%,#14532d_50%,#166534_100%)] text-white shadow-[0_24px_80px_-42px_rgba(20,83,45,0.72)] transition-transform duration-300 lg:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    isSidebarCollapsed ? 'lg:w-24' : 'lg:w-72',
                )}
            >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                    <div className={cn(isSidebarCollapsed ? 'lg:hidden' : 'block')}>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-200">KTX UTB</p>
                        <h1 className="mt-2 font-display text-2xl text-white">{APP_NAME}</h1>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <PanelLeftClose className="size-5" />
                    </Button>
                </div>

                <div className="border-b border-white/10 px-5 py-5">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/60">Phiên làm việc</p>
                        <div className={cn('mt-2 font-semibold text-white', isSidebarCollapsed && 'lg:hidden')}>
                            {user.full_name}
                        </div>
                        <div className={cn('mt-1 text-sm text-white/72', isSidebarCollapsed && 'lg:hidden')}>
                            {ROLE_LABELS[user.role]}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 px-4 py-5">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.path

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-white text-green-900 shadow-sm'
                                        : 'text-white/78 hover:bg-white/10 hover:text-white',
                                    isSidebarCollapsed && 'lg:justify-center lg:px-0',
                                )}
                            >
                                <Icon className="size-5 shrink-0" />
                                <span className={cn(isSidebarCollapsed && 'lg:hidden')}>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="border-t border-white/10 p-4">
                    <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                            'w-full justify-start text-white hover:bg-white/10 hover:text-white',
                            isSidebarCollapsed && 'lg:justify-center',
                        )}
                        disabled={isPending}
                        onClick={() =>
                            logout(undefined, {
                                onSuccess: () => {
                                    toast.info('Đăng xuất', 'Phiên làm việc đã kết thúc')
                                    navigate({ to: '/login' })
                                },
                            })
                        }
                    >
                        <LogOut className="size-4" />
                        <span className={cn(isSidebarCollapsed && 'lg:hidden')}>Đăng xuất</span>
                    </Button>
                </div>
            </aside>

            <div className={cn('min-h-screen transition-all duration-300', isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72')}>
                <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="border-slate-200 bg-white lg:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="size-5" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="hidden border-slate-200 bg-white lg:inline-flex"
                                onClick={toggleSidebarCollapse}
                            >
                                {isSidebarCollapsed ? (
                                    <PanelLeftOpen className="size-5" />
                                ) : (
                                    <PanelLeftClose className="size-5" />
                                )}
                            </Button>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">
                                    {activeItem?.label ?? 'Quản lý ký túc xá'}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    {formatDate(new Date(), {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-full border border-green-100 bg-green-50/70 px-4 py-2 text-sm text-green-900">
                            <Shield className="size-4 text-green-700" />
                            <span className="hidden sm:inline">{user.student_code}</span>
                            <span className="font-semibold">{ROLE_LABELS[user.role]}</span>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="animate-fade-in-up space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}