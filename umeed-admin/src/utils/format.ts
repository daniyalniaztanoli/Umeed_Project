import { format, formatDistanceToNow } from 'date-fns'

export const fmtDate = (d?: string) => d ? format(new Date(d), 'dd MMM yyyy') : '—'
export const fmtDateTime = (d?: string) => d ? format(new Date(d), 'dd MMM yyyy · HH:mm') : '—'
export const timeAgo = (d?: string) => d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : '—'
export const initials = (name?: string) =>
  (name || '').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?'
export const idOf = (v: unknown): string =>
  typeof v === 'string' ? v : (v as { _id?: string })?._id || ''