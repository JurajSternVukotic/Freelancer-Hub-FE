import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Proposal, PaginatedResponse } from '../types'
import { proposalService, type ProposalFilters } from '../services/proposalService'

export const useProposalsStore = defineStore('proposals', () => {

  const proposals = ref<Proposal[]>([])
  const currentProposal = ref<Proposal | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const filters = ref<ProposalFilters>({
    search: '',
    status: undefined,
    clientId: undefined,
    page: 1,
    limit: 10
  })

  const draftProposals = computed(() => 
    (proposals.value || []).filter(proposal => proposal.status === 'draft')
  )
  
  const sentProposals = computed(() => 
    (proposals.value || []).filter(proposal => proposal.status === 'sent')
  )
  
  const viewedProposals = computed(() => 
    (proposals.value || []).filter(proposal => proposal.status === 'viewed')
  )
  
  const acceptedProposals = computed(() => 
    (proposals.value || []).filter(proposal => proposal.status === 'accepted')
  )
  
  const rejectedProposals = computed(() => 
    (proposals.value || []).filter(proposal => proposal.status === 'rejected')
  )
  
  const expiredProposals = computed(() => 
    (proposals.value || []).filter(proposal => proposal.status === 'expired')
  )
  
  const totalProposals = computed(() => pagination.value.total)
  
  const totalValue = computed(() => 
    (proposals.value || []).reduce((sum, proposal) => sum + proposal.total, 0)
  )
  
  const acceptedValue = computed(() => 
    acceptedProposals.value.reduce((sum, proposal) => sum + proposal.total, 0)
  )
  
  const pendingValue = computed(() => 
    (proposals.value || [])
      .filter(proposal => ['sent', 'viewed'].includes(proposal.status))
      .reduce((sum, proposal) => sum + proposal.total, 0)
  )
  
  const conversionRate = computed(() => {
    const sentCount = (proposals.value || []).filter(p => p.status !== 'draft').length
    if (sentCount === 0) return 0
    return Math.round((acceptedProposals.value.length / sentCount) * 100)
  })

  async function fetchProposals(newFilters: Partial<ProposalFilters> = {}) {
    isLoading.value = true
    error.value = null

    filters.value = { ...filters.value, ...newFilters }
    
    try {
      const response = await proposalService.getProposals(filters.value)
      
      proposals.value = response.data || []
      pagination.value = {
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri dohvaćanju ponuda'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchProposal(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const proposal = await proposalService.getProposal(id)
      currentProposal.value = proposal
      return proposal
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri dohvaćanju ponude'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function createProposal(proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    isLoading.value = true
    error.value = null
    
    try {
      const newProposal = await proposalService.createProposal(proposalData)

      if (!proposals.value) {
        proposals.value = []
      }
      proposals.value.unshift(newProposal)
      
      console.log('Ponuda je uspješno kreirana')
      return newProposal
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri kreiranju ponude'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateProposal(id: string, proposalData: Partial<Proposal>) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedProposal = await proposalService.updateProposal(id, proposalData)

      if (!proposals.value) {
        proposals.value = []
      }
      const index = proposals.value.findIndex(proposal => proposal.id === id)
      if (index !== -1) {
        proposals.value[index] = updatedProposal
      }

      if (currentProposal.value?.id === id) {
        currentProposal.value = updatedProposal
      }
      
      console.log('Ponuda je uspješno ažurirana')
      return updatedProposal
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri ažuriranju ponude'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteProposal(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await proposalService.deleteProposal(id)

      if (!proposals.value) {
        proposals.value = []
      } else {
        proposals.value = proposals.value.filter(proposal => proposal.id !== id)
      }

      if (currentProposal.value?.id === id) {
        currentProposal.value = null
      }
      
      console.log('Ponuda je uspješno uklonjena')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri uklanjanju ponude'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function sendProposal(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedProposal = await proposalService.sendProposal(id)

      if (!proposals.value) {
        proposals.value = []
      }
      const index = proposals.value.findIndex(proposal => proposal.id === id)
      if (index !== -1) {
        proposals.value[index] = updatedProposal
      }

      if (currentProposal.value?.id === id) {
        currentProposal.value = updatedProposal
      }
      
      console.log('Ponuda je uspješno poslana')
      return updatedProposal
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri slanju ponude'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function acceptProposal(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedProposal = await proposalService.acceptProposal(id)

      if (!proposals.value) {
        proposals.value = []
      }
      const index = proposals.value.findIndex(proposal => proposal.id === id)
      if (index !== -1) {
        proposals.value[index] = updatedProposal
      }

      if (currentProposal.value?.id === id) {
        currentProposal.value = updatedProposal
      }
      
      console.log('Ponuda je uspješno prihvaćena')
      return updatedProposal
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri prihvaćanju ponude'
      error.value = message
      console.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function generateProposalPDF(id: string, filename?: string) {
    try {
      await proposalService.generateProposalPDF(id, filename)
      console.log('PDF je uspješno preuzet')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Greška pri preuzimanju PDF-a'
      error.value = message
      console.error(message)
      throw err
    }
  }
  
  function setCurrentProposal(proposal: Proposal | null) {
    currentProposal.value = proposal
  }
  
  function clearFilters() {
    filters.value = {
      search: '',
      status: undefined,
      clientId: undefined,
      page: 1,
      limit: 10
    }
  }
  
  function clearError() {
    error.value = null
  }
  
  return {

    proposals,
    currentProposal,
    isLoading,
    error,
    pagination,
    filters,

    draftProposals,
    sentProposals,
    viewedProposals,
    acceptedProposals,
    rejectedProposals,
    expiredProposals,
    totalProposals,
    totalValue,
    acceptedValue,
    pendingValue,
    conversionRate,

    fetchProposals,
    fetchProposal,
    createProposal,
    updateProposal,
    deleteProposal,
    sendProposal,
    acceptProposal,
    generateProposalPDF,
    setCurrentProposal,
    clearFilters,
    clearError
  }
})