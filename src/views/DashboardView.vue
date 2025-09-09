<template>
  <div class="dashboard">
    <div class="container">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Nadzorna ploča</h1>
          <p class="dashboard-subtitle">
            Dobrodošli natrag, {{ user?.firstName }}! 
            Evo pregleda vašeg poslovanja.
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="refreshData" class="btn btn-secondary" :disabled="isLoading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :class="{ 'animate-spin': isLoading }">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Osvježi
          </button>
          
          <router-link to="/clients/new" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Dodaj klijenta
          </router-link>
        </div>
      </div>
      
      <div v-if="error" class="error-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        {{ error }}
        <button @click="refreshData" class="btn btn-sm btn-secondary">
          Pokuśaj ponovno
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon stat-icon-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.996 2.996 0 0 0 17.06 6H16.5c-.28 0-.5.22-.5.5s.22.5.5.5h.56c.67 0 1.26.34 1.61.84L20.5 12h-2v8h2z"/>
              </svg>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalClients }}</div>
            <div class="stat-label">Ukupno klijenata</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon stat-icon-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-4h4v4zm0-6H8V7h4v4zm6 6h-4v-4h4v4zm0-6h-4V7h4v4z"/>
              </svg>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeProjects }}</div>
            <div class="stat-label">Aktivni projekti</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon stat-icon-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <div class="stat-trend stat-trend-neutral">
              <span>{{ stats.monthlyHours }}h</span>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatCurrency(stats.monthlyRevenue) }}</div>
            <div class="stat-label">Mjesečni prihod</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon stat-icon-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingInvoices }}</div>
            <div class="stat-label">Računi na čekanju</div>
          </div>
        </div>
      </div>
      
      <div class="content-grid">
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">Nedavna aktivnost</h3>
            <router-link to="/time" class="card-action">
              Prikaži sve
            </router-link>
          </div>
          
          <div class="card-body">
            <div v-if="recentActivity.length === 0" class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <p>Nema nedavne aktivnosti</p>
              <router-link to="/time" class="btn btn-sm btn-primary">
                Pokreni timer
              </router-link>
            </div>
            
            <div v-else class="activity-list">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.description }}</div>
                  <div class="activity-meta">
                    {{ activity.project }} • {{ formatDuration(activity.duration) }}
                  </div>
                </div>
                <div class="activity-time">
                  {{ formatRelativeTime(activity.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">Brze akcije</h3>
          </div>
          
          <div class="card-body">
            <div class="quick-actions">
              <router-link to="/clients/new" class="quick-action">
                <div class="quick-action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </div>
                <div class="quick-action-content">
                  <div class="quick-action-title">Novi klijent</div>
                  <div class="quick-action-subtitle">Dodaj novog klijenta</div>
                </div>
              </router-link>
              
              <router-link to="/projects/new" class="quick-action">
                <div class="quick-action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-4h4v4zm0-6H8V7h4v4zm6 6h-4v-4h4v4zm0-6h-4V7h4v4z"/>
                  </svg>
                </div>
                <div class="quick-action-content">
                  <div class="quick-action-title">Novi projekt</div>
                  <div class="quick-action-subtitle">Stvori novi projekt</div>
                </div>
              </router-link>
              
              <router-link to="/invoices/new" class="quick-action">
                <div class="quick-action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                </div>
                <div class="quick-action-content">
                  <div class="quick-action-title">Novi račun</div>
                  <div class="quick-action-subtitle">Generiraj račun</div>
                </div>
              </router-link>
              
              <router-link to="/kanban" class="quick-action">
                <div class="quick-action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                  </svg>
                </div>
                <div class="quick-action-content">
                  <div class="quick-action-title">Kanban ploča</div>
                  <div class="quick-action-subtitle">Upravljaj zadacima</div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { formatDistanceToNow } from 'date-fns'
import { hr } from 'date-fns/locale'
import dashboardService, { type DashboardStats, type RecentActivity } from '../services/dashboardService'

const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref<string | null>(null)

const stats = ref<DashboardStats>({
  totalClients: 0,
  activeProjects: 0,
  monthlyRevenue: 0,
  monthlyHours: 0,
  pendingInvoices: 0
})

const recentActivity = ref<RecentActivity[]>([])

const user = computed(() => authStore.user)

function formatCurrency(amount: number): string {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR'
  }).format(validAmount)
}

function formatDuration(minutes: number): string {
  if (!minutes || minutes === 0) return '0h'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  } else if (hours > 0) {
    return `${hours}h`
  }
  return `${mins}m`
}

function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { 
    addSuffix: true, 
    locale: hr 
  })
}

async function refreshData() {
  isLoading.value = true
  error.value = null
  
  try {
    // Fetch dashboard stats and recent activity in parallel
    const [dashboardStats, activity] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getRecentActivity(5)
    ])
    
    stats.value = dashboardStats
    recentActivity.value = activity
  } catch (err) {
    console.error('Error loading dashboard data:', err)
    error.value = 'Greška pri učitavanju podataka. Molimo pokušajte ponovno.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  min-height: 100%;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
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
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--danger-color);
  font-size: 0.875rem;
}

.error-banner svg {
  flex-shrink: 0;
}

.error-banner button {
  margin-left: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-primary { background: rgba(79, 70, 229, 0.1); color: var(--primary-color); }
.stat-icon-success { background: rgba(16, 185, 129, 0.1); color: var(--success-color); }
.stat-icon-warning { background: rgba(245, 158, 11, 0.1); color: var(--warning-color); }
.stat-icon-info { background: rgba(59, 130, 246, 0.1); color: var(--info-color); }

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.stat-trend-up { color: var(--success-color); background: rgba(16, 185, 129, 0.1); }
.stat-trend-down { color: var(--danger-color); background: rgba(239, 68, 68, 0.1); }
.stat-trend-neutral { color: var(--text-muted); background: var(--bg-secondary); }

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.content-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-action {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.card-action:hover {
  color: var(--primary-dark);
}

.card-body {
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.activity-list {
  space-y: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background: var(--bg-secondary);
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.activity-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.quick-actions {
  space-y: 0.5rem;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.quick-action:hover {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.quick-action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-action-content {
  flex: 1;
}

.quick-action-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.quick-action-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
}</style>