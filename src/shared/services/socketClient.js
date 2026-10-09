// Placeholder real-time client for live trips / dispatch board / driver map.
// Swap in socket.io-client or native WebSocket once the backend is ready.
export const socketClient = {
  connect() {
    console.info('[socketClient] connect() not yet wired to a backend')
  },
  disconnect() {},
  on() {},
  emit() {},
}
