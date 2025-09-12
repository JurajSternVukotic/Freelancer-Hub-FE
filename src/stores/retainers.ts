import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Retainer, PaginatedResponse } from '../types'
import { 
  retainerService, 
  type RetainerFilters, 
  type CreateRetainerData, 
  type UpdateRetainerData,
  type LogHoursData
} from '../services/retainerService'

export const useRetainersStore = defineStore('retainers', () => {

  const retainers = ref<Retainer[]>([])
  const currentRetainer = ref<Retainer | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const filters = ref<RetainerFilters>({
    search: '',
    status: undefined,
    clientId: undefined,
    page: 1,
    limit: 10
  })

  const activeRetainers = computed(() => 
    (retainers.value || []).filter(retainer => retainer.status === 'active')
  )
  
  const expiredRetainers = computed(() => 
    (retainers.value || []).filter(retainer => retainer.status === 'expired')
  )
  
  const completedRetainers = computed(() => 
    (retainers.value || []).filter(retainer => retainer.status === 'completed')
  )
  
  const totalRetainers = computed(() => pagination.value.total)
  
  const totalActiveAmount = computed(() => 
    activeRetainers.value.reduce((sum, retainer) => sum + retainer.remainingAmount, 0)
  )
  
  const totalUsedAmount = computed(() => 
    (retainers.value || []).reduce((sum, retainer) => sum + retainer.usedAmount, 0)
  )

  async function fetchRetainers(newFilters: Partial<RetainerFilters> = {}) {
    isLoading.value = true
    error.value = null

    filters.value = { ...filters.value, ...newFilters }
    
    try {
      const response = await retainerService.getRetainers(filters.value)
      
      retainers.value = response.data || []
      pagination.value = {
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Greška pri dohvaćanju zadržanih sredstava'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchRetainer(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const retainer = await retainerService.getRetainer(id)
      currentRetainer.value = retainer
      return retainer
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Greška pri dohvaćanju zadržanih sredstava'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function createRetainer(retainerData: CreateRetainerData) {
    isLoading.value = true
    error.value = null
    
    try {
      const newRetainer = await retainerService.createRetainer(retainerData)

      if (!retainers.value) {
        retainers.value = []
      }
      retainers.value.unshift(newRetainer)
      
      return newRetainer
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Greška pri dodavanju zadržanih sredstava'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateRetainer(id: string, retainerData: UpdateRetainerData) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedRetainer = await retainerService.updateRetainer(id, retainerData)

      if (!retainers.value) {
        retainers.value = []
      }
      const index = retainers.value.findIndex(retainer => retainer.id === id)
      if (index !== -1) {
        retainers.value[index] = updatedRetainer
      }

      if (currentRetainer.value?.id === id) {
        currentRetainer.value = updatedRetainer
      }
      
      return updatedRetainer
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Greška pri ažuriranju zadržanih sredstava'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteRetainer(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await retainerService.deleteRetainer(id)

      if (!retainers.value) {
        retainers.value = []
      } else {
        retainers.value = retainers.value.filter(retainer => retainer.id !== id)
      }

      if (currentRetainer.value?.id === id) {
        currentRetainer.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Greška pri uklanjanju zadržanih sredstava'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function logHours(id: string, data: LogHoursData) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedRetainer = await retainerService.logHours(id, data)

      if (!retainers.value) {
        retainers.value = []
      }
      const index = retainers.value.findIndex(retainer => retainer.id === id)
      if (index !== -1) {
        retainers.value[index] = updatedRetainer
      }

      if (currentRetainer.value?.id === id) {
        currentRetainer.value = updatedRetainer
      }
      
      return updatedRetainer
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Greška pri evidentiranju sati'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  function setCurrentRetainer(retainer: Retainer | null) {
    currentRetainer.value = retainer
  }
  
  function clearFilters() {
    filters.value = {
      search: '',
      status: undefined,
      clientId: undefined,
      page: 1,
      limit: 10
    }
  }
  
  function clearError() {
    error.value = null
  }
  
  return {

    retainers,
    currentRetainer,
    isLoading,
    error,
    pagination,
    filters,

    activeRetainers,
    expiredRetainers,
    completedRetainers,
    totalRetainers,
    totalActiveAmount,
    totalUsedAmount,

    fetchRetainers,
    fetchRetainer,
    createRetainer,
    updateRetainer,
    deleteRetainer,
    logHours,
    setCurrentRetainer,
    clearFilters,
    clearError
  }
})