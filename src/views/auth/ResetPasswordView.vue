<template>
  <div class="auth-form">
    <div class="form-header">
      <h2 class="form-title">Resetiranje lozinke</h2>
      <p class="form-subtitle">Unesite novu lozinku za svoj račun</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="reset-form">
      <div class="form-group">
        <label for="password" class="form-label">Nova lozinka</label>
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
      </div>
      
      <div class="form-group">
        <label for="confirmPassword" class="form-label">Potvrdite lozinku</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          class="form-input"
          :class="{ 'error': errors.confirmPassword }"
          placeholder="••••••••"
          required
        />
        <div v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</div>
      </div>
      
      <button
        type="submit"
        class="btn btn-primary btn-lg w-full"
        :disabled="isLoading || !isFormValid"
      >
        <svg v-if="isLoading" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
          <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/>
        </svg>
        <span v-else>Resetiraj lozinku</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

interface Props {
  token: string
}

const props = defineProps<Props>()
const router = useRouter()
const toast = useToast()

const form = ref({
  password: '',
  confirmPassword: ''
})

const errors = ref<Record<string, string>>({})
const isLoading = ref(false)
const showPassword = ref(false)

const isFormValid = computed(() => {
  return form.value.password && form.value.confirmPassword && !Object.keys(errors.value).length
})

function validateForm() {
  errors.value = {}
  
  if (!form.value.password) {
    errors.value.password = 'Lozinka je obavezna'
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Lozinka mora imati najmanje 8 karaktera'
  }
  
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Potvrdite lozinku'
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Lozinke se ne podudaraju'
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Lozinka je uspješno resetirana')
    router.push('/auth/login')
  } catch (error) {
    toast.error('Greška pri resetiranju lozinke')
  } finally {
    isLoading.value = false
  }
}
</script>