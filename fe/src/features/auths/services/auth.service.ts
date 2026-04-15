import { apiGet, apiPost } from '@/services/api'
import { executeRequest } from '@/services/error'
import { API_ENDPOINTS } from '@/services/endpoints'
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  TokenResponse,
} from '@/types/api.types'
import type { User } from '@/types/common.types'

// ─── Auth Service ──────────────────────────────────────────────────────────

export const authService = {
  login: async (payload: LoginRequest): Promise<AuthResponse> =>
    executeRequest(
      apiPost<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        payload,
      ),
      'Đăng nhập thất bại',
    ),

  register: async (payload: RegisterRequest): Promise<AuthResponse> =>
    executeRequest(
      apiPost<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        payload,
      ),
      'Đăng ký thất bại',
    ),

  logout: async (): Promise<void> => {
    await executeRequest(
      apiPost<ApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT),
      'Đăng xuất thất bại',
    )
  },

  getMe: async (): Promise<User> =>
    executeRequest(
      apiGet<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME),
      'Không thể lấy thông tin người dùng',
    ),

  refreshToken: async (payload?: RefreshTokenRequest): Promise<TokenResponse> =>
    executeRequest(
      apiPost<ApiResponse<TokenResponse>>(
        API_ENDPOINTS.AUTH.REFRESH,
        payload,
      ),
      'Làm mới phiên thất bại',
    ),
}
