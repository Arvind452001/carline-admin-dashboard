// Placeholder for a real-time connection (e.g. dispatch board, live map).
// Wire this up to socketClient.js once a backend/socket server is available.
import { useEffect, useState } from 'react'

export function useSocket() {
  const [connected] = useState(false)
  useEffect(() => {
    // socketClient.connect() would go here
  }, [])
  return { connected }
}
