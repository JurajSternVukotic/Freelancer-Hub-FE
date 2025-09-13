import { clientApi } from './clientApi'
import type { ClientLoginCredentials, ClientRegisterData } from '../stores/clientAuth'

const CLIENT_AUTH_BASE_URL = '/client-auth'

export const clientAuthService = {
  async login(credentials: ClientLoginCredentials) {
    return clientApi.post(`${CLIENT_AUTH_BASE_URL}/login`, credentials)
  },

  async register(data: ClientRegisterData) {
    return clientApi.post(`${CLIENT_AUTH_BASE_URL}/register`, data)
  },

  async getProfile() {
    return clientApi.get(`${CLIENT_AUTH_BASE_URL}/profile`)
  }
}