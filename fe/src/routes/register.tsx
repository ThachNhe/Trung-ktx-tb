import { createFileRoute, redirect } from '@tanstack/react-router'

import { ROUTES } from '@/lib/constants'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.LOGIN })
  },
  component: () => null,
})
