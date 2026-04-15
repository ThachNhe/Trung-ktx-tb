import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { LoginForm } from '@/features/auths/components/LoginForm'
import { AuthShell } from '@/layouts/auth-shell'
import { ROUTES } from '@/lib/constants'
import { redirectIfAuthenticated } from '@/lib/route-guards'

export const Route = createFileRoute('/login')({
  beforeLoad: () => redirectIfAuthenticated(),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  return (
    <AuthShell>
      <LoginForm onSwitchToRegister={() => navigate({ to: ROUTES.REGISTER })} />
    </AuthShell>
  )
}
