/* eslint-disable no-undef */
// Firebase Messaging Service Worker for Carline Web App
// Project: carline-2ed3c

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

const firebaseConfig = {
  projectId: 'carline-2ed3c',
}

try {
  firebase.initializeApp(firebaseConfig)
  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    console.info('[firebase-messaging-sw.js] Background push received:', payload)
    const title = payload.notification?.title || payload.data?.title || 'Carline Notification'
    const options = {
      body: payload.notification?.body || payload.data?.body || '',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: payload.data || {},
    }

    self.registration.showNotification(title, options)
  })
} catch (err) {
  console.warn('[firebase-messaging-sw.js] Initialization skipped:', err?.message)
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification.data || {}
  const targetUrl = data.rideId ? `/dispatcher/trip-details?tripId=${data.rideId}` : '/dispatcher/notifications'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
