<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Generiraj račun</h1>
      <p class="text-gray-600">
        Odaberite projekt i razdoblje za generiranje računa iz logovanih sati i troškova.
      </p>
    </div>

    <div class="bg-white shadow-sm rounded-lg p-6">
      <form @submit.prevent="generateInvoice" class="space-y-6">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Projekt <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.projectId"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Odaberite projekt...</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }} - {{ project.client.company }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Datum početka <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.startDate"
              type="date"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Datum kraja <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.endDate"
              type="date"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Datum dospijeća
          </label>
          <input
            v-model="formData.dueDate"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-sm text-gray-500 mt-1">
            Ako nije uneseno, automatski će se postaviti na 30 dana od danas.
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Napomene
          </label>
          <textarea
            v-model="formData.notes"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Dodatne napomene za račun..."
          ></textarea>
        </div>

        <div v-if="formData.projectId && formData.startDate && formData.endDate" class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-medium text-blue-900 mb-2">Pregled perioda:</h4>
          <p class="text-sm text-blue-800">
            <strong>Projekt:</strong> {{ selectedProject?.name }}<br>
            <strong>Klijent:</strong> {{ selectedProject?.client.company }}<br>
            <strong>Period:</strong> {{ formatDate(formData.startDate) }} - {{ formatDate(formData.endDate) }}
          </p>
          
          <div v-if="previewData" class="mt-3 pt-3 border-t border-blue-200">
            <p class="text-sm text-blue-800">
              <strong>{{ previewData.timeEntries }} unosa vremena</strong> 
              ({{ previewData.totalHours }} sati)<br>
              <strong>{{ previewData.expenses }} troškova</strong>
              <span v-if="previewData.totalExpenses > 0">
                ({{ invoiceService.formatCurrency(previewData.totalExpenses) }})
              </span>
            </p>
          </div>
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
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

        <div class="flex justify-between pt-4">
          <router-link
            to="/invoices"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Odustani
          </router-link>
          
          <button
            type="submit"
            :disabled="loading || !canGenerate"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Generiram...' : 'Generiraj račun' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { invoiceService, type GenerateInvoiceData } from '@/services/invoiceService'
import { projectService } from '@/services/projectService'

const router = useRouter()

const loading = ref(false)
const projects = ref<any[]>([])
const errorMessage = ref('')
const previewData = ref<any>(null)

const formData = ref<GenerateInvoiceData>({
  projectId: '',
  startDate: '',
  endDate: '',
  dueDate: '',
  notes: ''
})

const selectedProject = computed(() => {
  return projects.value.find(p => p.id === formData.value.projectId)
})

const canGenerate = computed(() => {
  return formData.value.projectId && 
         formData.value.startDate && 
         formData.value.endDate &&
         new Date(formData.value.startDate) < new Date(formData.value.endDate)
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('hr-HR')
}

const loadProjects = async () => {
  try {
    const response = await projectService.getProjects()
    projects.value = response.data || response || []
  } catch (error) {
    console.error('Error loading projects:', error)
    errorMessage.value = 'Greška pri učitavanju projekata'
  }
}

const loadPreviewData = async () => {
  if (!canGenerate.value) {
    previewData.value = null
    return
  }

  try {

    const [timeEntriesResponse, expensesResponse] = await Promise.all([
      projectService.getProjectTimeEntries(formData.value.projectId),
      projectService.getProjectExpenses(formData.value.projectId)
    ])
    
    const timeEntries = timeEntriesResponse.data || timeEntriesResponse || []
    const expenses = expensesResponse.data || expensesResponse || []

    const startDate = new Date(formData.value.startDate)
    const endDate = new Date(formData.value.endDate)
    
    const filteredTimeEntries = timeEntries.filter((entry: any) => {
      const entryDate = new Date(entry.startTime || entry.createdAt)
      return entryDate >= startDate && entryDate <= endDate
    })
    
    const filteredExpenses = expenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date || expense.createdAt)
      return expenseDate >= startDate && expenseDate <= endDate
    })

    const totalSeconds = filteredTimeEntries.reduce((sum: number, entry: any) => {
      return sum + (Number(entry.duration) || 0)
    }, 0)
    
    const totalExpenses = filteredExpenses.reduce((sum: number, expense: any) => {
      return sum + (Number(expense.amount) || 0)
    }, 0)
    
    previewData.value = {
      timeEntries: filteredTimeEntries.length,
      totalHours: Math.round(totalSeconds / 3600),
      expenses: filteredExpenses.length,
      totalExpenses: totalExpenses
    }
  } catch (error) {
    console.error('Error loading preview data:', error)

    previewData.value = {
      timeEntries: 0,
      totalHours: 0,
      expenses: 0,
      totalExpenses: 0
    }
  }
}

const generateInvoice = async () => {
  if (!canGenerate.value) return

  try {
    loading.value = true
    errorMessage.value = ''

    const response = await invoiceService.generateFromProject(formData.value.projectId, formData.value)

    const invoiceId = response.data?.id || response.id
    if (invoiceId) {
      router.push(`/invoices/${invoiceId}`)
    } else {
      throw new Error('Generated invoice ID not found')
    }
  } catch (error: any) {
    console.error('Error generating invoice:', error)
    
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message?.includes('billable')) {
      errorMessage.value = 'Nema dostupnih naplatnih unosa za odabrani period'
    } else {
      errorMessage.value = 'Greška pri generiranju računa. Pokušajte ponovno.'
    }
  } finally {
    loading.value = false
  }
}

const setDefaultDates = () => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  formData.value.startDate = startOfMonth.toISOString().split('T')[0]
  formData.value.endDate = today.toISOString().split('T')[0]
  
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)
  formData.value.dueDate = dueDate.toISOString().split('T')[0]
}

watch(
  () => [formData.value.projectId, formData.value.startDate, formData.value.endDate],
  () => {
    loadPreviewData()
  },
  { deep: true }
)

onMounted(() => {
  setDefaultDates()
  loadProjects()
})
</script>