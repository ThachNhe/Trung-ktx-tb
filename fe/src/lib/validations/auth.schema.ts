import { z } from 'zod'

// ─── Reusable fields ───────────────────────────────────────────────────────

const emailField = z
  .string()
  .min(1, 'Email là bắt buộc')
  .email('Email không hợp lệ')
  .toLowerCase()
  .trim()

const fullNameField = z
  .string()
  .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
  .max(255, 'Họ và tên không được quá 255 ký tự')
  .trim()

const studentCodeField = z
  .string()
  .min(3, 'Mã sinh viên không hợp lệ')
  .max(32, 'Mã sinh viên không được quá 32 ký tự')
  .trim()

const phoneField = z
  .string()
  .min(9, 'Số điện thoại không hợp lệ')
  .max(20, 'Số điện thoại không hợp lệ')
  .trim()

const passwordField = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(100, 'Mật khẩu không được quá 100 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')

const genderField = z.enum(['male', 'female', 'other'])
const nationalityField = z.enum(['vietnam', 'laos'])

// ─── Schemas ───────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
})

export const registerSchema = z
  .object({
    full_name: fullNameField,
    student_code: studentCodeField,
    email: emailField,
    phone: phoneField,
    gender: genderField,
    nationality: nationalityField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: emailField,
})

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    token: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

// ─── Inferred Types ────────────────────────────────────────────────────────

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
