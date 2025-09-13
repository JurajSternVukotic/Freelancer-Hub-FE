<template>
  <div class="client-invoices">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Računi</h1>
        <p class="page-subtitle">Pregled vaših računa i stanja plaćanja</p>
      </div>
      <div class="filters">
        <select v-model="statusFilter" @change="loadInvoices" class="filter-select">
          <option value="">Svi računi</option>
          <option value="DRAFT">Nacrti</option>
          <option value="SENT">Poslani</option>
          <option value="PAID">Plaćeni</option>
          <option value="OVERDUE">Prosročeni</option>
        </select>
      </div>
    </div>

    <div v-if="invoices.length > 0" class="summary-cards">
      <div class="summary-card">
        <div class="card-icon sent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        </div>
        <div class="card-content">
          <div class="card-value">{{ getSummary().sent.count }}</div>
          <div class="card-label">Poslani računi</div>
          <div class="card-amount">{{ formatCurrency(getSummary().sent.total) }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon paid">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="card-content">
          <div class="card-value">{{ getSummary().paid.count }}</div>
          <div class="card-label">Plaćeni računi</div>
          <div class="card-amount">{{ formatCurrency(getSummary().paid.total) }}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon overdue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
          </svg>
        </div>
        <div class="card-content">
          <div class="card-value">{{ getSummary().overdue.count }}</div>
          <div class="card-label">Prosročeni računi</div>
          <div class="card-amount">{{ formatCurrency(getSummary().overdue.total) }}</div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Učitavam račune...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-message">{{ error }}</div>
      <button @click="loadInvoices" class="retry-button">Pokušaj ponovo</button>
    </div>

    <div v-else-if="!invoices.length" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z"/>
        <path d="M16 18v-6H8v6"/>
        <path d="M16 6l-6-6"/>
      </svg>
      <h3>Nemate računa</h3>
      <p>Računi će se pojaviti ovdje kada vam ih freelanceri pošalju.</p>
    </div>

    <div v-else class="invoices-list">
      <div class="invoices-header">
        <h2 class="list-title">
          {{ statusFilter ? getStatusLabel(statusFilter) : 'Svi računi' }}
          <span class="list-count">({{ invoices.length }})</span>
        </h2>
      </div>

      <div class="invoices-table">
        <div class="table-header">
          <div class="header-cell">Broj računa</div>
          <div class="header-cell">Projekt</div>
          <div class="header-cell">Datum</div>
          <div class="header-cell">Dospjeće</div>
          <div class="header-cell">Iznos</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Akcije</div>
        </div>

        <div 
          v-for="invoice in invoices" 
          :key="invoice.id" 
          class="table-row"
          :class="{ 'overdue': isOverdue(invoice) }"
        >
          <div class="table-cell">
            <div class="invoice-number">{{ invoice.number }}</div>
          </div>
          
          <div class="table-cell">
            <div class="project-info">
              <span v-if="invoice.project" class="project-name">{{ invoice.project.name }}</span>
              <span v-else class="no-project">Nema projekta</span>
            </div>
          </div>
          
          <div class="table-cell">
            <div class="invoice-date">{{ formatDate(invoice.date) }}</div>
          </div>
          
          <div class="table-cell">
            <div class="due-date" :class="{ 'overdue': isOverdue(invoice) }">
              {{ formatDate(invoice.dueDate) }}
            </div>
          </div>
          
          <div class="table-cell">
            <div class="invoice-amount">{{ formatCurrency(invoice.total) }}</div>
          </div>
          
          <div class="table-cell">
            <span class="status-badge" :class="invoice.status.toLowerCase()">
              {{ getStatusLabel(invoice.status) }}
            </span>
          </div>
          
          <div class="table-cell">
            <div class="invoice-actions">
              <button 
                @click="viewInvoice(invoice.id)" 
                class="action-button view"
                title="Pogledaj račun"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>

              <button 
                @click="downloadPDF(invoice.id, invoice.number)"
                class="action-button download"
                title="Preuzmi PDF"
                :disabled="isDownloading"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </button>
              
              <button 
                v-if="invoice.status === 'SENT'" 
                @click="markAsPaid(invoice.id)"
                class="action-button pay"
                title="Označi kao plaćen"
                :disabled="isMarking"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pagination && pagination.totalPages > 1" class="pagination">
        <button 
          v-for="page in pagination.totalPages" 
          :key="page"
          @click="loadPage(page)"
          class="page-button"
          :class="{ active: page === pagination.currentPage }"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <div v-if="selectedInvoice" class="modal-overlay" @click="closeInvoiceDetail">
      <div class="modal-content invoice-detail" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Račun {{ selectedInvoice.number }}</h2>
          <button @click="closeInvoiceDetail" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="invoice-detail-content">
          <div class="invoice-header-info">
            <div class="invoice-meta">
              <div class="meta-item">
                <label>Datum:</label>
                <span>{{ formatDate(selectedInvoice.date) }}</span>
              </div>
              <div class="meta-item">
                <label>Dospjeće:</label>
                <span>{{ formatDate(selectedInvoice.dueDate) }}</span>
              </div>
              <div class="meta-item">
                <label>Status:</label>
                <span class="status-badge" :class="selectedInvoice.status.toLowerCase()">
                  {{ getStatusLabel(selectedInvoice.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="invoice-items">
            <h3>Stavke računa</h3>
            <div class="items-table">
              <div class="items-header">
                <div class="item-header">Opis</div>
                <div class="item-header">Količina</div>
                <div class="item-header">Cijena</div>
                <div class="item-header">Ukupno</div>
              </div>
              <div 
                v-for="item in selectedInvoice.items" 
                :key="item.id" 
                class="item-row"
              >
                <div class="item-cell">{{ item.description }}</div>
                <div class="item-cell">{{ item.quantity }}</div>
                <div class="item-cell">{{ formatCurrency(item.rate) }}</div>
                <div class="item-cell">{{ formatCurrency(item.amount) }}</div>
              </div>
            </div>
          </div>

          <div class="invoice-total">
            <div class="total-row">
              <label>Ukupno:</label>
              <span class="total-amount">{{ formatCurrency(selectedInvoice.total) }}</span>
            </div>
          </div>

          <div v-if="selectedInvoice.status === 'SENT'" class="invoice-actions-modal">
            <button 
              @click="markAsPaid(selectedInvoice.id)"
              class="pay-button"
              :disabled="isMarking"
            >
              <span v-if="isMarking">Označavam...</span>
              <span v-else>Označi kao plaćen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { clientPortalService } from '../../services/clientPortalService'
import type { ClientInvoice } from '../../services/clientPortalService'

const invoices = ref<ClientInvoice[]>([])
const selectedInvoice = ref<ClientInvoice | null>(null)
const isLoading = ref(false)
const isMarking = ref(false)
const isDownloading = ref(false)
const error = ref('')
const statusFilter = ref('')
const pagination = ref<any>(null)

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('hr-HR')
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    'DRAFT': 'Nacrt',
    'SENT': 'Poslan',
    'PAID': 'Plaćen',
    'OVERDUE': 'Prosročen'
  }
  return statusMap[status] || status
}

function isOverdue(invoice: ClientInvoice) {
  if (invoice.status === 'PAID') return false
  return new Date(invoice.dueDate) < new Date()
}

function getSummary() {
  const summary = {
    sent: { count: 0, total: 0 },
    paid: { count: 0, total: 0 },
    overdue: { count: 0, total: 0 }
  }

  invoices.value.forEach(invoice => {
    if (invoice.status === 'SENT') {
      summary.sent.count++
      summary.sent.total += invoice.total
    } else if (invoice.status === 'PAID') {
      summary.paid.count++
      summary.paid.total += invoice.total
    }
    
    if (isOverdue(invoice)) {
      summary.overdue.count++
      summary.overdue.total += invoice.total
    }
  })

  return summary
}

async function loadInvoices() {
  isLoading.value = true
  error.value = ''

  try {
    const params: any = {}
    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    const response = await clientPortalService.getInvoices(params)
    invoices.value = response.invoices || []
    pagination.value = response.pagination || null
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Greška pri učitavanju računa'
  } finally {
    isLoading.value = false
  }
}

async function viewInvoice(invoiceId: string) {
  try {
    const response = await clientPortalService.getInvoice(invoiceId)
    selectedInvoice.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Greška pri učitavanju računa'
  }
}

function closeInvoiceDetail() {
  selectedInvoice.value = null
}

async function markAsPaid(invoiceId: string) {
  isMarking.value = true
  
  try {
    await clientPortalService.markInvoiceAsPaid(invoiceId)

    const invoiceIndex = invoices.value.findIndex(inv => inv.id === invoiceId)
    if (invoiceIndex !== -1) {
      invoices.value[invoiceIndex].status = 'PAID'
    }

    if (selectedInvoice.value && selectedInvoice.value.id === invoiceId) {
      selectedInvoice.value.status = 'PAID'
    }
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Greška pri označavanju računa kao plaćen'
  } finally {
    isMarking.value = false
  }
}

async function downloadPDF(invoiceId: string, invoiceNumber: string) {
  isDownloading.value = true
  
  try {
    await clientPortalService.downloadInvoicePDF(invoiceId, `racun-${invoiceNumber}.pdf`)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Greška pri preuzimanju PDF-a'
  } finally {
    isDownloading.value = false
  }
}

async function loadPage(page: number) {

}

onMounted(() => {
  loadInvoices()
})
</script>

<style scoped>
.client-invoices {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-content {
  flex: 1;
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
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-icon.sent {
  background-color: var(--warning);
}

.card-icon.paid {
  background-color: var(--success);
}

.card-icon.overdue {
  background-color: var(--error);
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.card-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0;
}

.card-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: var(--error);
  margin-bottom: 1rem;
}

.retry-button {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: var(--primary-hover);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.invoices-header {
  margin-bottom: 1rem;
}

.list-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.list-count {
  color: var(--text-secondary);
  font-weight: 400;
}

.invoices-table {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 100px 100px 120px 100px 100px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-cell {
  padding: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 100px 100px 120px 100px 100px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: var(--bg-secondary);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.overdue {
  background-color: var(--error-bg);
}

.table-cell {
  padding: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.invoice-number {
  font-weight: 600;
  color: var(--text-primary);
}

.project-name {
  color: var(--text-primary);
}

.no-project {
  color: var(--text-secondary);
  font-style: italic;
}

.invoice-date,
.due-date {
  color: var(--text-secondary);
}

.due-date.overdue {
  color: var(--error);
  font-weight: 600;
}

.invoice-amount {
  font-weight: 600;
  color: var(--text-primary);
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.status-badge.draft {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.status-badge.sent {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.status-badge.paid {
  background-color: var(--success-bg);
  color: var(--success);
}

.status-badge.overdue {
  background-color: var(--error-bg);
  color: var(--error);
}

.invoice-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.view {
  background-color: var(--primary-light);
  color: var(--primary);
}

.action-button.view:hover {
  background-color: var(--primary);
  color: white;
}

.action-button.pay {
  background-color: var(--success-bg);
  color: var(--success);
}

.action-button.pay:hover:not(:disabled) {
  background-color: var(--success);
  color: white;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-content.invoice-detail {
  background-color: var(--bg-primary);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.invoice-detail-content {
  padding: 1.5rem;
}

.invoice-header-info {
  margin-bottom: 2rem;
}

.invoice-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-item label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.invoice-items {
  margin-bottom: 2rem;
}

.invoice-items h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.items-table {
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  overflow: hidden;
}

.items-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.item-header {
  padding: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid var(--border-color);
}

.item-row:last-child {
  border-bottom: none;
}

.item-cell {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.invoice-total {
  border-top: 2px solid var(--border-color);
  padding-top: 1rem;
  margin-bottom: 2rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-row label {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.invoice-actions-modal {
  display: flex;
  justify-content: flex-end;
}

.pay-button {
  background-color: var(--success);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.pay-button:hover:not(:disabled) {
  background-color: var(--success-hover);
}

.pay-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr 80px 80px 100px 80px 80px;
  }
  
  .header-cell,
  .table-cell {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .invoices-table {
    overflow-x: auto;
  }
  
  .table-header,
  .table-row {
    min-width: 600px;
  }
  
  .modal-content.invoice-detail {
    margin: 0;
    border-radius: 0;
    height: 100%;
    max-height: none;
  }
  
  .invoice-meta {
    grid-template-columns: 1fr;
  }
  
  .items-header,
  .item-row {
    grid-template-columns: 2fr 80px 80px 80px;
  }
  
  .item-header,
  .item-cell {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
}
</style>