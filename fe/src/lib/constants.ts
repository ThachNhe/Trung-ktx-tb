import type { ListQueryParams } from '@/types/api.types'
import type { Gender, Nationality, UserRole } from '@/types/common.types'

export const APP_NAME =
  import.meta.env.VITE_APP_NAME ?? 'Quản lý Ký túc xá - Đại học Tây Bắc'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0'
export const APP_ENV = import.meta.env.MODE
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_ROOMS: '/student/rooms',
  STUDENT_REGISTRATION: '/student/my-registration',
  STUDENT_INVOICES: '/student/invoices',
  STUDENT_MAINTENANCE: '/student/maintenance',
  STAFF_DASHBOARD: '/staff/dashboard',
  STAFF_REGISTRATIONS: '/staff/registrations',
  STAFF_INVOICES: '/staff/invoices',
  STAFF_MAINTENANCE: '/staff/maintenance',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_BUILDINGS: '/admin/buildings',
  ADMIN_ROOMS: '/admin/rooms',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_REPORTS: '/admin/reports',
} as const

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  admin: ROUTES.ADMIN_DASHBOARD,
  staff: ROUTES.STAFF_DASHBOARD,
  student: ROUTES.STUDENT_DASHBOARD,
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [5, 10, 20, 50, 100],
} as const

const normalizePagination = (params?: ListQueryParams) => ({
  page: params?.page ?? PAGINATION.DEFAULT_PAGE,
  limit: params?.limit ?? PAGINATION.DEFAULT_LIMIT,
})

export const QUERY_KEYS = {
  AUTH: {
    ROOT: ['auth'] as const,
    ME: ['auth', 'me'] as const,
  },
  BUILDINGS: {
    ROOT: ['buildings'] as const,
    LIST: (params?: ListQueryParams) =>
      ['buildings', 'list', normalizePagination(params)] as const,
  },
  ROOMS: {
    ROOT: ['rooms'] as const,
    BY_BUILDING: (buildingId: number, params?: ListQueryParams) =>
      ['rooms', 'building', buildingId, normalizePagination(params)] as const,
    AVAILABLE: (params?: { page?: number; limit?: number; gender?: Gender; nationality?: Nationality }) =>
      [
        'rooms',
        'available',
        {
          page: params?.page ?? PAGINATION.DEFAULT_PAGE,
          limit: params?.limit ?? PAGINATION.DEFAULT_LIMIT,
          gender: params?.gender ?? null,
          nationality: params?.nationality ?? null,
        },
      ] as const,
  },
  REGISTRATIONS: {
    ROOT: ['registrations'] as const,
    LIST: (params?: ListQueryParams) =>
      ['registrations', 'list', normalizePagination(params)] as const,
  },
  INVOICES: {
    ROOT: ['invoices'] as const,
    LIST: (params?: ListQueryParams) =>
      ['invoices', 'list', normalizePagination(params)] as const,
  },
  MAINTENANCE: {
    ROOT: ['maintenance'] as const,
    LIST: (params?: ListQueryParams) =>
      ['maintenance', 'list', normalizePagination(params)] as const,
  },
  NOTIFICATIONS: {
    ROOT: ['notifications'] as const,
    LIST: (params?: ListQueryParams) =>
      ['notifications', 'list', normalizePagination(params)] as const,
  },
  REPORTS: {
    ROOT: ['reports'] as const,
    MONTHLY: (params?: { month: number; year: number }) =>
      ['reports', 'monthly', params?.month ?? null, params?.year ?? null] as const,
  },
} as const

export const STORAGE_KEYS = {
  AUTH: 'ktx-utb-auth-storage',
  UI: 'ktx-utb-ui-storage',
} as const
