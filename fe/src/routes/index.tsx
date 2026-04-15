import { createFileRoute, redirect } from '@tanstack/react-router'

import { ROLE_HOME_ROUTES, ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/stores/useAuthStore'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (isAuthenticated && user) {
      throw redirect({ to: ROLE_HOME_ROUTES[user.role] })
    }
    throw redirect({ to: ROUTES.LOGIN })
  },
  component: () => null,
})