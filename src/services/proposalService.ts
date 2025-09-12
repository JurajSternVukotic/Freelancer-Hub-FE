import { apiHelper } from './api'
import type { Proposal, ProposalItem, PaginatedResponse } from '../types'

export interface ProposalFilters {
  search?: string
  status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  clientId?: string
  page?: number
  limit?: number
}

export const proposalService = {

  async getProposals(filters: ProposalFilters = {}): Promise<PaginatedResponse<Proposal>> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.clientId) params.append('clientId', filters.clientId)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const url = queryString ? `/proposals?${queryString}` : '/proposals'
    
    return apiHelper.get<PaginatedResponse<Proposal>>(url)
  },

  async getProposal(id: string): Promise<Proposal> {
    return apiHelper.get<Proposal>(`/proposals/${id}`)
  },

  async createProposal(proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Proposal> {
    return apiHelper.post<Proposal>('/proposals', proposalData)
  },

  async updateProposal(id: string, proposalData: Partial<Proposal>): Promise<Proposal> {
    return apiHelper.put<Proposal>(`/proposals/${id}`, proposalData)
  },

  async deleteProposal(id: string): Promise<void> {
    return apiHelper.delete(`/proposals/${id}`)
  },

  async sendProposal(id: string): Promise<Proposal> {
    return apiHelper.post<Proposal>(`/proposals/${id}/send`, {})
  },

  async acceptProposal(id: string): Promise<Proposal> {
    return apiHelper.post<Proposal>(`/proposals/${id}/accept`, {})
  },

  async generateProposalPDF(id: string, filename?: string): Promise<void> {
    try {

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/proposals/${id}/pdf`, {
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
      link.setAttribute('download', filename || `ponuda-${id}.pdf`)
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
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'viewed': 'bg-purple-100 text-purple-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  },

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'draft': 'Skica',
      'sent': 'Poslano',
      'viewed': 'Pogledano',
      'accepted': 'Prihvaćeno',
      'rejected': 'Odbačeno',
      'expired': 'Isteklo'
    }
    return texts[status] || status
  },

  formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('hr-HR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num)
  },

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}