<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Računi</h1>
        <router-link
          to="/invoices/generate"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Generiraj račun
        </router-link>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              @change="loadInvoices"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Svi statusi</option>
              <option value="DRAFT">Nacrt</option>
              <option value="SENT">Poslan</option>
              <option value="PAID">Plaćen</option>
              <option value="OVERDUE">Prošao rok</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Klijent</label>
            <select
              v-model="filters.clientId"
              @change="loadInvoices"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Svi klijenti</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.company }}
              </option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Očisti filtere
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="invoices.length > 0" class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Broj računa
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Klijent
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projekt
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Iznos
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ invoice.number }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ invoice.client.company }}</div>
                <div class="text-sm text-gray-500">{{ invoice.client.contactPerson }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ invoice.project?.name || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ invoiceService.formatDate(invoice.date) }}</div>
                <div class="text-sm text-gray-500">
                  Rok: {{ invoiceService.formatDate(invoice.dueDate) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ invoiceService.formatCurrency(invoice.total) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    invoiceService.getStatusColor(invoice.status)
                  ]"
                >
                  {{ invoiceService.getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-2">
                  <router-link
                    :to="`/invoices/${invoice.id}`"
                    class="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Prikaži
                  </router-link>
                  
                  <button
                    @click="downloadPDF(invoice)"
                    class="text-green-600 hover:text-green-800 transition-colors"
                  >
                    PDF
                  </button>

                  <select
                    v-if="invoice.status !== 'PAID'"
                    :value="invoice.status"
                    @change="updateStatus(invoice.id, ($event.target as HTMLSelectElement).value)"
                    class="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DRAFT">Nacrt</option>
                    <option value="SENT">Poslan</option>
                    <option value="PAID">Plaćen</option>
                    <option value="OVERDUE">Prošao rok</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <div class="text-gray-500 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Nema računa</h3>
      <p class="text-gray-500 mb-4">Još niste kreirali nijedan račun.</p>
      <router-link
        to="/invoices/generate"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Generiraj prvi račun
      </router-link>
    </div>

    <div v-if="pagination && pagination.pages > 1" class="mt-6 flex justify-between items-center">
      <div class="text-sm text-gray-700">
        Prikazano {{ ((pagination.page - 1) * pagination.limit) + 1 }} - 
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }} od {{ pagination.total }}
      </div>
      <div class="flex space-x-2">
        <button
          :disabled="pagination.page <= 1"
          @click="loadPage(pagination.page - 1)"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prethodna
        </button>
        <button
          :disabled="pagination.page >= pagination.pages"
          @click="loadPage(pagination.page + 1)"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sljedeća
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { invoiceService, type Invoice } from '@/services/invoiceService'
import { clientService, type Client } from '@/services/clientService'

const loading = ref(true)
const invoices = ref<Invoice[]>([])
const clients = ref<Client[]>([])
const pagination = ref<any>(null)

const filters = reactive({
  status: '',
  clientId: '',
  projectId: ''
})

const loadInvoices = async (page = 1) => {
  try {
    loading.value = true
    const response = await invoiceService.getInvoices(filters, page, 10)
    
    invoices.value = response.data || []
    pagination.value = response.pagination || null
  } catch (error) {
    console.error('Error loading invoices:', error)

  } finally {
    loading.value = false
  }
}

const loadClients = async () => {
  try {
    const response = await clientService.getClients()
    clients.value = response.data || []
  } catch (error) {
    console.error('Error loading clients:', error)
  }
}

const clearFilters = () => {
  filters.status = ''
  filters.clientId = ''
  filters.projectId = ''
  loadInvoices()
}

const loadPage = (page: number) => {
  loadInvoices(page)
}

const downloadPDF = async (invoice: Invoice) => {
  try {
    await invoiceService.downloadInvoicePDF(invoice.id, `racun-${invoice.number}.pdf`)
  } catch (error) {
    console.error('Error downloading PDF:', error)

  }
}

const updateStatus = async (invoiceId: string, newStatus: string) => {
  try {
    await invoiceService.updateInvoiceStatus(invoiceId, newStatus)
    await loadInvoices() // Reload to get updated data
  } catch (error) {
    console.error('Error updating invoice status:', error)

  }
}

onMounted(() => {
  loadInvoices()
  loadClients()
})
</script>