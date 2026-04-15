import type {
  Building,
  BuildingCode,
  BuildingStatus,
  Gender,
  Invoice,
  MaintenanceRequest,
  MaintenanceRequestStatus,
  NotificationItem,
  NotificationTargetRole,
  Nationality,
  PaginationMeta,
  Registration,
  Room,
  RoomStatus,
  RoomType,
  User,
} from './common.types'

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface ApiValidationError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  error_code?: string | null
  errors?: ApiValidationError[]
}

export interface PaginatedData<T> {
  items: T[]
  pagination: PaginationMeta
}

export interface ListQueryParams {
  page?: number
  limit?: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  full_name: string
  student_code: string
  email: string
  password: string
  phone?: string | null
  gender: Gender
  nationality?: Nationality
}

export interface RefreshTokenRequest {
  refresh_token?: string
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

export interface CreateBuildingPayload {
  name: BuildingCode
  total_floors: number
  description?: string | null
  status?: BuildingStatus
}

export interface CreateRoomPayload {
  building_id: number
  room_number: string
  floor: number
  capacity: number
  room_type: RoomType
  price_per_month: number
  status?: RoomStatus
}

export interface UpdateRoomStatusPayload {
  status: RoomStatus
}

export interface CreateRegistrationPayload {
  room_id: number
  start_date: string
  end_date: string
}

export interface AvailableRoomQueryParams extends ListQueryParams {
  gender?: Gender
  nationality?: Nationality
}

export interface MonthlyReportQueryParams {
  month: number
  year: number
}

export interface CreateInvoicePayload {
  student_id: string
  room_id: number
  month: number
  year: number
  electricity_used_kwh: number
  water_used_m3: number
  due_date: string
}

export interface CreateMaintenancePayload {
  room_id: number
  title: string
  description: string
}

export interface UpdateMaintenanceStatusPayload {
  status: MaintenanceRequestStatus
}

export interface CreateNotificationPayload {
  title: string
  content: string
  target_role: NotificationTargetRole
}

export interface MonthlyReportBuildingItem {
  building_id: number
  building_name: BuildingCode
  total_rooms: number
  total_capacity: number
  occupied_beds: number
  occupancy_rate: number
}

export interface MonthlyReport {
  month: number
  year: number
  total_revenue: number | string
  paid_invoices: number
  unpaid_invoices: number
  total_rooms: number
  total_capacity: number
  occupied_beds: number
  occupancy_rate: number
  building_reports: MonthlyReportBuildingItem[]
}

export type BuildingsPage = PaginatedData<Building>
export type RoomsPage = PaginatedData<Room>
export type RegistrationsPage = PaginatedData<Registration>
export type InvoicesPage = PaginatedData<Invoice>
export type MaintenancePage = PaginatedData<MaintenanceRequest>
export type NotificationsPage = PaginatedData<NotificationItem>
