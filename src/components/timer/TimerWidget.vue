<template>
  <div class="timer-widget" v-if="showWidget">
    <div class="timer-content">
      <div class="timer-display">
        <span class="timer-time">{{ formattedTime }}</span>
        <span class="timer-project" v-if="activeProject">{{ activeProject.name }}</span>
        <span class="timer-project no-project" v-else>Bez projekta</span>
        <span class="timer-task" v-if="currentTimer?.task">{{ currentTimer.task.title }}</span>
      </div>
      
      <div class="timer-controls">
        
        <button
          v-if="!hasActiveTimer"
          @click="startNewTimer"
          class="timer-btn timer-btn-start"
          :disabled="isLoading"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        <button
          v-if="hasActiveTimer && isRunning"
          @click="pauseTimer"
          class="timer-btn timer-btn-pause"
          :disabled="isLoading"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>

        <button
          v-if="hasActiveTimer && isPaused"
          @click="resumeTimer"
          class="timer-btn timer-btn-resume"
          :disabled="isLoading"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        <button
          v-if="hasActiveTimer"
          @click="stopTimer"
          class="timer-btn timer-btn-stop"
          :disabled="isLoading"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h12v12H6z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <button @click="closeWidget" class="timer-close">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>

    <div v-if="showTaskSelection" class="task-selection-modal" @click.self="closeTaskSelection">
      <div class="task-selection-content">
        <div class="modal-header">
          <h3>Odaberite zadatak za timer</h3>
          <button @click="closeTaskSelection" class="close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="isLoadingTasks" class="loading">
            Učitavanje zadataka...
          </div>
          
          <div v-else-if="!availableTasks || availableTasks.length === 0" class="no-tasks">
            Nema dostupnih zadataka.
          </div>
          
          <div v-else class="task-list">
            <div
              v-for="task in availableTasks"
              :key="task.id"
              @click="startTimerWithTask(task)"
              class="task-item"
            >
              <div class="task-info">
                <h4>{{ task.title }}</h4>
                <p v-if="task.project">{{ task.project.name }}<span v-if="task.project.client"> - {{ task.project.client.company }}</span></p>
                <p v-else>Nema dodijeljenog projekta</p>
                <span class="task-status">{{ getStatusText(task.status) }}</span>
              </div>
              <div class="task-priority" :class="`priority-${(task.priority || 'medium').toLowerCase()}`">
                {{ getPriorityText(task.priority || 'MEDIUM') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useTimerStore } from '../../stores/timer'
import taskService, { type Task } from '../../services/taskService'

const appStore = useAppStore()
const timerStore = useTimerStore()

const showTaskSelection = ref(false)
const availableTasks = ref<Task[]>([])
const isLoadingTasks = ref(false)

const showWidget = computed(() => appStore.showTimer)
const isRunning = computed(() => timerStore.isRunning)
const isLoading = computed(() => timerStore.isLoading)
const isPaused = computed(() => timerStore.isPaused)
const hasActiveTimer = computed(() => timerStore.hasActiveTimer)
const currentTimer = computed(() => timerStore.currentTimer)
const formattedTime = computed(() => timerStore.formattedTime)
const activeProject = computed(() => {
  console.log('Timer data:', currentTimer.value)
  console.log('Task data:', currentTimer.value?.task)
  console.log('Project data:', currentTimer.value?.task?.project)
  return currentTimer.value?.task?.project || null
})

async function startNewTimer() {

  await openTaskSelection()
}

async function pauseTimer() {
  try {
    timerStore.pauseTimer()
  } catch (error) {
    console.error('Error pausing timer:', error)
  }
}

async function resumeTimer() {
  try {
    timerStore.resumeTimer()
  } catch (error) {
    console.error('Error resuming timer:', error)
  }
}

async function openTaskSelection() {
  showTaskSelection.value = true
  isLoadingTasks.value = true
  
  try {
    const response = await taskService.getTasks({ 
      status: ['TODO', 'IN_PROGRESS'],
      limit: 50
    })

    availableTasks.value = Array.isArray(response) ? response : (response?.data || [])
  } catch (error) {
    console.error('Error loading tasks:', error)
    availableTasks.value = []
  } finally {
    isLoadingTasks.value = false
  }
}

function closeTaskSelection() {
  showTaskSelection.value = false
}

async function startTimerWithTask(task: Task) {
  try {
    await timerStore.startTimer({
      taskId: task.id,
      description: `Rad na zadatku: ${task.title}`
    })
    closeTaskSelection()
  } catch (error) {
    console.error('Error starting timer:', error)
  }
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'TODO': 'Za rad',
    'IN_PROGRESS': 'U tijeku',
    'REVIEW': 'Na provjeri',
    'DONE': 'Završeno'
  }
  return statusMap[status] || status
}

function getPriorityText(priority: string): string {
  const priorityMap: Record<string, string> = {
    'LOW': 'Nizak',
    'MEDIUM': 'Srednji',
    'HIGH': 'Visok',
    'URGENT': 'Hitan'
  }
  return priorityMap[priority] || priority
}

async function stopTimer() {
  try {
    await timerStore.stopTimer()
  } catch (error) {
    console.error('Error stopping timer:', error)
  }
}

function closeWidget() {
  if (isRunning.value) {

    if (confirm('Timer je aktivan. Želite li ga zaustaviti i zatvoriti widget?')) {
      stopTimer()
      appStore.toggleTimer()
    }
  } else {
    appStore.toggleTimer()
  }
}

onMounted(async () => {
  try {
    await timerStore.initialize()
  } catch (error) {
    console.error('Error initializing timer widget:', error)
  }
})

onUnmounted(() => {
  timerStore.cleanup()
})
</script>

<style scoped>
.timer-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 16px;
  min-width: 200px;
  z-index: 1000;
}

.timer-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timer-display {
  flex: 1;
}

.timer-time {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.timer-project {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.timer-project.no-project {
  font-style: italic;
  color: var(--text-secondary);
}

.timer-task {
  display: block;
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 1px;
  font-weight: 500;
}

.timer-controls {
  display: flex;
  gap: 8px;
}

.timer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timer-btn-start {
  background-color: var(--success-color);
  color: white;
}

.timer-btn-start:hover {
  background-color: #059669;
}

.timer-btn-pause {
  background-color: var(--warning-color);
  color: white;
}

.timer-btn-pause:hover {
  background-color: #d97706;
}

.timer-btn-resume {
  background-color: var(--success-color);
  color: white;
}

.timer-btn-resume:hover {
  background-color: #059669;
}

.timer-btn-stop {
  background-color: var(--danger-color);
  color: white;
}

.timer-btn-stop:hover {
  background-color: #dc2626;
}

.timer-close {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.timer-close:hover {
  background: var(--danger-color);
  color: white;
}

.task-selection-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.task-selection-content {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading, .no-tasks {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.task-info {
  flex: 1;
}

.task-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-info p {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.task-status {
  font-size: 10px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
}

.task-priority {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 50px;
  text-align: center;
}

.task-priority.priority-low {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.task-priority.priority-medium {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.task-priority.priority-high {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.task-priority.priority-urgent {
  background: rgba(220, 38, 38, 0.15);
  color: #dc2626;
}

@media (max-width: 768px) {
  .timer-widget {
    bottom: 10px;
    right: 10px;
    min-width: 160px;
    padding: 12px;
  }
  
  .timer-time {
    font-size: 1rem;
  }
  
  .timer-btn {
    width: 28px;
    height: 28px;
  }
  
  .task-selection-content {
    width: 95%;
    max-height: 80vh;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-header h3 {
    font-size: 1rem;
  }
}</style>