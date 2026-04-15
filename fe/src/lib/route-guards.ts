import { redirect } from '@tanstack/react-router'

import { ROLE_HOME_ROUTES, ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/stores/useAuthStore'
import type { UserRole } from '@/types/common.types'

export function redirectIfAuthenticated() {
    const { isAuthenticated, user } = useAuthStore.getState()

    if (isAuthenticated && user) {
        throw redirect({ to: ROLE_HOME_ROUTES[user.role], replace: true })
    }
}

export function requireRole(roles: UserRole[]) {
    const { isAuthenticated, user } = useAuthStore.getState()

    if (!isAuthenticated || !user) {
        throw redirect({ to: ROUTES.LOGIN, replace: true })
    }

    if (!roles.includes(user.role)) {
        throw redirect({ to: ROLE_HOME_ROUTES[user.role], replace: true })
    }

    return { user }
}