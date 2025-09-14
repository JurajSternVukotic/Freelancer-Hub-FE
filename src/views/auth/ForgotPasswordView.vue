<template>
  <div class="auth-form">
    <div class="form-header">
      <h2 class="form-title">Zaboravljena lozinka</h2>
      <p class="form-subtitle">Unesite email adresu za resetiranje lozinke</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="forgot-form">
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
        />
        <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
      </div>
      
      <button
        type="submit"
        class="btn btn-primary btn-lg w-full"
        :disabled="isLoading || !form.email"
      >
        <svg v-if="isLoading" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
          <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/>
        </svg>
        <span v-else>Pošaljite link za resetiranje</span>
      </button>
    </form>
    
    <div class="form-footer">
      <p>
        Sjetili ste se lozinke?
        <router-link to="/auth/login" class="login-link">
          Prijavite se
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const form = ref({
  email: ''
})

const errors = ref<Record<string, string>>({})
const isLoading = ref(false)

function validateForm() {
  errors.value = {}
  
  if (!form.value.email) {
    errors.value.email = 'Email adresa je obavezna'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Unesite valjanu email adresu'
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Link za resetiranje lozinke je poslan na vašu email adresu')
  } catch (error) {
    toast.error('Greška pri slanju linka za resetiranje lozinke')
  } finally {
    isLoading.value = false
  }
}
</script>