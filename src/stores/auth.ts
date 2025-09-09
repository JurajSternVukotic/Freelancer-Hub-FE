import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData } from '../types/auth'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {

  const user = ref<User | null>(JSON.parse(localStorage.getItem('user_data') || 'null'))
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const isFreelancer = computed(() => user.value?.role === 'freelancer')
  const isClient = computed(() => user.value?.role === 'client')

  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    try {
      const response = await authService.login(credentials)

      const userData = response.data || response
      token.value = userData.tokens?.accessToken || userData.accessToken
      refreshToken.value = userData.tokens?.refreshToken || userData.refreshToken
      user.value = userData.user

      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('refresh_token', refreshToken.value)
      localStorage.setItem('user_data', JSON.stringify(user.value))
      
      console.log('Uspješno ste se prijavili!')
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri prijavi'
      console.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function register(data: RegisterData) {
    isLoading.value = true
    try {
      const response = await authService.register(data)
      
      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      user.value = response.user

      localStorage.setItem('auth_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
      localStorage.setItem('user_data', JSON.stringify(user.value))
      
      console.log('Uspješno ste se registrirali!')
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri registraciji'
      console.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function logout() {
    try {
      if (token.value) {

        await authService.logout()
      }
    } catch (error) {

      console.error('Logout API error (ignored):', error)
    }

    user.value = null
    token.value = null
    refreshToken.value = null

    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    
    console.log('Uspješno ste se odjavili')
  }
  
  async function refreshAuthToken() {
    console.log('🔄 RefreshAuthToken called')
    
    if (!refreshToken.value) {
      console.log('❌ No refresh token available')
      return false
    }

    if (!token.value) {
      console.log('❌ No access token available')
      return false
    }
    
    try {
      console.log('🔄 Calling refresh token service...')
      const response = await authService.refreshToken(refreshToken.value)
      
      if (response.accessToken) {
        console.log('✅ New access token received')
        token.value = response.accessToken
        localStorage.setItem('auth_token', response.accessToken)
        
        if (response.refreshToken) {
          console.log('✅ New refresh token received')
          refreshToken.value = response.refreshToken
          localStorage.setItem('refresh_token', response.refreshToken)
        }
        
        return true
      } else {
        console.log('❌ No access token in refresh response')
        await logout()
        return false
      }
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error)

      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('❌ Refresh token invalid, logging out')
        await logout()
      }
      
      return false
    }
  }
  
  async function checkAuth() {
    if (!token.value) {
      return false
    }

    if (user.value) {
      return true
    }
    
    try {
      const userData = await authService.getCurrentUser()
      user.value = userData

      localStorage.setItem('user_data', JSON.stringify(user.value))
      return true
    } catch (error) {
      console.error('Auth check failed:', error)

      const refreshed = await refreshAuthToken()
      if (refreshed) {
        try {
          const userData = await authService.getCurrentUser()
          user.value = userData
          localStorage.setItem('user_data', JSON.stringify(user.value))
          return true
        } catch (retryError) {
          console.error('Auth check retry failed:', retryError)
          await logout()
          return false
        }
      }
      
      await logout()
      return false
    }
  }
  
  async function updateProfile(profileData: Partial<User>) {
    isLoading.value = true
    try {
      const updatedUser = await authService.updateProfile(profileData)
      user.value = { ...user.value!, ...updatedUser }
      console.log('Profil je uspješno ažuriran')
      return updatedUser
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri ažuriranju profila'
      console.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function changePassword(currentPassword: string, newPassword: string) {
    isLoading.value = true
    try {
      await authService.changePassword(currentPassword, newPassword)
      console.log('Lozinka je uspješno promijenjena')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri promjeni lozinke'
      console.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  return {

    user,
    token,
    refreshToken,
    isLoading,

    isAuthenticated,
    userRole,
    isFreelancer,
    isClient,

    login,
    register,
    logout,
    refreshAuthToken,
    checkAuth,
    updateProfile,
    changePassword
  }
})