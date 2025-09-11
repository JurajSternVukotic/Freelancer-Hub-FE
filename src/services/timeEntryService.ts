import { apiHelper } from './api'
import { TimeEntry } from './taskService'

export interface CreateTimeEntryRequest {
  taskId: string
  startTime: string | Date
  endTime: string | Date
  description?: string
  billable?: boolean
}

export interface UpdateTimeEntryRequest {
  startTime?: string | Date
  endTime?: string | Date
  description?: string
  billable?: boolean
}

export interface TimeEntryFilters {
  taskId?: string
  projectId?: string
  billable?: boolean
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface TimeEntriesResponse {
  success: boolean
  data: TimeEntry[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface TimeEntryResponse {
  success: boolean
  message?: string
  data: TimeEntry
}

class TimeEntryService {
  
  async getTimeEntries(filters: TimeEntryFilters = {}): Promise<TimeEntriesResponse> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
    
    const queryString = params.toString()
    const url = queryString ? `/time-entries?${queryString}` : '/time-entries'
    
    return apiHelper.get<TimeEntriesResponse>(url)
  }

  async createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntryResponse> {
    return apiHelper.post<TimeEntryResponse>('/time-entries', data)
  }

  async getTimeEntry(id: string): Promise<TimeEntryResponse> {
    return apiHelper.get<TimeEntryResponse>(`/time-entries/${id}`)
  }

  async updateTimeEntry(id: string, data: UpdateTimeEntryRequest): Promise<TimeEntryResponse> {
    return apiHelper.put<TimeEntryResponse>(`/time-entries/${id}`, data)
  }

  async deleteTimeEntry(id: string): Promise<{ success: boolean; message?: string }> {
    return apiHelper.delete(`/time-entries/${id}`)
  }

  async getTimeEntriesForDateRange(startDate: string, endDate: string, filters: Omit<TimeEntryFilters, 'dateFrom' | 'dateTo'> = {}): Promise<TimeEntriesResponse> {
    return this.getTimeEntries({
      ...filters,
      dateFrom: startDate,
      dateTo: endDate
    })
  }

  async getTimeEntriesForTask(taskId: string, filters: Omit<TimeEntryFilters, 'taskId'> = {}): Promise<TimeEntriesResponse> {
    return this.getTimeEntries({
      ...filters,
      taskId
    })
  }

  async getTimeEntriesForProject(projectId: string, filters: Omit<TimeEntryFilters, 'projectId'> = {}): Promise<TimeEntriesResponse> {
    return this.getTimeEntries({
      ...filters,
      projectId
    })
  }
}

export default new TimeEntryService()