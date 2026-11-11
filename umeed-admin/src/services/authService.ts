import { request, setToken } from './api'
import type { User } from '@/types'

export const authService = {
  async login(email: string, password: string) {
    const res = await request<{ token: string; user: User }>('POST', '/auth/login', { email, password })
    setToken(res.token)
    return res.user
  },
  async me() { return request<User>('GET', '/auth/me') },
  logout() { setToken(null) },
}