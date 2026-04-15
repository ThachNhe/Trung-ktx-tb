import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAuthStore } from '@/stores/useAuthStore'
import { QUERY_KEYS } from '@/lib/constants'
import { authService } from '../services/auth.service'
import type { LoginFormValues, RegisterFormValues } from '../types/auth.types'

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (values: LoginFormValues) => authService.login(values),

    onSuccess: (data) => {
      setSession(data.user)
    },
  })
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (values: RegisterFormValues) =>
      authService.register({
        full_name: values.full_name,
        student_code: values.student_code,
        email: values.email,
        password: values.password,
        phone: values.phone,
        gender: values.gender,
        nationality: values.nationality,
      }),

    onSuccess: (data) => {
      setSession(data.user)
    },
  })
}

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

export function useMe() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const setSession = useAuthStore((state) => state.setSession)
  const logout = useAuthStore((state) => state.logout)

  const query = useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: async () => {
      const user = await authService.getMe()
      setSession(user)
      return user
    },
    enabled: hasHydrated,
    retry: 0,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (query.error) {
      logout()
    }
  }, [logout, query.error])

  return query
}

export function useBootstrapAuth() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const meQuery = useMe()
  const isLoading = hasHydrated && meQuery.isPending

  return {
    isReady: hasHydrated && !isLoading,
    isLoading,
  }
}
