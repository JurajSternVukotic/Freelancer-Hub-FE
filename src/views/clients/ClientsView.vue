<template>
  <div class="clients-view">
    <div class="container">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Klijenti</h1>
          <p class="page-subtitle">
            Upravljajte svojim klijentima i njihovim podacima
          </p>
        </div>
        
        <div class="header-actions">
          <router-link to="/clients/new" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Dodaj klijenta
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
            placeholder="Pretraži klijente..."
            class="search-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" class="filter-select" @change="applyFilters">
            <option value="">Svi statusi</option>
            <option value="active">Aktivni</option>
            <option value="inactive">Neaktivni</option>
            <option value="archived">Arhivirani</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-secondary btn-sm" :disabled="!hasActiveFilters">
            Obriši filtere
          </button>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ totalClients }}</div>
          <div class="stat-label">Ukupno klijenata</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeClients.length }}</div>
          <div class="stat-label">Aktivni klijenti</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ archivedClients.length }}</div>
          <div class="stat-label">Arhivirani</div>
        </div>
      </div>

      <div class="content-card">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p>Učitavanje klijenata...</p>
        </div>
        
        <div v-else-if="clients.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.996 2.996 0 0 0 17.06 6H16.5c-.28 0-.5.22-.5.5s.22.5.5.5h.56c.67 0 1.26.34 1.61.84L20.5 12h-2v8h2z"/>
          </svg>
          <h3>Nema klijenata</h3>
          <p v-if="hasActiveFilters">Nema klijenata koji odgovaraju vašim filterima.</p>
          <p v-else>Dodajte svojeg prvog klijenta za početak.</p>
          <router-link to="/clients/new" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Dodaj klijenta
          </router-link>
        </div>
        
        <div v-else>
          
          <div class="clients-table desktop-view">
            <div class="table-header">
              <div class="table-cell">Klijent</div>
              <div class="table-cell">Kontakt</div>
              <div class="table-cell">Tvrtka</div>
              <div class="table-cell">Status</div>
              <div class="table-cell">Akcije</div>
            </div>
            
            <div
              v-for="client in clients"
              :key="client.id"
              class="table-row"
              @click="viewClient(client.id)"
            >
              <div class="table-cell">
                <div class="client-info">
                  <div class="client-avatar">
                    {{ getClientInitials(client) }}
                  </div>
                  <div>
                    <div class="client-name">{{ client.contactPerson }}</div>
                    <div class="client-meta">{{ formatDate(client.createdAt) }}</div>
                  </div>
                </div>
              </div>
              
              <div class="table-cell">
                <div class="contact-info">
                  <div class="contact-email">{{ client.email }}</div>
                  <div v-if="client.phone" class="contact-phone">{{ client.phone }}</div>
                </div>
              </div>
              
              <div class="table-cell">
                <div class="company-info">{{ client.company || '-' }}</div>
              </div>
              
              <div class="table-cell">
                <span :class="['status-badge', `status-${client.status}`]">
                  {{ getStatusText(client.status) }}
                </span>
              </div>
              
              <div class="table-cell">
                <div class="action-buttons" @click.stop>
                  <router-link :to="`/clients/${client.id}/edit`" class="btn btn-sm btn-secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Uredi
                  </router-link>
                  
                  <button
                    @click="handleArchiveClient(client)"
                    class="btn btn-sm btn-secondary"
                    :class="{ 'btn-warning': client.status === 'archived' }"
                  >
                    <svg v-if="client.status === 'archived'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                    </svg>
                    {{ client.status === 'archived' ? 'Vrati' : 'Arhiviraj' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="clients-cards mobile-view">
            <div
              v-for="client in clients"
              :key="client.id"
              class="client-card"
              @click="viewClient(client.id)"
            >
              <div class="client-card-header">
                <div class="client-avatar">
                  {{ getClientInitials(client) }}
                </div>
                <div class="client-info">
                  <h3 class="client-name">{{ client.contactPerson }}</h3>
                  <p class="client-company">{{ client.company || 'Nema tvrtke' }}</p>
                </div>
                <span :class="['status-badge', `status-${client.status}`]">
                  {{ getStatusText(client.status) }}
                </span>
              </div>
              
              <div class="client-card-body">
                <div class="client-contact">
                  <div class="contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    {{ client.email }}
                  </div>
                  <div v-if="client.phone" class="contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    {{ client.phone }}
                  </div>
                </div>
                
                <div class="client-meta">
                  Dodan {{ formatDate(client.createdAt) }}
                </div>
              </div>
              
              <div class="client-card-actions" @click.stop>
                <router-link :to="`/clients/${client.id}/edit`" class="btn btn-sm btn-secondary">
                  Uredi
                </router-link>
                <button
                  @click="handleArchiveClient(client)"
                  class="btn btn-sm btn-secondary"
                  :class="{ 'btn-warning': client.status === 'archived' }"
                >
                  {{ client.status === 'archived' ? 'Vrati' : 'Arhiviraj' }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClientsStore } from '../../stores/clients'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useToast } from 'vue-toastification'

const router = useRouter()
const clientsStore = useClientsStore()
const toast = useToast()

const searchQuery = ref('')
const statusFilter = ref('')
const searchTimeout = ref<NodeJS.Timeout>()

const clients = computed(() => clientsStore.clients)
const activeClients = computed(() => 
  clients.value.filter(client => client.status === 'active')
)
const archivedClients = computed(() => 
  clients.value.filter(client => client.status === 'archived')
)
const totalClients = computed(() => clientsStore.totalClients)
const pagination = computed(() => clientsStore.pagination)
const isLoading = computed(() => clientsStore.isLoading)

const hasActiveFilters = computed(() => {
  return searchQuery.value || statusFilter.value
})

function getClientInitials(client: any): string {
  if (!client || !client.contactPerson) {
    return '??'
  }
  
  return client.contactPerson
    .split(' ')
    .map((word: string) => word[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Aktivan',
    inactive: 'Neaktivan', 
    archived: 'Arhiviran'
  }
  return statusMap[status] || status
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd.MM.yyyy', { locale: hr })
}

function viewClient(clientId: string) {
  router.push(`/clients/${clientId}`)
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
  clientsStore.fetchClients({
    search: searchQuery.value || undefined,
    status: statusFilter.value as any || undefined,
    page: 1
  })
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  clientsStore.clearFilters()
  clientsStore.fetchClients()
}

function goToPage(page: number) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    clientsStore.fetchClients({ page })
  }
}

async function handleArchiveClient(client: any) {
  try {
    if (client.status === 'archived') {
      await clientsStore.restoreClient(client.id)
    } else {
      await clientsStore.archiveClient(client.id)
    }
  } catch (error) {
    console.error('Error handling client archive:', error)
  }
}

onMounted(async () => {
  await clientsStore.fetchClients()
  console.log('Clients loaded:', clients.value.length)
  console.log('Total clients:', totalClients.value)
  console.log('Pagination:', pagination.value)
})

watch(statusFilter, () => {
  if (statusFilter.value === '') {
    applyFilters()
  }
})
</script>

<style scoped>
.clients-view {
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
  font-size: 2rem;
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 1rem;
}

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

.clients-table {
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

.client-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.client-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.client-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-email {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.contact-phone {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.company-info {
  font-size: 0.875rem;
  color: var(--text-primary);
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

.status-inactive {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-muted);
}

.status-archived {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.clients-cards {
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.client-card {
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.client-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.client-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.client-card-header .client-info {
  flex: 1;
  min-width: 0;
}

.client-card-header .client-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.client-company {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.client-card-body {
  margin-bottom: 1rem;
}

.client-contact {
  margin-bottom: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.client-card-actions {
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
  .clients-view {
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
  
  .header-actions .btn {
    flex: 1;
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
    grid-template-columns: 1fr;
  }
  
  .desktop-view {
    display: none;
  }
  
  .mobile-view {
    display: flex;
  }
  
  .clients-cards {
    display: flex;
  }
  
  .client-card-actions .btn {
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