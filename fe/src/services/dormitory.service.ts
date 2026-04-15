import { cleanObject } from '@/lib/utils'
import { apiGet, apiPatch, apiPost } from '@/services/api'
import { executeRequest } from '@/services/error'
import { API_ENDPOINTS } from '@/services/endpoints'
import type {
  ApiResponse,
  BuildingsPage,
  CreateBuildingPayload,
  CreateInvoicePayload,
  CreateMaintenancePayload,
  CreateNotificationPayload,
  CreateRegistrationPayload,
  CreateRoomPayload,
  AvailableRoomQueryParams,
  InvoicesPage,
  ListQueryParams,
  MaintenancePage,
  MonthlyReport,
  MonthlyReportQueryParams,
  NotificationsPage,
  RegistrationsPage,
  RoomsPage,
  UpdateMaintenanceStatusPayload,
  UpdateRoomStatusPayload,
} from '@/types/api.types'
import type {
  Building,
  Invoice,
  MaintenanceRequest,
  NotificationItem,
  Registration,
  Room,
} from '@/types/common.types'

export const dormitoryService = {
  listBuildings: async (params?: ListQueryParams): Promise<BuildingsPage> =>
    executeRequest(
      apiGet<ApiResponse<BuildingsPage>>(
        API_ENDPOINTS.BUILDINGS.LIST,
        cleanObject(params ?? {}),
      ),
      'Không thể tải danh sách tòa nhà',
    ),

  createBuilding: async (payload: CreateBuildingPayload): Promise<Building> =>
    executeRequest(
      apiPost<ApiResponse<Building>>(API_ENDPOINTS.BUILDINGS.LIST, payload),
      'Không thể tạo tòa nhà',
    ),

  listRoomsByBuilding: async (
    buildingId: number,
    params?: ListQueryParams,
  ): Promise<RoomsPage> =>
    executeRequest(
      apiGet<ApiResponse<RoomsPage>>(
        API_ENDPOINTS.BUILDINGS.ROOMS_BY_BUILDING(buildingId),
        cleanObject(params ?? {}),
      ),
      'Không thể tải danh sách phòng',
    ),

  listAvailableRooms: async (
    params?: AvailableRoomQueryParams,
  ): Promise<RoomsPage> =>
    executeRequest(
      apiGet<ApiResponse<RoomsPage>>(
        API_ENDPOINTS.ROOMS.AVAILABLE,
        cleanObject(params ?? {}),
      ),
      'Không thể tải danh sách phòng còn chỗ',
    ),

  createRoom: async (payload: CreateRoomPayload): Promise<Room> =>
    executeRequest(
      apiPost<ApiResponse<Room>>(API_ENDPOINTS.ROOMS.CREATE, payload),
      'Không thể tạo phòng mới',
    ),

  updateRoomStatus: async (
    roomId: number,
    payload: UpdateRoomStatusPayload,
  ): Promise<Room> =>
    executeRequest(
      apiPatch<ApiResponse<Room>>(
        API_ENDPOINTS.ROOMS.UPDATE_STATUS(roomId),
        payload,
      ),
      'Không thể cập nhật trạng thái phòng',
    ),

  listRegistrations: async (
    params?: ListQueryParams,
  ): Promise<RegistrationsPage> =>
    executeRequest(
      apiGet<ApiResponse<RegistrationsPage>>(
        API_ENDPOINTS.REGISTRATIONS.LIST,
        cleanObject(params ?? {}),
      ),
      'Không thể tải danh sách đăng ký',
    ),

  createRegistration: async (
    payload: CreateRegistrationPayload,
  ): Promise<Registration> =>
    executeRequest(
      apiPost<ApiResponse<Registration>>(
        API_ENDPOINTS.REGISTRATIONS.CREATE,
        payload,
      ),
      'Không thể tạo đơn đăng ký',
    ),

  approveRegistration: async (registrationId: number): Promise<Registration> =>
    executeRequest(
      apiPatch<ApiResponse<Registration>>(
        API_ENDPOINTS.REGISTRATIONS.APPROVE(registrationId),
      ),
      'Không thể duyệt đơn đăng ký',
    ),

  rejectRegistration: async (registrationId: number): Promise<Registration> =>
    executeRequest(
      apiPatch<ApiResponse<Registration>>(
        API_ENDPOINTS.REGISTRATIONS.REJECT(registrationId),
      ),
      'Không thể từ chối đơn đăng ký',
    ),

  checkoutRegistration: async (registrationId: number): Promise<Registration> =>
    executeRequest(
      apiPatch<ApiResponse<Registration>>(
        API_ENDPOINTS.REGISTRATIONS.CHECKOUT(registrationId),
      ),
      'Không thể cập nhật trạng thái trả phòng',
    ),

  listInvoices: async (params?: ListQueryParams): Promise<InvoicesPage> =>
    executeRequest(
      apiGet<ApiResponse<InvoicesPage>>(
        API_ENDPOINTS.INVOICES.LIST,
        cleanObject(params ?? {}),
      ),
      'Không thể tải danh sách hóa đơn',
    ),

  createInvoice: async (payload: CreateInvoicePayload): Promise<Invoice> =>
    executeRequest(
      apiPost<ApiResponse<Invoice>>(API_ENDPOINTS.INVOICES.CREATE, payload),
      'Không thể tạo hóa đơn',
    ),

  payInvoice: async (invoiceId: number): Promise<Invoice> =>
    executeRequest(
      apiPatch<ApiResponse<Invoice>>(API_ENDPOINTS.INVOICES.PAY(invoiceId)),
      'Không thể xác nhận thanh toán',
    ),

  listMaintenance: async (params?: ListQueryParams): Promise<MaintenancePage> =>
    executeRequest(
      apiGet<ApiResponse<MaintenancePage>>(
        API_ENDPOINTS.MAINTENANCE.LIST,
        cleanObject(params ?? {}),
      ),
      'Không thể tải danh sách bảo trì',
    ),

  createMaintenance: async (
    payload: CreateMaintenancePayload,
  ): Promise<MaintenanceRequest> =>
    executeRequest(
      apiPost<ApiResponse<MaintenanceRequest>>(
        API_ENDPOINTS.MAINTENANCE.CREATE,
        payload,
      ),
      'Không thể tạo yêu cầu bảo trì',
    ),

  updateMaintenanceStatus: async (
    maintenanceId: number,
    payload: UpdateMaintenanceStatusPayload,
  ): Promise<MaintenanceRequest> =>
    executeRequest(
      apiPatch<ApiResponse<MaintenanceRequest>>(
        API_ENDPOINTS.MAINTENANCE.UPDATE_STATUS(maintenanceId),
        payload,
      ),
      'Không thể cập nhật trạng thái bảo trì',
    ),

  listNotifications: async (
    params?: ListQueryParams,
  ): Promise<NotificationsPage> =>
    executeRequest(
      apiGet<ApiResponse<NotificationsPage>>(
        API_ENDPOINTS.NOTIFICATIONS.LIST_MY,
        cleanObject(params ?? {}),
      ),
      'Không thể tải danh sách thông báo',
    ),

  createNotification: async (
    payload: CreateNotificationPayload,
  ): Promise<NotificationItem> =>
    executeRequest(
      apiPost<ApiResponse<NotificationItem>>(
        API_ENDPOINTS.NOTIFICATIONS.CREATE,
        payload,
      ),
      'Không thể tạo thông báo',
    ),

  getMonthlyReport: async (
    params: MonthlyReportQueryParams,
  ): Promise<MonthlyReport> =>
    executeRequest(
      apiGet<ApiResponse<MonthlyReport>>(
        API_ENDPOINTS.REPORTS.MONTHLY,
        cleanObject(params),
      ),
      'Không thể tải báo cáo tháng',
    ),
}