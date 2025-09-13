import { clientApi, unwrapResponse } from './clientApi'

const CLIENT_PORTAL_BASE_URL = '/client-portal'

export interface ProjectRequest {
  id: string
  title: string
  description: string
  budgetRange?: string
  deadline?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'ASSIGNED' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  freelancerResponse?: string
  quotedAmount?: number
  assignedFreelancer?: {
    firstName: string
    lastName: string
    company?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateProjectRequestData {
  title: string
  description: string
  budgetRange?: string
  deadline?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

export interface ClientInvoice {
  id: string
  number: string
  total: number
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  date: string
  dueDate: string
  project?: {
    id: string
    name: string
  }
  items: Array<{
    id: string
    description: string
    quantity: number
    rate: number
    amount: number
  }>
}

export interface ClientDashboard {
  activeProjects: Array<{
    id: string
    name: string
    status: string
    priority: string
    startDate?: string
    endDate?: string
    description?: string
    owner: {
      firstName: string
      lastName: string
      company?: string
    }
  }>
  pendingRequests: Array<{
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
  }>
  recentInvoices: Array<{
    id: string
    number: string
    total: number
    status: string
    date: string
    dueDate: string
  }>
  summary: {
    activeProjectsCount: number
    pendingRequestsCount: number
    invoices: Record<string, { count: number; total: number }>
  }
}

export const clientPortalService = {

  async createProjectRequest(data: CreateProjectRequestData) {
    const response = await clientApi.post(`${CLIENT_PORTAL_BASE_URL}/project-requests`, data)
    return unwrapResponse(response)
  },

  async getProjectRequests(): Promise<ProjectRequest[]> {
    const response = await clientApi.get(`${CLIENT_PORTAL_BASE_URL}/project-requests`)
    return unwrapResponse(response)
  },

  async getProjectRequest(id: string): Promise<ProjectRequest> {
    const response = await clientApi.get(`${CLIENT_PORTAL_BASE_URL}/project-requests/${id}`)
    return unwrapResponse(response)
  },

  async getInvoices(params?: { page?: number; limit?: number; status?: string }) {
    const response = await clientApi.get(`${CLIENT_PORTAL_BASE_URL}/invoices`, { params })
    return unwrapResponse(response)
  },

  async getInvoice(id: string): Promise<ClientInvoice> {
    const response = await clientApi.get(`${CLIENT_PORTAL_BASE_URL}/invoices/${id}`)
    return unwrapResponse(response)
  },

  async markInvoiceAsPaid(id: string) {
    const response = await clientApi.post(`${CLIENT_PORTAL_BASE_URL}/invoices/${id}/pay`)
    return unwrapResponse(response)
  },

  async downloadInvoicePDF(id: string, filename?: string): Promise<void> {
    try {

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}${CLIENT_PORTAL_BASE_URL}/invoices/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('client_token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Greška pri preuzimanju PDF-a')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename || `racun-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Greška pri preuzimanju PDF-a:', error)
      throw error
    }
  },

  async getDashboard(): Promise<ClientDashboard> {
    const response = await clientApi.get(`${CLIENT_PORTAL_BASE_URL}/dashboard`)
    return unwrapResponse(response)
  }
}