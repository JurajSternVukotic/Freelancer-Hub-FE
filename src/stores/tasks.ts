import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import taskService, { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  ReorderTaskData,
  TaskFilters 
} from '../services/taskService'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useTasksStore = defineStore('tasks', () => {

  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const isLoading = ref(false)
  const currentFilters = ref<TaskFilters>({})
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

  const tasksByStatus = computed(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: []
    }
    
    console.log('Grouping tasks by status. Total tasks:', tasks.value?.length || 0)
    
    (tasks.value || []).forEach(task => {

      const status = task?.status || TaskStatus.TODO
      console.log(`Task ${task?.id}: status="${status}", title="${task?.title}"`)
      if (grouped[status]) {
        grouped[status].push(task)
      } else {
        console.warn(`Unknown task status: "${status}" for task ${task?.id}`)
      }
    })
    
    console.log('Grouped tasks:', {
      todo: grouped[TaskStatus.TODO]?.length || 0,
      in_progress: grouped[TaskStatus.IN_PROGRESS]?.length || 0, 
      review: grouped[TaskStatus.REVIEW]?.length || 0,
      done: grouped[TaskStatus.DONE]?.length || 0
    })

    Object.values(grouped).forEach(statusTasks => {
      statusTasks.sort((a, b) => {

        const { calculateTaskUrgency } = require('../utils/urgency')
        const urgencyA = calculateTaskUrgency(a)
        const urgencyB = calculateTaskUrgency(b)

        if (urgencyA.urgencyScore !== urgencyB.urgencyScore) {
          return urgencyB.urgencyScore - urgencyA.urgencyScore
        }
        return (a?.position || 0) - (b?.position || 0)
      })
    })
    
    return grouped
  })
  
  const tasksByProject = computed(() => {
    return (tasks.value || []).reduce((acc, task) => {
      const projectId = task?.project?.id
      if (projectId) {
        if (!acc[projectId]) {
          acc[projectId] = []
        }
        acc[projectId].push(task)
      }
      return acc
    }, {} as Record<string, Task[]>)
  })
  
  const tasksByPriority = computed(() => {
    return (tasks.value || []).reduce((acc, task) => {
      const priority = task?.priority || TaskPriority.MEDIUM
      if (!acc[priority]) {
        acc[priority] = []
      }
      acc[priority].push(task)
      return acc
    }, {} as Record<TaskPriority, Task[]>)
  })

  async function fetchTasks(filters: TaskFilters = {}) {
    isLoading.value = true
    try {
      currentFilters.value = { ...filters }
      const response = await taskService.getTasks(filters)

      tasks.value = Array.isArray(response) ? response : (response.data || [])
      if (response.pagination) {
        pagination.value = response.pagination
      }
      
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju zadataka'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function createTask(data: CreateTaskRequest) {
    isLoading.value = true
    try {
      const response = await taskService.createTask(data)
      
      console.log('Task creation response:', response)

      if (!tasks.value) {
        tasks.value = []
      }

      if (response) {
        console.log('Adding task to local state:', response)
        tasks.value.push(response as Task)
        console.log('Total tasks after creation:', tasks.value.length)
      } else {
        console.warn('No response data to add to local state')
      }
      
      toast.success('Zadatak je uspješno kreiran')
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri kreiranju zadatka'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchTask(id: string) {
    isLoading.value = true
    try {
      const response = await taskService.getTask(id)

      const taskData = response?.data || response
      currentTask.value = taskData as Task

      if (!tasks.value) {
        tasks.value = []
      }
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1 && taskData) {
        tasks.value[index] = taskData as Task
      }
      
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju zadatka'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateTask(id: string, data: UpdateTaskRequest) {
    isLoading.value = true
    try {
      const response = await taskService.updateTask(id, data)
      
      console.log('Task update response:', response)

      const updatedTask = response?.data || response

      if (!tasks.value) {
        tasks.value = []
      }
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1 && updatedTask) {
        console.log('Updating task at index', index, 'with:', updatedTask)
        tasks.value[index] = updatedTask as Task
      }
      
      if (currentTask.value?.id === id && updatedTask) {
        currentTask.value = updatedTask as Task
      }
      
      toast.success('Zadatak je uspješno ažuriran')
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri ažuriranju zadatka'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteTask(id: string) {
    isLoading.value = true
    try {
      await taskService.deleteTask(id)

      if (!tasks.value) {
        tasks.value = []
      } else {
        tasks.value = tasks.value.filter(t => t.id !== id)
      }
      
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }
      
      toast.success('Zadatak je uspješno obrisan')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri brisanju zadatka'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function reorderTasks(reorderData: ReorderTaskData[]) {
    try {
      const response = await taskService.reorderTasks({ tasks: reorderData })
      
      console.log('=== REORDER RESPONSE DEBUG ===')
      console.log('Reorder response:', response)
      console.log('Response type:', typeof response)
      console.log('Has data property?', response && typeof response === 'object' && 'data' in response)
      console.log('=== END REORDER DEBUG ===')

      if (!tasks.value) {
        tasks.value = []
      }

      const updatedTasks = response?.data?.updatedTasks || response?.updatedTasks || []
      console.log('Updated tasks:', updatedTasks)
      
      updatedTasks.forEach(updatedTask => {
        const index = tasks.value.findIndex(t => t.id === updatedTask.id)
        if (index !== -1) {
          tasks.value[index] = updatedTask
        }
      })
      
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri preraspoređivanju zadataka'
      toast.error(message)
      throw error
    }
  }
  
  async function fetchTasksForProject(projectId: string) {
    return fetchTasks({ projectId, limit: 1000 })
  }
  
  async function fetchKanbanTasks(projectId?: string) {
    const filters: TaskFilters = { 
      limit: 1000,
      sort: 'position', 
      order: 'asc' 
    }
    if (projectId) {
      filters.projectId = projectId
    }
    
    return fetchTasks(filters)
  }

  function updateTaskStatusOptimistic(taskId: string, newStatus: TaskStatus, newPosition: number) {
    if (!tasks.value) {
      tasks.value = []
    }
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.status = newStatus
      task.position = newPosition
    }
  }

  function revertTaskUpdate(taskId: string, originalStatus: TaskStatus, originalPosition: number) {
    if (!tasks.value) {
      tasks.value = []
    }
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.status = originalStatus
      task.position = originalPosition
    }
  }
  
  function clearCurrentTask() {
    currentTask.value = null
  }
  
  function clearTasks() {
    tasks.value = []
    pagination.value = { page: 1, limit: 50, total: 0, pages: 0 }
  }
  
  return {

    tasks,
    currentTask,
    isLoading,
    currentFilters,
    pagination,

    tasksByStatus,
    tasksByProject,
    tasksByPriority,

    fetchTasks,
    createTask,
    fetchTask,
    updateTask,
    deleteTask,
    reorderTasks,
    fetchTasksForProject,
    fetchKanbanTasks,
    updateTaskStatusOptimistic,
    revertTaskUpdate,
    clearCurrentTask,
    clearTasks
  }
})