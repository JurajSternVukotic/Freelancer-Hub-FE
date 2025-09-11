<template>
  <div class="timesheet-view">
    <div class="container">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Evidencija rada</h1>
          <p class="page-subtitle">
            Pregled i upravljanje evidencijom radnog vremena
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="exportTimesheet" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Izvoz
          </button>
          <router-link to="/time" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Novo praćenje vremena
          </router-link>
        </div>
      </div>

      <div class="filters-bar">
        <div class="date-range">
          <input
            v-model="startDate"
            type="date"
            class="date-input"
            @change="applyFilters"
          />
          <span class="date-separator">-</span>
          <input
            v-model="endDate"
            type="date"
            class="date-input"
            @change="applyFilters"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="projectFilter" class="filter-select" @change="applyFilters">
            <option value="">Svi projekti</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
          
          <select v-model="statusFilter" class="filter-select" @change="applyFilters">
            <option value="">Svi statusi</option>
            <option value="active">Aktivno</option>
            <option value="paused">Pauzirano</option>
            <option value="completed">Završeno</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-secondary btn-sm" :disabled="!hasActiveFilters">
            Obriši filtere
          </button>
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-value">{{ formatDuration(totalHours) }}</div>
          <div class="summary-label">Ukupno sati</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">{{ formatCurrency(totalEarnings) }}</div>
          <div class="summary-label">Ukupna zarada</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">{{ averageHoursPerDay }}</div>
          <div class="summary-label">Prosjek po danu</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">{{ billablePercentage }}%</div>
          <div class="summary-label">Naplativo</div>
        </div>
      </div>

      <div class="content-card">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p>Učitavanje evidencije rada...</p>
        </div>
        
        <div v-else-if="timeEntries.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
          </svg>
          <h3>Nema evidencije rada</h3>
          <p v-if="hasActiveFilters">Nema unosa vremena koji odgovaraju vašim filterima.</p>
          <p v-else>Počnite s praćenjem vremena za svoje projekte.</p>
          <router-link to="/time" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Počni praćenje vremena
          </router-link>
        </div>
        
        <div v-else>
          
          <div v-for="(entries, date) in groupedEntries" :key="date" class="date-group">
            <div class="date-header">
              <h3 class="date-title">{{ formatDateTitle(date) }}</h3>
              <div class="date-summary">
                {{ formatDuration(getDayTotal(entries)) }} sati
              </div>
            </div>
            
            <div class="entries-list">
              <div
                v-for="entry in entries"
                :key="entry.id"
                class="entry-row"
                @click="editEntry(entry.id)"
              >
                <div class="entry-time">
                  <span class="start-time">{{ formatTime(entry.startTime) }}</span>
                  <span class="time-separator">-</span>
                  <span class="end-time">
                    {{ entry.endTime ? formatTime(entry.endTime) : 'Aktivno' }}
                  </span>
                </div>
                
                <div class="entry-project">
                  <div class="project-name">{{ entry.project?.name || 'Bez projekta' }}</div>
                  <div v-if="entry.task" class="task-name">{{ entry.task.title }}</div>
                </div>
                
                <div class="entry-description">
                  {{ entry.description || 'Bez opisa' }}
                </div>
                
                <div class="entry-duration">
                  {{ formatDuration(entry.duration) }}
                </div>
                
                <div class="entry-rate" v-if="entry.billable">
                  {{ formatCurrency(entry.amount) }}
                </div>
                
                <div class="entry-status">
                  <span :class="['status-badge', `status-${entry.status}`]">
                    {{ getStatusText(entry.status) }}
                  </span>
                </div>
                
                <div class="entry-actions" @click.stop>
                  <button
                    @click="editEntry(entry.id)"
                    class="btn btn-sm btn-secondary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  
                  <button
                    @click="deleteEntry(entry.id)"
                    class="btn btn-sm btn-danger"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                    </svg>
                  </button>
                </div>
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
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

const isLoading = ref(false)
const timeEntries = ref([])
const projects = ref([])
const pagination = ref({
  page: 1,
  totalPages: 1,
  total: 0
})

const startDate = ref('')
const endDate = ref('')
const projectFilter = ref('')
const statusFilter = ref('')

const hasActiveFilters = computed(() => {
  return startDate.value || endDate.value || projectFilter.value || statusFilter.value
})

const groupedEntries = computed(() => {

  const groups: Record<string, any[]> = {}
  timeEntries.value.forEach(entry => {
    const date = format(parseISO(entry.startTime), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
  })
  return groups
})

const totalHours = computed(() => {
  return timeEntries.value.reduce((total, entry) => total + (entry.duration || 0), 0)
})

const totalEarnings = computed(() => {
  return timeEntries.value.reduce((total, entry) => total + (entry.amount || 0), 0)
})

const averageHoursPerDay = computed(() => {
  const days = Object.keys(groupedEntries.value).length
  return days > 0 ? Math.round((totalHours.value / days) * 100) / 100 : 0
})

const billablePercentage = computed(() => {
  const billableHours = timeEntries.value
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + (entry.duration || 0), 0)
  return totalHours.value > 0 ? Math.round((billableHours / totalHours.value) * 100) : 0
})

function formatDuration(hours: number): string {
  if (!hours || hours === 0) return '0h'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h > 0 && m > 0) {
    return `${h}h ${m}m`
  } else if (h > 0) {
    return `${h}h`
  } else {
    return `${m}m`
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

function formatTime(dateTime: string): string {
  return format(parseISO(dateTime), 'HH:mm')
}

function formatDateTitle(date: string): string {
  return format(parseISO(date), 'dd. MMMM yyyy', { locale: hr })
}

function getDayTotal(entries: any[]): number {
  return entries.reduce((total, entry) => total + (entry.duration || 0), 0)
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Aktivno',
    paused: 'Pauzirano',
    completed: 'Završeno'
  }
  return statusMap[status] || status
}

function applyFilters() {

  fetchTimeEntries()
}

function clearFilters() {
  startDate.value = ''
  endDate.value = ''
  projectFilter.value = ''
  statusFilter.value = ''
  fetchTimeEntries()
}

function exportTimesheet() {

  toast.info('Izvoz evidencije rada - u razvoju')
}

function editEntry(entryId: string) {

  toast.info('Uređivanje unosa - u razvoju')
}

function deleteEntry(entryId: string) {

  toast.info('Brisanje unosa - u razvoju')
}

function goToPage(page: number) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    fetchTimeEntries()
  }
}

function fetchTimeEntries() {
  isLoading.value = true

  setTimeout(() => {
    timeEntries.value = []
    isLoading.value = false
  }, 1000)
}

function fetchProjects() {

  projects.value = []
}

onMounted(() => {

  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6))
  
  startDate.value = format(weekStart, 'yyyy-MM-dd')
  endDate.value = format(weekEnd, 'yyyy-MM-dd')
  
  fetchProjects()
  fetchTimeEntries()
})
</script>

<style scoped>
.timesheet-view {
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

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.date-separator {
  color: var(--text-muted);
  font-weight: 500;
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.summary-label {
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

.date-group {
  border-bottom: 1px solid var(--border-color);
}

.date-group:last-child {
  border-bottom: none;
}

.date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.date-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.date-summary {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.entries-list {
  padding: 0;
}

.entry-row {
  display: grid;
  grid-template-columns: 1fr 2fr 3fr 1fr 1fr 1fr auto;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s ease;
  gap: 1rem;
}

.entry-row:hover {
  background: var(--bg-secondary);
}

.entry-row:last-child {
  border-bottom: none;
}

.entry-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
}

.time-separator {
  color: var(--text-muted);
}

.entry-project .project-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.entry-project .task-name {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.entry-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.entry-duration {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.entry-rate {
  font-weight: 600;
  color: var(--success-color);
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

.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-paused {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.status-completed {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-muted);
}

.entry-actions {
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
  .timesheet-view {
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
  
  .filter-controls {
    justify-content: space-between;
  }
  
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .entry-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .entry-time,
  .entry-project,
  .entry-description,
  .entry-duration,
  .entry-rate,
  .entry-status {
    grid-column: 1;
  }
  
  .entry-actions {
    grid-column: 1;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
}
</style>