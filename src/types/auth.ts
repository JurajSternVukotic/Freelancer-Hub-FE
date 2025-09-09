export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'freelancer' | 'client'
  company?: string
  phone?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  oib?: string // Croatian tax ID
  hourlyRate?: number
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'freelancer' | 'client'
  company?: string
  phone?: string
  hourlyRate?: number
  acceptTerms: boolean
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken?: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
}