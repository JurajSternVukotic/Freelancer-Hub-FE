import { apiHelper } from './api'
import type { Client, PaginatedResponse } from '../types'

export interface ClientFilters {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'  // Backend expects UPPERCASE but transforms to lowercase for response
  page?: number
  limit?: number
}

export const clientService = {

  async getClients(filters: ClientFilters = {}): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const url = queryString ? `/clients?${queryString}` : '/clients'
    
    return apiHelper.get<PaginatedResponse<Client>>(url)
  },

  async getClient(id: string): Promise<Client> {
    return apiHelper.get<Client>(`/clients/${id}`)
  },

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Client> {
    return apiHelper.post<Client>('/clients', clientData)
  },

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    return apiHelper.put<Client>(`/clients/${id}`, clientData)
  },

  async deleteClient(id: string): Promise<void> {
    return apiHelper.delete(`/clients/${id}`)
  },

  async archiveClient(id: string): Promise<Client> {
    return apiHelper.patch<Client>(`/clients/${id}/archive`)
  },

  async restoreClient(id: string): Promise<Client> {
    return apiHelper.patch<Client>(`/clients/${id}/restore`)
  },

  async getClientProjects(clientId: string): Promise<any[]> {
    return apiHelper.get(`/clients/${clientId}/projects`)
  },

  async getClientInvoices(clientId: string): Promise<any[]> {
    return apiHelper.get(`/clients/${clientId}/invoices`)
  }
}