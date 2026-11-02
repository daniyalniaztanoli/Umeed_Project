export type Role = 'student' | 'staff' | 'admin'
export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
export type ComplaintPriority = 'Low' | 'Medium' | 'High'
export type ComplaintCategory = 'Facilities' | 'Cleanliness' | 'Hostel' | 'Safety' | 'Academic' | 'Other'
export type WelfareStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected'
export type WelfareType = 'Fee Aid' | 'Medical' | 'Counseling' | 'Emergency' | 'Other'
export type AnnouncementCategory = 'General' | 'Academic' | 'Event' | 'Emergency' | 'Facilities'

export interface User {
  _id: string
  name: string
  email: string
  role: Role
  studentId?: string
  department?: string
  phone?: string
  isBlocked?: boolean
  createdAt?: string
  lastActive?: string
  submissions?: number
}

export interface TimelineEvent {
  status: ComplaintStatus
  note?: string
  by?: string
  at: string
}

export interface Complaint {
  _id: string
  title: string
  description: string
  category: ComplaintCategory
  priority: ComplaintPriority
  status: ComplaintStatus
  images?: { url: string; name?: string; size?: number }[]
  location?: { building?: string; room?: string; text?: string }
  reportedBy: User | string
  assignedTo?: User | string | null
  timeline: TimelineEvent[]
  rating?: number
  feedback?: string
  createdAt: string
  updatedAt?: string
}

export interface WelfareRequest {
  _id: string
  type: WelfareType
  details: string
  documents?: { url: string; name?: string; size?: number }[]
  status: WelfareStatus
  adminNote?: string
  requestedBy: User | string
  amountRequested?: number
  createdAt: string
  updatedAt?: string
}

export interface Announcement {
  _id: string
  title: string
  body: string
  category: AnnouncementCategory
  createdBy: User | string
  createdAt: string
}

export interface Notification {
  _id: string
  user: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface AdminStats {
  totalComplaints: number
  pending: number
  inProgress: number
  resolved: number
  rejected: number
  welfareTotal: number
  welfarePending: number
  activeStudents: number
  avgResolutionHours: number
  categoryBreakdown: { name: ComplaintCategory | string; value: number }[]
  statusBreakdown: { name: ComplaintStatus | string; value: number }[]
  monthlyTrend: { month: string; filed: number; resolved: number }[]
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}