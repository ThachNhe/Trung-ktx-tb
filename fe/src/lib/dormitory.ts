import { ROLE_HOME_ROUTES } from '@/lib/constants'
import type {
  Building,
  BuildingStatus,
  Gender,
  InvoiceStatus,
  MaintenanceRequestStatus,
  NotificationTargetRole,
  NumericValue,
  PaginationMeta,
  Registration,
  Room,
  RoomRegistrationStatus,
  RoomStatus,
  RoomSummary,
  RoomType,
  UserRole,
} from '@/types/common.types'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  staff: 'Cán bộ quản lý',
  student: 'Sinh viên',
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
}

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  male: 'Phòng nam',
  female: 'Phòng nữ',
  laos_student: 'Sinh viên Lào',
}

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Còn trống',
  full: 'Đã đầy',
  maintenance: 'Bảo trì',
}

export const REGISTRATION_STATUS_LABELS: Record<RoomRegistrationStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  checked_out: 'Đã trả phòng',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceRequestStatus, string> = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang xử lý',
  resolved: 'Đã hoàn tất',
}

export const BUILDING_STATUS_LABELS: Record<BuildingStatus, string> = {
  active: 'Hoạt động',
  maintenance: 'Bảo trì',
}

export const NOTIFICATION_ROLE_LABELS: Record<NotificationTargetRole, string> = {
  all: 'Toàn hệ thống',
  staff: 'Cán bộ',
  student: 'Sinh viên',
}

export const STATUS_TONE_MAP: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  available: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  approved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  paid: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  resolved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  in_progress: 'bg-sky-100 text-sky-800 ring-sky-200',
  unpaid: 'bg-amber-100 text-amber-800 ring-amber-200',
  rejected: 'bg-rose-100 text-rose-800 ring-rose-200',
  full: 'bg-rose-100 text-rose-800 ring-rose-200',
  checked_out: 'bg-slate-100 text-slate-700 ring-slate-200',
  maintenance: 'bg-slate-200 text-slate-700 ring-slate-300',
  all: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  student: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  staff: 'bg-sky-100 text-sky-800 ring-sky-200',
}

export const toNumber = (value: NumericValue): number => Number(value)

export const getDefaultRouteForRole = (role: UserRole) => ROLE_HOME_ROUTES[role]

export const getRoomLabel = (room: Room | RoomSummary) =>
  `${room.building_name ?? ''}${'building_name' in room ? '-' : ''}${room.room_number}`.replace(/^-/, '')

export const getRoomDisplayName = (room: Room | RoomSummary, buildings?: Building[]) => {
  if ('building_name' in room) {
    return `${room.building_name} - ${room.room_number}`
  }

  const buildingName = buildings?.find((building) => building.id === room.building_id)?.name
  return `${buildingName ?? 'KTX'} - ${room.room_number}`
}

export const getCurrentRegistration = (registrations: Registration[]) =>
  registrations.find((item) => item.status === 'approved') ?? null

export const uniqueApprovedRegistrations = (registrations: Registration[]) => {
  const seen = new Set<string>()

  return registrations.filter((item) => {
    if (item.status !== 'approved') {
      return false
    }

    if (seen.has(item.student.id)) {
      return false
    }

    seen.add(item.student.id)
    return true
  })
}

export const calculateOccupancyRate = (rooms: Room[]) => {
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
  const occupiedBeds = rooms.reduce((sum, room) => sum + room.current_occupancy, 0)

  if (!totalCapacity) {
    return 0
  }

  return Math.round((occupiedBeds / totalCapacity) * 100)
}

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  total_pages: total > 0 ? Math.ceil(total / limit) : 0,
})

export function paginateItems<T>(items: T[], page: number, limit: number) {
  return {
    items: items.slice((page - 1) * limit, page * limit),
    pagination: buildPaginationMeta(page, limit, items.length),
  }
}

export const buildOccupancyByBuilding = (buildings: Building[], rooms: Room[]) =>
  buildings.map((building) => {
    const buildingRooms = rooms.filter((room) => room.building_id === building.id)
    const totalCapacity = buildingRooms.reduce((sum, room) => sum + room.capacity, 0)
    const occupiedBeds = buildingRooms.reduce(
      (sum, room) => sum + room.current_occupancy,
      0,
    )

    return {
      building: building.name,
      occupiedBeds,
      totalCapacity,
      rate: totalCapacity ? Math.round((occupiedBeds / totalCapacity) * 100) : 0,
    }
  })