<template>
  <div class="projects-view">
    <div class="page-header">
      <h1>Projekti</h1>
      <router-link to="/projects/new" class="btn btn-primary">
        + Novi projekt
      </router-link>
    </div>

    <div class="tabs-section">
      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'projects' }"
          @click="activeTab = 'projects'"
          class="tab-btn"
        >
          Moji projekti
          <span v-if="projects.length > 0" class="tab-badge">{{ projects.length }}</span>
        </button>
        <button 
          :class="{ active: activeTab === 'requests' }"
          @click="activeTab = 'requests'; loadProjectRequests()"
          class="tab-btn"
        >
          Zahtjevi klijenata
          <span v-if="projectRequests.length > 0" class="tab-badge">{{ projectRequests.length }}</span>
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'projects'" class="tab-content">
      <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pretraži projekte..."
            class="search-input"
            @input="handleSearch"
          />
        </div>
        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select" @change="handleFilterChange">
            <option value="">Svi statusi</option>
            <option value="planning">Planiranje</option>
            <option value="active">Aktivno</option>
            <option value="on_hold">Na čekanju</option>
            <option value="completed">Završeno</option>
            <option value="cancelled">Otkazano</option>
          </select>
        </div>
        <div class="filter-group">
          <select v-model="priorityFilter" class="filter-select" @change="handleFilterChange">
            <option value="">Svi prioriteti</option>
            <option value="low">Niska</option>
            <option value="medium">Srednja</option>
            <option value="high">Visoka</option>
            <option value="urgent">Hitna</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      Učitavanje projekata...
    </div>

    <div v-else-if="projects.length === 0" class="empty-state">
      <p>Nema pronađenih projekata.</p>
      <router-link to="/projects/new" class="btn btn-primary">
        Stvori prvi projekt
      </router-link>
    </div>

    <div v-else class="projects-grid">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <router-link :to="`/projects/${project.id}`">
          <h3>{{ project.name }}</h3>
          <p class="client">{{ project.client?.name || project.client?.company }}</p>
          <p v-if="project.description" class="description">{{ project.description }}</p>
          <div class="project-meta">
            <span :class="`status status-${project.status}`">
              {{ getStatusLabel(project.status) }}
            </span>
            <span :class="`priority priority-${project.priority}`">
              {{ getPriorityLabel(project.priority) }}
            </span>
          </div>
          <div class="project-footer">
            <span v-if="project.budget" class="budget">€{{ project.budget?.toLocaleString('hr-HR') }}</span>
            <span v-if="project.startDate" class="dates">{{ formatDate(project.startDate) }}</span>
          </div>
        </router-link>
      </div>
    </div>

      <div v-if="pagination.totalPages > 1" class="pagination">
        <button 
          v-for="page in pagination.totalPages" 
          :key="page"
          :class="{ active: page === pagination.page }"
          @click="changePage(page)"
          class="page-btn"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'requests'" class="tab-content">
      <div class="requests-header">
        <h2>Zahtjevi klijenata</h2>
        <p class="requests-subtitle">Pregledaj i prihvati zahtjeve klijenata za nove projekte</p>
      </div>

      <div v-if="requestsLoading" class="loading">
        Učitavanje zahtjeva...
      </div>

      <div v-else-if="projectRequests.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          <path d="M16 11H8"/>
          <path d="M16 15H8"/>
          <path d="M12 7v2"/>
        </svg>
        <h3>Nema novih zahtjeva</h3>
        <p>Trenutno nema dostupnih zahtjeva klijenata za nove projekte.</p>
      </div>

      <div v-else class="requests-list">
        <div v-for="request in projectRequests" :key="request.id" class="request-card">
          <div class="request-header">
            <div class="request-info">
              <h3 class="request-title">{{ request.title }}</h3>
              <div class="client-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                {{ request.client?.company }} - {{ request.client?.contactPerson }}
              </div>
            </div>
            <div class="request-badges">
              <span class="priority-badge" :class="request.priority?.toLowerCase()">
                {{ getPriorityLabel(request.priority) }}
              </span>
              <span class="status-badge" :class="request.status?.toLowerCase()">
                {{ getRequestStatusLabel(request.status) }}
              </span>
            </div>
          </div>

          <div class="request-description" v-html="renderMarkdown(request.description)"></div>

          <div v-if="request.deadline" class="request-deadline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
            </svg>
            <span>Rok: {{ formatDate(request.deadline) }}</span>
          </div>

          <div v-if="request.budgetRange" class="request-budget">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
            <span>Proračun: {{ request.budgetRange }}</span>
          </div>

          <div v-if="request.assignedFreelancer" class="assigned-info">
            <div class="assigned-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Dodijeljeno: {{ request.assignedFreelancer.firstName }} {{ request.assignedFreelancer.lastName }}</span>
            </div>
            <div v-if="request.freelancerResponse" class="freelancer-response">
              <strong>Odgovor:</strong> {{ request.freelancerResponse }}
            </div>
            <div v-if="request.quotedAmount" class="quoted-amount">
              <strong>Ponuda:</strong> €{{ request.quotedAmount?.toLocaleString('hr-HR') }}
            </div>
          </div>

          <div class="request-actions">
            <button 
              v-if="!request.assignedFreelancer || request.assignedTo === currentUserId"
              @click="openAcceptModal(request)"
              :class="request.assignedTo === currentUserId ? 'secondary-button' : 'primary-button'"
              class="action-button"
            >
              {{ request.assignedTo === currentUserId ? 'Ažuriraj odgovor' : 'Prihvati zahtjev' }}
            </button>
            <button 
              v-if="request.assignedTo === currentUserId && request.status === 'ASSIGNED'"
              @click="convertToProject(request.id)"
              class="action-button success-button"
            >
              Stvori projekt
            </button>
          </div>
        </div>
      </div>
    </div>

    <ProjectRequestModal
      :show="showAcceptModal"
      :request="selectedRequest"
      @close="closeAcceptModal"
      @submit="handleAcceptRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProjectsStore } from '../../stores/projects';
import { useAuthStore } from '../../stores/auth';
import api, { apiHelper } from '../../services/api';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import ProjectRequestModal from '../../components/ProjectRequestModal.vue';
import { toastService } from '../../services/toastService';

const projectsStore = useProjectsStore();
const authStore = useAuthStore();

const activeTab = ref('projects');

const projectRequests = ref([]);
const requestsLoading = ref(false);

const showAcceptModal = ref(false);
const selectedRequest = ref(null);

const currentUserId = computed(() => authStore.user?.id);

const searchQuery = ref('');
const statusFilter = ref('');
const priorityFilter = ref('');

const projects = computed(() => projectsStore.projects);
const isLoading = computed(() => projectsStore.isLoading);
const pagination = computed(() => projectsStore.pagination);

const handleSearch = () => {
  handleFilterChange();
};

const handleFilterChange = () => {
  projectsStore.fetchProjects({
    search: searchQuery.value || undefined,
    status: statusFilter.value || undefined,
    priority: priorityFilter.value || undefined,
    page: 1 // Reset to first page when filtering
  });
};

const changePage = (page: number) => {
  projectsStore.fetchProjects({ 
    ...projectsStore.filters,
    page 
  });
};

const getStatusLabel = (status: string) => {
  const labels = {
    'planning': 'Planiranje',
    'active': 'Aktivno',
    'on_hold': 'Na čekanju',
    'completed': 'Završeno',
    'cancelled': 'Otkazano'
  };
  return labels[status] || status;
};

const getPriorityLabel = (priority: string) => {
  const labels = {
    'low': 'Niska',
    'medium': 'Srednja',
    'high': 'Visoka',
    'urgent': 'Hitna'
  };
  return labels[priority] || priority;
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: hr });
  } catch {
    return dateString;
  }
};

const loadProjectRequests = async () => {
  if (requestsLoading.value) return;
  
  requestsLoading.value = true;
  try {
    const response = await apiHelper.get('/projects/requests');
    projectRequests.value = response.requests || [];
  } catch (error) {
    console.error('Error loading project requests:', error);
    projectRequests.value = [];
  } finally {
    requestsLoading.value = false;
  }
};

const openAcceptModal = (request) => {
  selectedRequest.value = request;
  showAcceptModal.value = true;
};

const closeAcceptModal = () => {
  showAcceptModal.value = false;
  selectedRequest.value = null;
};

const handleAcceptRequest = async (formData) => {
  try {
    const response = await apiHelper.post(`/projects/requests/${formData.requestId}/accept`, {
      freelancerResponse: formData.freelancerResponse,
      quotedAmount: formData.quotedAmount,
      estimatedHours: formData.estimatedHours,
      availableImmediately: formData.availableImmediately
    });

    toastService.success({
      title: 'Uspješno poslano',
      message: 'Vaš odgovor je uspješno poslan klijentu.'
    });

    await loadProjectRequests();
    
    closeAcceptModal();
  } catch (error) {
    console.error('Error accepting project request:', error);
    toastService.error({
      title: 'Greška',
      message: 'Došlo je do greške pri slanju odgovora. Molimo pokušajte ponovno.'
    });
  }
};

const convertToProject = async (requestId) => {
  try {
    await apiHelper.post(`/projects/requests/${requestId}/convert`);

    projectsStore.fetchProjects();
    loadProjectRequests();

    activeTab.value = 'projects';
  } catch (error) {
    console.error('Error converting request to project:', error);
  }
};

const getRequestStatusLabel = (status) => {
  const statusMap = {
    'PENDING': 'Na čekanju',
    'ASSIGNED': 'Dodijeljeno', 
    'QUOTED': 'Ponuđeno',
    'ACCEPTED': 'Prihvaćeno',
    'REJECTED': 'Odbačeno',
    'COMPLETED': 'Završeno'
  };
  return statusMap[status] || status;
};

function renderMarkdown(text: string): string {
  if (!text) return ''
  
  return text

    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')

    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    .replace(/^• (.+)$/gm, '<ul><li>$1</li></ul>')
    .replace(/^\* (.+)$/gm, '<ul><li>$1</li></ul>')

    .replace(/<\/ul>\s*<ul>/g, '')

    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim()) {

        if (paragraph.includes('<h') || paragraph.includes('<ul>') || paragraph.includes('<li>')) {
          return paragraph
        }
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`
      }
      return ''
    })
    .join('')
}

onMounted(() => {
  projectsStore.fetchProjects();
});
</script>

<style scoped>
.projects-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.filters-section {
  margin-bottom: 30px;
}

.filters-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  min-width: 200px;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state .btn {
  margin-top: 20px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.project-card {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border-color);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.project-card a {
  text-decoration: none;
  color: inherit;
  display: block;
}

.project-card h3 {
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.client {
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.status,
.priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-planning {
  background: #dbeafe;
  color: #1e40af;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-on_hold {
  background: #fef3c7;
  color: #92400e;
}

.status-completed {
  background: #f3f4f6;
  color: #374151;
}

.status-cancelled {
  background: #fecaca;
  color: #991b1b;
}

.priority-low {
  background: #f0fdf4;
  color: #166534;
}

.priority-medium {
  background: #fffbeb;
  color: #92400e;
}

.priority-high {
  background: #fef2f2;
  color: #991b1b;
}

.priority-urgent {
  background: #7c2d12;
  color: white;
}

.budget {
  font-weight: 600;
  color: var(--primary-color);
}

.dates {
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  background: var(--primary-color);
  color: white;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: inline-block;
  transition: background-color 0.2s;
}

.btn:hover {
  background: var(--primary-color-dark);
}

.tabs-section {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.tabs {
  display: flex;
  gap: 0;
}

.tab-btn {
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  color: var(--primary-color);
}

.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-badge {
  background: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  min-width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-content {
  min-height: 300px;
}

.requests-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.requests-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.requests-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.request-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.request-card:hover {
  box-shadow: 0 8px 25px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
  border-color: var(--primary-color);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.request-info {
  flex: 1;
}

.request-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.client-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.client-name svg {
  color: var(--text-tertiary);
}

.request-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.priority-badge,
.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.priority-badge.low {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.priority-badge.medium {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #f59e0b;
}

.priority-badge.high {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #ef4444;
}

.priority-badge.urgent {
  background-color: #dc2626;
  color: white;
  border: 1px solid #b91c1c;
  font-weight: 600;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #f59e0b;
}

.status-badge.assigned {
  background-color: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #3b82f6;
}

.status-badge.quoted {
  background-color: #e0e7ff;
  color: #5b21b6;
  border: 1px solid #8b5cf6;
}

.status-badge.accepted {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.status-badge.completed {
  background-color: #10b981;
  color: white;
  border: 1px solid #059669;
  font-weight: 600;
}

.request-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.request-description h1,
.request-description h2,
.request-description h3 {
  color: var(--text-primary);
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
}

.request-description h1 {
  font-size: 1.25rem;
}

.request-description h2 {
  font-size: 1.125rem;
}

.request-description h3 {
  font-size: 1rem;
}

.request-description strong {
  color: var(--text-primary);
  font-weight: 600;
}

.request-description ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.request-description li {
  margin: 0.25rem 0;
  color: var(--text-secondary);
}

.request-description p {
  margin: 0.5rem 0;
}

.request-description p:first-child {
  margin-top: 0;
}

.request-description p:last-child {
  margin-bottom: 0;
}

.request-deadline,
.request-budget {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.request-deadline svg,
.request-budget svg {
  color: #6b7280;
}

.assigned-info {
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
}

.assigned-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--warning);
  margin-bottom: 0.5rem;
}

.assigned-header svg {
  color: var(--warning);
}

.freelancer-response,
.quoted-amount {
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.freelancer-response strong,
.quoted-amount strong {
  color: var(--warning);
}

.request-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.action-button {
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  text-transform: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-button {
  background: #3b82f6;
  color: white;
}

.primary-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px 0 rgba(59, 130, 246, 0.3);
}

.secondary-button {
  background: #6b7280;
  color: white;
}

.secondary-button:hover {
  background: #4b5563;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px 0 rgba(107, 114, 128, 0.3);
}

.success-button {
  background: #10b981;
  color: white;
}

.success-button:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px 0 rgba(16, 185, 129, 0.3);
}

@media (max-width: 768px) {
  .tabs {
    flex-wrap: wrap;
  }
  
  .requests-list {
    gap: 1rem;
  }
  
  .request-card {
    padding: 1rem;
  }
  
  .request-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .request-badges {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  
  .request-actions {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>