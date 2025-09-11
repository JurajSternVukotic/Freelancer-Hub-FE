<template>
  <div 
    class="task-card" 
    :class="[...priorityClass, ...urgencyClasses]"
    :style="urgencyStyle"
  >
    <div class="task-header">
      <div class="urgency-indicator" :class="`urgency-${taskUrgency.urgencyLevel}`">
        <span class="urgency-score">{{ taskUrgency.urgencyScore }}</span>
      </div>
      <h4 class="task-title">{{ task.title }}</h4>
      <div class="task-actions">
        <button
          @click.stop="$emit('start-timer')"
          class="btn-icon timer-btn"
          :disabled="isTimerRunning"
          :title="isTimerRunning ? 'Timer već radi' : 'Pokreni timer'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        <button
          @click.stop="$emit('edit')"
          class="btn-icon edit-btn"
          title="Uredi zadatak"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <p v-if="task.description" class="task-description">
      {{ truncatedDescription }}
    </p>
    
    <div class="task-meta">
      <div class="task-project" v-if="task.project">
        <span class="project-name">{{ task.project.name || 'Unknown Project' }}</span>
        <span class="client-name">{{ task.project.client?.company || 'Unknown Client' }}</span>
      </div>
      
      <div class="task-info">
        <div v-if="task.dueDate" class="due-date" :class="dueDateClass">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          {{ formatDate(task.dueDate) }}
        </div>
        
        <div v-if="task.estimatedHours" class="estimated-time">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
          </svg>
          {{ task.estimatedHours }}h
        </div>
        
        <div v-if="task._count?.timeEntries" class="time-entries">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
          </svg>
          {{ task._count.timeEntries }}
        </div>
      </div>
    </div>
    
    <div class="task-footer">
      <span class="priority-badge" :class="`priority-${task.priority ? task.priority.toLowerCase() : 'medium'}`">
        {{ priorityText }}
      </span>
      <span class="urgency-description" :title="taskUrgency.description">
        {{ taskUrgency.description }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, isToday, isTomorrow, isYesterday, isPast } from 'date-fns'
import { hr } from 'date-fns/locale'
import type { Task, TaskPriority } from '../../services/taskService'
import { useTimerStore } from '../../stores/timer'
import { calculateTaskUrgency, getUrgencyClasses } from '../../utils/urgency'

interface Props {
  task: Task
}

const props = defineProps<Props>()

defineEmits<{
  'start-timer': []
  'edit': []
}>()

const timerStore = useTimerStore()

const isTimerRunning = computed(() => {
  return timerStore.isRunning && timerStore.currentTimer?.taskId === props.task.id
})

const taskUrgency = computed(() => calculateTaskUrgency(props.task))
const urgencyClasses = computed(() => getUrgencyClasses(taskUrgency.value))
const urgencyStyle = computed(() => ({
  minHeight: `${taskUrgency.value.urgencyHeight * 80}px` 
}))

const priorityClass = computed(() => {
  return [`priority-${props.task.priority ? props.task.priority.toLowerCase() : 'medium'}`]
})

const priorityText = computed(() => {
  const priorities: Record<TaskPriority, string> = {
    LOW: 'Nizak',
    MEDIUM: 'Srednji',
    HIGH: 'Visok',
    URGENT: 'Hitan'
  }
  return priorities[props.task.priority || 'MEDIUM'] || 'Srednji'
})

const truncatedDescription = computed(() => {
  if (!props.task.description) return ''
  return props.task.description.length > 100 
    ? props.task.description.substring(0, 100) + '...'
    : props.task.description
})

const dueDateClass = computed(() => {
  if (!props.task.dueDate) return ''
  const dueDate = new Date(props.task.dueDate)
  
  if (isPast(dueDate) && !isToday(dueDate)) {
    return 'overdue'
  } else if (isToday(dueDate)) {
    return 'today'
  } else if (isTomorrow(dueDate)) {
    return 'tomorrow'
  }
  return ''
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  if (isToday(date)) {
    return 'Danas'
  } else if (isTomorrow(date)) {
    return 'Sutra'
  } else if (isYesterday(date)) {
    return 'Jučer'
  } else {
    return format(date, 'dd.MM.yyyy', { locale: hr })
  }
}
</script>

<style scoped>
.task-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.task-card:active {
  cursor: grabbing;
}

.task-card.priority-low {
  border-left: 4px solid #10b981;
}

.task-card.priority-medium {
  border-left: 4px solid #f59e0b;
}

.task-card.priority-high {
  border-left: 4px solid #ef4444;
}

.task-card.priority-urgent {
  border-left: 4px solid #dc2626;
  background: linear-gradient(135deg, #fef2f2 0%, var(--bg-primary) 100%);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.task-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.timer-btn {
  color: var(--success-color);
}

.timer-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.1);
}

.timer-btn:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

.edit-btn {
  color: var(--text-muted);
}

.edit-btn:hover {
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
}

.task-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.task-meta {
  margin-bottom: 8px;
}

.task-project {
  margin-bottom: 6px;
}

.project-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--primary-color);
  display: block;
}

.client-name {
  font-size: 10px;
  color: var(--text-muted);
  display: block;
}

.task-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.due-date,
.estimated-time,
.time-entries {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-muted);
}

.due-date.today {
  color: var(--warning-color);
}

.due-date.tomorrow {
  color: var(--info-color);
}

.due-date.overdue {
  color: var(--danger-color);
}

.task-footer {
  display: flex;
  justify-content: flex-end;
}

.priority-badge {
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 4px;
}

.priority-badge.priority-low {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.priority-badge.priority-medium {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.priority-badge.priority-high {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.priority-badge.priority-urgent {
  background: rgba(220, 38, 38, 0.15);
  color: #dc2626;
}

.urgency-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid var(--bg-primary);
}

.urgency-indicator.urgency-low {
  background: #10b981;
  color: white;
}

.urgency-indicator.urgency-medium {
  background: #f59e0b;
  color: white;
}

.urgency-indicator.urgency-high {
  background: #ef4444;
  color: white;
}

.urgency-indicator.urgency-critical {
  background: #dc2626;
  color: white;
  animation: urgency-pulse 2s infinite;
}

.urgency-description {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 4px;
  display: block;
}

.urgency-low {
  border-left: 3px solid #10b981;
}

.urgency-medium {
  border-left: 3px solid #f59e0b;
}

.urgency-high {
  border-left: 3px solid #ef4444;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
}

.urgency-critical {
  border-left: 3px solid #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
  background: rgba(220, 38, 38, 0.02);
}

.urgency-pulse {
  animation: urgency-pulse 2s infinite;
}

@keyframes urgency-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.task-header {
  position: relative;
}
</style>