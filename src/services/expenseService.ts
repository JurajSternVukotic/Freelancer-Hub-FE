import { apiHelper } from './api'
import type { Expense, PaginatedResponse } from '../types'

export interface ExpenseFilters {
  search?: string
  category?: string
  projectId?: string
  clientId?: string
  billable?: boolean
  reimbursable?: boolean
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
}

export const expenseService = {

  async getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.category) params.append('category', filters.category)
    if (filters.projectId) params.append('projectId', filters.projectId)
    if (filters.clientId) params.append('clientId', filters.clientId)
    if (filters.billable !== undefined) params.append('billable', filters.billable.toString())
    if (filters.reimbursable !== undefined) params.append('reimbursable', filters.reimbursable.toString())
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const url = queryString ? `/expenses?${queryString}` : '/expenses'
    
    return apiHelper.get<PaginatedResponse<Expense>>(url)
  },

  async getExpense(id: string): Promise<Expense> {
    return apiHelper.get<Expense>(`/expenses/${id}`)
  },

  async createExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Expense> {
    return apiHelper.post<Expense>('/expenses', expenseData)
  },

  async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    return apiHelper.put<Expense>(`/expenses/${id}`, expenseData)
  },

  async deleteExpense(id: string): Promise<void> {
    return apiHelper.delete(`/expenses/${id}`)
  },

  async getCategories(): Promise<ExpenseCategory[]> {

    return Promise.resolve([
      { id: 'office', name: 'Ured', description: 'Uredski materijal i oprema' },
      { id: 'travel', name: 'Putovanje', description: 'Troškovi putovanja i smještaja' },
      { id: 'transport', name: 'Prijevoz', description: 'Troškovi prometa i goriva' },
      { id: 'meals', name: 'Hrana', description: 'Obroci i piće' },
      { id: 'software', name: 'Softver', description: 'Licencije i pretplate' },
      { id: 'education', name: 'Edukacija', description: 'Tečajevi i konferencije' },
      { id: 'marketing', name: 'Marketing', description: 'Oglašavanje i promocija' },
      { id: 'communication', name: 'Komunikacija', description: 'Telefon, internet, pošta' },
      { id: 'utilities', name: 'Režije', description: 'Struja, voda, grijanje' },
      { id: 'other', name: 'Ostalo', description: 'Ostali troškovi' }
    ])
  },

  getCategoryName(categoryId: string): string {
    const categories: { [key: string]: string } = {
      'office': 'Ured',
      'travel': 'Putovanje',
      'transport': 'Prijevoz',
      'meals': 'Hrana',
      'software': 'Softver',
      'education': 'Edukacija',
      'marketing': 'Marketing',
      'communication': 'Komunikacija',
      'utilities': 'Režije',
      'other': 'Ostalo'
    }
    return categories[categoryId] || categoryId
  },

  getCategoryColor(categoryId: string): string {
    const colors: { [key: string]: string } = {
      'office': 'bg-blue-100 text-blue-800',
      'travel': 'bg-green-100 text-green-800',
      'transport': 'bg-yellow-100 text-yellow-800',
      'meals': 'bg-orange-100 text-orange-800',
      'software': 'bg-purple-100 text-purple-800',
      'education': 'bg-indigo-100 text-indigo-800',
      'marketing': 'bg-pink-100 text-pink-800',
      'communication': 'bg-teal-100 text-teal-800',
      'utilities': 'bg-red-100 text-red-800',
      'other': 'bg-gray-100 text-gray-800'
    }
    return colors[categoryId] || 'bg-gray-100 text-gray-800'
  },

  formatCurrency(amount: string | number, currency: string = 'EUR'): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('hr-HR', {
      style: 'currency',
      currency: currency
    }).format(num)
  },

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  },

  formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}