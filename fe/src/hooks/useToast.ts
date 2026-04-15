import { useUIStore } from '@/stores/useUIStore'

export function useToast() {
  const addToast = useUIStore((state) => state.addToast)

  return {
    success: (title: string, description?: string) =>
      addToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) =>
      addToast({ title, description, type: 'error' }),
    info: (title: string, description?: string) =>
      addToast({ title, description, type: 'info' }),
    warning: (title: string, description?: string) =>
      addToast({ title, description, type: 'warning' }),
  }
}