<template>
  <div class="invoice-form-view">
    <div class="container">
      
      <div class="page-header">
        <div class="header-nav">
          <router-link to="/invoices" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            Natrag na račune
          </router-link>
        </div>
        
        <div>
          <h1 class="page-title">{{ isEdit ? 'Uredi račun' : 'Novi račun' }}</h1>
          <p class="page-subtitle">
            {{ isEdit ? 'Uredite podatke o računu' : 'Kreirajte novi račun za klijenta' }}
          </p>
        </div>
      </div>

      <div class="form-container">
        <form @submit.prevent="handleSubmit">
          
          <div class="form-section">
            <h3>Osnovni podaci</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="client">Klijent *</label>
                <select 
                  id="client" 
                  v-model="form.clientId" 
                  class="form-select"
                  :class="{ 'error': errors.clientId }"
                  required
                >
                  <option value="">Odaberite klijenta</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.name }}{{ client.company ? ` - ${client.company}` : '' }}
                  </option>
                </select>
                <div v-if="errors.clientId" class="error-message">{{ errors.clientId }}</div>
              </div>
              
              <div class="form-group">
                <label for="number">Broj računa *</label>
                <input
                  id="number"
                  v-model="form.number"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.number }"
                  placeholder="R-2024-001"
                  required
                />
                <div v-if="errors.number" class="error-message">{{ errors.number }}</div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="issueDate">Datum izdavanja *</label>
                <input
                  id="issueDate"
                  v-model="form.date"
                  type="date"
                  class="form-input"
                  :class="{ 'error': errors.issueDate }"
                  required
                />
                <div v-if="errors.issueDate" class="error-message">{{ errors.issueDate }}</div>
              </div>
              
              <div class="form-group">
                <label for="dueDate">Datum dospijeća *</label>
                <input
                  id="dueDate"
                  v-model="form.dueDate"
                  type="date"
                  class="form-input"
                  :class="{ 'error': errors.dueDate }"
                  required
                />
                <div v-if="errors.dueDate" class="error-message">{{ errors.dueDate }}</div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <h3>Stavke računa</h3>
              <button type="button" @click="addItem" class="btn btn-secondary btn-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Dodaj stavku
              </button>
            </div>
            
            <div v-if="form.items.length === 0" class="empty-items">
              <p>Nema dodanih stavki. Kliknite "Dodaj stavku" za početak.</p>
            </div>
            
            <div v-else class="items-list">
              <div
                v-for="(item, index) in form.items"
                :key="index"
                class="item-row"
              >
                <div class="item-number">{{ index + 1 }}.</div>
                
                <div class="item-fields">
                  <div class="form-group">
                    <label>Opis *</label>
                    <input
                      v-model="item.description"
                      type="text"
                      class="form-input"
                      placeholder="Opis usluge/proizvoda"
                      required
                    />
                  </div>
                  
                  <div class="form-group">
                    <label>Detalji</label>
                    <textarea
                      v-model="item.details"
                      class="form-textarea"
                      rows="2"
                      placeholder="Dodatni detalji (opcionalno)"
                    ></textarea>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>Količina *</label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        class="form-input"
                        min="0.01"
                        step="0.01"
                        required
                        @input="calculateItemTotal(item)"
                      />
                    </div>
                    
                    <div class="form-group">
                      <label>Cijena (EUR) *</label>
                      <input
                        v-model.number="item.rate"
                        type="number"
                        class="form-input"
                        min="0.01"
                        step="0.01"
                        required
                        @input="calculateItemTotal(item)"
                      />
                    </div>
                    
                    <div class="form-group">
                      <label>Ukupno</label>
                      <div class="total-display">{{ formatCurrency(item.amount || 0) }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="item-actions">
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="btn btn-danger btn-sm"
                    :disabled="form.items.length === 1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Ukupni iznos</h3>
            
            <div class="totals-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="taxRate">Stopa PDV-a (%)</label>
                  <input
                    id="taxRate"
                    v-model.number="form.taxRate"
                    type="number"
                    class="form-input"
                    min="0"
                    max="100"
                    step="0.01"
                    @input="calculateTotals"
                  />
                </div>
                
                <div class="form-group">
                  <label for="discount">Popust (EUR)</label>
                  <input
                    id="discount"
                    v-model.number="form.discount"
                    type="number"
                    class="form-input"
                    min="0"
                    step="0.01"
                    @input="calculateTotals"
                  />
                </div>
              </div>
              
              <div class="totals-summary">
                <div class="total-row">
                  <span>Međuzbroj:</span>
                  <span>{{ formatCurrency(subtotal) }}</span>
                </div>
                <div v-if="form.taxRate > 0" class="total-row">
                  <span>PDV ({{ form.taxRate }}%):</span>
                  <span>{{ formatCurrency(taxAmount) }}</span>
                </div>
                <div v-if="form.discount > 0" class="total-row discount">
                  <span>Popust:</span>
                  <span>-{{ formatCurrency(form.discount) }}</span>
                </div>
                <div class="total-row final">
                  <span>Ukupno:</span>
                  <span>{{ formatCurrency(totalAmount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Dodatne informacije</h3>
            
            <div class="form-group">
              <label for="notes">Napomene</label>
              <textarea
                id="notes"
                v-model="form.notes"
                class="form-textarea"
                rows="4"
                placeholder="Dodatne napomene ili upute za klijenta"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <router-link to="/invoices" class="btn btn-secondary">
              Odustani
            </router-link>
            
            <button
              type="button"
              @click="saveDraft"
              class="btn btn-secondary"
              :disabled="isSubmitting"
            >
              Spremi kao skicu
            </button>
            
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting || !isFormValid"
            >
              <span v-if="isSubmitting" class="loading-spinner small"></span>
              {{ isEdit ? 'Spremi promjene' : 'Kreiraj račun' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import { useClientsStore } from '@/stores/clients'
import { invoiceService } from '@/services/invoiceService'
import type { Invoice } from '@/types'

const route = useRoute()
const router = useRouter()
const invoicesStore = useInvoicesStore()
const clientsStore = useClientsStore()

const props = defineProps<{
  id?: string
}>()

const isSubmitting = ref(false)
const errors = ref({})

const form = ref({
  clientId: '',
  number: '',
  date: '',
  dueDate: '',
  items: [{
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0,
    taxRate: 0,
    taxAmount: 0
  }],
  subtotal: 0,
  taxRate: 0,
  tax: 0,
  discount: 0,
  total: 0,
  currency: 'EUR',
  notes: '',
  paymentTerms: ''
})

const clients = computed(() => clientsStore.activeClients)
const isLoading = computed(() => invoicesStore.isLoading || clientsStore.isLoading)
const isEdit = computed(() => !!props.id || !!route.params.id)
const currentInvoice = computed(() => invoicesStore.currentInvoice)

const subtotal = computed(() => {
  return form.value.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
})

const taxAmount = computed(() => {

  const taxRate = parseFloat(form.value.taxRate) || 0
  if (taxRate > 0) {
    return subtotal.value * (taxRate / 100)
  }
  return form.value.items.reduce((sum, item) => sum + parseFloat(item.taxAmount || 0), 0)
})

const totalAmount = computed(() => {
  const discount = parseFloat(form.value.discount) || 0
  return subtotal.value + taxAmount.value - discount
})

const isFormValid = computed(() => {
  return form.value.clientId &&
         form.value.number &&
         form.value.date &&
         form.value.dueDate &&
         form.value.items.length > 0 &&
         form.value.items.every(item => item.description && item.quantity > 0 && item.rate > 0)
})

function formatCurrency(amount: number): string {
  return invoiceService.formatCurrency(amount)
}

function addItem() {
  form.value.items.push({
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0,
    taxRate: 0,
    taxAmount: 0
  })
}

function removeItem(index: number) {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
    calculateTotals()
  }
}

function calculateItemTotal(item: any) {

  const quantity = parseFloat(item.quantity) || 0
  const rate = parseFloat(item.rate) || 0
  const taxRate = parseFloat(item.taxRate) || 0
  
  item.amount = quantity * rate
  item.taxAmount = item.amount * (taxRate / 100)
  
  console.log('Calculating item total:', {
    quantity,
    rate,
    amount: item.amount,
    taxRate,
    taxAmount: item.taxAmount
  })
  
  calculateTotals()
}

function calculateTotals() {
  form.value.subtotal = subtotal.value
  form.value.taxAmount = taxAmount.value
  form.value.total = totalAmount.value
}

function generateInvoiceNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `R-${year}-${month}-${random}`
}

function setDefaultDates() {
  const now = new Date()
  const dueDate = new Date(now)
  dueDate.setDate(dueDate.getDate() + 30)
  
  form.value.date = now.toISOString().split('T')[0]
  form.value.dueDate = dueDate.toISOString().split('T')[0]
}

async function handleSubmit() {
  if (!isFormValid.value) {
    console.error('Molimo ispunite sva obavezna polja')
    return
  }
  
  isSubmitting.value = true
  
  try {
    await saveInvoice('SENT')
    console.log(isEdit.value ? 'Račun je uspješno ažuriran' : 'Račun je uspješno kreiran')
    router.push('/invoices')
  } catch (error) {
    console.error('Error saving invoice:', error)
  } finally {
    isSubmitting.value = false
  }
}

async function saveDraft() {
  isSubmitting.value = true
  
  try {
    await saveInvoice('DRAFT')
    console.log('Skica računa je spremljena')
    router.push('/invoices')
  } catch (error) {
    console.error('Error saving draft:', error)
  } finally {
    isSubmitting.value = false
  }
}

async function saveInvoice(status: 'DRAFT' | 'SENT') {
  const invoiceData = {
    ...form.value,
    status,
    subtotal: subtotal.value,
    tax: taxAmount.value,
    total: totalAmount.value
  }

  if (isEdit.value) {
    const id = props.id || route.params.id as string
    await invoicesStore.updateInvoice(id, invoiceData)
  } else {
    await invoicesStore.createInvoice(invoiceData as any)
  }
}

async function fetchClients() {
  try {
    await clientsStore.fetchClients()
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

async function fetchInvoice() {
  if (isEdit.value) {
    try {
      const id = props.id || route.params.id as string
      await invoicesStore.fetchInvoice(id)
      
      const invoice = invoicesStore.currentInvoice
      if (invoice) {
        form.value = {
          clientId: invoice.clientId,
          number: invoice.number,
          issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
          dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: (invoice.items || []).map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            taxRate: item.taxRate || 0,
            taxAmount: item.taxAmount || 0
          })),
          subtotal: invoice.subtotal,
          taxRate: invoice.taxRate || 0,
          taxAmount: invoice.taxAmount,
          discount: invoice.discount || 0,
          total: invoice.total,
          currency: invoice.currency,
          notes: invoice.notes || '',
          paymentTerms: invoice.paymentTerms || ''
        }
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
    }
  }
}

watch(() => form.value.items, () => {
  form.value.items.forEach(calculateItemTotal)
}, { deep: true })

onMounted(async () => {
  await fetchClients()
  
  if (isEdit.value) {
    await fetchInvoice()
  } else {
    form.value.number = generateInvoiceNumber()
    setDefaultDates()
  }
})
</script>

<style scoped>
.invoice-form-view {
  padding: 2rem;
  min-height: 100%;
}

.page-header {
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: var(--primary-color);
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
  font-size: 1.125rem;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input.error,
.form-select.error {
  border-color: var(--error-color);
}

.error-message {
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.empty-items {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px dashed var(--border-color);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.item-row {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
}

.item-number {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.125rem;
  margin-top: 0.5rem;
}

.item-fields {
  flex: 1;
}

.item-actions {
  display: flex;
  align-items: flex-start;
  padding-top: 0.5rem;
}

.total-display {
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  color: var(--text-primary);
  font-weight: 600;
}

.totals-form {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.totals-summary {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.total-row:last-child {
  margin-bottom: 0;
}

.total-row.final {
  font-size: 1.125rem;
  font-weight: 700;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.75rem;
}

.total-row.discount span:last-child {
  color: var(--error-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .invoice-form-view {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .item-row {
    flex-direction: column;
  }
  
  .item-number {
    margin-top: 0;
  }
  
  .totals-form {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>