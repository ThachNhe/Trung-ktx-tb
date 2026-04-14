import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAuthStore } from '@/stores/useAuthStore'
import { QUERY_KEYS } from '@/lib/constants'
import { authService } from '../services/auth.service'
import type { LoginFormValues, RegisterFormValues } from '../types/auth.types'

// ─── useLogin ──────────────────────────────────────────────────────────────

export function useLogin() {
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: (values: LoginFormValues) => authService.login(values),

    onSuccess: (data) => {
      login(data.user)
    },
  })
}

// ─── useRegister ───────────────────────────────────────────────────────────

export function useRegister() {
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: (values: RegisterFormValues) =>
      authService.register({
        full_name: values.full_name,
        student_code: values.student_code,
        email: values.email,
        password: values.password,
        phone: values.phone,
        gender: values.gender,
      }),

    onSuccess: (data) => {
      login(data.user)
    },
  })
}

// ─── useLogout ─────────────────────────────────────────────────────────────

export function useLogout() {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,

    onSettled: () => {
      logout()
      queryClient.clear()
    },
  })
}

// ─── useMe ─────────────────────────────────────────────────────────────────

export function useMe() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setUser = useAuthStore((state) => state.setUser)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  const query = useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
      setAuthenticated(true)
    }
  }, [query.data, setAuthenticated, setUser])

  useEffect(() => {
    if (query.error) {
      logout()
    }
  }, [logout, query.error])

  return query
}
