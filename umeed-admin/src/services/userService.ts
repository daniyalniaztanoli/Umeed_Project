import { request } from './api'
import type { User } from '@/types'

export const userService = {
  list(params: { role?: string; blocked?: boolean; q?: string } = {}) {
    const qs = new URLSearchParams()
    if (params.role) qs.append('role', params.role)
    if (params.blocked) qs.append('blocked', 'true')
    if (params.q) qs.append('q', params.q)
    return request<User[]>('GET', `/admin/users?${qs.toString()}`)
  },
  setBlocked(id: string, blocked: boolean) { return request<User>('PATCH', `/admin/users/${id}/block`, { blocked }) },
}