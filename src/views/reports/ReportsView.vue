<template>
  <div class="reports-container">
    <div class="header-section">
      <h1 class="page-title">Financije & Izvještaji</h1>
      <p class="page-subtitle">Pregled svih financijskih podataka, izvještaja i analitike na jednom mjestu</p>
      
      <div class="date-filters">
        <div class="filter-group">
          <label>Od datuma:</label>
          <input v-model="filters.startDate" type="date" class="date-input">
        </div>
        <div class="filter-group">
          <label>Do datuma:</label>
          <input v-model="filters.endDate" type="date" class="date-input">
        </div>
        <div class="filter-group">
          <label>Projekt:</label>
          <select v-model="filters.projectId" class="select-input">
            <option value="">Svi projekti</option>
            <option v-for="project in reportsStore.availableProjects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
        <div class="quick-filters">
          <button @click="setThisMonth" class="btn-outline">Ovaj mjesec</button>
          <button @click="setLastMonth" class="btn-outline">Prošli mjesec</button>
          <button @click="setThisYear" class="btn-outline">Ova godina</button>
        </div>
        <button @click="refreshReports" :disabled="reportsStore.isLoading" class="btn-primary">
          {{ reportsStore.isLoading ? 'Učitava...' : 'Osvježi' }}
        </button>
      </div>
    </div>

    <div class="stats-grid" v-if="reportsStore.reportStats">
      <div class="stat-card success">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Ukupni prihod</h3>
          <p class="stat-value">€{{ reportsStore.reportStats.totalRevenue.toLocaleString('hr-HR') }}</p>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Profit</h3>
          <p class="stat-value">€{{ reportsStore.reportStats.totalProfit.toLocaleString('hr-HR') }}</p>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <h3>Naplativi sati</h3>
          <p class="stat-value">{{ reportsStore.reportStats.billableHours }}h</p>
        </div>
      </div>
      <div class="stat-card primary">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>Stopa iskorištenosti</h3>
          <p class="stat-value">{{ reportsStore.reportStats.utilizationRate }}%</p>
        </div>
      </div>
    </div>

    <div class="reports-grid">
      
      <div class="report-card full-width">
        <div class="card-header">
          <h2 class="report-title">Prihodi, rashodi i profit po mjesecima</h2>
          <button @click="exportReport('revenue')" class="btn-export">
            📥 Izvezi
          </button>
        </div>
        <div class="chart-container">
          <LineChart
            v-if="reportsStore.revenueData.length > 0"
            :data="reportsStore.revenueChartData"
            :show-legend="true"
            y-axis-label="Iznos (€)"
          />
          <div v-else class="chart-placeholder">
            <p>{{ reportsStore.isLoading ? 'Učitavanje podataka...' : 'Nema podataka za prikaz' }}</p>
          </div>
        </div>
      </div>

      <div class="report-card">
        <div class="card-header">
          <h2 class="report-title">Profitabilnost projekata</h2>
          <button @click="exportReport('projects')" class="btn-export">
            📥 Izvezi
          </button>
        </div>
        <div class="chart-container">
          <RevenueChart
            v-if="reportsStore.projectStats.length > 0"
            :data="reportsStore.projectProfitabilityChartData"
          />
          <div v-else class="chart-placeholder">
            <p>{{ reportsStore.isLoading ? 'Učitavanje podataka...' : 'Nema podataka za prikaz' }}</p>
          </div>
        </div>
      </div>

      <div class="report-card">
        <div class="card-header">
          <h2 class="report-title">Distribucija prihoda po klijentima</h2>
          <button @click="exportReport('clients')" class="btn-export">
            📥 Izvezi
          </button>
        </div>
        <div class="chart-container">
          <DoughnutChart
            v-if="reportsStore.clientStats.length > 0"
            :data="reportsStore.clientDistributionChartData"
            :show-legend="true"
            cutout="60%"
          />
          <div v-else class="chart-placeholder">
            <p>{{ reportsStore.isLoading ? 'Učitavanje podataka...' : 'Nema podataka za prikaz' }}</p>
          </div>
        </div>
      </div>

      <div class="report-card full-width">
        <div class="card-header">
          <h2 class="report-title">Iskorištenost vremena</h2>
          <button @click="exportReport('time')" class="btn-export">
            📥 Izvezi
          </button>
        </div>
        <div class="chart-container">
          <RevenueChart
            v-if="reportsStore.timeStats.length > 0"
            :data="reportsStore.utilizationChartData"
          />
          <div v-else class="chart-placeholder">
            <p>{{ reportsStore.isLoading ? 'Učitavanje podataka...' : 'Nema podataka za prikaz' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="report-card" v-if="reportsStore.projectStats.length > 0">
      <h2 class="report-title">Detaljni pregled projekata</h2>
      <div class="table-container">
        <table class="performance-table">
          <thead>
            <tr>
              <th>Projekt</th>
              <th>Prihod</th>
              <th>Rashodi</th>
              <th>Profit</th>
              <th>Marža</th>
              <th>Sati</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in reportsStore.projectStats" :key="project.projectId">
              <td class="project-name">{{ project.projectName }}</td>
              <td class="amount positive">€{{ project.revenue.toLocaleString('hr-HR') }}</td>
              <td class="amount negative">€{{ project.expenses.toLocaleString('hr-HR') }}</td>
              <td class="amount" :class="project.profit >= 0 ? 'positive' : 'negative'">
                €{{ project.profit.toLocaleString('hr-HR') }}
              </td>
              <td class="percentage" :class="project.margin >= 0 ? 'positive' : 'negative'">
                {{ project.margin.toFixed(1) }}%
              </td>
              <td class="hours">{{ project.hours }}h</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useReportsStore } from '@/stores/reports'
import { useToast } from 'vue-toastification'
import RevenueChart from '@/components/charts/RevenueChart.vue'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import type { ReportFilter } from '@/types'

const reportsStore = useReportsStore()
const toast = useToast()

const filters = ref<ReportFilter>({
  startDate: new Date(2025, 0, 1).toISOString().split('T')[0], // Start of 2025
  endDate: new Date().toISOString().split('T')[0], // Today
  clientId: undefined,
  projectId: undefined,
  status: undefined
})

const setThisMonth = () => {
  reportsStore.setThisMonth()
  filters.value.startDate = reportsStore.currentFilters.startDate
  filters.value.endDate = reportsStore.currentFilters.endDate
}

const setLastMonth = () => {
  reportsStore.setLastMonth()
  filters.value.startDate = reportsStore.currentFilters.startDate
  filters.value.endDate = reportsStore.currentFilters.endDate
}

const setThisYear = () => {
  reportsStore.setThisYear()
  filters.value.startDate = reportsStore.currentFilters.startDate
  filters.value.endDate = reportsStore.currentFilters.endDate
}

const refreshReports = async () => {
  try {
    console.log('🔍 RefreshReports called with filters:', filters.value)
    await reportsStore.fetchAllReports(filters.value)
    console.log('📊 Reports data loaded:')
    console.log('- Stats:', reportsStore.reportStats)
    console.log('- Revenue:', reportsStore.revenueData.length, 'items')
    console.log('- Clients:', reportsStore.clientStats.length, 'items')
    console.log('- Projects:', reportsStore.projectStats.length, 'items') 
    console.log('- Time:', reportsStore.timeStats.length, 'items')
  } catch (error: any) {
    console.error('❌ Failed to load reports:', error)
    toast.error('Greška pri učitavanju izvještaja')
  }
}

const exportReport = async (type: 'revenue' | 'projects' | 'clients' | 'time') => {
  try {
    await reportsStore.exportReport(type, filters.value)
  } catch (error: any) {
    console.error('Failed to export report:', error)
    toast.error('Greška pri izvozu izvještaja')
  }
}

watch(
  () => [filters.value.startDate, filters.value.endDate, filters.value.projectId, filters.value.clientId],
  ([newStartDate, newEndDate, newProjectId, newClientId], [oldStartDate, oldEndDate, oldProjectId, oldClientId]) => {

    const hasChanged = 
      newStartDate !== oldStartDate || 
      newEndDate !== oldEndDate || 
      newProjectId !== oldProjectId || 
      newClientId !== oldClientId

    if (hasChanged && newStartDate && newEndDate) {
      refreshReports()
    }
  },
  { deep: true }
)

onMounted(async () => {

  await reportsStore.fetchProjectsForFilter()

  await refreshReports()
})
</script>

<style scoped>
.reports-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: var(--text-primary);
}

.date-filters {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.date-input, .select-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-width: 140px;
}

.select-input {
  cursor: pointer;
}

.quick-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-outline {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: var(--primary-color);
  color: white;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  padding: 8px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary-color);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.success {
  border-left-color: #10B981;
}

.stat-card.info {
  border-left-color: #3B82F6;
}

.stat-card.warning {
  border-left-color: #F59E0B;
}

.stat-card.primary {
  border-left-color: var(--primary-color);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.report-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.report-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.report-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.report-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.btn-export {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-export:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--primary-color);
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  font-style: italic;
}

.table-container {
  overflow-x: auto;
  margin-top: 16px;
}

.performance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.performance-table th {
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-weight: 600;
  padding: 12px 8px;
  text-align: left;
  border-bottom: 2px solid var(--border-color);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.performance-table td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--border-color);
}

.performance-table tbody tr:hover {
  background: var(--bg-primary);
}

.project-name {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 200px;
}

.amount {
  font-weight: 600;
  text-align: right;
}

.amount.positive {
  color: #10B981;
}

.amount.negative {
  color: #EF4444;
}

.percentage {
  font-weight: 600;
  text-align: right;
}

.percentage.positive {
  color: #10B981;
}

.percentage.negative {
  color: #EF4444;
}

.hours {
  text-align: right;
  color: var(--text-secondary);
}

.page-subtitle {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

@media (max-width: 1024px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
  
  .report-card.full-width {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .date-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .performance-table {
    font-size: 0.8rem;
  }
  
  .performance-table th,
  .performance-table td {
    padding: 8px 4px;
  }
}

@media (max-width: 480px) {
  .reports-container {
    padding: 10px;
  }
  
  .quick-filters {
    width: 100%;
    justify-content: space-between;
  }
  
  .btn-outline {
    flex: 1;
    font-size: 0.8rem;
    padding: 8px 4px;
  }
}
</style>