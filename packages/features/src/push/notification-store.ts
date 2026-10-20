import { create } from 'zustand'

export interface InAppNotificationItem {
  id: string
  title: string
  body: string
  href?: string
  timestamp: number
}

interface NotificationStore {
  current: InAppNotificationItem | null
  show: (notification: Omit<InAppNotificationItem, 'id' | 'timestamp'>) => void
  dismiss: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  current: null,
  show: (notification) =>
    set({
      current: {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      },
    }),
  dismiss: () => set({ current: null }),
}))
