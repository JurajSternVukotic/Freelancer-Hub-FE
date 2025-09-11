import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Invoice, PaginatedResponse } from '../types'
import { invoiceService, type InvoiceFilters, type GenerateInvoiceData } from '../services/invoiceService'

export const useInvoicesStore = defineStore('invoices', () => {

  const invoices = ref<Invoice[]>([])
  const currentInvoice = ref<Invoice | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const filters = ref<InvoiceFilters>({
    search: '',
    status: undefined,
    clientId: undefined,
    projectId: undefined,
    page: 1,
    limit: 10
  })

  const draftInvoices = computed(() => 
    (invoices.value || []).filter(invoice => invoice && invoice.status === 'DRAFT')
  )
  
  const sentInvoices = computed(() => 
    (invoices.value || []).filter(invoice => invoice && invoice.status === 'SENT')
  )
  
  const paidInvoices = computed(() => 
    (invoices.value || []).filter(invoice => invoice && invoice.status === 'PAID')
  )
  
  const overdueInvoices = computed(() => 
    (invoices.value || []).filter(invoice => invoice && invoice.status === 'OVERDUE')
  )
  
  const totalInvoices = computed(() => pagination.value.total)
  
  const totalValue = computed(() => 
    (invoices.value || []).reduce((sum, invoice) => {
      const total = typeof invoice?.total === 'object' ? Number(invoice.total) : (invoice?.total || 0)
      return sum + total
    }, 0)
  )
  
  const paidValue = computed(() => 
    paidInvoices.value.reduce((sum, invoice) => {
      const total = typeof invoice?.total === 'object' ? Number(invoice.total) : (Number(invoice?.total) || 0)
      return sum + total
    }, 0)
  )
  
  const unpaidValue = computed(() => 
    (invoices.value || [])
      .filter(invoice => invoice && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED')
      .reduce((sum, invoice) => {
        const total = typeof invoice?.total === 'object' ? Number(invoice.total) : (invoice?.total || 0)
        return sum + total
      }, 0)
  )

  async function fetchInvoices(newFilters: Partial<InvoiceFilters> = {}) {
    isLoading.value = true
    error.value = null

    filters.value = { ...filters.value, ...newFilters }
    
    try {
      const response = await invoiceService.getInvoices(filters.value)

      if (Array.isArray(response)) {

        invoices.value = response
        pagination.value = {
          total: response.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(response.length / 10)
        }
      } else {

        invoices.value = response?.data || []
        pagination.value = {
          total: response?.pagination?.total || 0,
          page: response?.pagination?.page || 1,
          limit: response?.pagination?.limit || 10,
          totalPages: response?.pagination?.pages || 0
        }
      }
      
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri dohvaćanju računa'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchInvoice(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const invoice = await invoiceService.getInvoice(id)
      currentInvoice.value = invoice
      return invoice
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri dohvaćanju računa'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    isLoading.value = true
    error.value = null
    
    try {
      const newInvoice = await invoiceService.createInvoice(invoiceData)

      if (!invoices.value) {
        invoices.value = []
      }
      if (newInvoice && newInvoice.id) {
        invoices.value.unshift(newInvoice)
      }
      
      console.log('Račun je uspješno kreiran')
      return newInvoice
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri kreiranju računa'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateInvoice(id: string, invoiceData: Partial<Invoice>) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedInvoice = await invoiceService.updateInvoice(id, invoiceData)

      if (!invoices.value) {
        invoices.value = []
      }
      const index = invoices.value.findIndex(invoice => invoice.id === id)
      if (index !== -1) {
        invoices.value[index] = updatedInvoice
      }

      if (currentInvoice.value?.id === id) {
        currentInvoice.value = updatedInvoice
      }
      
      console.log('Račun je uspješno ažuriran')
      return updatedInvoice
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri ažuriranju računa'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteInvoice(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await invoiceService.deleteInvoice(id)

      if (!invoices.value) {
        invoices.value = []
      } else {
        invoices.value = invoices.value.filter(invoice => invoice.id !== id)
      }

      if (currentInvoice.value?.id === id) {
        currentInvoice.value = null
      }
      
      console.log('Račun je uspješno uklonjen')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri uklanjanju računa'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function generateFromProject(projectId: string, data: GenerateInvoiceData) {
    isLoading.value = true
    error.value = null
    
    try {
      const newInvoice = await invoiceService.generateFromProject(projectId, data)

      if (!invoices.value) {
        invoices.value = []
      }
      if (newInvoice && newInvoice.id) {
        invoices.value.unshift(newInvoice)
      }
      
      console.log('Račun je uspješno generiran iz projekta')
      return newInvoice
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri generiranju računa iz projekta'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function downloadPDF(id: string, filename?: string) {
    try {
      await invoiceService.downloadPDF(id, filename)
      console.log('PDF je uspješno preuzet')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri preuzimanju PDF-a'
      error.value = message
      console.error(message)
      throw err
    }
  }
  
  function setCurrentInvoice(invoice: Invoice | null) {
    currentInvoice.value = invoice
  }
  
  function clearFilters() {
    filters.value = {
      search: '',
      status: undefined,
      clientId: undefined,
      projectId: undefined,
      page: 1,
      limit: 10
    }
  }
  
  function clearError() {
    error.value = null
  }
  
  return {

    invoices,
    currentInvoice,
    isLoading,
    error,
    pagination,
    filters,

    draftInvoices,
    sentInvoices,
    paidInvoices,
    overdueInvoices,
    totalInvoices,
    totalValue,
    paidValue,
    unpaidValue,

    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateFromProject,
    downloadPDF,
    setCurrentInvoice,
    clearFilters,
    clearError
  }
})