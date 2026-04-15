import { createFileRoute } from '@tanstack/react-router'

import { DashboardLayout } from '@/layouts/dashboard-layout'
import { requireRole } from '@/lib/route-guards'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => requireRole(['admin']),
  component: DashboardLayout,
})
