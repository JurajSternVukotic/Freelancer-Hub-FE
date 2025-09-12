<template>
  <div class="financial-dashboard">
    
    <div class="dashboard-header">
      <h1>Financije & Izvještaji</h1>
      <p>Pregled svih financijskih podataka na jednom mjestu</p>

      <div class="filter-bar">
        <div class="filter-group">
          <label>Projekt:</label>
          <select v-model="filters.projectId" @change="refreshData">
            <option value="">Svi projekti</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Od datuma:</label>
          <input v-model="filters.dateFrom" type="date" @change="refreshData">
        </div>
        
        <div class="filter-group">
          <label>Do datuma:</label>
          <input v-model="filters.dateTo" type="date" @change="refreshData">
        </div>
        
        <button @click="refreshData" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Učitava...' : 'Osvježi' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Učitavanje financijskih podataka...</p>
    </div>

    <div v-else class="content-section">
      <div class="summary-cards">
        <div class="summary-card expenses">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Ukupni troškovi</h3>
            <p class="amount">{{ formatCurrency(summary.totalExpenses) }}</p>
          </div>
        </div>
        
        <div class="summary-card proposals">
          <div class="card-icon">📄</div>
          <div class="card-content">
            <h3>Vrijednost ponuda</h3>
            <p class="amount">{{ formatCurrency(summary.totalProposals) }}</p>
          </div>
        </div>
        
        <div class="summary-card retainers">
          <div class="card-icon">🔒</div>
          <div class="card-content">
            <h3>Zadržavanje sredstava</h3>
            <p class="amount">{{ formatCurrency(summary.totalRetainers) }}</p>
          </div>
        </div>
        
        <div class="summary-card invoices">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h3>Ukupni računi</h3>
            <p class="amount">{{ formatCurrency(summary.totalInvoices) }}</p>
          </div>
        </div>
        
        <div class="summary-card profit">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <h3>Neto profit</h3>
            <p class="amount" :class="{ negative: summary.netProfit < 0 }">
              {{ formatCurrency(summary.netProfit) }}
            </p>
          </div>
        </div>
        
        <div class="summary-card hours">
          <div class="card-icon">⏰</div>
          <div class="card-content">
            <h3>Naplativo vrijeme</h3>
            <p class="amount">{{ summary.totalBillableHours }}h</p>
          </div>
        </div>
      </div>

      <div class="financial-sections">

        <div class="section">
          <div class="section-header">
            <h2>Troškovi ({{ expenses.recent?.length || 0 }})</h2>
          </div>
          
          <div v-if="expenses.recent?.length" class="items-table">
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Projekt</th>
                  <th>Kategorija</th>
                  <th>Opis</th>
                  <th>Iznos</th>
                  <th>Naplativo</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="expense in expenses.recent" :key="expense.id">
                  <td>{{ formatDate(expense.date) }}</td>
                  <td>{{ expense.project?.name }}</td>
                  <td>{{ expense.category }}</td>
                  <td>{{ expense.description }}</td>
                  <td>{{ formatCurrency(expense.amount) }}</td>
                  <td>
                    <span :class="expense.billable ? 'badge-success' : 'badge-warning'">
                      {{ expense.billable ? 'Da' : 'Ne' }}
                    </span>
                  </td>
                  <td>
                    <button @click="deleteItem('expenses', expense.id)" class="btn-danger btn-sm">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            <p>Nema troškova za prikaz</p>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Ponude ({{ proposals.recent?.length || 0 }})</h2>
          </div>
          
          <div v-if="proposals.recent?.length" class="items-table">
            <table>
              <thead>
                <tr>
                  <th>Naslov</th>
                  <th>Klijent</th>
                  <th>Status</th>
                  <th>Vrijednost</th>
                  <th>Vrijedi do</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="proposal in proposals.recent" :key="proposal.id">
                  <td>{{ proposal.title }}</td>
                  <td>{{ proposal.client?.company }}</td>
                  <td>
                    <span :class="`badge-${getStatusClass(proposal.status)}`">
                      {{ proposal.status }}
                    </span>
                  </td>
                  <td>{{ formatCurrency(proposal.total) }}</td>
                  <td>{{ formatDate(proposal.validUntil) }}</td>
                  <td>
                    <button @click="deleteItem('proposals', proposal.id)" class="btn-danger btn-sm">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            <p>Nema ponuda za prikaz</p>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Zadržavanja ({{ retainers.active?.length || 0 }})</h2>
          </div>
          
          <div v-if="retainers.active?.length" class="items-table">
            <table>
              <thead>
                <tr>
                  <th>Klijent</th>
                  <th>Mjesečni sati</th>
                  <th>Tarifa</th>
                  <th>Mjesečna vrijednost</th>
                  <th>Početak</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="retainer in retainers.active" :key="retainer.id">
                  <td>{{ retainer.client?.company }}</td>
                  <td>{{ retainer.monthlyHours }}h</td>
                  <td>{{ formatCurrency(retainer.rate) }}/h</td>
                  <td>{{ formatCurrency(retainer.monthlyHours * retainer.rate) }}</td>
                  <td>{{ formatDate(retainer.startDate) }}</td>
                  <td>
                    <button @click="deleteItem('retainers', retainer.id)" class="btn-danger btn-sm">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            <p>Nema aktivnih zadržavanja</p>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Računi ({{ invoices.recent?.length || 0 }})</h2>
            <router-link to="/invoices/new" class="btn btn-secondary">
              <span class="icon">+</span>
              Novi račun
            </router-link>
          </div>
          
          <div v-if="invoices.recent?.length" class="items-table">
            <table>
              <thead>
                <tr>
                  <th>Broj računa</th>
                  <th>Projekt</th>
                  <th>Status</th>
                  <th>Iznos</th>
                  <th>Datum izdavanja</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in invoices.recent" :key="invoice.id">
                  <td>{{ invoice.invoiceNumber }}</td>
                  <td>{{ invoice.project?.name }}</td>
                  <td>
                    <span :class="`badge-${getStatusClass(invoice.status)}`">
                      {{ invoice.status }}
                    </span>
                  </td>
                  <td>{{ formatCurrency(invoice.total) }}</td>
                  <td>{{ formatDate(invoice.issuedDate) }}</td>
                  <td>
                    <router-link :to="`/invoices/${invoice.id}`" class="btn btn-sm btn-outline">
                      Prikaži
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            <p>Nema računa za prikaz</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProjectsStore } from '@/stores/projects';
import api from '@/services/api';

const projectsStore = useProjectsStore();

const loading = ref(false);

const filters = ref({
  projectId: '',
  dateFrom: '',
  dateTo: ''
});

const financialData = ref({
  summary: {
    totalExpenses: 0,
    totalProposals: 0,
    totalRetainers: 0,
    totalInvoices: 0,
    netProfit: 0,
    totalBillableHours: 0
  },
  expenses: { recent: [], byCategory: {}, total: 0 },
  proposals: { recent: [], byStatus: {}, total: 0 },
  retainers: { active: [], total: 0 },
  invoices: { recent: [], total: 0 }
});

const summary = computed(() => financialData.value.summary);
const expenses = computed(() => financialData.value.expenses);
const proposals = computed(() => financialData.value.proposals);
const retainers = computed(() => financialData.value.retainers);
const invoices = computed(() => financialData.value.invoices);
const projects = computed(() => projectsStore.projects);

const refreshData = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (filters.value.projectId) params.projectId = filters.value.projectId;
    if (filters.value.dateFrom) params.dateFrom = filters.value.dateFrom;
    if (filters.value.dateTo) params.dateTo = filters.value.dateTo;

    const response = await api.get('/financial/dashboard', { params });
    financialData.value = response.data.data;
  } catch (error) {
    console.error('Failed to load financial data:', error);
  } finally {
    loading.value = false;
  }
};

const getStatusClass = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'DRAFT': 'warning',
    'SENT': 'info',
    'ACCEPTED': 'success',
    'REJECTED': 'danger',
    'PAID': 'success',
    'OVERDUE': 'danger'
  };
  return statusMap[status] || 'secondary';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('hr-HR', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(amount || 0);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('hr-HR');
};

const deleteItem = async (type: string, id: string) => {
  if (!confirm('Jeste li sigurni da želite obrisati ovaj unos?')) return;
  
  try {
    await api.delete(`/financial/${type}/${id}`);
    await refreshData();
  } catch (error) {
    console.error(`Failed to delete ${type}:`, error);
  }
};

onMounted(async () => {
  await projectsStore.fetchProjects();
  await refreshData();
});
</script>

<style scoped>
.financial-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.filter-bar {
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.filter-group select,
.filter-group input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  min-width: 150px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: 2rem;
}

.card-content h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 0.25rem 0;
}

.card-content .amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.amount.negative {
  color: var(--danger-text);
}

.financial-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.section h2 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.items-table {
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
}

.items-table table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.items-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.badge-success { background: var(--success-bg); color: var(--success-text); }
.badge-warning { background: var(--warning-bg); color: var(--warning-text); }
.badge-danger { background: var(--danger-bg); color: var(--danger-text); }
.badge-info { background: var(--info-bg); color: var(--info-text); }

.badge-success, .badge-warning, .badge-danger, .badge-info {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary { background: var(--primary); color: white; }
.btn-secondary { background: var(--secondary); color: white; }
.btn-danger { background: var(--danger); color: white; }
.btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>