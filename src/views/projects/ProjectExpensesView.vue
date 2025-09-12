<template>
  <div class="project-expenses">
    <div class="page-header">
      <div class="header-left">
        <h1>💰 Troškovi projekta</h1>
        <p v-if="project">{{ project.name }}</p>
      </div>
      <div class="header-actions">
        <button @click="showAddForm = true" class="btn btn-primary">
          + Dodaj trošak
        </button>
        <router-link :to="`/projects/${projectId}`" class="btn btn-secondary">
          ← Povratak na projekt
        </router-link>
      </div>
    </div>

    <div v-if="showAddForm || editingExpense" class="expense-form-container">
      <div class="form-card">
        <h3>{{ editingExpense ? 'Uredi trošak' : 'Dodaj novi trošak' }}</h3>
        <form @submit.prevent="saveExpense">
          <div class="form-row">
            <div class="form-group">
              <label for="description">Opis troška *</label>
              <input
                id="description"
                v-model="form.description"
                type="text"
                class="form-input"
                placeholder="Npr. Materijali za projekt"
                required
              />
            </div>
            <div class="form-group">
              <label for="amount">Iznos (€) *</label>
              <input
                id="amount"
                v-model="form.amount"
                type="number"
                step="0.01"
                min="0"
                class="form-input"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="category">Kategorija *</label>
              <select id="category" v-model="form.category" class="form-input" required>
                <option value="">Odaberite kategoriju</option>
                <option value="MATERIJALI">Materijali</option>
                <option value="SOFTVER">Softver</option>
                <option value="PUTOVANJE">Putovanje</option>
                <option value="MARKETING">Marketing</option>
                <option value="OSTALO">Ostalo</option>
              </select>
            </div>
            <div class="form-group">
              <label for="date">Datum troška *</label>
              <input
                id="date"
                v-model="form.date"
                type="date"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>
                <input
                  v-model="form.billable"
                  type="checkbox"
                  class="form-checkbox"
                />
                Naplativo klijentu
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ editingExpense ? 'Ažuriraj' : 'Dodaj' }} trošak
            </button>
            <button type="button" @click="cancelForm" class="btn btn-secondary">
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="expenses-list">
      <div v-if="isLoading && !expenses.length" class="loading">
        Učitavanje troškova...
      </div>
      
      <div v-else-if="!expenses.length" class="empty-state">
        <h3>Nema troškova</h3>
        <p>Dodajte prvi trošak za ovaj projekt.</p>
        <button @click="showAddForm = true" class="btn btn-primary">
          + Dodaj trošak
        </button>
      </div>

      <div v-else class="expenses-table">
        <table class="table">
          <thead>
            <tr>
              <th>Opis</th>
              <th>Kategorija</th>
              <th>Datum</th>
              <th>Iznos</th>
              <th>Status</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in expenses" :key="expense.id" class="expense-row">
              <td class="expense-description">{{ expense.description }}</td>
              <td>
                <span class="category-badge">{{ expense.category }}</span>
              </td>
              <td>{{ formatDate(expense.date) }}</td>
              <td class="expense-amount">€{{ Number(expense.amount).toFixed(2) }}</td>
              <td>
                <span :class="expense.billable ? 'status-billable' : 'status-internal'">
                  {{ expense.billable ? 'Naplativo' : 'Interno' }}
                </span>
              </td>
              <td class="expense-actions">
                <button @click="editExpense(expense)" class="btn-icon" title="Uredi">
                  ✏️
                </button>
                <button @click="deleteExpense(expense)" class="btn-icon btn-danger" title="Obriši">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="expenses-summary">
          <div class="summary-card">
            <h4>Ukupno troškova</h4>
            <p class="total-amount">€{{ totalAmount.toFixed(2) }}</p>
          </div>
          <div class="summary-card">
            <h4>Naplativo</h4>
            <p class="billable-amount">€{{ billableAmount.toFixed(2) }}</p>
          </div>
          <div class="summary-card">
            <h4>Interno</h4>
            <p class="internal-amount">€{{ internalAmount.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { apiHelper } from '@/services/api'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  billable: boolean
  receipt?: string
}

const route = useRoute()
const projectsStore = useProjectsStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectsStore.currentProject)
const isLoading = ref(false)
const expenses = ref<Expense[]>([])
const showAddForm = ref(false)
const editingExpense = ref<Expense | null>(null)

const form = reactive({
  description: '',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  billable: true
})

const totalAmount = computed(() => 
  expenses.value.reduce((sum, expense) => sum + Number(expense.amount), 0)
)

const billableAmount = computed(() => 
  expenses.value.filter(e => e.billable).reduce((sum, expense) => sum + Number(expense.amount), 0)
)

const internalAmount = computed(() => 
  expenses.value.filter(e => !e.billable).reduce((sum, expense) => sum + Number(expense.amount), 0)
)

const fetchExpenses = async () => {
  try {
    isLoading.value = true
    const response = await apiHelper.get(`/projects/${projectId.value}/expenses`)
    expenses.value = response || []
  } catch (error) {
    console.error('Error fetching expenses:', error)
    expenses.value = []
  } finally {
    isLoading.value = false
  }
}

const saveExpense = async () => {
  try {
    isLoading.value = true
    
    const expenseData = {
      description: form.description,
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      billable: form.billable
    }

    if (editingExpense.value) {

      await apiHelper.put(`/projects/${projectId.value}/expenses/${editingExpense.value.id}`, expenseData)
    } else {

      await apiHelper.post(`/projects/${projectId.value}/expenses`, expenseData)
    }

    await fetchExpenses()
    cancelForm()
  } catch (error) {
    console.error('Error saving expense:', error)
    alert('Greška pri spremanju troška. Molimo pokušajte ponovo.')
  } finally {
    isLoading.value = false
  }
}

const editExpense = (expense: Expense) => {
  editingExpense.value = expense
  form.description = expense.description
  form.amount = expense.amount.toString()
  form.category = expense.category
  form.date = expense.date.split('T')[0]
  form.billable = expense.billable
  showAddForm.value = true
}

const deleteExpense = async (expense: Expense) => {
  if (confirm('Jeste li sigurni da želite obrisati ovaj trošak?')) {
    try {
      isLoading.value = true
      await apiHelper.delete(`/projects/${projectId.value}/expenses/${expense.id}`)
      await fetchExpenses()
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert('Greška pri brisanju troška. Molimo pokušajte ponovo.')
    } finally {
      isLoading.value = false
    }
  }
}

const cancelForm = () => {
  showAddForm.value = false
  editingExpense.value = null

  form.description = ''
  form.amount = ''
  form.category = ''
  form.date = new Date().toISOString().split('T')[0]
  form.billable = true
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: hr })
  } catch {
    return dateString
  }
}

onMounted(async () => {
  try {

    await Promise.all([
      projectsStore.fetchProject(projectId.value),
      fetchExpenses()
    ])
  } catch (error) {
    console.error('Error loading project expenses:', error)
  }
})
</script>

<style scoped>
.project-expenses {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-left h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.header-left p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.expense-form-container {
  margin-bottom: 2rem;
}

.form-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.form-card h3 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input, .form-checkbox {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-checkbox {
  width: auto;
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.expenses-table {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: var(--bg-secondary);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-primary);
}

.expense-row:hover {
  background: var(--bg-secondary);
}

.category-badge {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.expense-amount {
  font-weight: 600;
  color: var(--primary-color);
}

.status-billable {
  color: var(--success-color);
  font-weight: 500;
}

.status-internal {
  color: var(--text-muted);
  font-weight: 500;
}

.expense-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background: var(--bg-secondary);
}

.btn-icon.btn-danger:hover {
  background: var(--danger-color);
  color: white;
}

.expenses-summary {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
}

.summary-card {
  flex: 1;
  text-align: center;
}

.summary-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.summary-card p {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.total-amount {
  color: var(--primary-color) !important;
}

.billable-amount {
  color: var(--success-color) !important;
}

.internal-amount {
  color: var(--text-muted) !important;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .project-expenses {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .expenses-summary {
    flex-direction: column;
  }
  
  .table {
    font-size: 0.875rem;
  }
  
  .table th,
  .table td {
    padding: 0.5rem;
  }
}
</style>