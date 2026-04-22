import { createFileRoute } from '@tanstack/react-router'

import { LoginForm } from '@/features/auths/components/LoginForm'
import { AuthShell } from '@/layouts/auth-shell'
import { redirectIfAuthenticated } from '@/lib/route-guards'

export const Route = createFileRoute('/login')({
  beforeLoad: () => redirectIfAuthenticated(),
  component: LoginPage,
})

function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  )
}
