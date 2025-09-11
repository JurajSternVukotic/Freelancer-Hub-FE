<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? 'Uredi unos vremena' : 'Novi unos vremena' }}</h3>
        <button @click="closeModal" class="close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="entry-form">
        <div v-if="!isEditing" class="form-row">
          <div class="form-group">
            <label for="projectId">Projekt *</label>
            <select 
              id="projectId" 
              v-model="form.projectId" 
              @change="updateTaskOptions"
              class="form-select" 
              required
            >
              <option value="">Odaberite projekt...</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }} - {{ project.client.company }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="taskId">Zadatak *</label>
            <select 
              id="taskId" 
              v-model="form.taskId" 
              class="form-select" 
              :disabled="!form.projectId"
              required
            >
              <option value="">{{ form.projectId ? 'Odaberite zadatak...' : 'Prvo odaberite projekt' }}</option>
              <option v-for="task in availableTasks" :key="task.id" :value="task.id">
                {{ task.title }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="startDate">Datum *</label>
            <input
              id="startDate"
              v-model="form.startDate"
              type="date"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="billable">Naplativost</label>
            <select id="billable" v-model="form.billable" class="form-select">
              <option :value="true">Naplativo</option>
              <option :value="false">Nenaplativo</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="startTime">Početno vrijeme *</label>
            <input
              id="startTime"
              v-model="form.startTime"
              type="time"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="endTime">Završno vrijeme *</label>
            <input
              id="endTime"
              v-model="form.endTime"
              type="time"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="duration">Trajanje</label>
          <div class="duration-display">
            {{ calculateDuration() }}
          </div>
        </div>

        <div class="form-group">
          <label for="description">Opis</label>
          <textarea
            id="description"
            v-model="form.description"
            class="form-textarea"
            placeholder="Opišite što ste radili..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn-secondary">
            Odustani
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="isSubmitting || !isFormValid"
          >
            {{ isSubmitting ? 'Spremam...' : (isEditing ? 'Ažuriraj' : 'Kreiraj') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { format, parseISO } from 'date-fns'
import timeEntryService, { TimeEntry, CreateTimeEntryRequest, UpdateTimeEntryRequest } from '../../services/timeEntryService'
import taskService, { Task } from '../../services/taskService'
import { useToast } from 'vue-toastification'

interface Project {
  id: string
  name: string
  client: {
    id: string
    company: string
  }
}

interface Props {
  isOpen: boolean
  entry?: TimeEntry | null
  projects?: Project[]
}

interface Emits {
  'close': []
  'submit': []
}

const props = withDefaults(defineProps<Props>(), {
  entry: null,
  projects: () => []
})

const emit = defineEmits<Emits>()
const toast = useToast()

const isSubmitting = ref(false)
const availableTasks = ref<Task[]>([])

const form = reactive({
  projectId: '',
  taskId: '',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  startTime: '',
  endTime: '',
  billable: true,
  description: ''
})

const isEditing = computed(() => !!props.entry)

const isFormValid = computed(() => {
  if (isEditing.value) {
    return form.startDate && form.startTime && form.endTime && 
           form.startTime < form.endTime
  }
  return form.projectId && form.taskId && form.startDate && 
         form.startTime && form.endTime && form.startTime < form.endTime
})

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

watch(() => props.entry, (entry) => {
  if (entry) {
    populateForm(entry)
  }
}, { immediate: true })

function resetForm() {
  form.projectId = ''
  form.taskId = ''
  form.startDate = format(new Date(), 'yyyy-MM-dd')
  form.startTime = ''
  form.endTime = ''
  form.billable = true
  form.description = ''

  availableTasks.value = []

  if (props.entry) {
    populateForm(props.entry)
  }
}

function populateForm(entry: TimeEntry) {
  const startDateTime = parseISO(entry.startTime)
  const endDateTime = entry.endTime ? parseISO(entry.endTime) : null

  form.projectId = entry.task.project.id
  form.taskId = entry.taskId
  form.startDate = format(startDateTime, 'yyyy-MM-dd')
  form.startTime = format(startDateTime, 'HH:mm')
  form.endTime = endDateTime ? format(endDateTime, 'HH:mm') : ''
  form.billable = entry.billable
  form.description = entry.description || ''

  updateTaskOptions()
}

async function updateTaskOptions() {
  if (!form.projectId) {
    availableTasks.value = []
    form.taskId = ''
    return
  }

  try {
    const response = await taskService.getTasks({ 
      projectId: form.projectId,
      limit: 100
    })
    availableTasks.value = response.data

    if (!isEditing.value) {
      form.taskId = ''
    }
  } catch (error) {
    console.error('Error loading tasks:', error)
    toast.error('Greška pri dohvaćanju zadataka')
  }
}

function calculateDuration(): string {
  if (!form.startTime || !form.endTime) {
    return '0h 0m'
  }

  if (form.startTime >= form.endTime) {
    return 'Nepovaljno vrijeme'
  }

  const [startHours, startMinutes] = form.startTime.split(':').map(Number)
  const [endHours, endMinutes] = form.endTime.split(':').map(Number)

  const startTotalMinutes = startHours * 60 + startMinutes
  const endTotalMinutes = endHours * 60 + endMinutes

  const durationMinutes = endTotalMinutes - startTotalMinutes

  if (durationMinutes <= 0) {
    return 'Nepovaljno vrijeme'
  }

  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

function closeModal() {
  emit('close')
}

async function submitForm() {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    const startDateTime = new Date(`${form.startDate}T${form.startTime}:00`)
    const endDateTime = new Date(`${form.startDate}T${form.endTime}:00`)

    if (startDateTime >= endDateTime) {
      toast.error('Završno vrijeme mora biti nakon početnog vremena')
      return
    }

    if (isEditing.value && props.entry) {

      const updateData: UpdateTimeEntryRequest = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        description: form.description.trim() || undefined,
        billable: form.billable
      }

      await timeEntryService.updateTimeEntry(props.entry.id, updateData)
      toast.success('Unos vremena je uspješno ažuriran')
    } else {

      const createData: CreateTimeEntryRequest = {
        taskId: form.taskId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        description: form.description.trim() || undefined,
        billable: form.billable
      }

      await timeEntryService.createTimeEntry(createData)
      toast.success('Unos vremena je uspješno kreiran')
    }

    emit('submit')
    closeModal()
  } catch (error: any) {
    const message = error.response?.data?.message || 'Greška pri spremanju unosa vremena'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary);
}

.entry-form {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.duration-display {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  margin-top: 20px;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-width: calc(100% - 20px);
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal-header {
    padding: 16px;
  }

  .entry-form {
    padding: 16px;
  }
}
</style>