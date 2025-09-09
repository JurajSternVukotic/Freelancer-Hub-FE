import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Client, PaginatedResponse } from '../types'
import { clientService, type ClientFilters } from '../services/clientService'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useClientsStore = defineStore('clients', () => {

  const clients = ref<Client[]>([])
  const currentClient = ref<Client | null>(null)
  const isLoading = ref(false)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const filters = ref<ClientFilters>({
    search: '',
    status: undefined,
    page: 1,
    limit: 10
  })

  const activeClients = computed(() => 
    (clients.value || []).filter(client => 
      client.status?.toLowerCase() === 'active'
    )
  )
  
  const archivedClients = computed(() => 
    (clients.value || []).filter(client => 
      client.status?.toLowerCase() === 'archived'
    )
  )
  
  const totalClients = computed(() => pagination.value.total)

  async function fetchClients(newFilters: Partial<ClientFilters> = {}) {
    isLoading.value = true

    filters.value = { ...filters.value, ...newFilters }
    
    try {
      const response = await clientService.getClients(filters.value)

      clients.value = Array.isArray(response) ? response : (response?.data || [])

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
      const message = error.response?.data?.message || 'Greška pri dohvaćanju klijenata'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchClient(id: string) {
    isLoading.value = true
    
    try {
      const client = await clientService.getClient(id)
      currentClient.value = client
      return client
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju klijenta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    isLoading.value = true
    
    try {
      const newClient = await clientService.createClient(clientData)

      if (!clients.value) {
        clients.value = []
      }
      clients.value.unshift(newClient)
      
      toast.success('Klijent je uspješno dodan')
      return newClient
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dodavanju klijenta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateClient(id: string, clientData: Partial<Client>) {
    isLoading.value = true
    
    try {
      const updatedClient = await clientService.updateClient(id, clientData)

      if (!clients.value) {
        clients.value = []
      }
      const index = clients.value.findIndex(client => client.id === id)
      if (index !== -1) {
        clients.value[index] = updatedClient
      }

      if (currentClient.value?.id === id) {
        currentClient.value = updatedClient
      }
      
      toast.success('Klijent je uspješno ažuriran')
      return updatedClient
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri ažuriranju klijenta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteClient(id: string) {
    isLoading.value = true
    
    try {
      await clientService.deleteClient(id)

      if (!clients.value) {
        clients.value = []
      } else {
        clients.value = clients.value.filter(client => client.id !== id)
      }

      if (currentClient.value?.id === id) {
        currentClient.value = null
      }
      
      toast.success('Klijent je uspješno uklonjen')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri uklanjanju klijenta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function archiveClient(id: string) {
    isLoading.value = true
    
    try {
      const archivedClient = await clientService.archiveClient(id)

      if (!clients.value) {
        clients.value = []
      }
      const index = clients.value.findIndex(client => client.id === id)
      if (index !== -1) {
        clients.value[index] = archivedClient
      }

      if (currentClient.value?.id === id) {
        currentClient.value = archivedClient
      }
      
      toast.success('Klijent je arhiviran')
      return archivedClient
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri arhiviranju klijenta'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function restoreClient(id: string) {
    isLoading.value = true
    
    try {
      const restoredClient = await clientService.restoreClient(id)

      if (!clients.value) {
        clients.value = []
      }
      const index = clients.value.findIndex(client => client.id === id)
      if (index !== -1) {
        clients.value[index] = restoredClient
      }

      if (currentClient.value?.id === id) {
        currentClient.value = restoredClient
      }
      
      toast.success('Klijent je vraćen iz arhive')
      return restoredClient
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri vraćanju klijenta iz arhive'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  function setCurrentClient(client: Client | null) {
    currentClient.value = client
  }
  
  function clearFilters() {
    filters.value = {
      search: '',
      status: undefined,
      page: 1,
      limit: 10
    }
  }
  
  return {

    clients,
    currentClient,
    isLoading,
    pagination,
    filters,

    activeClients,
    archivedClients,
    totalClients,

    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    archiveClient,
    restoreClient,
    setCurrentClient,
    clearFilters
  }
})