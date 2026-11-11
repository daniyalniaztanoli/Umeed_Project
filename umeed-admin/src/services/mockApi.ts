import type {
  AdminStats, Announcement, Complaint, ComplaintStatus, User, WelfareRequest,
} from '@/types'

const uid = () => Math.random().toString(36).slice(2, 11)

const students: User[] = [
  { _id: 'u1', name: 'Ayesha Malik', email: 'ayesha@campus.edu', role: 'student', studentId: 'CS-2022-011', department: 'Computer Science', createdAt: '2024-01-10', submissions: 3 },
  { _id: 'u2', name: 'Bilal Ahmed', email: 'bilal@campus.edu', role: 'student', studentId: 'EE-2021-044', department: 'Electrical Engineering', createdAt: '2023-09-12', submissions: 1 },
  { _id: 'u3', name: 'Hina Shah', email: 'hina@campus.edu', role: 'student', studentId: 'BBA-2023-007', department: 'Business Admin', createdAt: '2024-02-01', submissions: 2 },
  { _id: 'u4', name: 'Omar Khan', email: 'omar@campus.edu', role: 'student', studentId: 'ME-2020-102', department: 'Mechanical Engineering', createdAt: '2022-08-15', submissions: 5, isBlocked: true },
  { _id: 'u5', name: 'Sana Yousaf', email: 'sana@campus.edu', role: 'student', studentId: 'CS-2023-019', department: 'Computer Science', createdAt: '2024-03-04', submissions: 0 },
]
const staff: User[] = [
  { _id: 's1', name: 'Rashid Ali', email: 'rashid.ali@campus.edu', role: 'staff', department: 'Facilities', createdAt: '2022-01-04' },
  { _id: 's2', name: 'Khurram Shahzad', email: 'khurram.s@campus.edu', role: 'staff', department: 'Hostel Administration', createdAt: '2021-06-19' },
  { _id: 's3', name: 'Imtiaz Ahmed', email: 'imtiaz.a@campus.edu', role: 'staff', department: 'Maintenance', createdAt: '2020-11-02' },
  { _id: 's4', name: 'Farah Naz', email: 'farah.naz@campus.edu', role: 'staff', department: 'Student Affairs', createdAt: '2023-04-12' },
]
const admins: User[] = [
  { _id: 'a1', name: 'Dr. Adeel Hashmi', email: 'admin@umeed.edu', role: 'admin', department: 'Administration', createdAt: '2020-01-01' },
]
const users = [...students, ...staff, ...admins]

function makeComplaint(id: string, title: string, description: string, category: Complaint['category'], priority: Complaint['priority'], status: Complaint['status'], reporterId: string, assigneeId?: string): Complaint {
  const now = Date.now()
  const timeline: Complaint['timeline'] = [{ status: 'Pending', note: 'Complaint submitted', by: 'Student', at: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString() }]
  if (status !== 'Pending') timeline.push({ status: 'In Progress', note: 'Assigned to staff', by: 'Admin', at: new Date(now - 1000 * 60 * 60 * 20).toISOString() })
  if (status === 'Resolved') timeline.push({ status: 'Resolved', note: 'Issue addressed', by: 'Staff', at: new Date(now - 1000 * 60 * 60 * 4).toISOString() })
  if (status === 'Rejected') timeline.push({ status: 'Rejected', note: 'Not within scope', by: 'Admin', at: new Date(now - 1000 * 60 * 60 * 4).toISOString() })
  return { _id: id, title, description, category, priority, status, reportedBy: reporterId, assignedTo: assigneeId || null, timeline, createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString() }
}

let complaints: Complaint[] = [
  makeComplaint('CMP-2024-1042', 'Hostel Mess Food Hygiene', 'Food served in the hostel mess on 12 Oct showed signs of spoilage. Several students reported stomach issues.', 'Hostel', 'High', 'Pending', 'u1'),
  makeComplaint('CMP-2024-1041', 'Broken Classroom Furniture', 'Two desks in Room B-204 have broken legs.', 'Facilities', 'Medium', 'In Progress', 'u2', 's1'),
  makeComplaint('CMP-2024-1040', 'Washroom Maintenance', 'Washroom on 3rd floor, Block C has a leaking tap and blocked drain.', 'Cleanliness', 'Medium', 'In Progress', 'u3', 's3'),
  makeComplaint('CMP-2024-1039', 'Campus Lighting Issue', 'Street lights near the library parking are non-functional after 7 PM.', 'Safety', 'High', 'Pending', 'u4'),
  makeComplaint('CMP-2024-1038', 'Water Supply Problem', 'Intermittent water supply in Girls Hostel B.', 'Hostel', 'High', 'Resolved', 'u1', 's2'),
  makeComplaint('CMP-2024-1037', 'Library AC Not Working', 'The reading room AC has been broken for a week.', 'Facilities', 'Low', 'Resolved', 'u5', 's1'),
  makeComplaint('CMP-2024-1036', 'Exam Schedule Conflict', 'Two final exams scheduled on the same day.', 'Academic', 'Medium', 'Rejected', 'u2'),
  makeComplaint('CMP-2024-1035', 'Broken Wi-Fi Router', 'Wi-Fi in Lab 2 is down since Monday.', 'Facilities', 'Medium', 'Resolved', 'u3', 's3'),
  makeComplaint('CMP-2024-1034', 'Stray Dogs Near Cafeteria', 'Stray dogs near the cafeteria — safety concern.', 'Safety', 'Medium', 'In Progress', 'u5', 's4'),
  makeComplaint('CMP-2024-1033', 'Overflowing Dustbins', 'Dustbins outside the science block overflowing.', 'Cleanliness', 'Low', 'Resolved', 'u1', 's3'),
]

function makeWelfare(id: string, type: WelfareRequest['type'], details: string, status: WelfareRequest['status'], userId: string, amount?: number): WelfareRequest {
  return { _id: id, type, details, status, requestedBy: userId, amountRequested: amount, adminNote: status === 'Rejected' ? 'Insufficient documentation.' : undefined, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() }
}

let welfare: WelfareRequest[] = [
  makeWelfare('WLF-2024-201', 'Fee Aid', "Family income dropped due to father's illness. Requesting partial fee waiver.", 'Submitted', 'u1', 45000),
  makeWelfare('WLF-2024-200', 'Medical', "Need help covering hospital bill from last month's surgery.", 'Under Review', 'u2', 80000),
  makeWelfare('WLF-2024-199', 'Counseling', 'Requesting confidential counseling sessions.', 'Approved', 'u3'),
  makeWelfare('WLF-2024-198', 'Emergency', 'Emergency travel support due to family bereavement.', 'Approved', 'u4', 20000),
  makeWelfare('WLF-2024-197', 'Fee Aid', 'Semester fee installment support request.', 'Rejected', 'u5', 30000),
]

let announcements: Announcement[] = [
  { _id: 'ann1', title: 'Mid-Term Examination Schedule Released', body: 'Dear students, the mid-term examination schedule for Fall 2024 has been published on the student portal. Please check your individual timetables.', category: 'Academic', createdBy: 'a1', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { _id: 'ann2', title: 'Campus Wi-Fi Maintenance — 15 Nov', body: 'Campus Wi-Fi services will be interrupted between 10:00 AM and 2:00 PM on 15 November 2024 for scheduled maintenance.', category: 'Facilities', createdBy: 'a1', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
]

const notif = [
  { _id: 'n1', user: 'a1', title: 'New high-priority complaint', message: 'CMP-2024-1039 flagged as High priority.', read: false, createdAt: new Date().toISOString() },
  { _id: 'n2', user: 'a1', title: 'Welfare request awaiting review', message: 'WLF-2024-200 needs your attention.', read: false, createdAt: new Date().toISOString() },
]

const resolveUser = (id: string | User | null | undefined): User | string => {
  if (!id) return ''
  if (typeof id === 'object') return id
  return users.find((u) => u._id === id) || id
}
const populateComplaint = (c: Complaint): Complaint => ({ ...c, reportedBy: resolveUser(c.reportedBy), assignedTo: c.assignedTo ? resolveUser(c.assignedTo) : null })
const populateWelfare = (w: WelfareRequest): WelfareRequest => ({ ...w, requestedBy: resolveUser(w.requestedBy) })
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

function computeStats(): AdminStats {
  const catMap = new Map<string, number>(); const statMap = new Map<string, number>()
  let totalHours = 0, resolvedCount = 0
  complaints.forEach((c) => {
    catMap.set(c.category, (catMap.get(c.category) || 0) + 1)
    statMap.set(c.status, (statMap.get(c.status) || 0) + 1)
    if (c.status === 'Resolved') {
      const created = new Date(c.createdAt).getTime()
            const upd = new Date(c.updatedAt || c.timeline[c.timeline.length - 1]?.at || c.createdAt).getTime()
      totalHours += Math.max(1, (upd - created) / 3600000); resolvedCount++
    }
  })
  const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    return {
      month: d.toLocaleString('en', { month: 'short' }),
      filed: complaints.filter((c) => new Date(c.createdAt).getMonth() === d.getMonth()).length + Math.floor(Math.random() * 3),
      resolved: complaints.filter((c) => c.status === 'Resolved' && new Date(c.createdAt).getMonth() === d.getMonth()).length + Math.floor(Math.random() * 2),
    }
  })
  return {
    totalComplaints: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
    rejected: complaints.filter((c) => c.status === 'Rejected').length,
    welfareTotal: welfare.length,
    welfarePending: welfare.filter((w) => w.status === 'Submitted' || w.status === 'Under Review').length,
    activeStudents: students.filter((s) => !s.isBlocked).length,
    avgResolutionHours: resolvedCount ? Math.round(totalHours / resolvedCount) : 0,
    categoryBreakdown: Array.from(catMap, ([name, value]) => ({ name, value })),
    statusBreakdown: Array.from(statMap, ([name, value]) => ({ name, value })),
    monthlyTrend,
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
export async function mockApi<T>(method: Method, url: string, body?: unknown): Promise<T> {
  await delay()
  const [rawPath, rawQuery] = url.split('?')
  const path = rawPath
  const query = new URLSearchParams(rawQuery || '')

  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = body as { email: string; password: string }
    const user = users.find((u) => u.email === email)
    if (!user || password !== 'admin123') throw new Error('Invalid email or password')
    if (user.role !== 'admin') throw new Error('Access denied — admin privileges required')
    if (user.isBlocked) throw new Error('This account has been blocked')
    return { token: `mock.${user._id}.${uid()}`, user } as T
  }
  if (path === '/auth/me' && method === 'GET') return admins[0] as T
  if (path === '/admin/stats' && method === 'GET') return computeStats() as T

  if (path === '/complaints' && method === 'GET') {
    let list = [...complaints]
    const status = query.get('status'); if (status) list = list.filter((c) => c.status === status)
    const category = query.get('category'); if (category) list = list.filter((c) => c.category === category)
    const priority = query.get('priority'); if (priority) list = list.filter((c) => c.priority === priority)
    const assigned = query.get('assignedTo'); if (assigned) list = list.filter((c) => c.assignedTo === assigned)
    const q = query.get('q')?.toLowerCase()
    if (q) list = list.filter((c) => {
      const rep = resolveUser(c.reportedBy) as User
      return c._id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || rep?.name?.toLowerCase().includes(q) || rep?.studentId?.toLowerCase().includes(q)
    })
    const page = Number(query.get('page') || 1); const limit = Number(query.get('limit') || 10)
    const total = list.length; const totalPages = Math.max(1, Math.ceil(total / limit))
    const paged = list.slice((page - 1) * limit, page * limit).map(populateComplaint)
    return { data: paged, total, page, limit, totalPages } as T
  }
  if (path.startsWith('/complaints/') && path.endsWith('/assign') && method === 'PATCH') {
    const id = path.split('/')[2]
    const { assignedTo } = body as { assignedTo: string }
    const idx = complaints.findIndex((c) => c._id === id)
    if (idx < 0) throw new Error('Complaint not found')
    complaints[idx] = { ...complaints[idx], assignedTo, status: complaints[idx].status === 'Pending' ? 'In Progress' : complaints[idx].status, updatedAt: new Date().toISOString(), timeline: [...complaints[idx].timeline, { status: 'In Progress', note: 'Staff assigned', by: 'Admin', at: new Date().toISOString() }] }
    return populateComplaint(complaints[idx]) as T
  }
  if (path.startsWith('/complaints/') && path.endsWith('/status') && method === 'PATCH') {
    const id = path.split('/')[2]
    const { status, note } = body as { status: ComplaintStatus; note?: string }
    const idx = complaints.findIndex((c) => c._id === id)
    if (idx < 0) throw new Error('Complaint not found')
    complaints[idx] = { ...complaints[idx], status, updatedAt: new Date().toISOString(), timeline: [...complaints[idx].timeline, { status, note, by: 'Admin', at: new Date().toISOString() }] }
    return populateComplaint(complaints[idx]) as T
  }
  if (path.startsWith('/complaints/') && method === 'GET') {
    const id = path.split('/')[2]
    const c = complaints.find((x) => x._id === id)
    if (!c) throw new Error('Complaint not found')
    return populateComplaint(c) as T
  }

  if (path === '/welfare' && method === 'GET') {
    let list = welfare.map(populateWelfare)
    const status = query.get('status'); if (status) list = list.filter((w) => w.status === status)
    const type = query.get('type'); if (type) list = list.filter((w) => w.type === type)
    const q = query.get('q')?.toLowerCase()
    if (q) list = list.filter((w) => { const u = w.requestedBy as User; return w._id.toLowerCase().includes(q) || u?.name?.toLowerCase().includes(q) || u?.studentId?.toLowerCase().includes(q) })
    return list as T
  }
  if (path.startsWith('/welfare/') && method === 'PATCH') {
    const id = path.split('/')[2]
    const patch = body as Partial<WelfareRequest>
    const idx = welfare.findIndex((w) => w._id === id)
    if (idx < 0) throw new Error('Welfare request not found')
    welfare[idx] = { ...welfare[idx], ...patch, updatedAt: new Date().toISOString() }
    return populateWelfare(welfare[idx]) as T
  }

  if (path === '/announcements' && method === 'GET') return announcements.map((a) => ({ ...a, createdBy: resolveUser(a.createdBy) })) as T
  if (path === '/announcements' && method === 'POST') {
    const bodyIn = body as Pick<Announcement, 'title' | 'body' | 'category'>
    const a: Announcement = { _id: 'ann' + uid(), ...bodyIn, createdBy: 'a1', createdAt: new Date().toISOString() }
    announcements = [a, ...announcements]
    return a as T
  }
  if (path.startsWith('/announcements/') && method === 'DELETE') {
    const id = path.split('/')[2]
    announcements = announcements.filter((a) => a._id !== id)
    return { ok: true } as T
  }

  if (path === '/admin/staff' && method === 'POST') {
    const bodyIn = body as { name: string; email: string; department: string; password: string }
    if (users.some((u) => u.email === bodyIn.email)) throw new Error('A user with this email already exists')
    const u: User = { _id: 's' + uid(), name: bodyIn.name, email: bodyIn.email, role: 'staff', department: bodyIn.department, createdAt: new Date().toISOString() }
    staff.push(u); users.push(u)
    return u as T
  }
  if (path === '/admin/users' && method === 'GET') {
    const role = query.get('role'); const blocked = query.get('blocked')
    let list = users
    if (role) list = list.filter((u) => u.role === role)
    if (blocked === 'true') list = list.filter((u) => u.isBlocked)
    const q = query.get('q')?.toLowerCase()
    if (q) list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.studentId?.toLowerCase().includes(q))
    return list as T
  }
  if (path.match(/^\/admin\/users\/[^/]+\/block$/) && method === 'PATCH') {
    const id = path.split('/')[3]
    const { blocked } = body as { blocked: boolean }
    const u = users.find((x) => x._id === id)
    if (!u) throw new Error('User not found')
    u.isBlocked = blocked
    return u as T
  }

  if (path === '/notifications' && method === 'GET') return notif as T
  if (path.match(/^\/notifications\/[^/]+\/read$/) && method === 'PATCH') {
    const id = path.split('/')[2]; const n = notif.find((x) => x._id === id); if (n) n.read = true
    return { ok: true } as T
  }
  if (path === '/notifications/read-all' && method === 'PATCH') { notif.forEach((n) => (n.read = true)); return { ok: true } as T }

  throw new Error(`Mock API: no handler for ${method} ${path}`)
}