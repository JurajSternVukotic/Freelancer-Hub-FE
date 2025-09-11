import { apiHelper } from './api'

export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  startTime: string
  endTime: string
  duration: number
  description?: string
  billable: boolean
  task?: {
    id: string
    title: string
    project: {
      id: string
      name: string
    }
  }
  project?: {
    id: string
    name: string
  }
}

export interface CreateTimeEntryRequest {
  taskId: string
  startTime: string
  endTime: string
  duration: number
  description?: string
  billable: boolean
}

export interface UpdateTimeEntryRequest {
  startTime?: string
  endTime?: string
  duration?: number
  description?: string
  billable?: boolean
}

class TimeService {
  
  async getTimeEntries(projectId?: string): Promise<TimeEntry[]> {
    const url = projectId ? `/time-entries?projectId=${projectId}` : '/time-entries'
    const response = await apiHelper.get<TimeEntry[]>(url)
    return response.data || response
  }

  async getTimeEntry(id: string): Promise<TimeEntry> {
    const response = await apiHelper.get<TimeEntry>(`/time-entries/${id}`)
    return response.data || response
  }

  async createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
    const response = await apiHelper.post<TimeEntry>('/time-entries', data)
    return response.data || response
  }

  async updateTimeEntry(id: string, data: UpdateTimeEntryRequest): Promise<TimeEntry> {
    const response = await apiHelper.put<TimeEntry>(`/time-entries/${id}`, data)
    return response.data || response
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await apiHelper.delete(`/time-entries/${id}`)
  }
}

export default new TimeService()