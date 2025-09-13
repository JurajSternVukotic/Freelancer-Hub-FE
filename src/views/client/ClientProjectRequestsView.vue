<template>
  <div class="project-requests">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Zahtjevi za projekt</h1>
        <p class="page-subtitle">Upravlja vašim zahtjevima za projekte</p>
      </div>
      <button @click="showCreateForm = true" class="create-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        Novi zahtjev
      </button>
    </div>

    <div v-if="showCreateForm" class="modal-overlay" @click="closeCreateForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Novi zahtjev za projekt</h2>
          <button @click="closeCreateForm" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleCreateRequest" class="create-form">
          <div class="form-group">
            <label for="title" class="form-label">Naslov projekta *</label>
            <input
              id="title"
              v-model="createForm.title"
              type="text"
              class="form-input"
              :class="{ 'error': createErrors.title }"
              placeholder="Opišite što trebate"
              required
            />
            <div v-if="createErrors.title" class="form-error">{{ createErrors.title }}</div>
          </div>

          <div class="form-group">
            <div class="form-label-with-ai">
              <label for="description" class="form-label">Opis projekta *</label>
              <button 
                type="button" 
                @click="showAIModal = true"
                class="ai-help-button"
                title="AI pomoć za opis projekta"
              >
                🤖 AI pomoć
              </button>
            </div>
            <textarea
              id="description"
              v-model="createForm.description"
              class="form-textarea"
              :class="{ 'error': createErrors.description }"
              rows="5"
              placeholder="Detaljno opišite projekt, ciljeve i zahtjeve..."
              required
            ></textarea>
            <div v-if="createErrors.description" class="form-error">{{ createErrors.description }}</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="budgetRange" class="form-label">Proračun</label>
              <select
                id="budgetRange"
                v-model="createForm.budgetRange"
                class="form-select"
              >
                <option value="">Odaberite proračun</option>
                <option value="under-1000">Do 1.000 €</option>
                <option value="1000-5000">1.000 € - 5.000 €</option>
                <option value="5000-10000">5.000 € - 10.000 €</option>
                <option value="10000-25000">10.000 € - 25.000 €</option>
                <option value="over-25000">Preko 25.000 €</option>
              </select>
            </div>

            <div class="form-group">
              <label for="priority" class="form-label">Prioritet</label>
              <select
                id="priority"
                v-model="createForm.priority"
                class="form-select"
              >
                <option value="LOW">Nizak</option>
                <option value="MEDIUM">Srednji</option>
                <option value="HIGH">Visok</option>
                <option value="URGENT">Hitan</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="deadline" class="form-label">Željeni rok završetka</label>
            <input
              id="deadline"
              v-model="createForm.deadline"
              type="date"
              class="form-input"
            />
          </div>

          <div v-if="createErrors.general" class="form-error general">{{ createErrors.general }}</div>

          <div class="form-actions">
            <button type="button" @click="closeCreateForm" class="cancel-button" :disabled="isCreating">
              Odustani
            </button>
            <button type="submit" class="submit-button" :disabled="isCreating">
              <span v-if="isCreating">Stvaram...</span>
              <span v-else>Stvori zahtjev</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isLoading" class="skeleton-loading">
      <div v-for="n in 3" :key="n" class="skeleton-card">
        <div class="skeleton-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-status"></div>
        </div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-footer">
          <div class="skeleton-date"></div>
          <div class="skeleton-priority"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-message">{{ error }}</div>
      <button @click="loadRequests" class="retry-button">Pokušaj ponovo</button>
    </div>

    <div v-else-if="!requests.length" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
        <path d="M16 11H8"/>
        <path d="M16 15H8"/>
        <path d="M12 7v2"/>
      </svg>
      <h3>Nemate zahtjeva za projekte</h3>
      <p>Stvorite svoj prvi zahtjev za projekt kako biste počeli.</p>
      <button @click="showCreateForm = true" class="create-button primary">
        Stvori zahtjev
      </button>
    </div>

    <div v-else class="requests-list">
      <div 
        v-for="request in requests" 
        :key="request.id" 
        class="request-card"
      >
        <div class="request-header">
          <div class="request-title-section">
            <h3 class="request-title">{{ request.title }}</h3>
            <div class="request-meta">
              <span class="request-date">{{ formatDate(request.createdAt) }}</span>
              <span v-if="request.budgetRange" class="request-budget">{{ formatBudgetRange(request.budgetRange) }}</span>
            </div>
          </div>
          <div class="request-badges">
            <span class="priority-badge" :class="request.priority.toLowerCase()">
              {{ getPriorityLabel(request.priority) }}
            </span>
            <span class="status-badge" :class="request.status.toLowerCase()">
              {{ getStatusLabel(request.status) }}
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

        <div v-if="request.assignedFreelancer" class="request-freelancer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span>
            Dodijeljeno: {{ request.assignedFreelancer.firstName }} {{ request.assignedFreelancer.lastName }}
            <span v-if="request.assignedFreelancer.company">({{ request.assignedFreelancer.company }})</span>
          </span>
        </div>

        <div v-if="request.quotedAmount" class="request-quote">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
          <span>Ponuda: {{ formatCurrency(request.quotedAmount) }}</span>
        </div>

        <div v-if="request.freelancerResponse" class="request-response">
          <h4>Odgovor freelancera:</h4>
          <p>{{ request.freelancerResponse }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showAIModal" class="modal-overlay" @click="closeAIModal">
    <div class="modal-content ai-modal" @click.stop>
      <div class="modal-header">
        <h3>🤖 AI pomoć za opis projekta</h3>
        <button type="button" @click="closeAIModal" class="close-button">×</button>
      </div>
      
      <div class="modal-body">
        <p class="ai-help-text">
          Opišite ukratko što želite u vašem projektu, a AI će pomoći stvoriti detaljan opis koji će pomoći freelancerima razumjeti vaše potrebe.
        </p>
        
        <div class="form-group">
          <label for="aiPrompt" class="form-label">Ukratko opišite vaš projekt:</label>
          <textarea
            id="aiPrompt"
            v-model="aiPrompt"
            class="form-textarea"
            rows="3"
            placeholder="Npr. 'Trebam web stranicu za moju pekarnicu s online narudžbama'"
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeAIModal" class="cancel-button">
            Odustani
          </button>
          <button 
            type="button" 
            @click="generateDescription" 
            class="submit-button ai-generate"
            :disabled="!aiPrompt.trim() || isGenerating"
          >
            <span v-if="isGenerating">🤖 Generiram...</span>
            <span v-else>🤖 Generiraj opis</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { clientPortalService } from '../../services/clientPortalService'
import { toastService } from '../../services/toastService'
import aiService from '../../services/aiService'
import type { ProjectRequest, CreateProjectRequestData } from '../../services/clientPortalService'
import type { GenerateDescriptionData } from '../../services/aiService'

const requests = ref<ProjectRequest[]>([])
const isLoading = ref(false)
const error = ref('')
const showCreateForm = ref(false)
const isCreating = ref(false)

const createForm = reactive<CreateProjectRequestData>({
  title: '',
  description: '',
  budgetRange: '',
  deadline: '',
  priority: 'MEDIUM'
})

const createErrors = reactive({
  title: '',
  description: '',
  general: ''
})

const showAIModal = ref(false)
const aiPrompt = ref('')
const isGenerating = ref(false)

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('hr-HR')
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function formatBudgetRange(range: string) {
  const rangeMap: Record<string, string> = {
    'under-1000': 'Do 1.000 €',
    '1000-5000': '1.000 € - 5.000 €',
    '5000-10000': '5.000 € - 10.000 €',
    '10000-25000': '10.000 € - 25.000 €',
    'over-25000': 'Preko 25.000 €'
  }
  return rangeMap[range] || range
}

function getPriorityLabel(priority: string) {
  const priorityMap: Record<string, string> = {
    'LOW': 'Nizak',
    'MEDIUM': 'Srednji',
    'HIGH': 'Visok',
    'URGENT': 'Hitan'
  }
  return priorityMap[priority] || priority
}

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    'PENDING': 'Na čekanju',
    'ASSIGNED': 'Dodijeljeno',
    'QUOTED': 'Ponuđeno',
    'ACCEPTED': 'Prihvaćeno',
    'REJECTED': 'Odbačeno',
    'COMPLETED': 'Završeno'
  }
  return statusMap[status] || status
}

function clearCreateErrors() {
  createErrors.title = ''
  createErrors.description = ''
  createErrors.general = ''
}

function validateCreateForm() {
  clearCreateErrors()
  let isValid = true

  if (!createForm.title.trim()) {
    createErrors.title = 'Naslov je obavezan'
    isValid = false
  }

  if (!createForm.description.trim()) {
    createErrors.description = 'Opis je obavezan'
    isValid = false
  }

  return isValid
}

function closeCreateForm() {
  showCreateForm.value = false

  Object.assign(createForm, {
    title: '',
    description: '',
    budgetRange: '',
    deadline: '',
    priority: 'MEDIUM'
  })
  clearCreateErrors()
}

async function handleCreateRequest() {
  if (!validateCreateForm()) return

  isCreating.value = true
  clearCreateErrors()

  try {
    await clientPortalService.createProjectRequest({
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      budgetRange: createForm.budgetRange || undefined,
      deadline: createForm.deadline || undefined,
      priority: createForm.priority
    })

    toastService.success(
      'Vaš zahtjev je uspješno poslan i bit će obrađen uskoro.',
      'Zahtjev stvoren!'
    )
    
    closeCreateForm()
    await loadRequests() // Reload the list
  } catch (err: any) {
    console.error('Project request creation error:', err.response?.data)
    
    if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {

      const errors = err.response.data.errors
      for (const error of errors) {
        if (error.includes('title:')) {
          createErrors.title = error.split('title: ')[1] || 'Naslov je obavezan'
        }
        if (error.includes('description:')) {
          createErrors.description = error.split('description: ')[1] || 'Opis je obavezan'
        }
      }
      createErrors.general = 'Molimo popravite greške u formi'
      toastService.error('Molimo popravite greške u formi', 'Neispravni podaci')
    } else {
      const message = err.response?.data?.message || 'Greška pri stvaranju zahtjeva'
      createErrors.general = message
      toastService.error(message, 'Greška')
    }
  } finally {
    isCreating.value = false
  }
}

async function loadRequests() {
  isLoading.value = true
  error.value = ''

  try {
    const projectRequests = await clientPortalService.getProjectRequests()
    requests.value = projectRequests
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Greška pri učitavanju zahtjeva'
  } finally {
    isLoading.value = false
  }
}

function closeAIModal() {
  showAIModal.value = false
  aiPrompt.value = ''
}

async function generateDescription() {
  if (!aiPrompt.value.trim()) {
    toastService.error('Molimo unesite opis projekta', 'Nedostaje opis')
    return
  }

  isGenerating.value = true
  
  try {
    const requestData: GenerateDescriptionData = {
      userPrompt: aiPrompt.value.trim(),
      projectTitle: createForm.title.trim() || undefined,
      budgetRange: createForm.budgetRange || undefined,
      priority: createForm.priority,
      deadline: createForm.deadline || undefined
    }

    const generatedDescription = await aiService.generateProjectDescriptionForClient(requestData)

    createForm.description = generatedDescription

    closeAIModal()
    
    toastService.success(
      'AI opis je uspješno generiran i ustavljen u polje opisa!',
      'Opis generiran!'
    )
  } catch (err: any) {
    console.error('AI generation error:', err)
    toastService.error(
      'Greška pri generiranju opisa. Molimo pokušajte ponovo.',
      'AI greška'
    )
  } finally {
    isGenerating.value = false
  }
}

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
  loadRequests()
})
</script>

<style scoped>
.project-requests {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.create-button:hover {
  background-color: var(--primary-hover);
}

.create-button.primary {
  margin-top: 1rem;
}

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
  z-index: 50;
  padding: 1rem;
}

.modal-content {
  background-color: var(--bg-primary);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.create-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: var(--error);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-error {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-error.general {
  background-color: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.submit-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: var(--error);
  margin-bottom: 1rem;
}

.retry-button {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: var(--primary-hover);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.request-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.request-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.request-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.request-title-section {
  flex: 1;
}

.request-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.request-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
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
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.priority-badge.medium {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.priority-badge.high {
  background-color: var(--error-bg);
  color: var(--error);
}

.priority-badge.urgent {
  background-color: var(--error);
  color: white;
}

.status-badge.pending {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.status-badge.assigned {
  background-color: var(--primary-light);
  color: var(--primary);
}

.status-badge.quoted {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.status-badge.accepted {
  background-color: var(--success-bg);
  color: var(--success);
}

.status-badge.rejected {
  background-color: var(--error-bg);
  color: var(--error);
}

.status-badge.completed {
  background-color: var(--success);
  color: white;
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
.request-freelancer,
.request-quote {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.request-response {
  margin-top: 1rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 0.375rem;
}

.request-response h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.request-response p {
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .request-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .request-badges {
    flex-direction: row;
    align-items: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-content {
    margin: 0;
    border-radius: 0;
    height: 100%;
    max-height: none;
  }
}

.skeleton-loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.skeleton-title {
  height: 1.5rem;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s infinite;
  border-radius: 0.25rem;
}

.skeleton-status {
  height: 1.5rem;
  width: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s infinite;
  border-radius: 0.75rem;
}

.skeleton-content {
  margin-bottom: 1rem;
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s infinite;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-line.short {
  width: 75%;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-date,
.skeleton-priority {
  height: 1rem;
  width: 100px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s infinite;
  border-radius: 0.25rem;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.form-label-with-ai {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.ai-help-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--primary-color);
  background: var(--bg-primary);
  border: 1px solid var(--primary-color);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.ai-help-button:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.ai-modal {
  max-width: 600px;
}

.ai-help-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.375rem;
  border-left: 4px solid var(--primary-color);
}

.ai-generate {
  background: linear-gradient(135deg, var(--primary-color), #7c3aed);
}

.ai-generate:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.ai-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .form-label-with-ai {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .ai-help-button {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>