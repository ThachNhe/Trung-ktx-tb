
import type { Gender, Nationality, User } from '@/types/common.types'
import type { AuthResponse, LoginRequest, TokenResponse } from '@/types/api.types'

// ─── Auth State ────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthSession {
  user: User
  tokens: AuthTokens
}

// ─── Form Values ───────────────────────────────────────────────────────────

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  full_name: string
  student_code: string
  email: string
  password: string
  phone: string
  gender: Gender
  nationality: Nationality
  confirmPassword: string
}

export interface ForgotPasswordFormValues {
  email: string
}

export interface ResetPasswordFormValues {
  token: string
  password: string
  confirmPassword: string
}

// ─── API Payloads ──────────────────────────────────────────────────────────

export type LoginPayload = LoginRequest
export type RegisterPayload = Omit<RegisterFormValues, 'confirmPassword'>

// ─── API Responses ─────────────────────────────────────────────────────────

export type LoginApiResponse = AuthResponse
export type RegisterApiResponse = AuthResponse

export type { TokenResponse }
