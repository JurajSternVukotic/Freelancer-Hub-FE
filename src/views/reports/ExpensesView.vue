<template>
  <div class="expenses-view">
    <div class="container">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Troškovi</h1>
          <p class="page-subtitle">
            Upravljanje troškovima i izdacima za projekte
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="handleNewExpense" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Novi trošak
          </button>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pretraži troškove..."
            class="search-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div class="filter-controls">
          <select v-model="categoryFilter" class="filter-select" @change="applyFilters">
            <option value="">Sve kategorije</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          
          <select v-model="projectFilter" class="filter-select" @change="applyFilters">
            <option value="">Svi projekti</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>

          <select v-model="billableFilter" class="filter-select" @change="applyFilters">
            <option value="">Svi troškovi</option>
            <option value="true">Naplativo</option>
            <option value="false">Nenaplativo</option>
          </select>
          
          <div class="date-filters">
            <input
              v-model="startDateFilter"
              type="date"
              class="filter-date"
              @change="applyFilters"
            />
            <span class="date-separator">-</span>
            <input
              v-model="endDateFilter"
              type="date"
              class="filter-date"
              @change="applyFilters"
            />
          </div>
          
          <button @click="clearFilters" class="btn btn-secondary btn-sm" :disabled="!hasActiveFilters">
            Obriši filtere
          </button>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalAmount) }}</div>
          <div class="stat-label">Ukupni troškovi</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(billableAmount) }}</div>
          <div class="stat-label">Naplativo</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(nonBillableAmount) }}</div>
          <div class="stat-label">Nenaplativo</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalExpenses }}</div>
          <div class="stat-label">Ukupno stavaka</div>
        </div>
      </div>

      <div class="content-card">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p>Učitavanje troškova...</p>
        </div>
        
        <div v-else-if="expenses.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M11.8,10.9c-2.27-0.59-3-1.2-3-2.15c0-1.09,1.01-1.85,2.7-1.85c1.78,0,2.44,0.85,2.5,2.1h2.21c-0.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94,0.42-3.5,1.68-3.5,3.61c0,2.31,1.91,3.46,4.7,4.13c2.5,0.6,3,1.48,3,2.41c0,0.69-0.49,1.79-2.7,1.79c-2.06,0-2.87-0.92-2.98-2.1h-2.2c0.12,2.19,1.76,3.42,3.68,3.83V21h3v-2.15c1.95-0.37,3.5-1.5,3.5-3.55C15.8,12.72,13.93,11.5,11.8,10.9z"/>
          </svg>
          <h3>Nema troškova</h3>
          <p v-if="hasActiveFilters">Nema troškova koji odgovaraju vašim filterima.</p>
          <p v-else>Dodajte svoj prvi trošak.</p>
          <button @click="handleNewExpense" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Novi trošak
          </button>
        </div>

        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Opis</th>
                <th>Kategorija</th>
                <th>Projekt</th>
                <th>Datum</th>
                <th>Iznos</th>
                <th>Status</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in expenses" :key="expense.id" class="table-row">
                <td class="expense-description">
                  <div class="expense-info">
                    <span class="expense-title">{{ expense.description }}</span>
                  </div>
                </td>
                
                <td>
                  <span :class="getCategoryColor(expense.category)" class="category-badge">
                    {{ getCategoryName(expense.category) }}
                  </span>
                </td>
                
                <td>
                  <span v-if="expense.project" class="project-name">
                    {{ expense.project.name }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                
                <td>
                  <div class="expense-date">
                    {{ formatDate(expense.expenseDate) }}
                  </div>
                </td>
                
                <td>
                  <div class="expense-amount">
                    {{ formatCurrency(expense.amount, expense.currency) }}
                  </div>
                </td>
                
                <td>
                  <div class="status-badges">
                    <span v-if="expense.billable" class="status-badge billable">
                      Naplativo
                    </span>
                    <span v-if="expense.reimbursable" class="status-badge reimbursable">
                      Refundabilno
                    </span>
                    <span v-if="!expense.billable && !expense.reimbursable" class="status-badge internal">
                      Interno
                    </span>
                  </div>
                </td>
                
                <td>
                  <div class="action-buttons">
                    <button @click="editExpense(expense)" class="btn-icon" title="Uredi">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button @click="confirmDeleteExpense(expense)" class="btn-icon btn-danger" title="Ukloni">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.totalPages > 1" class="pagination-container">
          <div class="pagination-info">
            Prikazuje se {{ ((pagination.page - 1) * pagination.limit) + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }} od {{ pagination.total }}
          </div>
          
          <div class="pagination-controls">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="btn btn-secondary btn-sm"
            >
              Prethodno
            </button>
            
            <span class="page-numbers">
              <button
                v-for="page in visiblePageNumbers"
                :key="page"
                @click="changePage(page)"
                :class="['page-btn', { active: page === pagination.page }]"
              >
                {{ page }}
              </button>
            </span>
            
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="btn btn-secondary btn-sm"
            >
              Sljedeće
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import { useProjectsStore } from '@/stores/projects'
import { expenseService } from '@/services/expenseService'
import type { Expense } from '@/types'

const expensesStore = useExpensesStore()
const projectsStore = useProjectsStore()

const { 
  expenses, 
  isLoading, 
  error, 
  pagination, 
  filters,
  categories,
  totalExpenses,
  totalAmount,
  billableAmount,
  nonBillableAmount
} = expensesStore

const { projects } = projectsStore

const searchQuery = ref('')
const categoryFilter = ref('')
const projectFilter = ref('')
const billableFilter = ref('')
const startDateFilter = ref('')
const endDateFilter = ref('')
const searchTimeout = ref<NodeJS.Timeout>()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingExpense = ref<Expense | null>(null)
const expenseToDelete = ref<Expense | null>(null)

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || categoryFilter.value || projectFilter.value || 
           billableFilter.value || startDateFilter.value || endDateFilter.value)
})

const visiblePageNumbers = computed(() => {
  const current = pagination.page
  const total = pagination.totalPages
  const delta = 2
  const range = []
  const rangeWithDots = []
  
  for (let i = Math.max(2, current - delta); 
       i <= Math.min(total - 1, current + delta); 
       i++) {
    range.push(i)
  }
  
  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }
  
  rangeWithDots.push(...range)
  
  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else {
    rangeWithDots.push(total)
  }
  
  return rangeWithDots.filter((v, i, arr) => arr.indexOf(v) === i && v !== '...' || v === '...')
})

const debouncedSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    applyFilters()
  }, 300)
}

const applyFilters = async () => {
  const newFilters = {
    search: searchQuery.value,
    category: categoryFilter.value,
    projectId: projectFilter.value,
    billable: billableFilter.value ? billableFilter.value === 'true' : undefined,
    startDate: startDateFilter.value,
    endDate: endDateFilter.value,
    page: 1
  }
  
  try {
    await expensesStore.fetchExpenses(newFilters)
  } catch (error) {
    console.error('Greška pri dohvaćanju troškova:', error)
  }
}

const clearFilters = async () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  projectFilter.value = ''
  billableFilter.value = ''
  startDateFilter.value = ''
  endDateFilter.value = ''
  
  expensesStore.clearFilters()
  await expensesStore.fetchExpenses()
}

const handleNewExpense = () => {

  alert('Dodavanje novog troška će biti dostupno kada se kreira modal komponenta')
}

const changePage = async (page: number) => {
  if (page >= 1 && page <= pagination.totalPages) {
    try {
      await expensesStore.fetchExpenses({ page })
    } catch (error) {
      console.error('Greška pri promjeni stranice:', error)
    }
  }
}

const editExpense = (expense: Expense) => {

  console.log('Edit expense:', expense)
  alert('Uredovanje troška će biti dostupno kada se kreira modal komponenta')
}

const confirmDeleteExpense = (expense: Expense) => {

  if (confirm(`Jeste li sigurni da želite ukloniti trošak '${expense.description}'?`)) {
    deleteExpense(expense)
  }
}

const deleteExpense = async (expense: Expense) => {
  try {
    await expensesStore.deleteExpense(expense.id)
  } catch (error) {
    console.error('Greška pri brisanju troška:', error)
  }
}

const handleExpenseSaved = async (expense: Expense) => {
  await expensesStore.fetchExpenses()
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingExpense.value = null
}

const formatCurrency = (amount: number, currency = 'EUR') => {
  return expenseService.formatCurrency(amount, currency)
}

const formatDate = (date: string) => {
  return expenseService.formatDate(date)
}

const getCategoryName = (categoryId: string) => {
  return expenseService.getCategoryName(categoryId)
}

const getCategoryColor = (categoryId: string) => {
  return expenseService.getCategoryColor(categoryId)
}

onMounted(async () => {
  try {
    await Promise.all([
      expensesStore.fetchExpenses(),
      projectsStore.fetchProjects()
    ])
  } catch (error) {
    console.error('Greška pri dohvaćanju početnih podataka:', error)
  }
})

watch(error, (newError) => {
  if (newError) {
    console.error('Greška u expense store:', newError)
  }
})
</script>

<style scoped>
.expenses-view {
  padding: 2rem;
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filters-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 240px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 120px;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-date {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.filter-date:focus {
  outline: none;
  border-color: var(--primary-color);
}

.date-separator {
  color: var(--text-muted);
  font-weight: 500;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.content-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  overflow: hidden;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: var(--bg-secondary);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
}

.table-row:hover {
  background: var(--bg-secondary);
}

.expense-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.expense-title {
  font-weight: 500;
  color: var(--text-primary);
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.project-name {
  color: var(--text-primary);
  font-weight: 500;
}

.text-muted {
  color: var(--text-muted);
}

.expense-date {
  font-weight: 500;
  color: var(--text-primary);
}

.expense-amount {
  font-weight: 600;
  color: var(--text-primary);
}

.status-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.billable {
  background: var(--success-bg);
  color: var(--success-text);
}

.status-badge.reimbursable {
  background: var(--info-bg);
  color: var(--info-text);
}

.status-badge.internal {
  background: var(--warning-bg);
  color: var(--warning-text);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-icon.btn-danger:hover {
  background: var(--danger-bg);
  color: var(--danger-text);
  border-color: var(--danger-border);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.page-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.page-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:disabled:hover {
  background: inherit;
  color: inherit;
  border-color: inherit;
}

@media (max-width: 768px) {
  .expenses-view {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    justify-content: stretch;
  }
  
  .filter-select,
  .filter-date {
    flex: 1;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .data-table {
    font-size: 0.875rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>