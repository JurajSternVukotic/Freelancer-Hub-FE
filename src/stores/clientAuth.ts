import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { clientAuthService } from '../services/clientAuthService'
import { toastService } from '../services/toastService'

export interface Client {
  id: string
  company: string
  contactPerson: string
  email: string
  phone?: string
  assignedFreelancer?: {
    id: string
    firstName: string
    lastName: string
    company: string
  } | null
}

export interface ClientLoginCredentials {
  email: string
  password: string
}

export interface ClientRegisterData {
  company: string
  contactPerson: string
  email: string
  password: string
  phone?: string
  address?: string
  city?: string
  country?: string
  oib?: string
}

export const useClientAuthStore = defineStore('clientAuth', () => {
  const getStoredClient = () => {
    try {
      const clientData = localStorage.getItem('client_data')
      return clientData && clientData !== 'undefined' ? JSON.parse(clientData) : null
    } catch (error) {
      console.warn('Failed to parse client data from localStorage:', error)
      localStorage.removeItem('client_data')
      return null
    }
  }
  
  const client = ref<Client | null>(getStoredClient())
  const token = ref<string | null>(localStorage.getItem('client_token'))
  const isLoading = ref(false)
  
  const isAuthenticated = computed(() => !!token.value && !!client.value)
  
  async function login(credentials: ClientLoginCredentials) {
    isLoading.value = true
    try {
      const response = await clientAuthService.login(credentials)
      
      token.value = response.data.data.token
      client.value = response.data.data.client
      
      localStorage.setItem('client_token', token.value)
      localStorage.setItem('client_data', JSON.stringify(client.value))
      
      toastService.success(
        `Dobrodošli, ${client.value?.contactPerson}!`,
        'Uspješna prijava'
      )
      
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri prijavi'
      toastService.error(message, 'Greška prijave')
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }
  
  async function register(data: ClientRegisterData) {
    isLoading.value = true
    try {
      const response = await clientAuthService.register(data)
      
      toastService.success(
        'Molimo prijavite se sa vašim podacima.',
        'Uspješna registracija!'
      )
      
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri registraciji'
      toastService.error(message, 'Greška registracije')
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }
  
  async function logout() {
    try {
      client.value = null
      token.value = null
      
      localStorage.removeItem('client_token')
      localStorage.removeItem('client_data')
      
      toastService.info('Uspješno ste odjavljen.', 'Do viđenja!')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  async function checkAuth() {
    if (!token.value) {
      return false
    }
    
    try {
      const response = await clientAuthService.getProfile()
      client.value = response.data
      return true
    } catch (error) {
      await logout()
      return false
    }
  }
  
  function setClientData(data: { client: Client, token: string }) {
    client.value = data.client
    token.value = data.token
    
    localStorage.setItem('client_token', data.token)
    localStorage.setItem('client_data', JSON.stringify(data.client))
  }
  
  return {
    client: readonly(client),
    token: readonly(token),
    isLoading: readonly(isLoading),
    
    isAuthenticated,
    
    login,
    register,
    logout,
    checkAuth,
    setClientData
  }
})