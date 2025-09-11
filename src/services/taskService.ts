import { apiHelper } from './api'

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  position: number
  dueDate?: string
  estimatedHours?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
    client: {
      id: string
      company: string
    }
  }
  _count?: {
    timeEntries: number
  }
}

export interface TaskWithTimeEntries extends Task {
  timeEntries: TimeEntry[]
}

export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  startTime: string
  endTime?: string
  duration?: number
  description?: string
  billable: boolean
  approved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  projectId: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  estimatedHours?: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  estimatedHours?: number
}

export interface ReorderTaskData {
  id: string
  status: TaskStatus
  position: number
}

export interface ReorderTasksRequest {
  tasks: ReorderTaskData[]
}

export interface TasksResponse {
  success: boolean
  data: Task[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface TaskResponse {
  success: boolean
  message?: string
  data: Task | TaskWithTimeEntries
}

export interface ReorderResponse {
  success: boolean
  message?: string
  data: {
    updatedTasks: Task[]
  }
}

export interface TaskFilters {
  projectId?: string
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

class TaskService {
  
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {

          value.forEach(v => params.append(key, v.toString()))
        } else {
          params.append(key, value.toString())
        }
      }
    })

    params.append('_t', Date.now().toString())
    
    const queryString = params.toString()
    const url = queryString ? `/tasks?${queryString}` : `/tasks?_t=${Date.now()}`
    
    return apiHelper.get<TasksResponse>(url)
  }

  async createTask(data: CreateTaskRequest): Promise<TaskResponse> {
    return apiHelper.post<TaskResponse>('/tasks', data)
  }

  async getTask(id: string): Promise<TaskResponse> {
    return apiHelper.get<TaskResponse>(`/tasks/${id}`)
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<TaskResponse> {
    return apiHelper.put<TaskResponse>(`/tasks/${id}`, data)
  }

  async deleteTask(id: string): Promise<{ success: boolean; message?: string }> {
    return apiHelper.delete(`/tasks/${id}`)
  }

  async reorderTasks(data: ReorderTasksRequest): Promise<ReorderResponse> {

    const serverData = {
      tasks: data.tasks.map(task => ({
        ...task,
        status: task.status.toString().toUpperCase()
      }))
    }
    return apiHelper.post<ReorderResponse>('/tasks/reorder', serverData)
  }

  async getTasksGroupedByStatus(projectId?: string): Promise<Record<TaskStatus, Task[]>> {
    const response = await this.getTasks({ 
      projectId,
      limit: 1000,  
      sort: 'position',
      order: 'asc'
    })

    const grouped: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: []
    }

    response.data.forEach(task => {
      grouped[task.status].push(task)
    })

    return grouped
  }
}

export default new TaskService()