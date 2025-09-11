<template>
  <div class="time-entries-view">
    <div class="view-header">
      <div class="header-left">
        <h2>Unosi vremena</h2>
        <p class="view-description">Pregled i upravljanje unosima radnog vremena</p>
      </div>
      
      <div class="header-actions">
        <button @click="openCreateModal" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Novi unos
        </button>
      </div>
    </div>

    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>Projekt</label>
          <select v-model="filters.projectId" @change="applyFilters" class="form-select">
            <option value="">Svi projekti</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }} - {{ project.client.company }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Naplativost</label>
          <select v-model="filters.billable" @change="applyFilters" class="form-select">
            <option value="">Svi unosi</option>
            <option value="true">Naplativo</option>
            <option value="false">Nenaplativo</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Od datuma</label>
          <input 
            v-model="filters.dateFrom" 
            @change="applyFilters"
            type="date" 
            class="form-input"
          />
        </div>

        <div class="filter-group">
          <label>Do datuma</label>
          <input 
            v-model="filters.dateTo" 
            @change="applyFilters"
            type="date" 
            class="form-input"
          />
        </div>

        <div class="filter-actions">
          <button @click="clearFilters" class="btn-secondary">
            Očisti filtere
          </button>
        </div>
      </div>
    </div>

    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-header">
          <h3>Ukupno sati</h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
          </svg>
        </div>
        <div class="card-value">{{ totalHours }}h</div>
      </div>

      <div class="summary-card">
        <div class="card-header">
          <h3>Naplativo</h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
          </svg>
        </div>
        <div class="card-value">{{ billableHours }}h</div>
        <div class="card-subtitle">{{ billablePercentage }}%</div>
      </div>

      <div class="summary-card">
        <div class="card-header">
          <h3>Ovaj mjesec</h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        </div>
        <div class="card-value">{{ monthlyHours }}h</div>
      </div>
    </div>

    <div class="entries-section">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Učitavam unose...</p>
      </div>

      <div v-else-if="timeEntries.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
        </svg>
        <h3>Nema unosa vremena</h3>
        <p>{{ filters.projectId || filters.dateFrom || filters.dateTo ? 'Nema unosa koji odgovaraju filterima' : 'Dodajte prvi unos vremena' }}</p>
      </div>

      <div v-else class="entries-list">
        <div 
          v-for="entry in timeEntries" 
          :key="entry.id"
          class="entry-card"
          :class="{ 'non-billable': !entry.billable }"
        >
          <div class="entry-header">
            <div class="entry-task">
              <h4>{{ entry.task.title }}</h4>
              <div class="task-meta">
                <span class="project-name">{{ entry.task.project.name }}</span>
                <span class="client-name">{{ entry.task.project.client.company }}</span>
              </div>
            </div>
            
            <div class="entry-actions">
              <button @click="editEntry(entry)" class="btn-icon" title="Uredi">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              <button @click="deleteEntry(entry)" class="btn-icon delete-btn" title="Obriši">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="entry.description" class="entry-description">
            {{ entry.description }}
          </div>

          <div class="entry-details">
            <div class="time-info">
              <div class="time-range">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                </svg>
                {{ formatTimeRange(entry.startTime, entry.endTime) }}
              </div>
              
              <div class="duration">
                <strong>{{ formatDuration(entry.duration) }}</strong>
              </div>
            </div>

            <div class="entry-meta">
              <span class="date">{{ formatDate(entry.startTime) }}</span>
              <span 
                class="billable-badge" 
                :class="{ 'billable': entry.billable, 'non-billable': !entry.billable }"
              >
                {{ entry.billable ? 'Naplativo' : 'Nenaplativo' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pagination.pages > 1" class="pagination">
        <button 
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="page-btn"
        >
          Prethodna
        </button>
        
        <span class="page-info">
          Stranica {{ pagination.page }} od {{ pagination.pages }}
        </span>
        
        <button 
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.pages"
          class="page-btn"
        >
          Sljedeća
        </button>
      </div>
    </div>

    <TimeEntryModal
      :is-open="isModalOpen"
      :entry="editingEntry"
      :projects="projects"
      @close="closeModal"
      @submit="handleEntrySubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { format, startOfMonth, endOfMonth, parseISO, differenceInMinutes } from 'date-fns'
import { hr } from 'date-fns/locale'
import timeEntryService, { TimeEntry } from '../../services/timeEntryService'
import TimeEntryModal from '../../components/time/TimeEntryModal.vue'
import { useToast } from 'vue-toastification'

interface Project {
  id: string
  name: string
  client: {
    id: string
    company: string
  }
}

const toast = useToast()

const timeEntries = ref<TimeEntry[]>([])
const projects = ref<Project[]>([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const editingEntry = ref<TimeEntry | null>(null)

const filters = reactive({
  projectId: '',
  billable: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  limit: 20
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1
})

const totalHours = computed(() => {
  return Math.round(timeEntries.value.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60 * 100) / 100
})

const billableHours = computed(() => {
  return Math.round(timeEntries.value
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60 * 100) / 100
})

const billablePercentage = computed(() => {
  if (totalHours.value === 0) return 0
  return Math.round((billableHours.value / totalHours.value) * 100)
})

const monthlyHours = computed(() => {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  
  return Math.round(timeEntries.value
    .filter(entry => {
      const entryDate = parseISO(entry.startTime)
      return entryDate >= monthStart && entryDate <= monthEnd
    })
    .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60 * 100) / 100
})

async function loadTimeEntries() {
  isLoading.value = true
  try {
    const response = await timeEntryService.getTimeEntries({
      projectId: filters.projectId || undefined,
      billable: filters.billable ? filters.billable === 'true' : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page: filters.page,
      limit: filters.limit
    })

    timeEntries.value = response.data
    if (response.pagination) {
      Object.assign(pagination, response.pagination)
    }
  } catch (error) {
    console.error('Error loading time entries:', error)
    toast.error('Greška pri dohvaćanju unosa vremena')
  } finally {
    isLoading.value = false
  }
}

async function loadProjects() {
  try {

    projects.value = []
  } catch (error) {
    console.error('Error loading projects:', error)
  }
}

function applyFilters() {
  filters.page = 1
  loadTimeEntries()
}

function clearFilters() {
  Object.assign(filters, {
    projectId: '',
    billable: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20
  })
  loadTimeEntries()
}

function changePage(page: number) {
  filters.page = page
  loadTimeEntries()
}

function openCreateModal() {
  editingEntry.value = null
  isModalOpen.value = true
}

function editEntry(entry: TimeEntry) {
  editingEntry.value = entry
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingEntry.value = null
}

async function handleEntrySubmit() {
  await loadTimeEntries()
}

async function deleteEntry(entry: TimeEntry) {
  if (!confirm('Jeste li sigurni da želite obrisati ovaj unos vremena?')) {
    return
  }

  try {
    await timeEntryService.deleteTimeEntry(entry.id)
    await loadTimeEntries()
    toast.success('Unos vremena je uspješno obrisan')
  } catch (error) {
    console.error('Error deleting time entry:', error)
    toast.error('Greška pri brisanju unosa vremena')
  }
}

function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'dd.MM.yyyy', { locale: hr })
}

function formatTimeRange(startTime: string, endTime?: string): string {
  const start = format(parseISO(startTime), 'HH:mm')
  if (!endTime) return `${start} - u tijeku`
  const end = format(parseISO(endTime), 'HH:mm')
  return `${start} - ${end}`
}

function formatDuration(minutes?: number): string {
  if (!minutes || minutes === 0) return '0h'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}m`
  }
}

onMounted(async () => {
  await Promise.all([
    loadProjects(),
    loadTimeEntries()
  ])
})
</script>

<style scoped>
.time-entries-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.view-description {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.filters-section {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-select,
.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.btn-secondary {
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-header svg {
  color: var(--text-muted);
}

.card-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

.entries-section {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

.empty-state svg {
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.entries-list {
  divide-y divide-border-color;
}

.entry-card {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.entry-card:last-child {
  border-bottom: none;
}

.entry-card.non-billable {
  background: rgba(245, 158, 11, 0.05);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.entry-task h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.project-name {
  color: var(--primary-color);
  font-weight: 500;
}

.client-name {
  color: var(--text-muted);
}

.entry-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--text-muted);
}

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.entry-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.4;
}

.entry-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.duration {
  font-size: 14px;
  color: var(--text-primary);
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date {
  font-size: 12px;
  color: var(--text-muted);
}

.billable-badge {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 4px;
}

.billable-badge.billable {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.billable-badge.non-billable {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.page-btn {
  padding: 6px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .time-entries-view {
    padding: 16px;
  }

  .view-header {
    flex-direction: column;
    gap: 16px;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .entry-header {
    flex-direction: column;
    gap: 8px;
  }

  .entry-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .time-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>