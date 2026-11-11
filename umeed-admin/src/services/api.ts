import axios, { AxiosError } from 'axios'
import { mockApi } from './mockApi'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
const TOKEN_KEY = 'umeed_token'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)

api.interceptors.request.use((config) => {
  const t = getToken()
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      setToken(null)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1'
      }
    }
    const message =
      error.response?.data?.message || error.message || 'Network request failed. Is the backend reachable?'
    return Promise.reject(new Error(message))
  }
)

export async function request<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT', url: string, body?: unknown): Promise<T> {
  if (DEMO_MODE) return mockApi<T>(method, url, body)
  const res = await api.request<T>({ method, url, data: body })
  return res.data
}