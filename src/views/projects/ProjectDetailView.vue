<template>
  <div class="project-detail">
    <div v-if="isLoading" class="loading">
      Učitavanje projekta...
    </div>
    
    <div v-else-if="!project" class="error-state">
      <h2>Projekt nije pronađen</h2>
      <router-link to="/projects" class="btn btn-primary">
        Povratak na projekte
      </router-link>
    </div>
    
    <div v-else class="project-content">
      
      <div class="project-header">
        <div class="header-left">
          <h1>{{ project.name }}</h1>
          <div class="project-badges">
            <span :class="`status status-${project.status}`">
              {{ getStatusLabel(project.status) }}
            </span>
            <span :class="`priority priority-${project.priority}`">
              {{ getPriorityLabel(project.priority) }}
            </span>
          </div>
        </div>
        
        <div class="header-actions">
          <router-link v-if="project && project.id" :to="`/projects/${project.id}/edit`" class="btn btn-secondary">
            Uredi projekt
          </router-link>
          <button 
            v-if="project && project.id" 
            @click="deleteProject" 
            class="btn btn-danger"
          >
            Obriši projekt
          </button>
          <router-link to="/kanban" class="btn btn-primary">
            Kanban Board
          </router-link>
        </div>
      </div>

      <div class="info-cards">
        <div class="info-card">
          <h3>Klijent</h3>
          <p>{{ project.client?.contactPerson || 'N/A' }}</p>
          <p v-if="project.client?.company" class="company">{{ project.client.company }}</p>
          <p v-if="project.client?.email" class="contact">{{ project.client.email }}</p>
        </div>
        
        <div class="info-card">
          <h3>Budget & Sati</h3>
          <p v-if="project.budget" class="budget">€{{ project.budget.toLocaleString('hr-HR') }}</p>
          <p v-else class="budget">Budget nije postavljen</p>
          <div class="hours-info">
            <span v-if="project.estimatedHours">Procjenjeno: {{ project.estimatedHours }}h</span>
            <span v-if="project.actualHours">Odrađeno: {{ project.actualHours }}h</span>
          </div>
        </div>
        
        <div class="info-card">
          <h3>Datumi</h3>
          <p v-if="project.startDate">
            <strong>Početak:</strong> {{ formatDate(project.startDate) }}
          </p>
          <p v-if="project.endDate">
            <strong>Završetak:</strong> {{ formatDate(project.endDate) }}
          </p>
          <p v-if="!project.startDate && !project.endDate" class="no-dates">
            Datumi nisu postavljeni
          </p>
        </div>
      </div>

      <div v-if="project.description" class="description-section">
        <h3>Opis projekta</h3>
        <div class="description-content">
          {{ project.description }}
        </div>
      </div>

      <div v-if="project.estimatedHours && project.actualHours" class="progress-section">
        <h3>Napredak</h3>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${Math.min((project.actualHours / project.estimatedHours) * 100, 100)}%` }"
          ></div>
        </div>
        <p class="progress-text">
          {{ project.actualHours }}h od {{ project.estimatedHours }}h 
          ({{ Math.round((project.actualHours / project.estimatedHours) * 100) }}%)
        </p>
      </div>

      <div class="action-section">
        <h3>Akcije</h3>
        <div class="action-buttons">
          <router-link to="/kanban" class="btn btn-primary">
            📋 Kanban Board
          </router-link>
          <router-link v-if="project && project.id" :to="`/projects/${project.id}/expenses`" class="btn btn-secondary">
            💰 Troškovi
          </router-link>
        </div>
      </div>

      <div class="back-section">
        <router-link to="/projects" class="btn btn-outline">
          ← Povratak na projekte
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectsStore } from '../../stores/projects';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();

const projectId = computed(() => route.params.id as string);
const project = computed(() => projectsStore.currentProject);
const isLoading = computed(() => projectsStore.isLoading);

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
    'LOW': 'Niska',
    'MEDIUM': 'Srednja', 
    'HIGH': 'Visoka',
    'URGENT': 'Hitna',

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

const deleteProject = async () => {
  if (!project.value || !project.value.id) {
    console.error('No project data available');
    return;
  }
  
  if (confirm('Jeste li sigurni da želite obrisati ovaj projekt? Ova akcija se ne može poništiti.')) {
    try {
      await projectsStore.deleteProject(project.value.id);
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }
};

onMounted(async () => {
  try {
    await projectsStore.fetchProject(projectId.value);
  } catch (error) {
    console.error('Error loading project:', error);

    router.push('/projects');
  }
});
</script>

<style scoped>
.project-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading,
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state h2 {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.project-content {
  space-y: 30px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
}

.header-left h1 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-size: 2rem;
}

.project-badges {
  display: flex;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .project-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.info-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
}

.info-card h3 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.info-card p {
  margin: 8px 0;
  color: var(--text-primary);
}

.company {
  font-weight: 500;
  color: var(--text-secondary);
}

.contact {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.budget {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.hours-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.no-dates {
  color: var(--text-secondary);
  font-style: italic;
}

.description-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.description-section h3 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.description-content {
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.progress-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.progress-section h3 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
}

.action-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.action-section h3 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.back-section {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.status,
.priority {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
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

.btn {
  padding: 12px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}
</style>