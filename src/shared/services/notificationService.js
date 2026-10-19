import { apiClient } from './apiClient'

/**
 * Service for Carline Notification Endpoints
 * Documentation: Swagger section 'Notifications (by Prakash)'
 */
export const notificationService = {
  /**
   * 1. Register / Update Device FCM Token
   * POST /api/v1/notification/fcm-token
   * @param {string} fcmToken
   */
  registerFcmToken: async (fcmToken) => {
    if (!fcmToken) throw new Error('FCM token is required')
    return apiClient.post('/notification/fcm-token', { fcmToken })
  },

  /**
   * 2. Get Bell Icon Unread Count
   * GET /api/v1/notification/unread-count
   * @returns {Promise<{ count: number }>}
   */
  getUnreadCount: async () => {
    return apiClient.get('/notification/unread-count')
  },

  /**
   * 3. Get In-App Notifications History
   * GET /api/v1/notification/my?page=1&limit=20
   * @param {{ page?: number, limit?: number }} params
   * @returns {Promise<{ notifications: Array, total: number, page: number, limit: number, unreadCount: number }>}
   */
  getMyNotifications: async ({ page = 1, limit = 20 } = {}) => {
    return apiClient.get('/notification/my', { page, limit })
  },

  /**
   * 4. Mark a Single Notification as Read
   * PATCH /api/v1/notification/:id/read
   * @param {string} id
   */
  markAsRead: async (id) => {
    if (!id) throw new Error('Notification ID is required')
    return apiClient.patch(`/notification/${encodeURIComponent(id)}/read`)
  },

  /**
   * 5. Mark All Notifications as Read
   * PATCH /api/v1/notification/read-all
   */
  markAllAsRead: async () => {
    return apiClient.patch('/notification/read-all')
  },

  /**
   * 6. Send Test Push Notification
   * POST /api/v1/notification/test-push
   * @param {{ title: string, body: string, type?: string, data?: object }} payload
   */
  sendTestPush: async ({
    title = 'Test Push Notification',
    body = 'Hello from Carline Dispatcher! Notifications are active.',
    type = 'TEST_PUSH',
    data = {},
  } = {}) => {
    return apiClient.post('/notification/test-push', {
      title,
      body,
      type,
      data,
    })
  },

  /**
   * 7. Dispatcher sends direct message/alert to a trip driver or rider
   * POST /api/v1/notification/dispatcher/send
   * @param {{ tripId?: string, recipientType: 'driver'|'rider'|'both', recipientId?: string, title: string, body: string, data?: object }} payload
   */
  sendDispatcherAlert: async (payload) => {
    return apiClient.post('/notification/dispatcher/send', payload)
  },

  /**
   * 8. Broadcast push notification & in-app announcement to all Drivers/Users
   * POST /api/v1/notification/broadcast
   * @param {{ title: string, body: string, target?: 'all'|'drivers'|'riders', type?: string, data?: object }} payload
   */
  sendBroadcast: async (payload) => {
    return apiClient.post('/notification/broadcast', payload)
  },

  /**
   * 9. Get past broadcast communication history
   * GET /api/v1/notification/broadcasts?page=1&limit=20
   */
  getBroadcastHistory: async ({ page = 1, limit = 20 } = {}) => {
    return apiClient.get('/notification/broadcasts', { page, limit })
  },
}
