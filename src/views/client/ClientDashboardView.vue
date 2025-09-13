<template>
  <div class="client-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Nadzorna ploča</h1>
        <p class="dashboard-subtitle">Pregled vaših projekata i aktivnosti</p>
      </div>
      <div class="header-actions">
        <button @click="loadDashboard(true)" :disabled="isLoading" class="refresh-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" :class="{ 'animate-spin': isLoading }">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          {{ isLoading ? 'Učitavanje...' : 'Osvježi' }}
        </button>
        <button @click="showPerformance = !showPerformance" class="debug-toggle" title="Performance Monitor">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
        </button>
        <div class="last-updated" v-if="lastUpdated">
          Zadnje ažuriranje: {{ formatLastUpdated(lastUpdated) }}
        </div>
      </div>
    </div>

    <PerformanceDashboard v-if="showPerformance" />

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Učitavam podatke...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-message">{{ error }}</div>
      <button @click="loadDashboard(true)" class="retry-button">Pokušaj ponovo</button>
    </div>

    <div v-else class="dashboard-content">
      
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon projects">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div class="card-content">
            <div class="card-value">{{ dashboardData?.summary?.activeProjectsCount || 0 }}</div>
            <div class="card-label">Aktivni projekti</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon requests">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="card-content">
            <div class="card-value">{{ dashboardData?.summary?.pendingRequestsCount || 0 }}</div>
            <div class="card-label">Zahtjevi u obradi</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon invoices">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div class="card-content">
            <div class="card-value">{{ dashboardData?.summary?.invoices?.SENT?.count || 0 }}</div>
            <div class="card-label">Računi za plaćanje</div>
          </div>
        </div>
      </div>

      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Aktivni projekti</h2>
          <router-link to="/client/project-requests" class="section-link">
            Pogledaj sve
          </router-link>
        </div>

        <div v-if="!dashboardData?.activeProjects?.length" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            <path d="M16 11H8"/>
            <path d="M16 15H8"/>
            <path d="M12 7v2"/>
          </svg>
          <p>Trenutno nemate aktivnih projekata</p>
        </div>

        <div v-else class="projects-grid">
          <div 
            v-for="project in dashboardData.activeProjects" 
            :key="project.id" 
            class="project-card"
          >
            <div class="project-header">
              <h3 class="project-name">{{ project.name }}</h3>
              <span class="project-status" :class="project.status.toLowerCase()">
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
            <p class="project-description">{{ project.description || 'Nema opisa' }}</p>
            <div class="project-meta">
              <div class="project-freelancer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                {{ project.owner.firstName }} {{ project.owner.lastName }}
              </div>
              <div v-if="project.endDate" class="project-deadline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                </svg>
                {{ formatDate(project.endDate) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Najnoviji računi</h2>
          <router-link to="/client/invoices" class="section-link">
            Pogledaj sve
          </router-link>
        </div>

        <div v-if="!dashboardData?.recentInvoices?.length" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z"/>
            <path d="M16 18v-6H8v6"/>
            <path d="M16 6l-6-6"/>
          </svg>
          <p>Nemate računa za prikaz</p>
        </div>

        <div v-else class="invoices-list">
          <div 
            v-for="invoice in dashboardData.recentInvoices" 
            :key="invoice.id" 
            class="invoice-item"
          >
            <div class="invoice-info">
              <div class="invoice-number">{{ invoice.number }}</div>
              <div class="invoice-date">{{ formatDate(invoice.date) }}</div>
            </div>
            <div class="invoice-amount">{{ formatCurrency(invoice.total) }}</div>
            <span class="invoice-status" :class="invoice.status.toLowerCase()">
              {{ getInvoiceStatusLabel(invoice.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { clientPortalService } from '../../services/clientPortalService'
import { toastService } from '../../services/toastService'
import PerformanceDashboard from '../../components/debug/PerformanceDashboard.vue'
import type { ClientDashboard } from '../../services/clientPortalService'

const dashboardData = ref<ClientDashboard | null>(null)
const isLoading = ref(false)
const error = ref('')
const lastUpdated = ref<Date | null>(null)
const autoRefreshInterval = ref<number | null>(null)
const showPerformance = ref(false)

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('hr-HR')
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function formatLastUpdated(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'upravo sada'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `prije ${minutes} min`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `prije ${hours}h`
  } else {
    return date.toLocaleString('hr-HR')
  }
}

function startAutoRefresh() {

  autoRefreshInterval.value = window.setInterval(() => {
    if (!isLoading.value) {
      loadDashboard()
    }
  }, 120000)
}

function stopAutoRefresh() {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
}

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    'PLANNING': 'Planiranje',
    'ACTIVE': 'Aktivan',
    'ON_HOLD': 'Na čekanju',
    'COMPLETED': 'Završen'
  }
  return statusMap[status] || status
}

function getInvoiceStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    'DRAFT': 'Nacrt',
    'SENT': 'Poslan',
    'PAID': 'Plaćen',
    'OVERDUE': 'Prosročen'
  }
  return statusMap[status] || status
}

async function loadDashboard(showSuccessToast: boolean = false) {
  isLoading.value = true
  error.value = ''
  
  try {
    const data = await clientPortalService.getDashboard()
    dashboardData.value = data
    lastUpdated.value = new Date()
    
    if (showSuccessToast) {
      toastService.success('Podaci su uspješno ažurirani.', 'Osvježeno!')
    }
  } catch (err: any) {
    const message = err.response?.data?.message || 'Greška pri učitavanju podataka'
    error.value = message
    toastService.error(message, 'Greška pri učitavanju')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadDashboard()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.client-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.dashboard-subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.debug-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.debug-toggle:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.last-updated {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
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

.card-icon.projects {
  background-color: var(--primary);
}

.card-icon.requests {
  background-color: var(--success);
}

.card-icon.invoices {
  background-color: var(--warning);
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.card-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.dashboard-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.section-link:hover {
  color: var(--primary-hover);
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

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.project-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.project-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.project-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.project-status.active {
  background-color: var(--success-bg);
  color: var(--success);
}

.project-status.planning {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.project-status.on_hold {
  background-color: var(--error-bg);
  color: var(--error);
}

.project-status.completed {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.project-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.project-freelancer,
.project-deadline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.invoices-list {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.invoice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.invoice-item:last-child {
  border-bottom: none;
}

.invoice-info {
  flex: 1;
}

.invoice-number {
  font-weight: 600;
  color: var(--text-primary);
}

.invoice-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.invoice-amount {
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 1rem;
}

.invoice-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.invoice-status.draft {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.invoice-status.sent {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.invoice-status.paid {
  background-color: var(--success-bg);
  color: var(--success);
}

.invoice-status.overdue {
  background-color: var(--error-bg);
  color: var(--error);
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .invoice-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .invoice-amount {
    margin-right: 0;
  }
}
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    align-items: flex-start;
    width: 100%;
  }
  
  .refresh-button {
    width: 100%;
    justify-content: center;
  }
  
  .last-updated {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
}
</style>