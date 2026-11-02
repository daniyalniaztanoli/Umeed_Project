import { request } from './api'
import type { Complaint, Paginated, ComplaintStatus } from '@/types'

export interface ComplaintQuery {
  status?: string
  category?: string
  priority?: string
  assignedTo?: string
  q?: string
  page?: number
  limit?: number
}

export const complaintService = {
  list(params: ComplaintQuery = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) qs.append(k, String(v)) })
    return request<Paginated<Complaint>>('GET', `/complaints?${qs.toString()}`)
  },
  get(id: string) { return request<Complaint>('GET', `/complaints/${id}`) },
  assign(id: string, staffId: string) { return request<Complaint>('PATCH', `/complaints/${id}/assign`, { assignedTo: staffId }) },
  updateStatus(id: string, status: ComplaintStatus, note?: string) { return request<Complaint>('PATCH', `/complaints/${id}/status`, { status, note }) },
}