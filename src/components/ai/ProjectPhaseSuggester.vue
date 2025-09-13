<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <div class="flex items-center mb-4">
      <div class="mr-3">
        <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>
      <div>
        <h3 class="text-lg font-medium text-gray-900">AI Asistent za planiranje</h3>
        <p class="text-sm text-gray-600">Dobij prijedloge za faze projekta i planiranje</p>
      </div>
    </div>

    <form @submit.prevent="getSuggestions" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Opis projekta <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="formData.projectDescription"
          :disabled="loading"
          rows="4"
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:bg-gray-100"
          placeholder="Opišite projekt što detaljnije... npr. 'Potrebna mi je web stranica za malu tvrtku koja se bavi uslugama. Stranica treba imati kontakt formu, galeriju radova i blog.'"
        ></textarea>
        <div class="text-xs text-gray-500 mt-1">
          {{ formData.projectDescription.length }} / 500 znakova
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tip projekta
          </label>
          <select
            v-model="formData.projectType"
            :disabled="loading"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Auto-detect</option>
            <option value="web">Web development</option>
            <option value="mobile">Mobile app</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="consulting">Konzalting</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Budžet (EUR)
          </label>
          <input
            v-model.number="formData.budget"
            :disabled="loading"
            type="number"
            min="0"
            step="100"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="5000"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Planirani rok
        </label>
        <input
          v-model="formData.timeline"
          :disabled="loading"
          type="text"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          placeholder="npr. 2 mjeseca, 6 tjedana..."
        />
      </div>

      <button
        type="submit"
        :disabled="loading || !formData.projectDescription.trim()"
        class="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {{ loading ? 'Analiziram projekt...' : 'Generiraj prijedloge' }}
      </button>
    </form>

    <div v-if="errorMessage" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Greška</h3>
          <div class="mt-2 text-sm text-red-700">{{ errorMessage }}</div>
        </div>
      </div>
    </div>

    <div v-if="suggestions" class="mt-6 space-y-6">
      
      <div v-if="formData.projectType" class="flex items-center">
        <span class="text-2xl mr-2">{{ aiService.getProjectTypeIcon(formData.projectType) }}</span>
        <span 
          :class="['px-3 py-1 rounded-full text-sm font-medium', aiService.getProjectTypeColor(formData.projectType)]"
        >
          {{ formData.projectType || 'Web Development' }}
        </span>
        <span class="ml-3 text-sm text-gray-600">
          Procijenjeno vrijeme: <strong>{{ suggestions.estimatedDuration }}</strong>
        </span>
      </div>

      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg class="mr-2 h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Predložene faze projekta
        </h4>
        
        <div class="space-y-4">
          <div 
            v-for="(phase, index) in suggestions.phases" 
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {{ index + 1 }}
                </div>
                <h5 class="text-base font-medium text-gray-900">{{ phase.name }}</h5>
              </div>
              <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {{ aiService.formatDuration(phase.duration) }}
              </span>
            </div>
            
            <p v-if="phase.description" class="text-sm text-gray-600 mb-3 ml-11">
              {{ phase.description }}
            </p>
            
            <div class="ml-11">
              <h6 class="text-sm font-medium text-gray-700 mb-2">Isporučivi dijelovi:</h6>
              <ul class="text-sm text-gray-600 space-y-1">
                <li v-for="deliverable in phase.deliverables" :key="deliverable" class="flex items-center">
                  <svg class="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ deliverable }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="suggestions.recommendations?.length">
        <h4 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <svg class="mr-2 h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Preporuke
        </h4>
        
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <ul class="text-sm text-amber-800 space-y-2">
            <li v-for="recommendation in suggestions.recommendations" :key="recommendation" class="flex items-start">
              <svg class="mr-2 h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ recommendation }}
            </li>
          </ul>
        </div>
      </div>

      <div class="flex space-x-3 pt-4 border-t">
        <button
          @click="createProjectFromSuggestions"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Stvori projekt
        </button>
        
        <button
          @click="exportSuggestions"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Izvozi plan
        </button>
        
        <button
          @click="clearResults"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Nova analiza
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import aiService, { type ProjectPhaseSuggestion, type SuggestPhasesData } from '@/services/aiService'

const loading = ref(false)
const errorMessage = ref('')
const suggestions = ref<ProjectPhaseSuggestion | null>(null)

const formData = reactive<SuggestPhasesData>({
  projectDescription: '',
  projectType: '',
  budget: undefined,
  timeline: ''
})

const getSuggestions = async () => {
  if (!formData.projectDescription.trim()) return

  try {
    loading.value = true
    errorMessage.value = ''
    
    const result = await aiService.suggestProjectPhases(formData)
    suggestions.value = result
  } catch (error: any) {
    console.error('Error getting AI suggestions:', error)
    
    if (error.response?.status === 501) {
      errorMessage.value = 'AI usluga trenutno nije dostupna. Koriste se preddefinirani prijedlozi.'

      try {
        const result = await aiService.suggestProjectPhases(formData)
        suggestions.value = result
        errorMessage.value = ''
      } catch (stubError) {
        errorMessage.value = 'Greška pri dohvaćanju prijedloga. Pokušajte ponovno.'
      }
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Greška pri dohvaćanju AI prijedloga. Pokušajte ponovno.'
    }
  } finally {
    loading.value = false
  }
}

const createProjectFromSuggestions = () => {

  console.log('Creating project from suggestions:', suggestions.value)
  alert('Funkcija stvaranja projekta će biti implementirana uskoro!')
}

const exportSuggestions = () => {
  if (!suggestions.value) return

  let exportText = `PLAN PROJEKTA\n\n`
  exportText += `Opis: ${formData.projectDescription}\n`
  if (formData.projectType) exportText += `Tip: ${formData.projectType}\n`
  if (formData.budget) exportText += `Budžet: ${formData.budget} EUR\n`
  if (formData.timeline) exportText += `Rok: ${formData.timeline}\n`
  exportText += `Procijenjeno vrijeme: ${suggestions.value.estimatedDuration}\n\n`
  
  exportText += `FAZE PROJEKTA:\n\n`
  suggestions.value.phases.forEach((phase, index) => {
    exportText += `${index + 1}. ${phase.name} (${phase.duration})\n`
    if (phase.description) exportText += `   ${phase.description}\n`
    exportText += `   Isporučivi dijelovi:\n`
    phase.deliverables.forEach(deliverable => {
      exportText += `   • ${deliverable}\n`
    })
    exportText += `\n`
  })
  
  if (suggestions.value.recommendations?.length) {
    exportText += `PREPORUKE:\n\n`
    suggestions.value.recommendations.forEach(rec => {
      exportText += `• ${rec}\n`
    })
  }

  const blob = new Blob([exportText], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'plan-projekta.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const clearResults = () => {
  suggestions.value = null
  errorMessage.value = ''
  formData.projectDescription = ''
  formData.projectType = ''
  formData.budget = undefined
  formData.timeline = ''
}
</script>