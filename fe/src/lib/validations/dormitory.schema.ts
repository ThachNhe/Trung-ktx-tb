import { z } from 'zod'

const buildingCode = z.enum(['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'])
const buildingStatus = z.enum(['active', 'maintenance'])
const roomType = z.enum(['male', 'female', 'laos_student'])
const roomStatus = z.enum(['available', 'full', 'maintenance'])
const maintenanceStatus = z.enum(['pending', 'in_progress', 'resolved'])
const notificationTargetRole = z.enum(['all', 'student', 'staff'])

export const createBuildingSchema = z.object({
  name: buildingCode,
  total_floors: z.coerce.number().int().min(1, 'Số tầng phải lớn hơn 0'),
  description: z.string().max(255).optional().or(z.literal('')),
  status: buildingStatus.default('active'),
})

export const createRoomSchema = z.object({
  building_id: z.coerce.number().int().min(1, 'Vui lòng chọn tòa nhà'),
  room_number: z.string().min(1, 'Số phòng là bắt buộc').max(20),
  floor: z.coerce.number().int().min(1, 'Tầng phải lớn hơn 0'),
  capacity: z.coerce.number().int().min(1, 'Sức chứa phải lớn hơn 0'),
  room_type: roomType,
  price_per_month: z.coerce.number().min(1, 'Giá phòng phải lớn hơn 0'),
  status: roomStatus.default('available'),
})

export const createRegistrationSchema = z
  .object({
    room_id: z.coerce.number().int().min(1),
    start_date: z.string().min(1, 'Chọn ngày bắt đầu'),
    end_date: z.string().min(1, 'Chọn ngày kết thúc'),
  })
  .refine((value) => value.end_date > value.start_date, {
    message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu',
    path: ['end_date'],
  })

export const createInvoiceSchema = z.object({
  student_id: z.string().uuid('Sinh viên không hợp lệ'),
  room_id: z.coerce.number().int().min(1, 'Phòng không hợp lệ'),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
  electricity_used_kwh: z.coerce.number().min(0),
  water_used_m3: z.coerce.number().min(0),
  due_date: z.string().min(1, 'Chọn hạn thanh toán'),
})

export const createMaintenanceSchema = z.object({
  room_id: z.coerce.number().int().min(1, 'Chọn phòng'),
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(255),
  description: z.string().min(1, 'Mô tả là bắt buộc'),
})

export const updateMaintenanceStatusSchema = z.object({
  status: maintenanceStatus,
})

export const updateRoomStatusSchema = z.object({
  status: roomStatus,
})

export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(255),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  target_role: notificationTargetRole,
})

export type CreateBuildingFormValues = z.infer<typeof createBuildingSchema>
export type CreateRoomFormValues = z.infer<typeof createRoomSchema>
export type CreateRegistrationFormValues = z.infer<typeof createRegistrationSchema>
export type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>
export type CreateMaintenanceFormValues = z.infer<typeof createMaintenanceSchema>
export type UpdateMaintenanceStatusFormValues = z.infer<
  typeof updateMaintenanceStatusSchema
>
export type UpdateRoomStatusFormValues = z.infer<typeof updateRoomStatusSchema>
export type CreateNotificationFormValues = z.infer<typeof createNotificationSchema>