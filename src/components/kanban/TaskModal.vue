<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? 'Uredi zadatak' : 'Novi zadatak' }}</h3>
        <button @click="closeModal" class="close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="task-form">
        <div class="form-group">
          <label for="title">Naziv zadatka *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="Unesite naziv zadatka..."
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Opis</label>
          <textarea
            id="description"
            v-model="form.description"
            class="form-textarea"
            placeholder="Unesite opis zadatka..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="form.status" class="form-select">
              <option value="TODO">Za napraviti</option>
              <option value="IN_PROGRESS">U tijeku</option>
              <option value="REVIEW">Na pregledu</option>
              <option value="DONE">Gotovo</option>
            </select>
          </div>

          <div class="form-group">
            <label for="priority">Prioritet</label>
            <select id="priority" v-model="form.priority" class="form-select">
              <option value="LOW">Nizak</option>
              <option value="MEDIUM">Srednji</option>
              <option value="HIGH">Visok</option>
              <option value="URGENT">Hitan</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dueDate">Rok završetka</label>
            <input
              id="dueDate"
              v-model="form.dueDate"
              type="date"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="estimatedHours">Procjena sati</label>
            <input
              id="estimatedHours"
              v-model.number="form.estimatedHours"
              type="number"
              min="0"
              step="0.5"
              class="form-input"
              placeholder="0"
            />
          </div>
        </div>

        <div v-if="!isEditing && projects.length > 0" class="form-group">
          <label for="projectId">Projekt *</label>
          <select id="projectId" v-model="form.projectId" class="form-select" required>
            <option value="">Odaberite projekt...</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }} - {{ project.client.company }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn-secondary">
            Odustani
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="isSubmitting || !form.title.trim()"
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
import type { Task, TaskStatus, TaskPriority, CreateTaskRequest, UpdateTaskRequest } from '../../services/taskService'

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
  task?: Task | null
  projects?: Project[]
  defaultProjectId?: string
  defaultStatus?: TaskStatus
}

interface Emits {
  'close': []
  'submit': [data: CreateTaskRequest | { id: string; data: UpdateTaskRequest }]
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
  projects: () => [],
  defaultProjectId: undefined,
  defaultStatus: 'TODO'
})

const emit = defineEmits<Emits>()

const isSubmitting = ref(false)

const form = reactive({
  title: '',
  description: '',
  status: 'TODO' as TaskStatus,
  priority: 'MEDIUM' as TaskPriority,
  dueDate: '',
  estimatedHours: undefined as number | undefined,
  projectId: ''
})

const isEditing = computed(() => !!props.task)

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

watch(() => props.task, (task) => {
  if (task) {
    populateForm(task)
  }
}, { immediate: true })

function resetForm() {
  form.title = ''
  form.description = ''
  form.status = props.defaultStatus || 'TODO'
  form.priority = 'MEDIUM'
  form.dueDate = ''
  form.estimatedHours = undefined
  form.projectId = props.defaultProjectId || ''

  if (props.task) {
    populateForm(props.task)
  }
}

function populateForm(task: Task) {
  form.title = task.title
  form.description = task.description || ''
  form.status = task.status
  form.priority = task.priority
  form.dueDate = task.dueDate ? task.dueDate.split('T')[0] : ''
  form.estimatedHours = task.estimatedHours || undefined
  form.projectId = task.projectId
}

function closeModal() {
  emit('close')
}

async function submitForm() {
  isSubmitting.value = true

  try {
    const formData = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      estimatedHours: form.estimatedHours || undefined
    }

    if (isEditing.value && props.task) {

      emit('submit', {
        id: props.task.id,
        data: formData
      })
    } else {

      if (!form.projectId) {
        throw new Error('Project is required for new tasks')
      }

      emit('submit', {
        ...formData,
        projectId: form.projectId
      } as CreateTaskRequest)
    }

    closeModal()
  } catch (error) {
    console.error('Error submitting task form:', error)

    if (error instanceof Error) {
      alert(error.message)
    } else {
      alert('Greška pri spremanju zadatka')
    }
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
  max-width: 500px;
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

.task-form {
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

.form-textarea {
  resize: vertical;
  min-height: 80px;
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

  .task-form {
    padding: 16px;
  }
}
</style>