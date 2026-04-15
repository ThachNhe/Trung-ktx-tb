import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { RegisterForm } from '@/features/auths/components/RegisterForm'
import { AuthShell } from '@/layouts/auth-shell'
import { ROUTES } from '@/lib/constants'
import { redirectIfAuthenticated } from '@/lib/route-guards'

export const Route = createFileRoute('/register')({
  beforeLoad: () => redirectIfAuthenticated(),
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <AuthShell>
      <RegisterForm onSwitchToLogin={() => navigate({ to: ROUTES.LOGIN })} />
    </AuthShell>
  )
}
