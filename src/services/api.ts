import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/auth'
import { useAppStore } from '../stores/app'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const appStore = useAppStore()

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    if (!config.metadata?.background) {
      appStore.setLoading(true)
    }
    
    return config
  },
  (error) => {
    const appStore = useAppStore()
    appStore.setLoading(false)
    return Promise.reject(error)
  }
)

let isRefreshing = false
let refreshAttempts = 0
const MAX_REFRESH_ATTEMPTS = 3
let lastRefreshTime = 0
const REFRESH_COOLDOWN = 5000 // 5 seconds

api.interceptors.response.use(
  (response) => {
    const appStore = useAppStore()
    appStore.setLoading(false)
    return response
  },
  async (error) => {
    const appStore = useAppStore()
    const authStore = useAuthStore()
    
    appStore.setLoading(false)

    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/login') && 
        !error.config?.url?.includes('/auth/logout') && 
        !error.config?.url?.includes('/auth/refresh')) {
      
      console.log('🔄 401 Unauthorized detected, checking tokens...')

      if (!authStore.token || !authStore.refreshToken) {
        console.log('❌ No tokens available, redirecting to login')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.log('❌ Max refresh attempts reached, redirecting to login')
        refreshAttempts = 0
        isRefreshing = false
        window.location.href = '/login'
        return Promise.reject(error)
      }

      const now = Date.now()
      if (now - lastRefreshTime < REFRESH_COOLDOWN) {
        console.log('❌ Refresh cooldown active, redirecting to login')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (!isRefreshing && !error.config._retry) {
        console.log('🔄 Attempting token refresh...')
        isRefreshing = true
        error.config._retry = true
        refreshAttempts++
        lastRefreshTime = now
        
        try {
          const refreshed = await authStore.refreshAuthToken()
          
          if (refreshed && authStore.token) {
            console.log('✅ Token refresh successful, retrying request')
            refreshAttempts = 0 // Reset on success
            error.config.headers.Authorization = `Bearer ${authStore.token}`
            return api.request(error.config)
          } else {
            console.log('❌ Token refresh failed, redirecting to login')
            refreshAttempts = 0
            window.location.href = '/login'
            return Promise.reject(error)
          }
        } catch (refreshError) {
          console.error('❌ Token refresh error:', refreshError)
          refreshAttempts = 0
          window.location.href = '/login'
          return Promise.reject(error)
        } finally {
          isRefreshing = false
        }
      } else {
        console.log('⏳ Already refreshing or already retried, rejecting request')
        return Promise.reject(error)
      }
    }

    if (!error.response) {
      console.error('Greška mreže. Molimo provjerite internetsku vezu.')
      return Promise.reject(error)
    }

    if (error.response.status >= 500) {
      console.error('Greška servera. Molimo pokušajte kasnije.')
    }
    
    return Promise.reject(error)
  }
)

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      background?: boolean
    }
  }
}

export default api

function unwrapResponse<T>(response: any): T {

  if (response === null || response === undefined) {
    return null as unknown as T
  }

  if (response && typeof response === 'object' && 'success' in response && 'data' in response) {

    return response.data as T
  }

  return response as T
}

export const apiHelper = {

  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    api.get(url, config)
      .then(response => unwrapResponse<T>(response.data))
      .catch(error => {

        if (error.response?.status === 501) {
          console.warn(`Endpoint ${url} not implemented (501), returning null`)
          return null as T
        }
        throw error
      }),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.post(url, data, config)
      .then(response => unwrapResponse<T>(response.data))
      .catch(error => {
        if (error.response?.status === 501) {
          console.warn(`Endpoint ${url} not implemented (501), returning null`)
          return null as T
        }
        throw error
      }),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.put(url, data, config)
      .then(response => unwrapResponse<T>(response.data))
      .catch(error => {
        if (error.response?.status === 501) {
          console.warn(`Endpoint ${url} not implemented (501), returning null`)
          return null as T
        }
        throw error
      }),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.patch(url, data, config)
      .then(response => unwrapResponse<T>(response.data))
      .catch(error => {
        if (error.response?.status === 501) {
          console.warn(`Endpoint ${url} not implemented (501), returning null`)
          return null as T
        }
        throw error
      }),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    api.delete(url, config)
      .then(response => unwrapResponse<T>(response.data))
      .catch(error => {
        if (error.response?.status === 501) {
          console.warn(`Endpoint ${url} not implemented (501), returning null`)
          return null as T
        }
        throw error
      }),

  background: {
    get: <T = any>(url: string, config?: AxiosRequestConfig) => 
      api.get(url, { ...config, metadata: { background: true } })
        .then(response => unwrapResponse<T>(response.data))
        .catch(error => {
          if (error.response?.status === 501) {
            console.warn(`Background endpoint ${url} not implemented (501), returning null`)
            return null as T
          }
          throw error
        }),
      
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      api.post(url, data, { ...config, metadata: { background: true } })
        .then(response => unwrapResponse<T>(response.data))
        .catch(error => {
          if (error.response?.status === 501) {
            console.warn(`Background endpoint ${url} not implemented (501), returning null`)
            return null as T
          }
          throw error
        }),
  }
}