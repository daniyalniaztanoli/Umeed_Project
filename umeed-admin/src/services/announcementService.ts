import { request } from './api'
import type { Announcement } from '@/types'

export const announcementService = {
  list() { return request<Announcement[]>('GET', '/announcements') },
  create(data: Pick<Announcement, 'title' | 'body' | 'category'>) { return request<Announcement>('POST', '/announcements', data) },
  remove(id: string) { return request<{ ok: boolean }>('DELETE', `/announcements/${id}`) },
}