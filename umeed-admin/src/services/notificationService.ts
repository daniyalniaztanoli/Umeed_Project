import { request } from './api'
import type { Notification } from '@/types'

export const notificationService = {
  list() { return request<Notification[]>('GET', '/notifications') },
  read(id: string) { return request<{ ok: boolean }>('PATCH', `/notifications/${id}/read`) },
  readAll() { return request<{ ok: boolean }>('PATCH', '/notifications/read-all') },
}