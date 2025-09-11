import { apiHelper } from './api'

export interface TimerSession {
  id: string
  taskId: string
  userId: string
  startTime: string
  description?: string
  isRunning: boolean
  task: {
    id: string
    title: string
    project: {
      id: string
      name: string
    }
  }
}

export interface StartTimerRequest {
  taskId: string
  description?: string
}

export interface TimerResponse {
  success: boolean
  message?: string
  data: TimerSession | null
}

export interface StoppedTimerResponse {
  success: boolean
  message?: string
  data: {
    id: string
    taskId: string
    startTime: string
    endTime: string
    duration: number
    description?: string
    task: any
  }
}

class TimerService {
  
  async startTimer(data: StartTimerRequest): Promise<TimerResponse> {
    return apiHelper.post<TimerResponse>('/timer/start', data)
  }

  async stopTimer(): Promise<StoppedTimerResponse> {
    return apiHelper.post<StoppedTimerResponse>('/timer/stop')
  }

  async getCurrentTimer(): Promise<TimerResponse> {
    return apiHelper.get<TimerResponse>('/timer/current')
  }
}

export default new TimerService()