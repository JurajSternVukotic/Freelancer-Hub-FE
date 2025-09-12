<template>
  <div class="invoice-detail-view">
    <div class="container">
      
      <div class="page-header">
        <div class="header-nav">
          <router-link to="/invoices" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            Natrag na račune
          </router-link>
        </div>
        
        <div class="header-actions">
          <button @click="downloadPDF" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Preuzmi PDF
          </button>
          
          <button 
            @click="sendInvoice" 
            class="btn btn-primary"
            :disabled="invoice?.status === 'paid'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
            Pošalji račun
          </button>
          
          <router-link 
            :to="`/invoices/${invoice?.id}/edit`" 
            class="btn btn-secondary"
            v-if="invoice?.status !== 'paid'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Uredi
          </router-link>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p>Učitavanje računa...</p>
      </div>
      
      <div v-else-if="!invoice" class="error-state">
        <h2>Račun nije pronađen</h2>
        <p>Račun koji tražite ne postoji ili je uklonjen.</p>
        <router-link to="/invoices" class="btn btn-primary">Natrag na račune</router-link>
      </div>
      
      <div v-else class="invoice-content">
        
        <div class="invoice-header">
          <div class="invoice-info">
            <h1 class="invoice-number">Račun {{ invoice.number }}</h1>
            <span :class="['status-badge', `status-${invoice.status}`]">
              {{ getStatusText(invoice.status) }}
            </span>
          </div>
          
          <div class="invoice-dates">
            <div class="date-item">
              <span class="date-label">Datum izdavanja:</span>
              <span class="date-value">{{ formatDate(invoice.issueDate) }}</span>
            </div>
            <div class="date-item">
              <span class="date-label">Datum dospijeća:</span>
              <span class="date-value" :class="{ 'overdue': isOverdue(invoice.dueDate) }">
                {{ formatDate(invoice.dueDate) }}
              </span>
            </div>
          </div>
        </div>

        <div class="client-section">
          <h3>Podaci o klijentu</h3>
          <div class="client-card">
            <div class="client-info">
              <h4>{{ invoice.client?.name || 'N/A' }}</h4>
              <p v-if="invoice.client?.company">{{ invoice.client.company }}</p>
              <p v-if="invoice.client?.email">{{ invoice.client.email }}</p>
              <p v-if="invoice.client?.phone">{{ invoice.client.phone }}</p>
              <div v-if="invoice.client?.address" class="address">
                <p>{{ invoice.client.address }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="items-section">
          <h3>Stavke računa</h3>
          <div class="items-table">
            <div class="table-header">
              <div class="col-description">Opis</div>
              <div class="col-quantity">Količina</div>
              <div class="col-price">Cijena</div>
              <div class="col-total">Ukupno</div>
            </div>
            
            <div v-for="item in invoice.items" :key="item.id" class="table-row">
              <div class="col-description">
                <div class="item-title">{{ item.description }}</div>
                <div v-if="item.details" class="item-details">{{ item.details }}</div>
              </div>
              <div class="col-quantity">{{ item.quantity }}</div>
              <div class="col-price">{{ formatCurrency(item.rate) }}</div>
              <div class="col-total">{{ formatCurrency(item.amount) }}</div>
            </div>

            <div class="totals-section">
              <div class="total-row">
                <div class="total-label">Međuzbroj:</div>
                <div class="total-value">{{ formatCurrency(invoice.subtotal) }}</div>
              </div>
              
              <div v-if="invoice.taxAmount > 0" class="total-row">
                <div class="total-label">PDV:</div>
                <div class="total-value">{{ formatCurrency(invoice.taxAmount) }}</div>
              </div>
              
              <div class="total-row final">
                <div class="total-label">Ukupno za naplatu:</div>
                <div class="total-value">{{ formatCurrency(invoice.total) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="invoice.paymentInfo" class="payment-section">
          <h3>Informacije o plaćanju</h3>
          <div class="payment-card">
            <div v-if="invoice.paymentInfo.bankAccount" class="payment-item">
              <span class="payment-label">Broj računa:</span>
              <span class="payment-value">{{ invoice.paymentInfo.bankAccount }}</span>
            </div>
            <div v-if="invoice.paymentInfo.paymentMethod" class="payment-item">
              <span class="payment-label">Način plaćanja:</span>
              <span class="payment-value">{{ invoice.paymentInfo.paymentMethod }}</span>
            </div>
            <div v-if="invoice.paymentInfo.reference" class="payment-item">
              <span class="payment-label">Poziv na broj:</span>
              <span class="payment-value">{{ invoice.paymentInfo.reference }}</span>
            </div>
          </div>
        </div>

        <div v-if="invoice.notes" class="notes-section">
          <h3>Napomene</h3>
          <div class="notes-content">
            {{ invoice.notes }}
          </div>
        </div>

        <div class="actions-section">
          <button 
            v-if="invoice.status !== 'paid'" 
            @click="markAsPaid" 
            class="btn btn-success"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Označi kao plaćeno
          </button>
          
          <button 
            v-if="invoice.status === 'draft'" 
            @click="sendInvoice" 
            class="btn btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
            Pošalji račun
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, parseISO, isAfter } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useInvoicesStore } from '@/stores/invoices'
import { invoiceService } from '@/services/invoiceService'

const route = useRoute()
const router = useRouter()
const invoicesStore = useInvoicesStore()

const props = defineProps<{
  id?: string
}>()

const isLoading = computed(() => invoicesStore.isLoading)
const invoice = computed(() => invoicesStore.currentInvoice)

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

async function downloadPDF() {
  if (!invoice.value) return
  
  try {
    await invoicesStore.downloadPDF(invoice.value.id, `racun-${invoice.value.number}.pdf`)
  } catch (error) {
    console.error('Greška pri preuzimanju PDF-a:', error)
  }
}

function sendInvoice() {

  console.log('Slanje računa - funkcionalnost nije implementirana')
}

async function markAsPaid() {
  if (!invoice.value) return
  
  try {
    await invoicesStore.updateInvoice(invoice.value.id, { 
      status: 'paid',
      paidDate: new Date().toISOString()
    })
    console.log('Račun je označen kao plaćen')
  } catch (error) {
    console.error('Greška pri označavanju kao plaćeno:', error)
  }
}

async function fetchInvoice() {
  const invoiceId = props.id || route.params.id as string
  
  try {
    await invoicesStore.fetchInvoice(invoiceId)
  } catch (error) {
    console.error('Greška pri dohvaćanju računa:', error)
  }
}

onMounted(() => {
  fetchInvoice()
})
</script>

<style scoped>
.invoice-detail-view {
  padding: 2rem;
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.error-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.error-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.invoice-content {
  max-width: 800px;
  margin: 0 auto;
}

.invoice-header {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.invoice-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.invoice-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.invoice-dates {
  text-align: right;
}

.date-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.date-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.date-value {
  color: var(--text-primary);
  font-weight: 600;
}

.date-value.overdue {
  color: var(--error-color);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
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

.client-section,
.items-section,
.payment-section,
.notes-section {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.client-section h3,
.items-section h3,
.payment-section h3,
.notes-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.client-card {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
}

.client-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.client-info p {
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.items-table {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  background: var(--bg-secondary);
  padding: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border-color);
}

.table-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.col-quantity,
.col-price,
.col-total {
  text-align: right;
}

.item-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.item-details {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.totals-section {
  border-top: 2px solid var(--border-color);
  padding: 1rem;
  margin-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.total-row.final {
  font-size: 1rem;
  font-weight: 700;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.5rem;
}

.total-row.discount .total-value {
  color: var(--error-color);
}

.total-label {
  color: var(--text-secondary);
}

.total-value {
  color: var(--text-primary);
  font-weight: 600;
}

.payment-card {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
}

.payment-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.payment-item:last-child {
  margin-bottom: 0;
}

.payment-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.payment-value {
  color: var(--text-primary);
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
}

.notes-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  color: var(--text-primary);
  line-height: 1.6;
}

.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .invoice-detail-view {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .invoice-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .invoice-dates {
    text-align: left;
    width: 100%;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .col-quantity,
  .col-price,
  .col-total {
    text-align: left;
  }
  
  .actions-section {
    flex-direction: column;
  }
}
</style>