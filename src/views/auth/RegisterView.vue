<template>
  <div class="auth-form">
    <div class="form-header">
      <h2 class="form-title">Registracija</h2>
      <p class="form-subtitle">Stvorite svoj FreelancerHub račun</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="register-form">
      <div class="form-group">
        <label class="form-label">Tip računa</label>
        <div class="role-selector">
          <label class="role-option">
            <input
              v-model="form.role"
              type="radio"
              value="FREELANCER"
              class="role-input"
            />
            <div class="role-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span class="role-title">Freelancer</span>
              <span class="role-subtitle">Za samostalne djelatnike</span>
            </div>
          </label>
          
          <label class="role-option">
            <input
              v-model="form.role"
              type="radio"
              value="CLIENT"
              class="role-input"
            />
            <div class="role-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="role-title">Klijent</span>
              <span class="role-subtitle">Za poslodavce</span>
            </div>
          </label>
        </div>
        <div v-if="errors.role" class="form-error">{{ errors.role }}</div>
      </div>
      
      <div v-if="form.role === 'FREELANCER'" class="form-row">
        <div class="form-group">
          <label for="firstName" class="form-label">Ime</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            class="form-input"
            :class="{ 'error': errors.firstName }"
            placeholder="Ana"
            required
          />
          <div v-if="errors.firstName" class="form-error">{{ errors.firstName }}</div>
        </div>
        
        <div class="form-group">
          <label for="lastName" class="form-label">Prezime</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            class="form-input"
            :class="{ 'error': errors.lastName }"
            placeholder="Marić"
            required
          />
          <div v-if="errors.lastName" class="form-error">{{ errors.lastName }}</div>
        </div>
      </div>

      <div v-if="form.role === 'CLIENT'" class="form-row">
        <div class="form-group">
          <label for="company" class="form-label">Naziv kompanije *</label>
          <input
            id="company"
            v-model="form.company"
            type="text"
            class="form-input"
            :class="{ 'error': errors.company }"
            placeholder="Vaša kompanija d.o.o."
            required
          />
          <div v-if="errors.company" class="form-error">{{ errors.company }}</div>
        </div>
        
        <div class="form-group">
          <label for="contactPerson" class="form-label">Kontakt osoba *</label>
          <input
            id="contactPerson"
            v-model="form.contactPerson"
            type="text"
            class="form-input"
            :class="{ 'error': errors.contactPerson }"
            placeholder="Ime Prezime"
            required
          />
          <div v-if="errors.contactPerson" class="form-error">{{ errors.contactPerson }}</div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="email" class="form-label">Email adresa</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'error': errors.email }"
          placeholder="ana.maric@example.com"
          required
        />
        <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
      </div>
      
      <div class="form-group">
        <label for="password" class="form-label">Lozinka</label>
        <div class="password-input">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.password }"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="password-toggle"
          >
            <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
            </svg>
          </button>
        </div>
        <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
        <div class="password-strength">
          <div class="password-meter">
            <div 
              class="password-meter-bar"
              :class="passwordStrength.class"
              :style="{ width: passwordStrength.width }"
            ></div>
          </div>
          <span class="password-meter-text">{{ passwordStrength.text }}</span>
        </div>
      </div>
      
      <div class="form-group">
        <label for="company" class="form-label">
          {{ form.role === 'FREELANCER' ? 'Naziv djelatnosti (opcionalno)' : 'Tvrtka (opcionalno)' }}
        </label>
        <input
          id="company"
          v-model="form.company"
          type="text"
          class="form-input"
          :placeholder="form.role === 'FREELANCER' ? 'Ana Design Studio' : 'ABC d.o.o.'"
        />
      </div>
      
      <div v-if="form.role === 'FREELANCER'" class="form-group">
        <label for="hourlyRate" class="form-label">Satnica (EUR, opcionalno)</label>
        <input
          id="hourlyRate"
          v-model.number="form.hourlyRate"
          type="number"
          step="0.01"
          min="0"
          class="form-input"
          placeholder="50.00"
        />
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="form.acceptTerms"
            type="checkbox"
            class="checkbox-input"
            required
          />
          <span class="checkbox-custom"></span>
          Prihvaćam 
          <a href="#" class="terms-link">Uvjete korištenja</a>
          i
          <a href="#" class="terms-link">Pravila privatnosti</a>
        </label>
        <div v-if="errors.acceptTerms" class="form-error">{{ errors.acceptTerms }}</div>
      </div>
      
      <button
        type="submit"
        class="btn btn-primary btn-lg w-full"
        :disabled="isLoading || !isFormValid"
      >
        <svg v-if="isLoading" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
          <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/>
        </svg>
        <span v-else>Registriraj se</span>
      </button>
    </form>
    
    <div class="form-footer">
      <p>
        Već imate račun?
        <router-link to="/auth/login" class="login-link">
          Prijavite se
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useClientAuthStore } from '../../stores/clientAuth'
import type { RegisterData } from '../../types/auth'

const router = useRouter()
const authStore = useAuthStore()
const clientAuthStore = useClientAuthStore()

const form = ref<RegisterData>({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'FREELANCER',
  company: '',
  contactPerson: '',
  hourlyRate: undefined,
  acceptTerms: false
})

const errors = ref<Record<string, string>>({})
const showPassword = ref(false)

const isLoading = computed(() => authStore.isLoading)

const isFormValid = computed(() => {
  const baseValid = form.value.email && 
                   form.value.password && 
                   form.value.role &&
                   form.value.acceptTerms &&
                   !Object.keys(errors.value).length
  
  if (form.value.role === 'FREELANCER') {
    return baseValid && form.value.firstName && form.value.lastName
  } else if (form.value.role === 'CLIENT') {
    return baseValid && form.value.company && form.value.contactPerson
  }
  
  return baseValid
})

const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return { width: '0%', class: '', text: '' }
  
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score <= 2) return { width: '33%', class: 'weak', text: 'Slaba' }
  if (score <= 3) return { width: '66%', class: 'medium', text: 'Srednja' }
  return { width: '100%', class: 'strong', text: 'Jaka' }
})

function validateForm() {
  errors.value = {}
  
  if (!form.value.email) {
    errors.value.email = 'Email adresa je obavezna'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Unesite valjanu email adresu'
  }
  
  if (!form.value.password) {
    errors.value.password = 'Lozinka je obavezna'
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Lozinka mora imati najmanje 8 karaktera'
  }
  
  if (!form.value.role) {
    errors.value.role = 'Odaberite tip računa'
  }
  
  if (form.value.role === 'FREELANCER') {
    if (!form.value.firstName) {
      errors.value.firstName = 'Ime je obavezno'
    }
    if (!form.value.lastName) {
      errors.value.lastName = 'Prezime je obavezno'
    }
  } else if (form.value.role === 'CLIENT') {
    if (!form.value.company) {
      errors.value.company = 'Naziv kompanije je obavezan'
    }
    if (!form.value.contactPerson) {
      errors.value.contactPerson = 'Kontakt osoba je obavezna'
    }
  }
  
  if (!form.value.acceptTerms) {
    errors.value.acceptTerms = 'Morate prihvatiti uvjete korištenja'
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }
  
  try {
    if (form.value.role === 'CLIENT') {
      const clientData = {
        company: form.value.company,
        contactPerson: form.value.contactPerson,
        email: form.value.email,
        password: form.value.password
      }
      
      await clientAuthStore.register(clientData)
      router.push('/client/dashboard')
    } else {
      const registrationData = {
        email: form.value.email,
        password: form.value.password,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        role: form.value.role,
        company: form.value.company || undefined,
        hourlyRate: form.value.hourlyRate || undefined
      }
      
      await authStore.register(registrationData)
      router.push('/')
    }
  } catch (error: any) {
    console.error('Registration error:', error)
  }
}
</script>

<style scoped>
.auth-form {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.register-form {
  space-y: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.role-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.role-option {
  cursor: pointer;
}

.role-input {
  display: none;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  text-align: center;
}

.role-input:checked + .role-card {
  border-color: var(--primary-color);
  background: rgba(79, 70, 229, 0.05);
}

.role-card svg {
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.role-input:checked + .role-card svg {
  color: var(--primary-color);
}

.role-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.role-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.password-strength {
  margin-top: 0.5rem;
}

.password-meter {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.password-meter-bar {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.password-meter-bar.weak {
  background: var(--danger-color);
}

.password-meter-bar.medium {
  background: var(--warning-color);
}

.password-meter-bar.strong {
  background: var(--success-color);
}

.password-meter-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-radius: 0.25rem;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 2px;
  top: -1px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.terms-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.form-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.form-footer p {
  color: var(--text-secondary);
  margin: 0;
}

.login-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .role-selector {
    grid-template-columns: 1fr;
  }
  
  .role-card {
    padding: 1rem;
  }
}</style>