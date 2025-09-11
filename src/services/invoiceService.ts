import { apiHelper } from './api'
import type { Invoice, InvoiceItem, PaginatedResponse } from '../types'

export interface InvoiceFilters {
  search?: string
  status?: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  clientId?: string
  projectId?: string
  page?: number
  limit?: number
}

export interface GenerateInvoiceData {
  projectId: string
  startDate: string
  endDate: string
  dueDate?: string
  notes?: string
}

export const invoiceService = {

  async getInvoices(filters: InvoiceFilters = {}): Promise<PaginatedResponse<Invoice>> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.clientId) params.append('clientId', filters.clientId)
    if (filters.projectId) params.append('projectId', filters.projectId)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const url = queryString ? `/invoices?${queryString}` : '/invoices'
    
    return apiHelper.get<PaginatedResponse<Invoice>>(url)
  },

  async getInvoice(id: string): Promise<Invoice> {
    return apiHelper.get<Invoice>(`/invoices/${id}`)
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Invoice> {
    return apiHelper.post<Invoice>('/invoices', invoiceData)
  },

  async updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<Invoice> {
    return apiHelper.put<Invoice>(`/invoices/${id}`, invoiceData)
  },

  async deleteInvoice(id: string): Promise<void> {
    return apiHelper.delete(`/invoices/${id}`)
  },

  async generateFromProject(projectId: string, data: GenerateInvoiceData): Promise<Invoice> {
    return apiHelper.post<Invoice>('/invoices/generate', { ...data, projectId })
  },

  async downloadPDF(id: string, filename?: string): Promise<void> {
    try {

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/invoices/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SENT': 'bg-blue-100 text-blue-800',
      'VIEWED': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-green-100 text-green-800',
      'OVERDUE': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  },

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'DRAFT': 'Skica',
      'SENT': 'Poslano',
      'VIEWED': 'Pregledano',
      'PAID': 'Plaćeno',
      'OVERDUE': 'Zakašnjelo',
      'CANCELLED': 'Otkazano'
    }
    return texts[status] || status
  },

  formatCurrency(amount: string | number | object): string {
    let num: number;
    
    if (typeof amount === 'object' && amount !== null) {

      num = Number(amount)
    } else if (typeof amount === 'string') {
      num = parseFloat(amount)
    } else {
      num = amount || 0
    }
    
    if (isNaN(num)) {
      num = 0
    }
    
    return new Intl.NumberFormat('hr-HR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num)
  },

  formatDate(date: string | Date): string {
    if (!date) {
      return 'N/A'
    }
    
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
      }
      
      return dateObj.toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.warn('Date formatting error:', error, 'for date:', date)
      return 'Invalid Date'
    }
  }
}