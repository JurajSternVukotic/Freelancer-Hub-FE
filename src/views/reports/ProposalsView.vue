<template>
  <div class="proposals-view">
    <div class="container">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Ponude</h1>
          <p class="page-subtitle">
            Upravljanje ponudama za potencijalne projekte
          </p>
        </div>
        
        <div class="header-actions">
          <router-link to="/proposals/new" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Nova ponuda
          </router-link>
        </div>
      </div>

      <div v-if="error" class="error-banner">
        <div class="error-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="error-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>{{ error }}</span>
          <button @click="clearError" class="error-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pretraži ponude..."
            class="search-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" class="filter-select" @change="applyFilters">
            <option value="">Svi statusi</option>
            <option value="draft">Skica</option>
            <option value="sent">Poslano</option>
            <option value="viewed">Pogledano</option>
            <option value="accepted">Prihvaćeno</option>
            <option value="rejected">Odbačeno</option>
            <option value="expired">Isteklo</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-secondary btn-sm" :disabled="!hasActiveFilters">
            Obriši filtere
          </button>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ proposals.length }}</div>
          <div class="stat-label">Ukupno ponuda</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ acceptedProposals.length }}</div>
          <div class="stat-label">Prihvaćeno</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalValue) }}</div>
          <div class="stat-label">Ukupna vrijednost</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ conversionRate }}%</div>
          <div class="stat-label">Stopa konverzije</div>
        </div>
      </div>

      <div class="content-card">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p>Učitavanje ponuda...</p>
        </div>
        
        <div v-else-if="proposals.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          <h3>Nema ponuda</h3>
          <p v-if="hasActiveFilters">Nema ponuda koji odgovaraju vašim filterima.</p>
          <p v-else>Kreirajte svoju prvu ponudu za klijente.</p>
          <router-link to="/proposals/new" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Kreiraj ponudu
          </router-link>
        </div>
        
        <div v-else class="proposals-list">
          <div
            v-for="proposal in proposals"
            :key="proposal.id"
            class="proposal-card"
            @click="viewProposal(proposal.id)"
          >
            <div class="proposal-header">
              <div class="proposal-info">
                <h3 class="proposal-title">{{ proposal.title }}</h3>
                <p class="client-name">{{ proposal.client?.name || 'N/A' }}</p>
              </div>
              <span :class="['status-badge', `status-${proposal.status}`]">
                {{ getStatusText(proposal.status) }}
              </span>
            </div>
            
            <div class="proposal-body">
              <div class="proposal-details">
                <div class="detail-item">
                  <span class="detail-label">Kreirana:</span>
                  <span class="detail-value">{{ formatDate(proposal.createdAt) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Vrijednost:</span>
                  <span class="detail-value">{{ formatCurrency(proposal.total) }}</span>
                </div>
                <div v-if="proposal.validUntil" class="detail-item">
                  <span class="detail-label">Vrijedi do:</span>
                  <span class="detail-value" :class="{ 'expired': isExpired(proposal.validUntil) }">
                    {{ formatDate(proposal.validUntil) }}
                  </span>
                </div>
              </div>
              
              <div v-if="proposal.description" class="proposal-description">
                {{ proposal.description }}
              </div>
            </div>
            
            <div class="proposal-actions" @click.stop>
              <router-link :to="`/proposals/${proposal.id}/edit`" class="btn btn-sm btn-secondary">
                Uredi
              </router-link>
              <button @click="downloadProposal(proposal)" class="btn btn-sm btn-secondary">
                PDF
              </button>
              <button
                v-if="proposal.status === 'draft'"
                @click="sendProposal(proposal)"
                class="btn btn-sm btn-primary"
              >
                Pošalji
              </button>
              <button
                v-if="['sent', 'viewed'].includes(proposal.status)"
                @click="acceptProposal(proposal)"
                class="btn btn-sm btn-success"
              >
                Prihvati
              </button>
              <button
                @click="deleteProposal(proposal)"
                class="btn btn-sm btn-danger"
                style="margin-left: 0.5rem;"
              >
                Ukloni
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { format, parseISO, isAfter } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useProposalsStore } from '../../stores/proposals'

const router = useRouter()
const proposalsStore = useProposalsStore()

const searchQuery = ref('')
const statusFilter = ref('')
const searchTimeout = ref<NodeJS.Timeout>()

const { 
  proposals, 
  isLoading, 
  error, 
  acceptedProposals, 
  totalValue, 
  conversionRate 
} = proposalsStore

const hasActiveFilters = computed(() => {
  return searchQuery.value || statusFilter.value
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'dd.MM.yyyy', { locale: hr })
}

function isExpired(validUntil: string): boolean {
  return isAfter(new Date(), parseISO(validUntil))
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Skica',
    sent: 'Poslano',
    viewed: 'Pogledano',
    accepted: 'Prihvaćeno',
    rejected: 'Odbačeno',
    expired: 'Isteklo'
  }
  return statusMap[status] || status
}

function viewProposal(proposalId: string) {
  router.push(`/proposals/${proposalId}`)
}

function debouncedSearch() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    applyFilters()
  }, 300)
}

function applyFilters() {
  fetchProposals()
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  proposalsStore.clearFilters()
  fetchProposals()
}

async function downloadProposal(proposal: any) {
  try {
    await proposalsStore.generateProposalPDF(proposal.id)
  } catch (error) {
    console.error('Greška pri preuzimanju PDF-a:', error)
  }
}

async function sendProposal(proposal: any) {
  try {
    await proposalsStore.sendProposal(proposal.id)
    await fetchProposals() // Refresh the list
  } catch (error) {
    console.error('Greška pri slanju ponude:', error)
  }
}

async function acceptProposal(proposal: any) {
  try {
    await proposalsStore.acceptProposal(proposal.id)
    await fetchProposals() // Refresh the list
  } catch (error) {
    console.error('Greška pri prihvaćanju ponude:', error)
  }
}

async function deleteProposal(proposal: any) {
  if (!confirm('Jeste li sigurni da želite ukloniti ovu ponudu?')) {
    return
  }
  
  try {
    await proposalsStore.deleteProposal(proposal.id)
    await fetchProposals() // Refresh the list
  } catch (error) {
    console.error('Greška pri uklanjanju ponude:', error)
  }
}

function fetchProposals() {
  proposalsStore.fetchProposals({
    search: searchQuery.value || undefined,
    status: statusFilter.value || undefined
  })
}

const clearError = () => {
  if (error) {
    proposalsStore.clearError()
  }
}

watch([searchQuery, statusFilter], () => {
  debouncedSearch()
})

onMounted(() => {
  fetchProposals()
})
</script>

<style scoped>
.proposals-view {
  padding: 2rem;
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1.125rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  color: var(--error-color);
}

.error-icon {
  flex-shrink: 0;
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.error-close:hover {
  background: rgba(239, 68, 68, 0.1);
}

.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 120px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.content-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  overflow: hidden;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.proposals-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.proposal-card {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.proposal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.proposal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.client-name {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-draft {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-muted);
}

.status-sent {
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
}

.status-viewed {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.status-accepted {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-rejected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.status-expired {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.proposal-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.detail-label {
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

.detail-value.expired {
  color: var(--error-color);
}

.proposal-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.proposal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .proposals-view {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-box {
    max-width: none;
  }
  
  .filter-controls {
    justify-content: space-between;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .proposals-list {
    grid-template-columns: 1fr;
  }
  
  .proposal-actions {
    justify-content: stretch;
  }
  
  .proposal-actions .btn {
    flex: 1;
  }
}

.btn-success {
  background-color: var(--success-color, #10b981);
  color: white;
  border-color: var(--success-color, #10b981);
}

.btn-success:hover {
  background-color: #059669;
  border-color: #059669;
}

.btn-danger {
  background-color: var(--error-color, #ef4444);
  color: white;
  border-color: var(--error-color, #ef4444);
}

.btn-danger:hover {
  background-color: #dc2626;
  border-color: #dc2626;
}
</style>