import { apiHelper } from './api'
import type { 
  RevenueData, 
  ProjectProfitability, 
  ClientDistribution, 
  UtilizationData, 
  ReportFilter,
  Project,
  TimeEntry,
  PaginatedResponse
} from '../types'

export interface ReportStats {
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  activeProjects: number
  completedProjects: number
  totalClients: number
  billableHours: number
  utilizationRate: number
}

export interface RevenueParams {
  period: 'monthly' | 'yearly'
  startDate?: string
  endDate?: string
}

export const reportService = {

  async getRevenueData(params: RevenueParams): Promise<RevenueData[]> {
    const queryParams = new URLSearchParams()
    queryParams.append('period', params.period)
    queryParams.append('_t', Date.now().toString()) // Cache buster
    
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    
    return apiHelper.get<RevenueData[]>(`/reports/revenue?${queryParams.toString()}`)
  },

  async getProjectStats(filters: ReportFilter = {}): Promise<ProjectProfitability[]> {
    const queryParams = new URLSearchParams()
    queryParams.append('_t', Date.now().toString()) // Cache buster
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate)
    if (filters.endDate) queryParams.append('endDate', filters.endDate)
    if (filters.clientId) queryParams.append('clientId', filters.clientId)
    if (filters.projectId) queryParams.append('projectId', filters.projectId)
    
    return apiHelper.get<ProjectProfitability[]>(`/reports/projects?${queryParams.toString()}`)
  },

  async getClientStats(filters: ReportFilter = {}): Promise<ClientDistribution[]> {
    const queryParams = new URLSearchParams()
    queryParams.append('_t', Date.now().toString()) // Cache buster
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate)
    if (filters.endDate) queryParams.append('endDate', filters.endDate)
    if (filters.clientId) queryParams.append('clientId', filters.clientId)
    
    return apiHelper.get<ClientDistribution[]>(`/reports/clients?${queryParams.toString()}`)
  },

  async getTimeStats(filters: ReportFilter = {}): Promise<UtilizationData[]> {
    const queryParams = new URLSearchParams()
    queryParams.append('_t', Date.now().toString()) // Cache buster
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate)
    if (filters.endDate) queryParams.append('endDate', filters.endDate)
    if (filters.projectId) queryParams.append('projectId', filters.projectId)
    
    return apiHelper.get<UtilizationData[]>(`/reports/time?${queryParams.toString()}`)
  },

  async getReportStats(filters: ReportFilter = {}): Promise<ReportStats> {
    const queryParams = new URLSearchParams()
    queryParams.append('_t', Date.now().toString()) // Cache buster
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate)
    if (filters.endDate) queryParams.append('endDate', filters.endDate)
    if (filters.clientId) queryParams.append('clientId', filters.clientId)
    
    return apiHelper.get<ReportStats>(`/reports/stats?${queryParams.toString()}`)
  },

  async getProjectsForReports(): Promise<Project[]> {
    return apiHelper.get<PaginatedResponse<Project>>('/projects?limit=1000')
      .then(response => response.data)
  },

  async getTimeEntriesForReports(filters: ReportFilter = {}): Promise<TimeEntry[]> {
    const queryParams = new URLSearchParams()
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate)
    if (filters.endDate) queryParams.append('endDate', filters.endDate)
    if (filters.projectId) queryParams.append('projectId', filters.projectId)
    if (filters.clientId) queryParams.append('clientId', filters.clientId)
    
    queryParams.append('limit', '10000') // Get large dataset for reports
    
    const queryString = queryParams.toString()
    const url = queryString ? `/time-entries?${queryString}` : '/time-entries?limit=10000'
    
    return apiHelper.get<PaginatedResponse<TimeEntry>>(url)
      .then(response => response.data)
  },

  async exportReport(type: 'revenue' | 'projects' | 'clients' | 'time', filters: ReportFilter = {}): Promise<Blob> {
    const queryParams = new URLSearchParams()
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate)
    if (filters.endDate) queryParams.append('endDate', filters.endDate)
    if (filters.clientId) queryParams.append('clientId', filters.clientId)
    if (filters.projectId) queryParams.append('projectId', filters.projectId)
    
    queryParams.append('format', 'csv')
    
    const queryString = queryParams.toString()
    const url = `/reports/${type}/export?${queryString}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    
    return response.blob()
  }
}