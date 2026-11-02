import { request } from './api'
import type { User } from '@/types'

export const staffService = {
  list() { return request<User[]>('GET', '/admin/users?role=staff') },
  create(data: { name: string; email: string; password: string; department: string }) { return request<User>('POST', '/admin/staff', data) },
}