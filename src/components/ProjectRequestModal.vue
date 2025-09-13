<template>
  <div v-if="show" class="modal-backdrop" @click="handleBackdropClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>{{ isUpdate ? 'Ažuriraj odgovor' : 'Prihvati zahtjev' }}</h2>
        <button @click="closeModal" class="close-btn" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        
        <div class="request-summary">
          <h3>{{ request?.title }}</h3>
          <div class="summary-details">
            <div><strong>Klijent:</strong> {{ request?.client?.company }}</div>
            <div v-if="request?.budgetRange"><strong>Proračun:</strong> {{ request?.budgetRange }}</div>
            <div v-if="request?.deadline"><strong>Rok:</strong> {{ formatDate(request?.deadline) }}</div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="response-form">
          <div class="form-group">
            <label for="freelancerResponse" class="form-label">
              Vaš odgovor / komentar <span class="required">*</span>
            </label>
            <textarea
              id="freelancerResponse"
              v-model="formData.freelancerResponse"
              class="form-textarea"
              rows="4"
              placeholder="Objasnite svoj pristup projektu, zašto ste pravi izbor, ili postavite pitanja..."
              required
            ></textarea>
            <div v-if="errors.freelancerResponse" class="error-message">
              {{ errors.freelancerResponse }}
            </div>
          </div>

          <div class="form-group">
            <label for="quotedAmount" class="form-label">
              Predložena cijena (€) <span class="required">*</span>
            </label>
            <div class="currency-input">
              <span class="currency-symbol">€</span>
              <input
                id="quotedAmount"
                v-model.number="formData.quotedAmount"
                type="number"
                class="form-input currency-value"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div v-if="errors.quotedAmount" class="error-message">
              {{ errors.quotedAmount }}
            </div>
            <div class="form-hint">
              Unesite ukupnu cijenu za kompletan projekt
            </div>
          </div>

          <div class="form-group">
            <label for="estimatedHours" class="form-label">
              Procjena sati rada
            </label>
            <input
              id="estimatedHours"
              v-model.number="formData.estimatedHours"
              type="number"
              class="form-input"
              placeholder="40"
              min="0"
              step="0.5"
            />
            <div class="form-hint">
              Opcionalno: pomoći će vam u praćenju napretka
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="formData.availableImmediately"
                type="checkbox"
                class="checkbox"
              />
              <span class="checkmark"></span>
              Mogu početi odmah
            </label>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Odustani
            </button>
            <button type="submit" :disabled="isSubmitting" class="btn btn-primary">
              <span v-if="isSubmitting" class="loading-spinner"></span>
              {{ isSubmitting ? 'Šaljem...' : (isUpdate ? 'Ažuriraj' : 'Pošalji zahtjev') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

interface ProjectRequest {
  id: string;
  title: string;
  description: string;
  budgetRange?: string;
  deadline?: string;
  client?: {
    company: string;
    contactPerson: string;
    email: string;
  };
  assignedTo?: string;
  freelancerResponse?: string;
  quotedAmount?: number;
  estimatedHours?: number;
  availableImmediately?: boolean;
}

interface Props {
  show: boolean;
  request: ProjectRequest | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'submit', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isSubmitting = ref(false);

const formData = ref({
  freelancerResponse: '',
  quotedAmount: null as number | null,
  estimatedHours: null as number | null,
  availableImmediately: false
});

const errors = ref({
  freelancerResponse: '',
  quotedAmount: ''
});

const isUpdate = computed(() => {
  return props.request?.freelancerResponse || props.request?.quotedAmount;
});

watch(() => props.request, (newRequest) => {
  if (newRequest) {
    formData.value = {
      freelancerResponse: newRequest.freelancerResponse || '',
      quotedAmount: newRequest.quotedAmount || null,
      estimatedHours: newRequest.estimatedHours || null,
      availableImmediately: newRequest.availableImmediately || false
    };
  }
}, { immediate: true });

watch(() => props.show, (newShow) => {
  if (newShow) {
    errors.value = {
      freelancerResponse: '',
      quotedAmount: ''
    };
  }
});

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: hr });
  } catch {
    return dateString;
  }
};

const closeModal = () => {
  emit('close');
};

const handleBackdropClick = () => {
  closeModal();
};

const validateForm = () => {
  errors.value = {
    freelancerResponse: '',
    quotedAmount: ''
  };

  let hasErrors = false;

  if (!formData.value.freelancerResponse?.trim()) {
    errors.value.freelancerResponse = 'Odgovor je obavezan';
    hasErrors = true;
  } else if (formData.value.freelancerResponse.length < 20) {
    errors.value.freelancerResponse = 'Odgovor mora imati najmanje 20 znakova';
    hasErrors = true;
  }

  if (!formData.value.quotedAmount || formData.value.quotedAmount <= 0) {
    errors.value.quotedAmount = 'Cijena je obavezna i mora biti veća od 0';
    hasErrors = true;
  }

  return !hasErrors;
};

const handleSubmit = async () => {
  if (!validateForm() || !props.request) return;

  isSubmitting.value = true;
  
  try {
    const submitData = {
      requestId: props.request.id,
      freelancerResponse: formData.value.freelancerResponse,
      quotedAmount: formData.value.quotedAmount,
      estimatedHours: formData.value.estimatedHours || undefined,
      availableImmediately: formData.value.availableImmediately
    };

    emit('submit', submitData);
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.modal-backdrop {
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

.modal-container {
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

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
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

.close-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.request-summary {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.request-summary h3 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.summary-details {
  display: grid;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.summary-details strong {
  color: var(--text-primary);
}

.response-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.required {
  color: #dc2626;
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

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.currency-input {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  z-index: 1;
}

.currency-value {
  padding-left: 2rem;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  position: relative;
  cursor: pointer;
}

.checkbox:checked {
  background: var(--primary-color, #3b82f6);
  border-color: var(--primary-color, #3b82f6);
}

.checkbox:checked::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 4px;
  width: 3px;
  height: 6px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-tertiary);
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .modal-container {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .modal-header,
  .modal-body {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
  }
}
</style>