export type UserRole = 'admin' | 'staff' | 'student'
export type Gender = 'male' | 'female' | 'other'
export type Nationality = 'vietnam' | 'laos'
export type BuildingCode =
  | 'K1'
  | 'K2'
  | 'K3'
  | 'K4'
  | 'K5'
  | 'K6'
  | 'K7'
  | 'K8'
export type BuildingStatus = 'active' | 'maintenance'
export type RoomType = 'male' | 'female' | 'laos_student'
export type RoomStatus = 'available' | 'full' | 'maintenance'
export type RoomRegistrationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'checked_out'
export type InvoiceStatus = 'unpaid' | 'paid'
export type MaintenanceRequestStatus = 'pending' | 'in_progress' | 'resolved'
export type NotificationTargetRole = 'all' | 'student' | 'staff'

export type NumericValue = number | string

export interface User {
  id: string
  full_name: string
  student_code: string
  email: string
  phone: string | null
  role: UserRole
  gender: Gender
  nationality: Nationality
  created_at: string
}

export interface UserSummary {
  id: string
  full_name: string
  student_code: string
  email: string
  role: UserRole
  gender: Gender
  nationality: Nationality
}

export interface Building {
  id: number
  name: BuildingCode
  total_floors: number
  description: string | null
  status: BuildingStatus
}

export interface BuildingSummary {
  id: number
  name: BuildingCode
}

export interface Room {
  id: number
  building_id: number
  room_number: string
  floor: number
  capacity: number
  current_occupancy: number
  room_type: RoomType
  price_per_month: NumericValue
  status: RoomStatus
}

export interface RoomSummary {
  id: number
  building_id: number
  building_name: BuildingCode
  room_number: string
  floor: number
  room_type: RoomType
}

export interface Registration {
  id: number
  student: UserSummary
  room: RoomSummary
  start_date: string
  end_date: string
  status: RoomRegistrationStatus
  created_at: string
}

export interface Invoice {
  id: number
  student: UserSummary
  room: RoomSummary
  month: number
  year: number
  electricity_used_kwh: NumericValue
  water_used_m3: NumericValue
  room_fee: NumericValue
  electricity_fee: NumericValue
  water_fee: NumericValue
  total_amount: NumericValue
  status: InvoiceStatus
  due_date: string
  paid_at: string | null
}

export interface MaintenanceRequest {
  id: number
  student: UserSummary
  room: RoomSummary
  title: string
  description: string
  status: MaintenanceRequestStatus
  created_at: string
  resolved_at: string | null
}

export interface NotificationItem {
  id: number
  title: string
  content: string
  target_role: NotificationTargetRole
  created_by: string
  creator_name: string
  created_at: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
}

export type Nullable<T> = T | null
export type Maybe<T> = T | null | undefined
