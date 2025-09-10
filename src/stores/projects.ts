import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, PaginatedResponse } from '../types'
import { projectService, type ProjectFilters } from '../services/projectService'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useProjectsStore = defineStore('projects', () => {

  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const filters = ref<ProjectFilters>({
    search: '',
    status: undefined,
    clientId: undefined,
    priority: undefined,
    page: 1,
    limit: 10
  })

  const activeProjects = computed(() => 
    (projects.value || []).filter(project => 
      project.status?.toUpperCase() === 'ACTIVE'
    )
  )
  
  const completedProjects = computed(() => 
    (projects.value || []).filter(project => 
      project.status?.toUpperCase() === 'COMPLETED'
    )
  )
  
  const planningProjects = computed(() => 
    (projects.value || []).filter(project => 
      project.status?.toUpperCase() === 'PLANNING'
    )
  )
  
  const onHoldProjects = computed(() => 
    (projects.value || []).filter(project => 
      project.status?.toUpperCase() === 'ON_HOLD'
    )
  )
  
  const urgentProjects = computed(() => 
    (projects.value || []).filter(project => 
      project.priority?.toUpperCase() === 'URGENT'
    )
  )
  
  const totalProjects = computed(() => pagination.value.total)

  async function fetchProjects(newFilters: Partial<ProjectFilters> = {}) {
    isLoading.value = true

    filters.value = { ...filters.value, ...newFilters }
    
    try {
      const response = await projectService.getProjects(filters.value)

      projects.value = Array.isArray(response) ? response : (response?.data || [])

      if (response && typeof response === 'object' && 'pagination' in response) {
        const paginationData = response.pagination
        pagination.value = {
          total: paginationData?.total || 0,
          page: paginationData?.page || 1,
          limit: paginationData?.limit || 10,
          totalPages: paginationData?.pages || 0
        }
      } else {

        pagination.value = {
          total: Array.isArray(response) ? response.length : 0,
          page: filters.value.page || 1,
          limit: filters.value.limit || 10,
          totalPages: 1
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju projekata'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchProject(id: string) {
    isLoading.value = true
    
    try {
      const project = await projectService.getProject(id)
      currentProject.value = project
      return project
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju projekta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'actualHours'>) {
    isLoading.value = true
    
    try {
      const newProject = await projectService.createProject(projectData)

      if (!projects.value) {
        projects.value = []
      }
      projects.value.unshift(newProject)
      
      toast.success('Projekt je uspješno dodan')
      return newProject
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dodavanju projekta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateProject(id: string, projectData: Partial<Project>) {
    isLoading.value = true
    
    try {
      const updatedProject = await projectService.updateProject(id, projectData)

      if (!projects.value) {
        projects.value = []
      }
      const index = projects.value.findIndex(project => project.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject
      }
      
      toast.success('Projekt je uspješno ažuriran')
      return updatedProject
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri ažuriranju projekta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteProject(id: string) {
    isLoading.value = true
    
    try {
      await projectService.deleteProject(id)

      if (!projects.value) {
        projects.value = []
      } else {
        projects.value = projects.value.filter(project => project.id !== id)
      }

      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
      
      toast.success('Projekt je uspješno uklonjen')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri uklanjanju projekta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function archiveProject(id: string) {
    isLoading.value = true
    
    try {
      const archivedProject = await projectService.archiveProject(id)

      if (!projects.value) {
        projects.value = []
      }
      const index = projects.value.findIndex(project => project.id === id)
      if (index !== -1) {
        projects.value[index] = archivedProject
      }

      if (currentProject.value?.id === id) {
        currentProject.value = archivedProject
      }
      
      toast.success('Projekt je završen')
      return archivedProject
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri završavanju projekta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function restoreProject(id: string) {
    isLoading.value = true
    
    try {
      const restoredProject = await projectService.restoreProject(id)

      if (!projects.value) {
        projects.value = []
      }
      const index = projects.value.findIndex(project => project.id === id)
      if (index !== -1) {
        projects.value[index] = restoredProject
      }

      if (currentProject.value?.id === id) {
        currentProject.value = restoredProject
      }
      
      toast.success('Projekt je vraćen u aktivno stanje')
      return restoredProject
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri vraćanju projekta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateProjectStatus(id: string, status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled') {
    isLoading.value = true
    
    try {
      const updatedProject = await projectService.updateProjectStatus(id, status)

      if (!projects.value) {
        projects.value = []
      }
      const index = projects.value.findIndex(project => project.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject
      }
      
      const statusLabels = {
        'planning': 'planiranje',
        'active': 'aktivno',
        'on_hold': 'na čekanju',
        'completed': 'završeno',
        'cancelled': 'otkazano'
      }
      
      toast.success(`Status projekta je ažuriran na ${statusLabels[status]}`)
      return updatedProject
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri ažuriranju statusa projekta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateProjectPriority(id: string, priority: 'low' | 'medium' | 'high' | 'urgent') {
    isLoading.value = true
    
    try {
      const updatedProject = await projectService.updateProjectPriority(id, priority)

      if (!projects.value) {
        projects.value = []
      }
      const index = projects.value.findIndex(project => project.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject
      }
      
      const priorityLabels = {
        'low': 'niska',
        'medium': 'srednja',
        'high': 'visoka',
        'urgent': 'hitna'
      }
      
      toast.success(`Prioritet projekta je ažuriran na ${priorityLabels[priority]}`)
      return updatedProject
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri ažuriranju prioriteta projekta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  function setCurrentProject(project: Project | null) {
    currentProject.value = project
  }
  
  function clearFilters() {
    filters.value = {
      search: '',
      status: undefined,
      clientId: undefined,
      priority: undefined,
      page: 1,
      limit: 10
    }
  }

  function getProjectsByClient(clientId: string) {
    return computed(() => 
      (projects.value || []).filter(project => project.clientId === clientId)
    )
  }

  function getProjectsByStatus(status: Project['status']) {
    return computed(() => 
      (projects.value || []).filter(project => project.status === status)
    )
  }
  
  return {

    projects,
    currentProject,
    isLoading,
    pagination,
    filters,

    activeProjects,
    completedProjects,
    planningProjects,
    onHoldProjects,
    urgentProjects,
    totalProjects,

    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    restoreProject,
    updateProjectStatus,
    updateProjectPriority,
    setCurrentProject,
    clearFilters,
    getProjectsByClient,
    getProjectsByStatus
  }
})