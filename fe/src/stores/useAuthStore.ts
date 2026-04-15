import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@/lib/constants'
import type { User } from '@/types/common.types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  hasHydrated: boolean

  setUser: (user: User | null) => void
  setAuthenticated: (value: boolean) => void
  setSession: (user: User) => void
  login: (user: User) => void
  logout: () => void
  updateUser: (partial: Partial<User>) => void
  setHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        hasHydrated: false,

        setUser: (user) => set({ user }, false, 'auth/setUser'),

        setAuthenticated: (value) =>
          set({ isAuthenticated: value }, false, 'auth/setAuthenticated'),

        setSession: (user) => set({ user, isAuthenticated: true }, false, 'auth/setSession'),

        login: (user) =>
          set(
            () => ({
              user,
              isAuthenticated: true,
            }),
            false,
            'auth/login',
          ),

        logout: () => {
          set({ user: null, isAuthenticated: false }, false, 'auth/logout')
        },

        updateUser: (partial) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...partial } : null,
            }),
            false,
            'auth/updateUser',
          ),

        setHydrated: (value) =>
          set({ hasHydrated: value }, false, 'auth/setHydrated'),
      }),
      {
        name: STORAGE_KEYS.AUTH,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated(true)
        },
      },
    ),
    { name: 'AuthStore' },
  ),
)
