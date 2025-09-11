<template>
  <div class="kanban-view">
    <div class="page-header">
      <h1>Kanban ploča</h1>
      <div class="actions">
        <select v-model="selectedProjectId" @change="onProjectChange" class="project-select">
          <option value="">Svi projekti</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
        <router-link to="/tasks" class="btn btn-secondary">
          <i class="icon-list"></i>
          Lista zadataka
        </router-link>
        <button @click="refreshTasks" class="btn btn-secondary" :disabled="isLoading">
          <i class="icon-refresh"></i>
          Osvježi
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-spinner">
      Učitavanje zadataka...
    </div>

    <div v-else class="kanban-board">
      <div v-for="column in columns" :key="column.id" class="kanban-column">
        <div class="column-header">
          <h3>{{ column.title }}</h3>
          <span class="task-count">{{ getTasksForColumn(column.id).length }}</span>
        </div>
        
        <draggable
          :list="getTasksForColumn(column.id)"
          :group="{ name: 'tasks' }"
          item-key="id"
          class="column-tasks"
          @change="onTaskMoved($event, column.id)"
        >
          <template #item="{ element }">
            <div
              :key="element.id"
              class="task-card"
              @click="openTaskDetails(element)"
            >
              <div class="task-priority" :class="`priority-${element.priority.toLowerCase()}`"></div>
              <h4>{{ element.title }}</h4>
              <p class="task-project">{{ element.project?.name }}</p>
              <p v-if="element.description" class="task-description">{{ element.description }}</p>
              <div class="task-meta">
                <span v-if="element.estimatedHours" class="estimated-hours">
                  <i class="icon-clock"></i> {{ element.estimatedHours }}h
                </span>
                <span v-if="element.dueDate" class="due-date" :class="{ overdue: isOverdue(element.dueDate) }">
                  <i class="icon-calendar"></i> {{ formatDate(element.dueDate) }}
                </span>
              </div>
            </div>
          </template>
        </draggable>

        <button @click="addTask(column.id)" class="add-task-btn">
          <i class="icon-plus"></i> Dodaj zadatak
        </button>
      </div>
    </div>

    <div v-if="selectedTask" class="modal-overlay" @click.self="closeTaskDetails">
      <div class="modal">
        <h2>{{ selectedTask.title }}</h2>
        <div class="task-details">
          <div class="detail-row">
            <label>Projekt:</label>
            <span>{{ selectedTask.project?.name || 'Bez projekta' }}</span>
          </div>
          <div class="detail-row">
            <label>Status:</label>
            <select v-model="selectedTask.status" @change="updateTaskStatus" class="status-select">
              <option value="TODO">Za napraviti</option>
              <option value="IN_PROGRESS">U tijeku</option>
              <option value="REVIEW">Pregled</option>
              <option value="DONE">Završeno</option>
            </select>
          </div>
          <div class="detail-row">
            <label>Prioritet:</label>
            <select v-model="selectedTask.priority" @change="updateTaskPriority" class="priority-select">
              <option value="LOW">Nizak</option>
              <option value="MEDIUM">Srednji</option>
              <option value="HIGH">Visok</option>
              <option value="URGENT">Hitan</option>
            </select>
          </div>
          <div v-if="selectedTask.description" class="detail-row">
            <label>Opis:</label>
            <p>{{ selectedTask.description }}</p>
          </div>
          <div v-if="selectedTask.estimatedHours" class="detail-row">
            <label>Procijenjeno vrijeme:</label>
            <span>{{ selectedTask.estimatedHours }} sati</span>
          </div>
          <div v-if="selectedTask.dueDate" class="detail-row">
            <label>Rok izvršenja:</label>
            <span :class="{ 'text-danger': isOverdue(selectedTask.dueDate) }">
              {{ formatDate(selectedTask.dueDate) }}
            </span>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="deleteTask" class="btn btn-danger">Obriši</button>
          <button @click="closeTaskDetails" class="btn btn-primary">Zatvori</button>
        </div>
      </div>
    </div>

    <TaskModal
      :is-open="isTaskModalOpen"
      :task="taskToEdit"
      :projects="projects"
      :default-project-id="selectedProjectId"
      :default-status="defaultTaskStatus"
      @close="closeTaskModal"
      @submit="handleTaskSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import draggable from 'vuedraggable';
import { useTasksStore } from '@/stores/tasks';
import { useProjectsStore } from '@/stores/projects';
import { TaskStatus, TaskPriority, type Task, type ReorderTaskData, type CreateTaskRequest, type UpdateTaskRequest } from '@/services/taskService';
import { useToast } from 'vue-toastification';
import TaskModal from '@/components/kanban/TaskModal.vue';

const toast = useToast();
const tasksStore = useTasksStore();
const projectsStore = useProjectsStore();

const selectedProjectId = ref('');
const selectedTask = ref<Task | null>(null);
const projects = ref<any[]>([]);
const isLoading = ref(false);
const isTaskModalOpen = ref(false);
const taskToEdit = ref<Task | null>(null);
const defaultTaskStatus = ref<TaskStatus>(TaskStatus.TODO);

const columns = [
  { id: TaskStatus.TODO, title: 'Za napraviti' },
  { id: TaskStatus.IN_PROGRESS, title: 'U tijeku' },
  { id: TaskStatus.REVIEW, title: 'Pregled' },
  { id: TaskStatus.DONE, title: 'Završeno' }
];

const filteredTasks = computed(() => {
  let tasks = tasksStore.tasks || [];
  if (selectedProjectId.value) {
    tasks = tasks.filter(t => t && t.projectId === selectedProjectId.value);
  }
  return tasks.filter(t => t);
});

const getTasksForColumn = (status: string) => {
  return filteredTasks.value.filter(task => task && task.status === status);
};

watch(selectedProjectId, async (newProjectId) => {
  if (newProjectId) {
    await loadTasksForProject(newProjectId);
  } else {
    await loadAllTasks();
  }
});

const loadAllTasks = async () => {
  isLoading.value = true;
  try {
    await tasksStore.fetchKanbanTasks();
  } catch (error) {
    console.error('Failed to load tasks:', error);
    toast.error('Greška pri učitavanju zadataka');
  } finally {
    isLoading.value = false;
  }
};

const loadTasksForProject = async (projectId: string) => {
  isLoading.value = true;
  try {
    await tasksStore.fetchKanbanTasks(projectId);
  } catch (error) {
    console.error('Failed to load tasks for project:', error);
    toast.error('Greška pri učitavanju zadataka za projekt');
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      loadAllTasks(),
      projectsStore.fetchProjects()
    ]);
    projects.value = projectsStore.projects;
  } catch (error) {
    console.error('Failed to load data:', error);
    toast.error('Greška pri učitavanju podataka');
  } finally {
    isLoading.value = false;
  }
});

const onTaskMoved = async (event: any, newStatus: string) => {
  console.log('Task moved event:', event, 'to status:', newStatus);
  
  if (event.added) {
    const task = event.added.element as Task;
    const newIndex = event.added.newIndex;
    
    console.log('Task added:', task, 'at index:', newIndex);

    const originalStatus = task.status;
    const originalPosition = task.position;
    
    try {

      tasksStore.updateTaskStatusOptimistic(task.id, newStatus as TaskStatus, newIndex);

      const tasksInColumn = getTasksForColumn(newStatus);
      const reorderData: ReorderTaskData[] = tasksInColumn.map((t, index) => ({
        id: t.id,
        status: newStatus as TaskStatus,
        position: index
      }));

      await tasksStore.reorderTasks(reorderData);
      
      toast.success('Zadatak je premješten');
    } catch (error) {
      console.error('Failed to move task:', error);

      tasksStore.revertTaskUpdate(task.id, originalStatus, originalPosition);
      toast.error('Greška pri premještanju zadatka');
    }
  }
};

const onProjectChange = async () => {

};

const refreshTasks = async () => {
  if (selectedProjectId.value) {
    await loadTasksForProject(selectedProjectId.value);
  } else {
    await loadAllTasks();
  }
  toast.success('Zadaci osvježeni');
};

const addTask = (status: string) => {
  defaultTaskStatus.value = status as TaskStatus;
  taskToEdit.value = null;
  isTaskModalOpen.value = true;
};

const getColumnTitle = (status: string) => {
  const column = columns.find(c => c.id === status);
  return column ? column.title : status;
};

const openTaskDetails = (task: Task) => {
  selectedTask.value = { ...task };
};

const closeTaskDetails = () => {
  selectedTask.value = null;
};

const updateTaskStatus = async () => {
  if (selectedTask.value) {
    try {
      await tasksStore.updateTask(selectedTask.value.id, { status: selectedTask.value.status });
      toast.success('Status zadatka je ažuriran');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Greška pri ažuriranju statusa zadatka');
    }
  }
};

const updateTaskPriority = async () => {
  if (selectedTask.value) {
    try {
      await tasksStore.updateTask(selectedTask.value.id, { priority: selectedTask.value.priority });
      toast.success('Prioritet zadatka je ažuriran');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Greška pri ažuriranju prioriteta zadatka');
    }
  }
};

const deleteTask = async () => {
  if (selectedTask.value && confirm('Jeste li sigurni da želite obrisati ovaj zadatak?')) {
    try {
      await tasksStore.deleteTask(selectedTask.value.id);
      closeTaskDetails();
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

const isOverdue = (date: string) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const closeTaskModal = () => {
  isTaskModalOpen.value = false;
  taskToEdit.value = null;
};

const handleTaskSubmit = async (data: CreateTaskRequest | { id: string; data: UpdateTaskRequest }) => {
  try {
    if ('id' in data) {

      await tasksStore.updateTask(data.id, data.data);
      toast.success('Zadatak je uspješno ažuriran');
    } else {

      await tasksStore.createTask(data);
      toast.success('Zadatak je uspješno kreiran');
    }
    closeTaskModal();
  } catch (error) {
    console.error('Failed to save task:', error);
    toast.error('Greška pri spremanju zadatka');
  }
};
</script>

<style scoped>
.kanban-view {
  padding: 20px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
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
  align-items: center;
}

.project-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.kanban-board {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow-x: auto;
}

.kanban-column {
  flex: 0 0 300px;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
}

.column-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
}

.task-count {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.column-tasks {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.task-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: move;
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-priority {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.priority-low {
  background: #2196f3;
}

.priority-medium {
  background: #ff9800;
}

.priority-high {
  background: #ff5722;
}

.priority-urgent {
  background: #f44336;
}

.task-card h4 {
  margin: 8px 0;
  color: var(--text-primary);
  font-size: 14px;
}

.task-project {
  color: var(--primary-color);
  font-size: 12px;
  margin: 4px 0;
}

.task-description {
  color: var(--text-secondary);
  font-size: 12px;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.estimated-hours, .due-date {
  color: var(--text-secondary);
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.due-date.overdue {
  color: #f44336;
}

.add-task-btn {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px dashed var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.add-task-btn:hover {
  background: var(--bg-primary);
  border-style: solid;
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
  max-width: 500px;
}

.modal h2 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.task-details {
  margin: 20px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
}

.detail-row label {
  width: 120px;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-row span, .detail-row p {
  flex: 1;
  color: var(--text-primary);
  margin: 0;
}

.status-select, .priority-select {
  flex: 1;
  padding: 5px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
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

.btn-danger {
  background: #f44336;
  color: white;
}

.text-danger {
  color: #f44336;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--text-secondary);
  font-size: 16px;
}

.column-tasks {
  min-height: 100px;
}

.task-card {
  transition: all 0.2s ease;
}

.task-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sortable-ghost {
  opacity: 0.5;
}

.sortable-chosen {
  transform: rotate(3deg);
}

.sortable-drag {
  transform: rotate(3deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}
</style>