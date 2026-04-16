import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { ToastViewport } from '@/components/shared/toast-viewport'

function RootComponent() {
  return (
    <>
      <Outlet />
      <ToastViewport />
      {/* <TanStackRouterDevtools /> */}
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})