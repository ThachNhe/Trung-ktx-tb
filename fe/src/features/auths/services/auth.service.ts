import axios from 'axios'

import { apiGet, apiPost } from '@/services/api'
import { API_ENDPOINTS } from '@/services/endpoints'
import type {
  ApiErrorResponse,
  ApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  TokenResponse,
} from '@/types/api.types'
import type { RegisterApiResponse } from '../types/auth.types'
import type { User } from '@/types/common.types'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}

const unwrap = <T>(response: ApiResponse<T>): T => response.data

// ─── Auth Service ──────────────────────────────────────────────────────────

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await apiPost<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        payload,
      )
      return unwrap(response)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Đăng nhập thất bại'))
    }
  },

  register: async (payload: RegisterPayload): Promise<RegisterApiResponse> => {
    try {
      const response = await apiPost<ApiResponse<RegisterApiResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        payload,
      )
      return unwrap(response)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Đăng ký thất bại'))
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiPost<ApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Đăng xuất thất bại'))
    }
  },

  getMe: async (): Promise<User> => {
    try {
      const response = await apiGet<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME)
      return unwrap(response)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Không thể lấy thông tin người dùng'))
    }
  },

  refreshToken: async (): Promise<TokenResponse> => {
    try {
      const response = await apiPost<ApiResponse<TokenResponse>>(
        API_ENDPOINTS.AUTH.REFRESH,
      )
      return unwrap(response)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Làm mới phiên thất bại'))
    }
  },
}
