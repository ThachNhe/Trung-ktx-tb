import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { PAGINATION, QUERY_KEYS } from '@/lib/constants'
import { dormitoryService } from '@/services/dormitory.service'
import type {
  AvailableRoomQueryParams,
  CreateBuildingPayload,
  CreateInvoicePayload,
  CreateMaintenancePayload,
  CreateNotificationPayload,
  CreateRegistrationPayload,
  CreateRoomPayload,
  ListQueryParams,
  MonthlyReportQueryParams,
  UpdateMaintenanceStatusPayload,
  UpdateRoomStatusPayload,
} from '@/types/api.types'

const DEFAULT_COLLECTION_PARAMS = {
  page: PAGINATION.DEFAULT_PAGE,
  limit: PAGINATION.DEFAULT_LIMIT,
}

const LARGE_COLLECTION_PARAMS = {
  page: PAGINATION.DEFAULT_PAGE,
  limit: PAGINATION.MAX_LIMIT,
}

export function useBuildings(params: ListQueryParams = DEFAULT_COLLECTION_PARAMS) {
  return useQuery({
    queryKey: QUERY_KEYS.BUILDINGS.LIST(params),
    queryFn: () => dormitoryService.listBuildings(params),
  })
}

export function useCreateBuilding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBuildingPayload) =>
      dormitoryService.createBuilding(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUILDINGS.ROOT })
    },
  })
}

export function useRoomsByBuilding(
  buildingId: number,
  params: ListQueryParams = DEFAULT_COLLECTION_PARAMS,
  enabled = true,
) {
  return useQuery({
    queryKey: QUERY_KEYS.ROOMS.BY_BUILDING(buildingId, params),
    queryFn: () => dormitoryService.listRoomsByBuilding(buildingId, params),
    enabled,
  })
}

export function useAvailableRooms(
  params: AvailableRoomQueryParams = LARGE_COLLECTION_PARAMS,
  enabled = true,
) {
  return useQuery({
    queryKey: QUERY_KEYS.ROOMS.AVAILABLE(params),
    queryFn: () => dormitoryService.listAvailableRooms(params),
    enabled,
  })
}

export function useAllRooms(selectedBuildingId: number | 'all') {
  const buildingsQuery = useBuildings(LARGE_COLLECTION_PARAMS)
  const buildingIds =
    selectedBuildingId === 'all'
      ? (buildingsQuery.data?.items ?? []).map((building) => building.id)
      : [selectedBuildingId]

  const roomQueries = useQueries({
    queries: buildingIds.map((buildingId) => ({
      queryKey: QUERY_KEYS.ROOMS.BY_BUILDING(buildingId, LARGE_COLLECTION_PARAMS),
      queryFn: () =>
        dormitoryService.listRoomsByBuilding(buildingId, LARGE_COLLECTION_PARAMS),
      enabled:
        selectedBuildingId !== 'all' ||
        (buildingsQuery.isSuccess && buildingsQuery.data.items.length > 0),
      staleTime: 1000 * 60,
    })),
    combine: (results) => ({
      data: results.flatMap((result) => result.data?.items ?? []),
      isPending: results.some((result) => result.isPending),
      isFetching: results.some((result) => result.isFetching),
      error: results.find((result) => result.error)?.error ?? null,
    }),
  })

  return {
    buildingsQuery,
    rooms: roomQueries.data,
    isLoading: buildingsQuery.isPending || roomQueries.isPending,
    isFetching: buildingsQuery.isFetching || roomQueries.isFetching,
    error: buildingsQuery.error ?? roomQueries.error,
  }
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => dormitoryService.createRoom(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUILDINGS.ROOT }),
      ])
    },
  })
}

export function useUpdateRoomStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, payload }: { roomId: number; payload: UpdateRoomStatusPayload }) =>
      dormitoryService.updateRoomStatus(roomId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS.ROOT })
    },
  })
}

export function useRegistrations(
  params: ListQueryParams = DEFAULT_COLLECTION_PARAMS,
) {
  return useQuery({
    queryKey: QUERY_KEYS.REGISTRATIONS.LIST(params),
    queryFn: () => dormitoryService.listRegistrations(params),
  })
}

export function useCreateRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRegistrationPayload) =>
      dormitoryService.createRegistration(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS.ROOT })
    },
  })
}

export function useApproveRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (registrationId: number) =>
      dormitoryService.approveRegistration(registrationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS.ROOT }),
      ])
    },
  })
}

export function useRejectRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (registrationId: number) =>
      dormitoryService.rejectRegistration(registrationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS.ROOT })
    },
  })
}

export function useCheckoutRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (registrationId: number) =>
      dormitoryService.checkoutRegistration(registrationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS.ROOT }),
      ])
    },
  })
}

export function useInvoices(params: ListQueryParams = DEFAULT_COLLECTION_PARAMS) {
  return useQuery({
    queryKey: QUERY_KEYS.INVOICES.LIST(params),
    queryFn: () => dormitoryService.listInvoices(params),
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => dormitoryService.createInvoice(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES.ROOT })
    },
  })
}

export function usePayInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invoiceId: number) => dormitoryService.payInvoice(invoiceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES.ROOT })
    },
  })
}

export function useMaintenance(
  params: ListQueryParams = DEFAULT_COLLECTION_PARAMS,
) {
  return useQuery({
    queryKey: QUERY_KEYS.MAINTENANCE.LIST(params),
    queryFn: () => dormitoryService.listMaintenance(params),
  })
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMaintenancePayload) =>
      dormitoryService.createMaintenance(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE.ROOT })
    },
  })
}

export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      maintenanceId,
      payload,
    }: {
      maintenanceId: number
      payload: UpdateMaintenanceStatusPayload
    }) => dormitoryService.updateMaintenanceStatus(maintenanceId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE.ROOT })
    },
  })
}

export function useNotifications(
  params: ListQueryParams = DEFAULT_COLLECTION_PARAMS,
) {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(params),
    queryFn: () => dormitoryService.listNotifications(params),
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateNotificationPayload) =>
      dormitoryService.createNotification(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.ROOT,
      })
    },
  })
}

export function useMonthlyReport(params: MonthlyReportQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.REPORTS.MONTHLY(params),
    queryFn: () => dormitoryService.getMonthlyReport(params),
  })
}