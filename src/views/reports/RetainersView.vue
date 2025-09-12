<template>
  <div class="retainers-view">
    <div class="container">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Zadržavanje sredstava</h1>
          <p class="page-subtitle">
            Upravljanje zadržanim sredstvima klijenata
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="showCreateModal = true" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Dodaj zadržavanje
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
            placeholder="Pretraži zadržavanja..."
            class="search-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" class="filter-select" @change="applyFilters">
            <option value="">Svi statusi</option>
            <option value="active">Aktivni</option>
            <option value="expired">Istekli</option>
            <option value="completed">Završeni</option>
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

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17Z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Aktivni zadržavanja</div>
            <div class="stat-value">{{ activeRetainers.length }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon amount">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Ukupan iznos</div>
            <div class="stat-value">{{ formatCurrency(totalActiveAmount) }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon used">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17Z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Iskorišteno</div>
            <div class="stat-value">{{ formatCurrency(totalUsedAmount) }}</div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Učitavanje...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="error-icon">
          <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
        </svg>
        <h3>Greška pri učitavanju</h3>
        <p>{{ error }}</p>
        <button @click="loadRetainers" class="btn btn-primary">
          Pokušaj ponovno
        </button>
      </div>

      <div v-else-if="retainers.length === 0 && !hasActiveFilters" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,13H13V17H11V13H7V11H11V7H13V11H17V13Z"/>
        </svg>
        <h3>Nema zadržavanja</h3>
        <p>Počnite s dodavanjem zadržanih sredstava za svoje klijente.</p>
        <button @click="showCreateModal = true" class="btn btn-primary">
          Dodaj prvo zadržavanje
        </button>
      </div>

      <div v-else-if="retainers.length === 0 && hasActiveFilters" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <h3>Nema rezultata</h3>
        <p>Nema zadržavanja koja odgovaraju vašim kriterijima pretraživanja.</p>
        <button @click="clearFilters" class="btn btn-secondary">
          Obriši filtere
        </button>
      </div>

      <div v-else class="retainers-list">
        <div 
          v-for="retainer in retainers" 
          :key="retainer.id" 
          class="retainer-card"
          :class="{ 
            'status-active': retainer.status === 'active',
            'status-expired': retainer.status === 'expired',
            'status-completed': retainer.status === 'completed'
          }"
        >
          
          <div class="card-header">
            <div class="card-title">
              <h3>{{ retainer.name }}</h3>
              <span class="status-badge" :class="`status-${retainer.status}`">
                {{ getStatusText(retainer.status) }}
              </span>
            </div>
            <div class="card-actions">
              <button @click="showLogHoursModal(retainer)" class="btn btn-sm btn-secondary" :disabled="retainer.status !== 'active'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                </svg>
                Evidentiraj sate
              </button>
              <button @click="openEditModal(retainer)" class="btn btn-sm btn-outline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                </svg>
                Uredi
              </button>
              <button @click="confirmDelete(retainer)" class="btn btn-sm btn-danger">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                </svg>
                Obriši
              </button>
            </div>
          </div>

          <div class="card-content">
            <div class="retainer-info">
              <div class="info-group">
                <label>Klijent:</label>
                <span>{{ retainer.client?.name || 'Nepoznato' }}</span>
              </div>
              <div class="info-group">
                <label>Satnica:</label>
                <span>{{ formatCurrency(retainer.hourlyRate) }}</span>
              </div>
              <div class="info-group">
                <label>Ukupno sati:</label>
                <span>{{ retainer.totalHours }}h</span>
              </div>
              <div class="info-group">
                <label>Datum početka:</label>
                <span>{{ formatDate(retainer.startDate) }}</span>
              </div>
              <div v-if="retainer.endDate" class="info-group">
                <label>Datum završetka:</label>
                <span>{{ formatDate(retainer.endDate) }}</span>
              </div>
            </div>

            <div class="usage-section">
              <div class="usage-header">
                <span class="usage-label">Iskorišteno</span>
                <span class="usage-stats">
                  {{ retainer.usedHours }}h / {{ retainer.totalHours }}h
                  ({{ formatCurrency(retainer.usedAmount) }} / {{ formatCurrency(retainer.totalAmount) }})
                </span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${(retainer.usedHours / retainer.totalHours) * 100}%` }"
                ></div>
              </div>
              <div class="remaining-info">
                Preostalo: {{ retainer.remainingHours }}h ({{ formatCurrency(retainer.remainingAmount) }})
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage <= 1"
          class="btn btn-secondary btn-sm"
        >
          Prethodna
        </button>
        
        <span class="pagination-info">
          Stranica {{ currentPage }} od {{ totalPages }}
        </span>
        
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage >= totalPages"
          class="btn btn-secondary btn-sm"
        >
          Sljedeća
        </button>
      </div>
    </div>

    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ showCreateModal ? 'Dodaj zadržavanje' : 'Uredi zadržavanje' }}</h2>
          <button @click="closeModals" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">Naziv *</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="form-input"
                placeholder="Unesite naziv zadržavanja"
              />
            </div>
            
            <div class="form-group">
              <label for="description">Opis</label>
              <textarea
                id="description"
                v-model="formData.description"
                class="form-textarea"
                rows="3"
                placeholder="Opcionalni opis zadržavanja"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="client">Klijent *</label>
                <select
                  id="client"
                  v-model="formData.clientId"
                  required
                  class="form-select"
                >
                  <option value="">Odaberite klijenta</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="hourlyRate">Satnica (€) *</label>
                <input
                  id="hourlyRate"
                  v-model.number="formData.hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="form-input"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="totalHours">Ukupno sati *</label>
                <input
                  id="totalHours"
                  v-model.number="formData.totalHours"
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  class="form-input"
                  placeholder="0"
                />
              </div>
              
              <div class="form-group">
                <label>Ukupan iznos</label>
                <div class="form-calculated">
                  {{ formatCurrency((formData.totalHours || 0) * (formData.hourlyRate || 0)) }}
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Datum početka *</label>
                <input
                  id="startDate"
                  v-model="formData.startDate"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="endDate">Datum završetka</label>
                <input
                  id="endDate"
                  v-model="formData.endDate"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeModals" class="btn btn-secondary">
                Odustani
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                {{ showCreateModal ? 'Dodaj' : 'Spremi' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showLogModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <div class="modal-header">
          <h2>Evidentiraj sate</h2>
          <button @click="closeModals" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="submitLogHours">
            <div class="form-group">
              <label for="logDescription">Opis rada *</label>
              <textarea
                id="logDescription"
                v-model="logHoursData.description"
                required
                class="form-textarea"
                rows="3"
                placeholder="Opišite obavljeni rad..."
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="logHours">Broj sati *</label>
                <input
                  id="logHours"
                  v-model.number="logHoursData.hours"
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  class="form-input"
                  :max="selectedRetainer?.remainingHours"
                  placeholder="0.0"
                />
              </div>
              
              <div class="form-group">
                <label for="logDate">Datum *</label>
                <input
                  id="logDate"
                  v-model="logHoursData.date"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
            </div>
            
            <div v-if="selectedRetainer" class="log-summary">
              <p><strong>Zadržavanje:</strong> {{ selectedRetainer.name }}</p>
              <p><strong>Preostalo sati:</strong> {{ selectedRetainer.remainingHours }}h</p>
              <p><strong>Iznos po satu:</strong> {{ formatCurrency(selectedRetainer.hourlyRate) }}</p>
              <p v-if="logHoursData.hours"><strong>Iznos rada:</strong> {{ formatCurrency(logHoursData.hours * selectedRetainer.hourlyRate) }}</p>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeModals" class="btn btn-secondary">
                Odustani
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                Evidentiraj
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRetainersStore } from '../../stores/retainers'
import { useClientsStore } from '../../stores/clients'
import type { Retainer, Client } from '../../types'
import type { CreateRetainerData, UpdateRetainerData, LogHoursData } from '../../services/retainerService'

const retainersStore = useRetainersStore()
const clientsStore = useClientsStore()

const searchQuery = ref('')
const statusFilter = ref('')
const clientFilter = ref('')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showLogModal = ref(false)
const selectedRetainer = ref<Retainer | null>(null)

const formData = ref<CreateRetainerData>({
  name: '',
  description: '',
  totalHours: 0,
  hourlyRate: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  clientId: ''
})

const logHoursData = ref<LogHoursData>({
  description: '',
  hours: 0,
  date: new Date().toISOString().split('T')[0]
})

const retainers = computed(() => retainersStore.retainers)
const isLoading = computed(() => retainersStore.isLoading)
const error = computed(() => retainersStore.error)
const activeRetainers = computed(() => retainersStore.activeRetainers)
const totalActiveAmount = computed(() => retainersStore.totalActiveAmount)
const totalUsedAmount = computed(() => retainersStore.totalUsedAmount)
const clients = computed(() => clientsStore.activeClients)

const currentPage = computed(() => retainersStore.pagination.page)
const totalPages = computed(() => retainersStore.pagination.totalPages)

const hasActiveFilters = computed(() => 
  !!searchQuery.value || !!statusFilter.value || !!clientFilter.value
)

async function loadRetainers() {
  try {
    await retainersStore.fetchRetainers()
  } catch (error) {
    console.error('Error loading retainers:', error)
  }
}

async function loadClients() {
  try {
    if (clientsStore.clients.length === 0) {
      await clientsStore.fetchClients()
    }
  } catch (error) {
    console.error('Error loading clients:', error)
  }
}

let searchTimeout: ReturnType<typeof setTimeout>

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

async function applyFilters() {
  const filters: any = {
    page: 1 // Reset to first page when filtering
  }
  
  if (searchQuery.value) filters.search = searchQuery.value
  if (statusFilter.value) filters.status = statusFilter.value
  if (clientFilter.value) filters.clientId = clientFilter.value
  
  await retainersStore.fetchRetainers(filters)
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  clientFilter.value = ''
  retainersStore.clearFilters()
  loadRetainers()
}

async function goToPage(page: number) {
  await retainersStore.fetchRetainers({ page })
}

function resetFormData() {
  formData.value = {
    name: '',
    description: '',
    totalHours: 0,
    hourlyRate: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    clientId: ''
  }
}

function openEditModal(retainer: Retainer) {
  selectedRetainer.value = retainer
  formData.value = {
    name: retainer.name,
    description: retainer.description || '',
    totalHours: retainer.totalHours,
    hourlyRate: retainer.hourlyRate,
    startDate: retainer.startDate.split('T')[0],
    endDate: retainer.endDate ? retainer.endDate.split('T')[0] : '',
    clientId: retainer.clientId
  }
  showEditModal.value = true
}

function showLogHoursModal(retainer: Retainer) {
  selectedRetainer.value = retainer
  logHoursData.value = {
    description: '',
    hours: 0,
    date: new Date().toISOString().split('T')[0]
  }
  showLogModal.value = true
}

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  showLogModal.value = false
  selectedRetainer.value = null
  resetFormData()
  retainersStore.clearError()
}

async function submitForm() {
  try {
    if (showCreateModal.value) {
      await retainersStore.createRetainer(formData.value)
    } else if (selectedRetainer.value) {
      const updateData: UpdateRetainerData = {
        name: formData.value.name,
        description: formData.value.description,
        totalHours: formData.value.totalHours,
        hourlyRate: formData.value.hourlyRate,
        startDate: formData.value.startDate,
        endDate: formData.value.endDate || undefined
      }
      await retainersStore.updateRetainer(selectedRetainer.value.id, updateData)
    }
    closeModals()
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}

async function submitLogHours() {
  if (!selectedRetainer.value) return
  
  try {
    await retainersStore.logHours(selectedRetainer.value.id, logHoursData.value)
    closeModals()
  } catch (error) {
    console.error('Error logging hours:', error)
  }
}

function confirmDelete(retainer: Retainer) {
  if (confirm(`Jeste li sigurni da želite obrisati zadržavanje "${retainer.name}"?`)) {
    deleteRetainer(retainer.id)
  }
}

async function deleteRetainer(id: string) {
  try {
    await retainersStore.deleteRetainer(id)
  } catch (error) {
    console.error('Error deleting retainer:', error)
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  })
}

function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    active: 'Aktivno',
    expired: 'Isteklo',
    completed: 'Završeno'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadRetainers()
  loadClients()
})
</script>

<style scoped>
.retainers-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-alpha);
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 120px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.stat-icon.active {
  background: var(--success-color-light);
  color: var(--success-color);
}

.stat-icon.amount {
  background: var(--primary-color-light);
  color: var(--primary-color);
}

.stat-icon.used {
  background: var(--warning-color-light);
  color: var(--warning-color);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  color: var(--danger-color);
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
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
  margin-bottom: 1.5rem;
}

.retainers-list {
  display: grid;
  gap: 1.5rem;
}

.retainer-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.2s ease;
}

.retainer-card:hover {
  border-color: var(--primary-color-light);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.retainer-card.status-active {
  border-left: 4px solid var(--success-color);
}

.retainer-card.status-expired {
  border-left: 4px solid var(--danger-color);
}

.retainer-card.status-completed {
  border-left: 4px solid var(--text-muted);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-active {
  background: var(--success-color-light);
  color: var(--success-color);
}

.status-badge.status-expired {
  background: var(--danger-color-light);
  color: var(--danger-color);
}

.status-badge.status-completed {
  background: var(--text-muted-light);
  color: var(--text-muted);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-content {
  padding: 1.5rem;
}

.retainer-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-group span {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.usage-section {
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  padding: 1rem;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.usage-label {
  font-weight: 600;
  color: var(--text-primary);
}

.usage-stats {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.progress-bar {
  height: 0.5rem;
  background: var(--border-color);
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success-color), var(--primary-color));
  border-radius: 0.25rem;
  transition: width 0.3s ease;
}

.remaining-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: right;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  margin: 2rem;
  max-height: calc(100vh - 4rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-alpha);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-calculated {
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;
}

.log-summary {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.log-summary p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-color-hover);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--danger-color-dark);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .retainers-view {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    justify-content: stretch;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .card-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .retainer-info {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>