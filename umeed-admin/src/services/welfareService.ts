import { request } from './api'
import type { WelfareRequest, WelfareStatus } from '@/types'

export const welfareService = {
  list(params: { status?: string; type?: string; q?: string } = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) qs.append(k, v) })
    return request<WelfareRequest[]>('GET', `/welfare?${qs.toString()}`)
  },
  update(id: string, patch: { status?: WelfareStatus; adminNote?: string }) {
    return request<WelfareRequest>('PATCH', `/welfare/${id}`, patch)
  },
}