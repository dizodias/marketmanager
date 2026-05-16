import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { fetchCurrentUser, login as loginRequest, updateProfile as updateProfileRequest } from '../api/auth'
import { TOKEN_KEY, USER_KEY, registerUnauthorizedHandler } from '../api/client'
import { useBackend } from './BackendContext'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function tokenIsValid(token) {
  if (!token) return false
  try {
    const payload = jwtDecode(token)
    if (!payload?.exp) return true
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const { online } = useBackend()
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => readStoredUser())
  const [loadingUser, setLoadingUser] = useState(false)

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    registerUnauthorizedHandler(() => clear())
  }, [clear])

  useEffect(() => {
    if (!token) return
    if (!tokenIsValid(token)) {
      clear()
    }
  }, [token, clear])

  useEffect(() => {
    if (!token || !online) return
    let cancelled = false
    setLoadingUser(true)
    fetchCurrentUser()
      .then((current) => {
        if (cancelled) return
        setUser(current)
        localStorage.setItem(USER_KEY, JSON.stringify(current))
      })
      .catch(() => {
        if (!cancelled) clear()
      })
      .finally(() => {
        if (!cancelled) setLoadingUser(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, online, clear])

  const login = useCallback(async (email, password) => {
    const response = await loginRequest(email, password)
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    setToken(response.token)
    setUser(response.user)
    return response
  }, [])

  const logout = useCallback(() => {
    clear()
  }, [clear])

  const updateProfile = useCallback(async (payload) => {
    const updated = await updateProfileRequest(payload)
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
    setUser(updated)
    return updated
  }, [])

  const isAuthenticated = Boolean(token && user)
  const isAdmin = user?.role === 'ADMIN'

  const value = useMemo(
    () => ({ token, user, isAuthenticated, isAdmin, loadingUser, login, logout, updateProfile }),
    [token, user, isAuthenticated, isAdmin, loadingUser, login, logout, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
