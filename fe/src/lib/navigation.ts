import type { LucideIcon } from 'lucide-react'
import {
  BedDouble,
  BellRing,
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Users,
  Wrench,
} from 'lucide-react'

import { ROUTES } from '@/lib/constants'
import type { UserRole } from '@/types/common.types'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

const navigationByRole: Record<UserRole, NavigationItem[]> = {
  student: [
    { label: 'Tổng quan', path: ROUTES.STUDENT_DASHBOARD, icon: LayoutDashboard },
    { label: 'Phòng còn trống', path: ROUTES.STUDENT_ROOMS, icon: BedDouble },
    { label: 'Đơn đăng ký', path: ROUTES.STUDENT_REGISTRATION, icon: ClipboardList },
    { label: 'Hóa đơn', path: ROUTES.STUDENT_INVOICES, icon: Receipt },
    { label: 'Bảo trì', path: ROUTES.STUDENT_MAINTENANCE, icon: Wrench },
  ],
  staff: [
    { label: 'Tổng quan', path: ROUTES.STAFF_DASHBOARD, icon: LayoutDashboard },
    { label: 'Đăng ký phòng', path: ROUTES.STAFF_REGISTRATIONS, icon: ClipboardList },
    { label: 'Hóa đơn', path: ROUTES.STAFF_INVOICES, icon: Receipt },
    { label: 'Bảo trì', path: ROUTES.STAFF_MAINTENANCE, icon: Wrench },
  ],
  admin: [
    { label: 'Tổng quan', path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { label: 'Tòa nhà', path: ROUTES.ADMIN_BUILDINGS, icon: Building2 },
    { label: 'Phòng', path: ROUTES.ADMIN_ROOMS, icon: BedDouble },
    { label: 'Báo cáo tháng', path: ROUTES.ADMIN_REPORTS, icon: BarChart3 },
    { label: 'Sinh viên nội trú', path: ROUTES.ADMIN_STUDENTS, icon: Users },
    { label: 'Thông báo', path: ROUTES.ADMIN_NOTIFICATIONS, icon: BellRing },
  ],
}

export const getNavigationItems = (role: UserRole) => navigationByRole[role]