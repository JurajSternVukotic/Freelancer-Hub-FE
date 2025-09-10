<template>
  <div class="project-form">
    <div class="form-header">
      <h1>{{ isEditing ? 'Uredi Projekt' : 'Novi Projekt' }}</h1>
      <router-link to="/projects" class="btn btn-secondary">
        Povratak na projekte
      </router-link>
    </div>
    
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-row">
        <div class="form-group">
          <label for="name">Naziv projekta *</label>
          <input 
            id="name"
            v-model="form.name" 
            type="text" 
            required 
            class="form-input"
            placeholder="Unesite naziv projekta"
          >
        </div>
        
        <div class="form-group">
          <label for="clientId">Klijent *</label>
          <select 
            id="clientId"
            v-model="form.clientId" 
            required 
            class="form-input"
            :disabled="isLoadingClients"
          >
            <option value="">{{ isLoadingClients ? 'Učitavanje...' : 'Odaberi klijenta' }}</option>
            <option 
              v-for="client in clients" 
              :key="client.id" 
              :value="client.id"
            >
              {{ client.contactPerson }} ({{ client.company }})
            </option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="description">Opis projekta</label>
        <textarea 
          id="description"
          v-model="form.description" 
          class="form-textarea"
          rows="4"
          placeholder="Unesite opis projekta"
        ></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="form.status" class="form-input">
            <option value="PLANNING">Planiranje</option>
            <option value="ACTIVE">Aktivno</option>
            <option value="ON_HOLD">Na čekanju</option>
            <option value="COMPLETED">Završeno</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="priority">Prioritet</label>
          <select id="priority" v-model="form.priority" class="form-input">
            <option value="LOW">Niska</option>
            <option value="MEDIUM">Srednja</option>
            <option value="HIGH">Visoka</option>
            <option value="URGENT">Hitna</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="budget">Budget (€)</label>
          <input 
            id="budget"
            v-model.number="form.budget" 
            type="number" 
            min="0"
            step="0.01"
            class="form-input"
            placeholder="0.00"
          >
        </div>
        
        <div class="form-group">
          <label for="estimatedHours">Procjenjeni sati</label>
          <input 
            id="estimatedHours"
            v-model.number="form.estimatedHours" 
            type="number" 
            min="0"
            step="0.5"
            class="form-input"
            placeholder="0"
          >
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="startDate">Početni datum</label>
          <input 
            id="startDate"
            v-model="form.startDate" 
            type="date" 
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label for="endDate">Završni datum</label>
          <input 
            id="endDate"
            v-model="form.endDate" 
            type="date" 
            class="form-input"
          >
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="handleCancel" class="btn btn-secondary">
          Otkaži
        </button>
        <button type="submit" :disabled="isSubmitting" class="btn btn-primary">
          {{ isSubmitting ? 'Spremanje...' : (isEditing ? 'Ažuriraj projekt' : 'Stvori projekt') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectsStore } from '../../stores/projects';
import { useClientsStore } from '../../stores/clients';
import type { Project } from '../../types';

const router = useRouter();
const route = useRoute();
const projectsStore = useProjectsStore();
const clientsStore = useClientsStore();

const form = ref({
  name: '',
  description: '',
  status: 'PLANNING' as Project['status'],
  priority: 'MEDIUM' as Project['priority'],
  startDate: '',
  endDate: '',
  budget: 0,
  estimatedHours: 0,
  clientId: ''
});

const isSubmitting = ref(false);
const isEditing = computed(() => !!route.params.id);
const projectId = computed(() => route.params.id as string);

const clients = computed(() => clientsStore.activeClients);
const isLoadingClients = computed(() => clientsStore.isLoading);

const loadProject = async () => {
  if (!isEditing.value) return;
  
  try {
    await projectsStore.fetchProject(projectId.value);
    const project = projectsStore.currentProject;
    
    console.log('Project loaded for editing:', project);
    
    if (project) {

      form.value = {
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'PLANNING',
        priority: project.priority || 'MEDIUM',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        budget: project.budget || 0,
        estimatedHours: project.estimatedHours || 0,
        clientId: project.clientId || ''
      };
    } else {
      throw new Error('Project not found');
    }
  } catch (error) {
    console.error('Error loading project:', error);
    router.push('/projects');
  }
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  try {
    const projectData = {
      ...form.value,
      startDate: form.value.startDate || undefined,
      endDate: form.value.endDate || undefined,
      budget: form.value.budget || undefined,
      estimatedHours: form.value.estimatedHours || undefined
    };
    
    if (isEditing.value) {
      await projectsStore.updateProject(projectId.value, projectData);
    } else {
      await projectsStore.createProject(projectData);
    }
    
    router.push('/projects');
  } catch (error) {
    console.error('Error saving project:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push('/projects');
};

onMounted(async () => {

  if (clients.value.length === 0) {
    await clientsStore.fetchClients({ status: 'ACTIVE' });
  }

  if (isEditing.value) {
    await loadProject();
  }
});
</script>

<style scoped>
.project-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.form-header h1 {
  margin: 0;
  color: var(--text-primary);
}

.form {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 30px;
  border: 1px solid var(--border-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.form-input:disabled {
  background: var(--bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 120px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
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

.form-input:invalid {
  border-color: #ef4444;
}

.form-input:invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
</style>