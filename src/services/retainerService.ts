import { apiHelper } from './api'
import type { Retainer, PaginatedResponse } from '../types'

export interface RetainerFilters {
  search?: string
  status?: 'active' | 'expired' | 'completed'
  clientId?: string
  page?: number
  limit?: number
}

export interface CreateRetainerData {
  name: string
  description?: string
  totalHours: number
  hourlyRate: number
  startDate: string
  endDate?: string
  clientId: string
}

export interface UpdateRetainerData {
  name?: string
  description?: string
  totalHours?: number
  hourlyRate?: number
  startDate?: string
  endDate?: string
  status?: 'active' | 'expired' | 'completed'
}

export interface LogHoursData {
  description: string
  hours: number
  date: string
}

export const retainerService = {

  async getRetainers(filters: RetainerFilters = {}): Promise<PaginatedResponse<Retainer>> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.clientId) params.append('clientId', filters.clientId)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const url = queryString ? `/retainers?${queryString}` : '/retainers'
    
    return apiHelper.get<PaginatedResponse<Retainer>>(url)
  },

  async getRetainer(id: string): Promise<Retainer> {
    return apiHelper.get<Retainer>(`/retainers/${id}`)
  },

  async createRetainer(retainerData: CreateRetainerData): Promise<Retainer> {

    const totalAmount = retainerData.totalHours * retainerData.hourlyRate
    
    const payload = {
      ...retainerData,
      totalAmount,
      usedHours: 0,
      remainingHours: retainerData.totalHours,
      usedAmount: 0,
      remainingAmount: totalAmount,
      status: 'active' as const
    }
    
    return apiHelper.post<Retainer>('/retainers', payload)
  },

  async updateRetainer(id: string, retainerData: UpdateRetainerData): Promise<Retainer> {
    return apiHelper.put<Retainer>(`/retainers/${id}`, retainerData)
  },

  async deleteRetainer(id: string): Promise<void> {
    return apiHelper.delete(`/retainers/${id}`)
  },

  async logHours(id: string, data: LogHoursData): Promise<Retainer> {
    return apiHelper.post<Retainer>(`/retainers/${id}/log-hours`, data)
  },

  async getRetainerUsage(id: string): Promise<any[]> {
    return apiHelper.get(`/retainers/${id}/usage`)
  }
}