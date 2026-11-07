import axios from 'axios'

const TOKEN_KEY = 'jt_token'
const USER_KEY = 'jt_user'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 on a normal API call means the token is missing, invalid or expired: log out.
// Login/register calls are excluded, because a 401 there just means wrong credentials.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const isAuthCall = url.startsWith('/auth/')
    if (error.response?.status === 401 && !isAuthCall) {
      tokenStorage.clear()
      window.location.assign('/login?expired=1')
    }
    return Promise.reject(error)
  },
)

// Turns any axios error into a user-friendly { message, fieldErrors }.
export function parseError(error) {
  if (!error.response) {
    return {
      message: 'Cannot reach the server. Check your connection and try again.',
      fieldErrors: {},
    }
  }
  const data = error.response.data || {}
  return {
    message: data.message || 'Something went wrong. Please try again.',
    fieldErrors: data.fieldErrors || {},
  }
}

export default api
