import type { Gender, PaginationMeta, User } from './common.types'

// ─── Base API Response ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface ApiErrorResponse {
  message: string
  success: false
  errors?: Record<string, string[]> // field-level validation errors
  code?: string                      // error code (e.g. "UNAUTHORIZED")
}

// ─── Paginated Response ────────────────────────────────────────────────────

export interface PaginatedResponse<T = unknown> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: TokenResponse
}

export interface RegisterRequest {
  full_name: string
  student_code: string
  email: string
  password: string
  phone?: string | null
  gender: Gender
}

export interface RefreshTokenRequest {
  refresh_token?: string
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthResponse {
  user: User
  tokens: TokenResponse
}

// ─── Query Params helper ───────────────────────────────────────────────────

export interface ListQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
