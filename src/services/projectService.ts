import { apiHelper } from './api'
import type { Project, PaginatedResponse } from '../types'

export interface ProjectFilters {
  search?: string
  status?: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'  // Backend uses UPPERCASE
  clientId?: string
  page?: number
  limit?: number
}

export const projectService = {

  async getProjects(filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.clientId) params.append('clientId', filters.clientId)

    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const url = queryString ? `/projects?${queryString}` : '/projects'
    
    return apiHelper.get<PaginatedResponse<Project>>(url)
  },

  async getProject(id: string): Promise<Project> {
    return apiHelper.get<Project>(`/projects/${id}`)
  },

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'actualHours'>): Promise<Project> {
    return apiHelper.post<Project>('/projects', projectData)
  },

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    return apiHelper.put<Project>(`/projects/${id}`, projectData)
  },

  async deleteProject(id: string): Promise<void> {
    return apiHelper.delete(`/projects/${id}`)
  },

  async archiveProject(id: string): Promise<Project> {
    return apiHelper.patch<Project>(`/projects/${id}`, { status: 'COMPLETED' })
  },

  async restoreProject(id: string): Promise<Project> {
    return apiHelper.patch<Project>(`/projects/${id}`, { status: 'ACTIVE' })
  },

  async getProjectTasks(projectId: string): Promise<any[]> {
    return apiHelper.get(`/projects/${projectId}/tasks`)
  },

  async getProjectTimeEntries(projectId: string): Promise<any[]> {
    return apiHelper.get(`/projects/${projectId}/time-entries`)
  },

  async getProjectExpenses(projectId: string): Promise<any[]> {
    return apiHelper.get(`/projects/${projectId}/expenses`)
  },

  async getProjectInvoices(projectId: string): Promise<any[]> {
    return apiHelper.get(`/projects/${projectId}/invoices`)
  },

  async getProjectStats(projectId: string): Promise<any> {
    return apiHelper.get(`/projects/${projectId}/stats`)
  },

  async updateProjectStatus(id: string, status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'): Promise<Project> {
    return apiHelper.patch<Project>(`/projects/${id}`, { status })
  }
}