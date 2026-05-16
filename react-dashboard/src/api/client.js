import axios from 'axios'

export const TOKEN_KEY = 'marketmanager.token'
export const USER_KEY = 'marketmanager.user'

let unauthorizedHandler = null

export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Backend is unreachable. Start the engine and try again.'))
    }
    const { status, data } = error.response
    if (status === 401 && unauthorizedHandler) {
      unauthorizedHandler()
    }
    const message = data?.message || data?.error || `Request failed (${status})`
    const err = new Error(message)
    err.status = status
    err.data = data
    err.fieldErrors = data?.fieldErrors || null
    return Promise.reject(err)
  }
)

export default client
