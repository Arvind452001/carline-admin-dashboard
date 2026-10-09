import { create } from 'zustand'

const STORAGE_KEY = 'Carline.session'

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

const initial = loadSession()

export const useAuthStore = create((set) => ({
  user: initial?.user ?? null,
  role: initial?.role ?? null,
  // Bearer token from POST /super-admin/login. Null while running on demo data.
  token: initial?.token ?? null,
  isAuthenticated: Boolean(initial),

  login: ({ user, role, token }) => {
    const session = { user, role, token: token ?? null }
    saveSession(session)
    set({ user, role, token: session.token, isAuthenticated: true })
  },

  logout: () => {
    saveSession(null)
    set({ user: null, role: null, token: null, isAuthenticated: false })
  },
}))