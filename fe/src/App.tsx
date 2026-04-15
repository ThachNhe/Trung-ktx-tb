import { createRouter, RouterProvider } from '@tanstack/react-router'

import { AppLoader } from '@/components/shared/app-loader'
import { useBootstrapAuth } from '@/features/auths'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  const { isReady } = useBootstrapAuth()

  if (!isReady) {
    return <AppLoader />
  }

  return <RouterProvider router={router} />
}
