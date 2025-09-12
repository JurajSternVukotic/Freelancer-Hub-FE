import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Expense, PaginatedResponse } from '../types'
import { expenseService, type ExpenseFilters, type ExpenseCategory } from '../services/expenseService'

export const useExpensesStore = defineStore('expenses', () => {

  const expenses = ref<Expense[]>([])
  const currentExpense = ref<Expense | null>(null)
  const categories = ref<ExpenseCategory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const filters = ref<ExpenseFilters>({
    search: '',
    category: undefined,
    projectId: undefined,
    clientId: undefined,
    billable: undefined,
    reimbursable: undefined,
    startDate: undefined,
    endDate: undefined,
    page: 1,
    limit: 10
  })

  const billableExpenses = computed(() => 
    (expenses.value || []).filter(expense => expense.billable)
  )
  
  const nonBillableExpenses = computed(() => 
    (expenses.value || []).filter(expense => !expense.billable)
  )
  
  const reimbursableExpenses = computed(() => 
    (expenses.value || []).filter(expense => expense.reimbursable)
  )
  
  const nonReimbursableExpenses = computed(() => 
    (expenses.value || []).filter(expense => !expense.reimbursable)
  )
  
  const totalExpenses = computed(() => pagination.value.total)
  
  const totalAmount = computed(() => 
    (expenses.value || []).reduce((sum, expense) => sum + expense.amount, 0)
  )
  
  const billableAmount = computed(() => 
    billableExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  )
  
  const nonBillableAmount = computed(() => 
    nonBillableExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  )
  
  const reimbursableAmount = computed(() => 
    reimbursableExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  )
  
  const expensesByCategory = computed(() => {
    const categoryMap = new Map<string, { expenses: Expense[], total: number }>()
    
    ;(expenses.value || []).forEach(expense => {
      if (!categoryMap.has(expense.category)) {
        categoryMap.set(expense.category, { expenses: [], total: 0 })
      }
      const categoryData = categoryMap.get(expense.category)!
      categoryData.expenses.push(expense)
      categoryData.total += expense.amount
    })
    
    return categoryMap
  })
  
  const expensesByProject = computed(() => {
    const projectMap = new Map<string, { expenses: Expense[], total: number }>()
    
    ;(expenses.value || []).forEach(expense => {
      if (expense.projectId) {
        if (!projectMap.has(expense.projectId)) {
          projectMap.set(expense.projectId, { expenses: [], total: 0 })
        }
        const projectData = projectMap.get(expense.projectId)!
        projectData.expenses.push(expense)
        projectData.total += expense.amount
      }
    })
    
    return projectMap
  })

  async function fetchExpenses(newFilters: Partial<ExpenseFilters> = {}) {
    isLoading.value = true
    error.value = null

    filters.value = { ...filters.value, ...newFilters }
    
    try {
      const response = await expenseService.getExpenses(filters.value)
      
      expenses.value = response.data || []
      pagination.value = {
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri dohvaćanju troškova'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchExpense(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const expense = await expenseService.getExpense(id)
      currentExpense.value = expense
      return expense
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri dohvaćanju troška'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function createExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    isLoading.value = true
    error.value = null
    
    try {
      const newExpense = await expenseService.createExpense(expenseData)

      if (!expenses.value) {
        expenses.value = []
      }
      expenses.value.unshift(newExpense)
      
      console.log('Trošak je uspješno kreiran')
      return newExpense
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri kreiranju troška'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateExpense(id: string, expenseData: Partial<Expense>) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedExpense = await expenseService.updateExpense(id, expenseData)

      if (!expenses.value) {
        expenses.value = []
      }
      const index = expenses.value.findIndex(expense => expense.id === id)
      if (index !== -1) {
        expenses.value[index] = updatedExpense
      }

      if (currentExpense.value?.id === id) {
        currentExpense.value = updatedExpense
      }
      
      console.log('Trošak je uspješno ažuriran')
      return updatedExpense
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri ažuriranju troška'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteExpense(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await expenseService.deleteExpense(id)

      if (!expenses.value) {
        expenses.value = []
      } else {
        expenses.value = expenses.value.filter(expense => expense.id !== id)
      }

      if (currentExpense.value?.id === id) {
        currentExpense.value = null
      }
      
      console.log('Trošak je uspješno uklonjen')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri uklanjanju troška'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchCategories() {
    try {
      categories.value = (await expenseService.getCategories()) || []
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri dohvaćanju kategorija'
      error.value = message
      console.error(message)
      throw err
    }
  }
  
  function setCurrentExpense(expense: Expense | null) {
    currentExpense.value = expense
  }
  
  function clearFilters() {
    filters.value = {
      search: '',
      category: undefined,
      projectId: undefined,
      clientId: undefined,
      billable: undefined,
      reimbursable: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
      limit: 10
    }
  }
  
  function clearError() {
    error.value = null
  }

  fetchCategories()
  
  return {

    expenses,
    currentExpense,
    categories,
    isLoading,
    error,
    pagination,
    filters,

    billableExpenses,
    nonBillableExpenses,
    reimbursableExpenses,
    nonReimbursableExpenses,
    totalExpenses,
    totalAmount,
    billableAmount,
    nonBillableAmount,
    reimbursableAmount,
    expensesByCategory,
    expensesByProject,

    fetchExpenses,
    fetchExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchCategories,
    setCurrentExpense,
    clearFilters,
    clearError
  }
})