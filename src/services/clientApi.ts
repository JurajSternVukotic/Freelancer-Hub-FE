import axios, { AxiosInstance } from 'axios'
import { useClientAuthStore } from '../stores/clientAuth'
import { useAppStore } from '../stores/app'
import { toastService } from './toastService'
import { performanceMonitor } from './performanceMonitor'

const clientApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 60000, // Increased timeout for AI requests
  headers: {
    'Content-Type': 'application/json',
  },
})

clientApi.interceptors.request.use(
  (config) => {
    const clientAuthStore = useClientAuthStore()
    const appStore = useAppStore()

    if (clientAuthStore.token) {
      config.headers.Authorization = `Bearer ${clientAuthStore.token}`
    }

    if (!config.metadata?.background) {
      appStore.setLoading(true)
    }

    config.metadata = {
      ...config.metadata,
      startTime: performance.now()
    }
    
    return config
  },
  (error) => {
    const appStore = useAppStore()
    appStore.setLoading(false)
    return Promise.reject(error)
  }
)

clientApi.interceptors.response.use(
  (response) => {
    const appStore = useAppStore()
    appStore.setLoading(false)

    if (response.config.metadata?.startTime) {
      performanceMonitor.trackRequest(
        response.config.url || '',
        response.config.method || 'GET',
        response.config.metadata.startTime,
        response.status,
        true
      )
    }
    
    return response
  },
  async (error) => {
    const appStore = useAppStore()
    const clientAuthStore = useClientAuthStore()
    
    appStore.setLoading(false)

    if (error.config?.metadata?.startTime) {
      performanceMonitor.trackRequest(
        error.config.url || '',
        error.config.method || 'GET',
        error.config.metadata.startTime,
        error.response?.status || 0,
        false
      )

      performanceMonitor.trackError(
        error.config.url || '',
        error.config.method || 'GET',
        error.message || 'Unknown error'
      )
    }

    if (!error.response) {
      console.error('Network error: ', error.message)
      toastService.error(
        'Molimo provjerite internetsku vezu i pokušajte ponovo.',
        'Greška mreže'
      )
      const networkError = new Error('Network connection problem. Please check your internet connection.')
      networkError.name = 'NetworkError'
      return Promise.reject(networkError)
    }

    if (error.response?.status === 401 && !error.config?.url?.includes('/client-auth/login')) {

      await clientAuthStore.logout()
      window.location.href = '/auth/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data?.message)
      const forbiddenError = new Error('You do not have permission to access this resource.')
      forbiddenError.name = 'ForbiddenError'
      return Promise.reject(forbiddenError)
    }

    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url)
      const notFoundError = new Error('The requested resource was not found.')
      notFoundError.name = 'NotFoundError'
      return Promise.reject(notFoundError)
    }

    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data?.message)
      toastService.error(
        'Dogodila se greška na serveru. Molimo pokušajte kasnije.',
        'Greška servera'
      )
      const serverError = new Error('Server error. Please try again later.')
      serverError.name = 'ServerError'
      return Promise.reject(serverError)
    }

    if (error.response?.status === 429) {
      console.error('Rate limit exceeded')
      toastService.warning(
        'Previše zahtjeva u kratkom vremenu. Molimo pričekajte prije novog pokušaja.',
        'Previše zahtjeva'
      )
      const rateLimitError = new Error('Too many requests. Please wait a moment before trying again.')
      rateLimitError.name = 'RateLimitError'
      return Promise.reject(rateLimitError)
    }
    
    return Promise.reject(error)
  }
)

export function unwrapResponse<T>(response: any): T {
  if (response?.data?.data !== undefined) {
    return response.data.data
  }
  if (response?.data !== undefined) {
    return response.data
  }
  return response
}

export { clientApi }