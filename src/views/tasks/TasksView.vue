<template>
  <div class="tasks-view">
    <div class="page-header">
      <h1>Zadaci</h1>
      <div class="actions">
        <router-link to="/kanban" class="btn btn-secondary">
          <i class="icon-kanban"></i>
          Kanban ploča
        </router-link>
        <button @click="openTaskModal" class="btn btn-primary">
          <i class="icon-plus"></i>
          Novi zadatak
        </button>
      </div>
    </div>

    <div class="filters">
      <select v-model="filters.projectId" class="filter-select">
        <option value="">Svi projekti</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.name }}
        </option>
      </select>
      <select v-model="filters.status" class="filter-select">
        <option value="">Svi statusi</option>
        <option :value="TaskStatus.TODO">Za napraviti</option>
        <option :value="TaskStatus.IN_PROGRESS">U tijeku</option>
        <option :value="TaskStatus.REVIEW">Pregled</option>
        <option :value="TaskStatus.DONE">Završeno</option>
      </select>
      <select v-model="filters.priority" class="filter-select">
        <option value="">Svi prioriteti</option>
        <option :value="TaskPriority.LOW">Nizak</option>
        <option :value="TaskPriority.MEDIUM">Srednji</option>
        <option :value="TaskPriority.HIGH">Visok</option>
        <option :value="TaskPriority.URGENT">Hitan</option>
      </select>
    </div>

    <div class="tasks-list">
      <div v-if="isLoading" class="loading">Učitavanje zadataka...</div>
      <div v-else-if="filteredTasks.length === 0" class="empty-state">
        <p>Nema zadataka koji odgovaraju filterima</p>
      </div>
      <div v-else class="task-cards">
        <div v-for="task in filteredTasks" :key="task.id" class="task-card" @click="viewTask(task)">
          <div class="task-header">
            <h3>{{ task.title }}</h3>
            <span :class="['priority', `priority-${task.priority.toLowerCase()}`]">
              {{ getPriorityLabel(task.priority) }}
            </span>
          </div>
          <p class="task-project">{{ task.project?.name || 'Bez projekta' }}</p>
          <p v-if="task.description" class="task-description">{{ task.description }}</p>
          <div class="task-footer">
            <span :class="['status', `status-${task.status.toLowerCase()}`]">
              {{ getStatusLabel(task.status) }}
            </span>
            <span v-if="task.dueDate" class="due-date">
              Rok: {{ formatDate(task.dueDate) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingTask ? 'Uredi zadatak' : 'Novi zadatak' }}</h2>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label>Naslov *</label>
            <input v-model="taskForm.title" type="text" required class="form-input">
          </div>
          <div class="form-group">
            <label>Projekt *</label>
            <select v-model="taskForm.projectId" required class="form-input">
              <option value="">Odaberi projekt</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Opis</label>
            <textarea v-model="taskForm.description" rows="3" class="form-input"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select v-model="taskForm.status" class="form-input">
                <option :value="TaskStatus.TODO">Za napraviti</option>
                <option :value="TaskStatus.IN_PROGRESS">U tijeku</option>
                <option :value="TaskStatus.REVIEW">Pregled</option>
                <option :value="TaskStatus.DONE">Završeno</option>
              </select>
            </div>
            <div class="form-group">
              <label>Prioritet</label>
              <select v-model="taskForm.priority" class="form-input">
                <option :value="TaskPriority.LOW">Nizak</option>
                <option :value="TaskPriority.MEDIUM">Srednji</option>
                <option :value="TaskPriority.HIGH">Visok</option>
                <option :value="TaskPriority.URGENT">Hitan</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Rok izvršenja</label>
              <input v-model="taskForm.dueDate" type="date" class="form-input">
            </div>
            <div class="form-group">
              <label>Procijenjeni sati</label>
              <input v-model.number="taskForm.estimatedHours" type="number" step="0.5" class="form-input">
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Odustani</button>
            <button type="submit" class="btn btn-primary">
              {{ editingTask ? 'Spremi promjene' : 'Stvori zadatak' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTasksStore } from '@/stores/tasks';
import { useProjectsStore } from '@/stores/projects';
import { TaskStatus, TaskPriority, type Task, type CreateTaskRequest, type UpdateTaskRequest } from '@/services/taskService';
import { useToast } from 'vue-toastification';

const toast = useToast();
const tasksStore = useTasksStore();
const projectsStore = useProjectsStore();

const isLoading = computed(() => tasksStore.isLoading);
const showModal = ref(false);
const editingTask = ref<Task | null>(null);
const projects = ref<any[]>([]);

const filters = ref({
  projectId: '',
  status: '',
  priority: ''
});

const taskForm = ref({
  title: '',
  projectId: '',
  description: '',
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  dueDate: '',
  estimatedHours: undefined as number | undefined
});

const filteredTasks = computed(() => {
  let tasks = tasksStore.tasks || [];
  
  if (filters.value.projectId) {
    tasks = tasks.filter(t => t.projectId === filters.value.projectId);
  }
  if (filters.value.status) {
    tasks = tasks.filter(t => t.status === filters.value.status);
  }
  if (filters.value.priority) {
    tasks = tasks.filter(t => t.priority === filters.value.priority);
  }
  
  return tasks;
});

watch(filters, async (newFilters) => {
  try {
    await tasksStore.fetchTasks({
      projectId: newFilters.projectId || undefined,
      status: newFilters.status as TaskStatus || undefined,
      priority: newFilters.priority as TaskPriority || undefined,
      limit: 1000 
    });
  } catch (error) {
    console.error('Failed to filter tasks:', error);
    toast.error('Greška pri filtriranju zadataka');
  }
}, { deep: true });

onMounted(async () => {
  try {
    await Promise.all([
      tasksStore.fetchTasks({ limit: 1000 }), 
      projectsStore.fetchProjects()
    ]);
    projects.value = projectsStore.projects;
  } catch (error) {
    console.error('Failed to load data:', error);
    toast.error('Greška pri učitavanju podataka');
  }
});

const openTaskModal = (task: Task | null = null) => {
  if (task) {
    editingTask.value = { ...task };
    taskForm.value = { 
      title: task.title,
      projectId: task.projectId,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: formatDateForInput(task.dueDate || ''),
      estimatedHours: task.estimatedHours
    };
  } else {
    editingTask.value = null;
    taskForm.value = {
      title: '',
      projectId: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: '',
      estimatedHours: undefined
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingTask.value = null;
};

const saveTask = async () => {
  try {
    if (!taskForm.value.title || !taskForm.value.projectId) {
      toast.error('Naslov i projekt su obavezni');
      return;
    }

    if (editingTask.value && editingTask.value.id) {
      const updateData: UpdateTaskRequest = {
        title: taskForm.value.title,
        description: taskForm.value.description || undefined,
        status: taskForm.value.status,
        priority: taskForm.value.priority,
        dueDate: taskForm.value.dueDate || undefined,
        estimatedHours: taskForm.value.estimatedHours
      };
      await tasksStore.updateTask(editingTask.value.id, updateData);
      toast.success('Zadatak je uspješno ažuriran');

      await tasksStore.fetchTasks({
        projectId: filters.value.projectId || undefined,
        status: filters.value.status as TaskStatus || undefined,
        priority: filters.value.priority as TaskPriority || undefined,
        limit: 1000
      });
    } else {
      const createData: CreateTaskRequest = {
        title: taskForm.value.title,
        projectId: taskForm.value.projectId,
        description: taskForm.value.description || undefined,
        status: taskForm.value.status,
        priority: taskForm.value.priority,
        dueDate: taskForm.value.dueDate || undefined,
        estimatedHours: taskForm.value.estimatedHours
      };
      await tasksStore.createTask(createData);
      toast.success('Zadatak je uspješno kreiran');

      await tasksStore.fetchTasks({
        projectId: filters.value.projectId || undefined,
        status: filters.value.status as TaskStatus || undefined,
        priority: filters.value.priority as TaskPriority || undefined,
        limit: 1000
      });
    }
    closeModal();
  } catch (error) {
    console.error('Failed to save task:', error);
    toast.error('Greška pri spremanju zadatka');
  }
};

const viewTask = (task: Task) => {
  openTaskModal(task);
};

const deleteTask = async (taskId: string) => {
  if (confirm('Jeste li sigurni da želite obrisati ovaj zadatak?')) {
    try {
      await tasksStore.deleteTask(taskId);
      toast.success('Zadatak je obrisan');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Greška pri brisanju zadatka');
    }
  }
};

const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('hr-HR');
};

const formatDateForInput = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0]; 
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    TODO: 'Za napraviti',
    IN_PROGRESS: 'U tijeku',
    REVIEW: 'Pregled',
    DONE: 'Završeno'
  };
  return labels[status] || status;
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    LOW: 'Nizak',
    MEDIUM: 'Srednji',
    HIGH: 'Visok',
    URGENT: 'Hitan'
  };
  return labels[priority] || priority;
};
</script>

<style scoped>
.tasks-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--text-primary);
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.task-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.task-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.task-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
}

.task-project {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 5px 0;
}

.task-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.priority {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.priority-low {
  background: #e3f2fd;
  color: #1976d2;
}

.priority-medium {
  background: #fff3e0;
  color: #f57c00;
}

.priority-high {
  background: #fff3e0;
  color: #d84315;
}

.priority-urgent {
  background: #ffebee;
  color: #c62828;
}

.status {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.status-todo {
  background: #f5f5f5;
  color: #616161;
}

.status-in_progress {
  background: #e3f2fd;
  color: #1976d2;
}

.status-review {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-done {
  background: #e8f5e9;
  color: #388e3c;
}

.due-date {
  color: var(--text-secondary);
  font-size: 12px;
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
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>