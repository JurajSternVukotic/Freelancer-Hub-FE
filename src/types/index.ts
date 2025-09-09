export * from './auth'

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  field?: string
}

export interface Client {
  id: string
  company: string         // Required field in backend
  contactPerson: string
  email: string
  phone?: string
  address?: string
  city?: string
  country?: string
  oib?: string
  notes?: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'  // Backend expects UPPERCASE enum values
  name?: string           // Backend maps contactPerson to name for compatibility
  isActive?: boolean
  createdAt: string
  updatedAt: string

  projects?: any[]
  _count?: {
    projects: number
    invoices: number
  }
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'  // Backend uses UPPERCASE
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'  // Backend uses UPPERCASE
  startDate?: string
  endDate?: string
  budget?: number
  estimatedHours?: number
  actualHours?: number
  clientId: string
  ownerId: string
  client?: Client
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'  // Backend uses UPPERCASE
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'      // Backend uses UPPERCASE
  dueDate?: string
  estimatedHours?: number
  projectId: string
  project?: Project
  position: number
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  description?: string
  startTime: string
  endTime?: string
  duration?: number // in minutes
  billable: boolean
  hourlyRate?: number
  taskId?: string
  task?: Task
  projectId?: string
  project?: Project
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  description?: string
  defaultRate: number
  unit: 'hour' | 'day' | 'project' | 'item'
  category?: string
  isActive: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  category: string
  expenseDate: string
  receipt?: string
  billable: boolean
  reimbursable: boolean
  projectId?: string
  project?: Project
  clientId?: string
  client?: Client
  userId: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
  taxRate?: number
  taxAmount?: number
  serviceId?: string
  service?: Service
}

export interface Invoice {
  id: string
  number: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'  // Backend uses UPPERCASE only
  date: string        // Backend uses 'date' not 'issueDate'
  dueDate: string
  subtotal: number
  tax: number         // Backend uses 'tax' not 'taxAmount'
  total: number
  notes?: string
  clientId: string
  projectId?: string
  client?: Client
  items: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

export interface ProposalItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
  serviceId?: string
  service?: Service
}

export interface Proposal {
  id: string
  title: string
  description?: string
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  validUntil: string
  subtotal: number
  taxAmount: number
  total: number
  currency: string
  terms?: string
  clientId: string
  client?: Client
  items: ProposalItem[]
  acceptedAt?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ReportFilter {
  startDate?: string
  endDate?: string
  clientId?: string
  projectId?: string
  status?: string[]
}

export interface RevenueData {
  period: string
  revenue: number
  expenses: number
  profit: number
}

export interface ProjectProfitability {
  projectId: string
  projectName: string
  revenue: number
  expenses: number
  profit: number
  margin: number
  hours: number
}

export interface ClientDistribution {
  clientId: string
  clientName: string
  revenue: number
  percentage: number
}

export interface UtilizationData {
  period: string
  billableHours: number
  totalHours: number
  utilizationRate: number
}

export interface ProjectSuggestion {
  phase: string
  description: string
  estimatedHours: number
  suggestedTasks: string[]
}

export interface FreelancerMatch {
  skill: string
  experience: number
  rate: number
  availability: 'available' | 'busy' | 'unavailable'
  score: number
}

export interface TimeEstimate {
  taskDescription: string
  estimatedHours: number
  confidence: number
  factors: string[]
}

export interface Retainer {
  id: string
  name: string
  description?: string
  totalHours: number
  usedHours: number
  remainingHours: number
  hourlyRate: number
  totalAmount: number
  usedAmount: number
  remainingAmount: number
  startDate: string
  endDate?: string
  status: 'active' | 'expired' | 'completed'
  clientId: string
  client?: Client
  userId: string
  createdAt: string
  updatedAt: string
}

export interface RetainerUsage {
  id: string
  description: string
  hours: number
  amount: number
  date: string
  retainerId: string
  userId: string
  createdAt: string
  updatedAt: string
}