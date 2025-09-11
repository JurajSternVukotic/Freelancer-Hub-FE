<template>
  <div class="kanban-view">
    <div class="kanban-header">
      <div class="header-left">
        <h2>Kanban ploča</h2>
        <div v-if="selectedProject" class="project-info">
          <span class="project-name">{{ selectedProject.name }}</span>
          <span class="client-name">{{ selectedProject.client.company }}</span>
        </div>
      </div>
      
      <div class="header-actions">
        <select 
          v-model="selectedProjectId" 
          @change="changeProject" 
          class="project-select"
          v-if="projects.length > 0"
        >
          <option value="">Svi projekti</option>
          <option 
            v-for="project in projects" 
            :key="project.id" 
            :value="project.id"
          >
            {{ project.name }} - {{ project.client.company }}
          </option>
        </select>
        
        <button @click="openCreateModal" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Novi zadatak
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Učitavam zadatke...</p>
    </div>

    <div v-else class="kanban-board">
      <div 
        v-for="status in columns" 
        :key="status.key" 
        class="kanban-column"
      >
        <div class="column-header">
          <h3 class="column-title">{{ status.title }}</h3>
          <span class="task-count">{{ tasksByStatus[status.key]?.length || 0 }}</span>
        </div>
        
        <div class="column-body">
          <draggable
            :list="tasksByStatus[status.key] || []"
            group="tasks"
            item-key="id"
            @change="handleTaskMove"
            :disabled="isLoading"
            class="task-list"
            ghost-class="task-ghost"
            chosen-class="task-chosen"
            drag-class="task-drag"
          >
            <template #item="{ element: task }">
              <TaskCard
                :task="task"
                @start-timer="startTimer(task)"
                @edit="editTask(task)"
              />
            </template>
          </draggable>
          
          <button 
            @click="openCreateModal(status.key)"
            class="add-task-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Dodaj zadatak
          </button>
        </div>
      </div>
    </div>

    <TaskModal
      :is-open="isModalOpen"
      :task="editingTask"
      :projects="projects"
      :default-project-id="selectedProjectId"
      :default-status="defaultTaskStatus"
      @close="closeModal"
      @submit="handleTaskSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'
import TaskCard from '../../components/kanban/TaskCard.vue'
import TaskModal from '../../components/kanban/TaskModal.vue'
import { useTasksStore } from '../../stores/tasks'
import { useProjectsStore } from '../../stores/projects'
import { useTimerStore } from '../../stores/timer'
import type { Task, TaskStatus, CreateTaskRequest, UpdateTaskRequest, ReorderTaskData } from '../../services/taskService'
import { useToast } from 'vue-toastification'

interface Project {
  id: string
  name: string
  client: {
    id: string
    company: string
  }
}

interface Column {
  key: TaskStatus
  title: string
}

const toast = useToast()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const timerStore = useTimerStore()

const selectedProjectId = ref<string>('')
const projects = ref<Project[]>([])
const isModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const defaultTaskStatus = ref<TaskStatus>('TODO')

const isLoading = computed(() => tasksStore.isLoading)
const tasksByStatus = computed(() => tasksStore.tasksByStatus)

const selectedProject = computed(() => {
  return projects.value.find(p => p.id === selectedProjectId.value) || null
})

const columns: Column[] = [
  { key: 'TODO', title: 'Za napraviti' },
  { key: 'IN_PROGRESS', title: 'U tijeku' },
  { key: 'REVIEW', title: 'Na pregledu' },
  { key: 'DONE', title: 'Gotovo' }
]

async function loadProjects() {
  try {
    await projectsStore.fetchProjects({ limit: 1000 })
    projects.value = projectsStore.projects.map(project => ({
      id: project.id,
      name: project.name,
      client: project.client
    }))
  } catch (error) {
    console.error('Error loading projects:', error)
    toast.error('Greška pri dohvaćanju projekata')
  }
}

async function loadTasks() {
  try {
    await tasksStore.fetchKanbanTasks(selectedProjectId.value || undefined)
  } catch (error) {
    console.error('Error loading tasks:', error)
    toast.error('Greška pri dohvaćanju zadataka')
  }
}

async function changeProject() {
  await loadTasks()
}

function openCreateModal(status: TaskStatus = 'TODO') {
  editingTask.value = null
  defaultTaskStatus.value = status
  isModalOpen.value = true
}

function editTask(task: Task) {
  editingTask.value = task
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingTask.value = null
  defaultTaskStatus.value = 'TODO'
}

async function handleTaskSubmit(data: CreateTaskRequest | { id: string; data: UpdateTaskRequest }) {
  try {
    if ('id' in data) {

      await tasksStore.updateTask(data.id, data.data)
    } else {

      await tasksStore.createTask(data)

    }
    closeModal()
  } catch (error) {
    console.error('Error submitting task:', error)
  }
}

async function startTimer(task: Task) {
  try {
    await timerStore.startTimer({
      taskId: task.id,
      description: `Rad na zadatku: ${task.title}`
    })
  } catch (error) {
    console.error('Error starting timer:', error)
  }
}

async function handleTaskMove(event: any) {
  if (!event.moved && !event.added) return

  try {
    const taskMoved = event.moved || event.added
    if (!taskMoved) return

    const { element: task, newIndex } = taskMoved
    const newStatus = getStatusFromColumnIndex(event.to.closest('.kanban-column'))
    
    if (!newStatus) return

    const originalStatus = task.status
    const originalPosition = task.position
    
    tasksStore.updateTaskStatusOptimistic(task.id, newStatus, newIndex)

    const reorderData: ReorderTaskData[] = []

    const tasksInNewStatus = tasksByStatus.value[newStatus] || []
    tasksInNewStatus.forEach((t, index) => {
      reorderData.push({
        id: t.id,
        status: newStatus,
        position: index
      })
    })

    if (originalStatus !== newStatus) {
      const tasksInOriginalStatus = tasksByStatus.value[originalStatus] || []
      tasksInOriginalStatus.forEach((t, index) => {
        if (t.id !== task.id) {
          reorderData.push({
            id: t.id,
            status: originalStatus,
            position: index
          })
        }
      })
    }

    try {
      await tasksStore.reorderTasks(reorderData)
    } catch (error) {

      tasksStore.revertTaskUpdate(task.id, originalStatus, originalPosition)
      throw error
    }

  } catch (error) {
    console.error('Error moving task:', error)
    toast.error('Greška pri premještanju zadatka')
  }
}

function getStatusFromColumnIndex(columnElement: Element): TaskStatus | null {
  const columnElements = Array.from(columnElement.parentElement?.children || [])
  const columnIndex = columnElements.indexOf(columnElement)
  return columns[columnIndex]?.key || null
}

onMounted(async () => {
  await Promise.all([
    loadProjects(),
    loadTasks(),
    timerStore.initialize()
  ])
})

watch(selectedProjectId, () => {
  loadTasks()
})
</script>

<style scoped>
.kanban-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-color);
}

.client-name {
  font-size: 12px;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  min-width: 200px;
}

.project-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  flex: 1;
  overflow: hidden;
}

.kanban-column {
  background: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.column-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-count {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.column-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.task-list {
  flex: 1;
  min-height: 100px;
}

.add-task-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  margin-top: 8px;
  background: transparent;
  border: 2px dashed var(--border-color);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-task-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.task-ghost {
  opacity: 0.5;
  background: var(--primary-color);
  border-radius: 6px;
}

.task-chosen {
  background: var(--bg-tertiary);
}

.task-drag {
  transform: rotate(5deg);
}

@media (max-width: 1200px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kanban-view {
    padding: 16px;
  }

  .kanban-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .project-select {
    min-width: auto;
  }

  .kanban-board {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .column-header {
    padding: 12px;
  }

  .column-body {
    padding: 8px;
  }
}
</style>