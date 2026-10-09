import { create } from 'zustand'
import { mockNotifications } from '@/shared/utils/mockData'

export const useNotificationStore = create((set) => ({
  notifications: mockNotifications,
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}))
