import { request } from './api'
import type { AdminStats } from '@/types'

export const dashboardService = {
  stats() { return request<AdminStats>('GET', '/admin/stats') },
}