<template>
  <div class="invoices-view">
    <div class="container">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Računi</h1>
          <p class="page-subtitle">
            Upravljanje računima i fakturama za svoje klijente
          </p>
        </div>
        
        <div class="header-actions">
          <router-link to="/invoices/new" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Novi račun
          </router-link>
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
            placeholder="Pretraži račune..."
            class="search-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" class="filter-select" @change="applyFilters">
            <option value="">Svi statusi</option>
            <option value="DRAFT">Skica</option>
            <option value="SENT">Poslano</option>
            <option value="PAID">Plaćeno</option>
            <option value="OVERDUE">Zakašnjelo</option>
            <option value="CANCELLED">Otkazano</option>
          </select>
          
          <select v-model="clientFilter" class="filter-select" @change="applyFilters">
            <option value="">Svi klijenti</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
          
          <button @click="clearFilters" class="btn btn-secondary btn-sm" :disabled="!hasActiveFilters">
            Obriši filtere
          </button>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalRevenue) }}</div>
          <div class="stat-label">Ukupni prihod</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(pendingAmount) }}</div>
          <div class="stat-label">Na čekanju</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(overdueAmount) }}</div>
          <div class="stat-label">Zakašnjelo</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalInvoices }}</div>
          <div class="stat-label">Ukupno računa</div>
        </div>
      </div>

      <div class="content-card">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p>Učitavanje računa...</p>
        </div>
        
        <div v-else-if="invoices.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          <h3>Nema računa</h3>
          <p v-if="hasActiveFilters">Nema računa koji odgovaraju vašim filterima.</p>
          <p v-else>Kreirajte svoj prvi račun za klijente.</p>
          <router-link to="/invoices/new" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Kreiraj račun
          </router-link>
        </div>
        
        <div v-else>
          
          <div class="invoices-table desktop-view">
            <div class="table-header">
              <div class="table-cell">Broj računa</div>
              <div class="table-cell">Klijent</div>
              <div class="table-cell">Datum izdavanja</div>
              <div class="table-cell">Dospijeće</div>
              <div class="table-cell">Iznos</div>
              <div class="table-cell">Status</div>
              <div class="table-cell">Akcije</div>
            </div>
            
            <div
              v-for="invoice in invoices"
              :key="invoice.id"
              class="table-row"
              @click="viewInvoice(invoice.id)"
            >
              <div class="table-cell">
                <div class="invoice-number">{{ invoice.number }}</div>
              </div>
              
              <div class="table-cell">
                <div class="client-info">
                  <div class="client-name">{{ invoice.client?.company || 'N/A' }}</div>
                  <div class="client-company">{{ invoice.client?.contactPerson || '' }}</div>
                </div>
              </div>
              
              <div class="table-cell">
                <div class="invoice-date">{{ formatDate(invoice.date) }}</div>
              </div>
              
              <div class="table-cell">
                <div class="due-date" :class="{ 'overdue': isOverdue(invoice.dueDate) }">
                  {{ formatDate(invoice.dueDate) }}
                </div>
              </div>
              
              <div class="table-cell">
                <div class="invoice-amount">{{ formatCurrency(invoice.total) }}</div>
              </div>
              
              <div class="table-cell">
                <span :class="['status-badge', `status-${invoice.status}`]">
                  {{ getStatusText(invoice.status) }}
                </span>
              </div>
              
              <div class="table-cell">
                <div class="action-buttons" @click.stop>
                  <router-link :to="`/invoices/${invoice.id}/edit`" class="btn btn-sm btn-secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Uredi
                  </router-link>
                  
                  <button
                    @click="downloadInvoice(invoice)"
                    class="btn btn-sm btn-secondary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    PDF
                  </button>
                  
                  <button
                    @click="sendInvoice(invoice)"
                    class="btn btn-sm btn-primary"
                    :disabled="invoice.status === 'SENT' || invoice.status === 'PAID'"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                    </svg>
                    Pošalji
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="invoices-cards mobile-view">
            <div
              v-for="invoice in invoices"
              :key="invoice.id"
              class="invoice-card"
              @click="viewInvoice(invoice.id)"
            >
              <div class="invoice-card-header">
                <div class="invoice-info">
                  <h3 class="invoice-number">{{ invoice.number }}</h3>
                  <p class="client-name">{{ invoice.client?.company || 'N/A' }}</p>
                </div>
                <span :class="['status-badge', `status-${invoice.status}`]">
                  {{ getStatusText(invoice.status) }}
                </span>
              </div>
              
              <div class="invoice-card-body">
                <div class="invoice-details">
                  <div class="detail-item">
                    <span class="detail-label">Izdano:</span>
                    <span class="detail-value">{{ formatDate(invoice.date) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Dospijeće:</span>
                    <span class="detail-value" :class="{ 'overdue': isOverdue(invoice.dueDate) }">
                      {{ formatDate(invoice.dueDate) }}
                    </span>
                  </div>
                  <div class="detail-item amount">
                    <span class="detail-label">Ukupno:</span>
                    <span class="detail-value amount-value">{{ formatCurrency(invoice.total) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="invoice-card-actions" @click.stop>
                <router-link :to="`/invoices/${invoice.id}/edit`" class="btn btn-sm btn-secondary">
                  Uredi
                </router-link>
                <button @click="downloadInvoice(invoice)" class="btn btn-sm btn-secondary">
                  PDF
                </button>
                <button
                  @click="sendInvoice(invoice)"
                  class="btn btn-sm btn-primary"
                  :disabled="invoice.status === 'SENT' || invoice.status === 'PAID'"
                >
                  Pošalji
                </button>
              </div>
            </div>
          </div>

          <div v-if="pagination.totalPages > 1" class="pagination">
            <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="btn btn-secondary btn-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
              Prethodna
            </button>
            
            <span class="pagination-info">
              Stranica {{ pagination.page }} od {{ pagination.totalPages }}
            </span>
            
            <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="btn btn-secondary btn-sm"
            >
              Sljedeća
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format, parseISO, isAfter } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useInvoicesStore } from '@/stores/invoices'
import { useClientsStore } from '@/stores/clients'
import { invoiceService } from '@/services/invoiceService'

const router = useRouter()
const invoicesStore = useInvoicesStore()
const clientsStore = useClientsStore()

const isLoading = computed(() => invoicesStore.isLoading)
const invoices = computed(() => (invoicesStore.invoices || []).filter(invoice => invoice !== null && invoice !== undefined))
const pagination = computed(() => invoicesStore.pagination)

const searchQuery = ref('')
const statusFilter = ref('')
const clientFilter = ref('')
const searchTimeout = ref<NodeJS.Timeout>()

const clients = computed(() => clientsStore.activeClients)

const hasActiveFilters = computed(() => {
  return searchQuery.value || statusFilter.value || clientFilter.value
})

const totalRevenue = computed(() => invoicesStore.paidValue)

const pendingAmount = computed(() => {
  return (invoicesStore.invoices || [])
    .filter(invoice => invoice && (invoice.status === 'SENT' || invoice.status === 'VIEWED'))
    .reduce((total, invoice) => {
      const invoiceTotal = typeof invoice.total === 'object' ? Number(invoice.total) : (Number(invoice.total) || 0)
      return total + invoiceTotal
    }, 0)
})

const overdueAmount = computed(() => {
  return (invoicesStore.invoices || [])
    .filter(invoice => invoice && invoice.status === 'OVERDUE')
    .reduce((total, invoice) => {
      const invoiceTotal = typeof invoice.total === 'object' ? Number(invoice.total) : (Number(invoice.total) || 0)
      return total + invoiceTotal
    }, 0)
})

const totalInvoices = computed(() => invoicesStore.totalInvoices)

function formatCurrency(amount: number): string {
  return invoiceService.formatCurrency(amount)
}

function formatDate(dateString: string): string {
  return invoiceService.formatDate(dateString)
}

function isOverdue(dueDate: string): boolean {
  return isAfter(new Date(), parseISO(dueDate))
}

function getStatusText(status: string): string {
  return invoiceService.getStatusText(status)
}

function viewInvoice(invoiceId: string) {
  router.push(`/invoices/${invoiceId}`)
}

function debouncedSearch() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    applyFilters()
  }, 300)
}

async function applyFilters() {
  try {
    await invoicesStore.fetchInvoices({
      search: searchQuery.value || undefined,
      status: statusFilter.value as any || undefined,
      clientId: clientFilter.value || undefined,
      page: 1
    })
  } catch (error) {
    console.error('Greška pri primjeni filtera:', error)
  }
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  clientFilter.value = ''
  invoicesStore.clearFilters()
  fetchInvoices()
}

async function goToPage(page: number) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    try {
      await invoicesStore.fetchInvoices({
        page
      })
    } catch (error) {
      console.error('Greška pri navigaciji na stranicu:', error)
    }
  }
}

async function downloadInvoice(invoice: any) {
  try {
    await invoicesStore.downloadPDF(invoice.id, `racun-${invoice.number}.pdf`)
  } catch (error) {
    console.error('Greška pri preuzimanju PDF-a:', error)
  }
}

function sendInvoice(invoice: any) {

  console.log(`Slanje računa ${invoice.number} - funkcionalnost nije implementirana`)
}

async function fetchInvoices() {
  try {
    await invoicesStore.fetchInvoices()
  } catch (error) {
    console.error('Greška pri dohvaćanju računa:', error)
  }
}

async function fetchClients() {
  try {
    await clientsStore.fetchClients()
  } catch (error) {
    console.error('Greška pri dohvaćanju klijenata:', error)
  }
}

onMounted(() => {
  fetchClients()
  fetchInvoices()
})
</script>

<style scoped>
.invoices-view {
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
  margin: 0;
  margin-bottom: 0.5rem;
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

.invoices-table {
  display: table;
  width: 100%;
}

.table-header,
.table-row {
  display: table-row;
}

.table-header .table-cell {
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.table-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: var(--bg-secondary);
}

.table-row .table-cell {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.table-cell {
  display: table-cell;
}

.invoice-number {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.client-info .client-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.client-company {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.invoice-date,
.due-date {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.due-date.overdue {
  color: var(--error-color);
  font-weight: 600;
}

.invoice-amount {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
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

.status-paid {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-overdue {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.status-cancelled {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.invoices-cards {
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.invoice-card {
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.invoice-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.invoice-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.invoice-info .invoice-number {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.invoice-info .client-name {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.invoice-card-body {
  margin-bottom: 1rem;
}

.invoice-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.detail-item.amount {
  font-weight: 600;
  font-size: 1rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.detail-label {
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
}

.detail-value.overdue {
  color: var(--error-color);
  font-weight: 600;
}

.amount-value {
  font-weight: 700;
  color: var(--success-color);
}

.invoice-card-actions {
  display: flex;
  gap: 0.5rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .invoices-view {
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
    flex-wrap: wrap;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .desktop-view {
    display: none;
  }
  
  .mobile-view {
    display: flex;
  }
  
  .invoices-cards {
    display: flex;
  }
  
  .invoice-card-actions .btn {
    flex: 1;
  }
}

.mobile-view {
  display: none;
}

@media (max-width: 768px) {
  .mobile-view {
    display: flex;
  }
}
</style>