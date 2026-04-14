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
  // ─── Auth ────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
} as const
