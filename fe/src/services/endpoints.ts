/**
 * Centralized API endpoints.
 * All endpoints are defined here to avoid magic strings scattered across the codebase.
 *
 * Usage:
 *   import { API_ENDPOINTS } from '@/services/endpoints'
 *   api.get(API_ENDPOINTS.USERS.LIST)
 *   api.get(API_ENDPOINTS.USERS.BY_ID(userId))
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  BUILDINGS: {
    LIST: '/buildings',
    ROOMS_BY_BUILDING: (buildingId: number) => `/buildings/${buildingId}/rooms`,
  },
  ROOMS: {
    CREATE: '/rooms',
    UPDATE_STATUS: (roomId: number) => `/rooms/${roomId}`,
  },
  REGISTRATIONS: {
    LIST: '/registrations',
    CREATE: '/registrations',
    APPROVE: (registrationId: number) => `/registrations/${registrationId}/approve`,
    REJECT: (registrationId: number) => `/registrations/${registrationId}/reject`,
    CHECKOUT: (registrationId: number) => `/registrations/${registrationId}/checkout`,
  },
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    PAY: (invoiceId: number) => `/invoices/${invoiceId}/pay`,
  },
  MAINTENANCE: {
    LIST: '/maintenance',
    CREATE: '/maintenance',
    UPDATE_STATUS: (maintenanceId: number) => `/maintenance/${maintenanceId}/status`,
  },
  NOTIFICATIONS: {
    LIST_MY: '/notifications/me',
    CREATE: '/notifications',
  },
} as const
