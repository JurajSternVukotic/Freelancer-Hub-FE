<template>
  <div class="auth-form">
    <div class="form-header">
      <h2 class="form-title">Prijava</h2>
      <p class="form-subtitle">Prijavite se u svoj FreelancerHub račun</p>
    </div>
    
    <div class="login-form">
      <div class="form-group">
        <label for="accountType" class="form-label">Tip računa</label>
        <select
          id="accountType"
          v-model="form.accountType"
          class="form-input"
          :class="{ 'error': errors.accountType }"
          required
        >
          <option value="">Odaberite tip računa</option>
          <option value="freelancer">Freelancer</option>
          <option value="client">Klijent</option>
        </select>
        <div v-if="errors.accountType" class="form-error">{{ errors.accountType }}</div>
      </div>
      
      <div class="form-group">
        <label for="email" class="form-label">Email adresa</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'error': errors.email }"
          placeholder="ana@example.com"
          required
          autofocus
          @keypress.enter.prevent="handleSubmit"
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
            @keypress.enter.prevent="handleSubmit"
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
      </div>
      
      <div class="form-options">
        <label class="checkbox-label">
          <input
            v-model="form.rememberMe"
            type="checkbox"
            class="checkbox-input"
          />
          <span class="checkbox-custom"></span>
          Zapamti me
        </label>
        
        <router-link to="/auth/forgot-password" class="forgot-link">
          Zaboravili ste lozinku?
        </router-link>
      </div>
      
      <div v-if="errors.general" class="form-error general">{{ errors.general }}</div>
      
      <button
        type="button"
        class="btn btn-primary btn-lg w-full"
        :disabled="isLoading || !isFormValid"
        @click="handleSubmit"
      >
        <svg v-if="isLoading" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
          <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/>
        </svg>
        <span v-else>Prijavite se</span>
      </button>
    </div>
    
    <div class="form-footer">
      <p>
        Nemate račun?
        <router-link to="/auth/register" class="register-link">
          Registrirajte se
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useClientAuthStore } from '../../stores/clientAuth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const clientAuthStore = useClientAuthStore()

const form = ref({
  accountType: '',
  email: '',
  password: '',
  rememberMe: false
})

const errors = ref<Record<string, string>>({})
const showPassword = ref(false)

const isLoading = computed(() => authStore.isLoading)
const isFormValid = computed(() => {
  return form.value.accountType && form.value.email && form.value.password && !Object.keys(errors.value).length
})

function validateForm() {
  errors.value = {}
  
  if (errors.value.general) {
    delete errors.value.general
  }
  
  if (!form.value.accountType) {
    errors.value.accountType = 'Tip računa je obavezan'
  }
  
  if (!form.value.email) {
    errors.value.email = 'Email adresa je obavezna'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Unesite valjanu email adresu'
  }
  
  if (!form.value.password) {
    errors.value.password = 'Lozinka je obavezna'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Lozinka mora imati najmanje 6 karaktera'
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSubmit(event?: Event) {
  if (event) {
    event.preventDefault()
  }
  
  if (!validateForm()) {
    return
  }
  
  try {
    if (form.value.accountType === 'freelancer') {
      await authStore.login({
        email: form.value.email,
        password: form.value.password,
        rememberMe: form.value.rememberMe
      })
      
      const redirectTo = (route.query.redirect as string) || '/'
      router.push(redirectTo)
      
    } else if (form.value.accountType === 'client') {
      await clientAuthStore.login({
        email: form.value.email,
        password: form.value.password
      })
      
      router.push('/client/dashboard')
    }
    
  } catch (error: any) {
    console.error('Login error:', error)
    errors.value.general = 'Neispravni podaci za prijavu. Molimo provjerite email i lozinku.'
  }
}

onMounted(() => {
  const emailInput = document.getElementById('email') as HTMLInputElement
  if (emailInput) {
    emailInput.focus()
  }
})
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

.login-form {
  space-y: 1.5rem;
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

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary);
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

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.forgot-link:hover {
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

.register-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.register-link:hover {
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

@media (max-width: 480px) {
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}</style>