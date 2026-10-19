import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { notificationService } from './notificationService'
import { useAuthStore } from '@/store/authStore'

let messagingInstance = null

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'carline-2ed3c.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'carline-2ed3c',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'carline-2ed3c.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  }
}

/**
 * Initializes Firebase Cloud Messaging for Web
 * @param {Function} onForegroundMessage Callback when a push arrives in foreground
 */
export async function initFirebaseMessaging(onForegroundMessage) {
  if (typeof window === 'undefined') return null

  // Check browser notification support
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.info('[FCM] Browser does not support Push Notifications')
    return null
  }

  const supported = await isSupported().catch(() => false)
  if (!supported) {
    console.info('[FCM] Firebase Messaging is not supported in this browser environment')
    return null
  }

  const config = getFirebaseConfig()
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

  if (!config.apiKey || !vapidKey) {
    console.info(
      '[FCM] Firebase Web credentials or VAPID key not configured. Web Push is optional; real-time notifications are active via WebSockets.'
    )
    return null
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config)
    messagingInstance = getMessaging(app)

    // Request browser notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.info('[FCM] Notification permission was not granted:', permission)
      return null
    }

    // Register service worker if needed
    let swRegistration
    try {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    } catch (swErr) {
      console.warn('[FCM] Service worker registration failed:', swErr?.message)
    }

    // Retrieve FCM Device Token
    const fcmToken = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    })

    if (fcmToken) {
      const token = useAuthStore.getState().token
      if (token) {
        await notificationService.registerFcmToken(fcmToken).catch((err) => {
          console.warn('[FCM] Failed to register token with backend:', err?.message)
        })
      }
    }

    // Attach Foreground Notification Listener
    if (typeof onForegroundMessage === 'function') {
      onMessage(messagingInstance, (payload) => {
        onForegroundMessage({
          title: payload.notification?.title || payload.data?.title || 'Notification',
          body: payload.notification?.body || payload.data?.body || '',
          type: payload.data?.type || 'SYSTEM',
          data: payload.data || {},
        })
      })
    }

    return messagingInstance
  } catch (err) {
    console.warn('[FCM] Initialization failed:', err?.message)
    return null
  }
}
