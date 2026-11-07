import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { tokenStorage } from '../api/axiosClient'
import * as authApi from '../api/authApi'

const USER_KEY = 'jt_user'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // Restore the session on page refresh.
  const [user, setUser] = useState(() => (tokenStorage.get() ? readStoredUser() : null))

  const saveSession = useCallback((data) => {
    tokenStorage.set(data.token)
    const profile = { id: data.userId, fullName: data.fullName, email: data.email }
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
    setUser(profile)
  }, [])

  const login = useCallback(
    async (credentials) => saveSession(await authApi.login(credentials)),
    [saveSession],
  )

  const register = useCallback(
    async (details) => saveSession(await authApi.register(details)),
    [saveSession],
  )

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
