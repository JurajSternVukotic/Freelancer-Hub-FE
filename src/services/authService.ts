import { apiHelper } from './api'
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  TokenResponse,
  PasswordResetRequest,
  PasswordResetConfirm
} from '../types/auth'

export const authService = {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiHelper.post('/auth/login', credentials)
  },
  
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiHelper.post('/auth/register', data)
  },
  
  async logout(): Promise<void> {
    return apiHelper.post('/auth/logout')
  },
  
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return apiHelper.post('/auth/refresh', { refreshToken })
  },

  async getCurrentUser(): Promise<User> {
    return apiHelper.get('/users/me')
  },
  
  async updateProfile(profileData: Partial<User>): Promise<User> {
    return apiHelper.patch('/auth/profile', profileData)
  },
  
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiHelper.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
  },

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    return apiHelper.post('/auth/forgot-password', data)
  },
  
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    return apiHelper.post('/auth/reset-password', data)
  },

  async deleteAccount(): Promise<void> {
    return apiHelper.delete('/auth/account')
  },
  
  async verifyEmail(token: string): Promise<void> {
    return apiHelper.post('/auth/verify-email', { token })
  },
  
  async resendEmailVerification(): Promise<void> {
    return apiHelper.post('/auth/resend-verification')
  }
}