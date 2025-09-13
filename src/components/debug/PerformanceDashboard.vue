<template>
  <div class="performance-dashboard">
    <div class="performance-header">
      <div class="header-left">
        <h3 class="dashboard-title">App Performance</h3>
        <div class="health-indicator" :class="healthStatus">
          <div class="health-dot"></div>
          <span class="health-text">{{ getHealthText() }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button @click="refreshData" class="refresh-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Osvježi
        </button>
        <button @click="exportReport" class="export-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          Izvoz
        </button>
        <button @click="clearMetrics" class="clear-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          Očisti
        </button>
      </div>
    </div>

    <div class="performance-metrics">
      <div class="metric-card">
        <div class="metric-icon response-time">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ report.averageResponseTime }}ms</div>
          <div class="metric-label">Prosječno vrijeme odgovora</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon requests">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ report.totalRequests }}</div>
          <div class="metric-label">Ukupno zahtjeva</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon error-rate" :class="{ warning: report.errorRate > 10 }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-value" :class="{ error: report.errorRate > 10 }">
            {{ report.errorRate }}%
          </div>
          <div class="metric-label">Stopa greške</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon slow-requests" :class="{ warning: report.slowRequests > 3 }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-value" :class="{ warning: report.slowRequests > 3 }">
            {{ report.slowRequests }}
          </div>
          <div class="metric-label">Spori zahtjevi (>2s)</div>
        </div>
      </div>
    </div>

    <div v-if="report.slowestRequests.length" class="slowest-requests">
      <h4>Najsporiji zahtjevi</h4>
      <div class="requests-list">
        <div 
          v-for="request in report.slowestRequests" 
          :key="`${request.endpoint}-${request.timestamp}`"
          class="request-item"
        >
          <div class="request-info">
            <span class="method" :class="request.method.toLowerCase()">
              {{ request.method }}
            </span>
            <span class="endpoint">{{ request.endpoint }}</span>
          </div>
          <div class="request-metrics">
            <span class="duration" :class="{ slow: request.duration > 2000 }">
              {{ request.duration }}ms
            </span>
            <span class="status" :class="getStatusClass(request.status)">
              {{ request.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="report.recentErrors.length" class="recent-errors">
      <h4>Nedavne greške</h4>
      <div class="errors-list">
        <div 
          v-for="error in report.recentErrors" 
          :key="`${error.endpoint}-${error.timestamp}`"
          class="error-item"
        >
          <div class="error-info">
            <span class="method" :class="error.method.toLowerCase()">
              {{ error.method }}
            </span>
            <span class="endpoint">{{ error.endpoint }}</span>
          </div>
          <div class="error-details">
            <span class="error-message">{{ error.error }}</span>
            <span class="error-time">{{ formatTime(error.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { performanceMonitor } from '../../services/performanceMonitor'

const report = ref(performanceMonitor.getPerformanceReport())
const healthStatus = ref(performanceMonitor.getHealthStatus())
const refreshInterval = ref<number | null>(null)

function refreshData() {
  report.value = performanceMonitor.getPerformanceReport()
  healthStatus.value = performanceMonitor.getHealthStatus()
}

function exportReport() {
  const reportData = performanceMonitor.exportReport()
  const blob = new Blob([reportData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `performance-report-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function clearMetrics() {
  if (confirm('Jeste li sigurni da želite obrisati sve performanse podatke?')) {
    performanceMonitor.clearMetrics()
    refreshData()
  }
}

function getHealthText() {
  switch (healthStatus.value) {
    case 'good': return 'Odlično'
    case 'warning': return 'Upozorenje'
    case 'critical': return 'Kritično'
    default: return 'Nepoznato'
  }
}

function getStatusClass(status: number) {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 400 && status < 500) return 'client-error'
  if (status >= 500) return 'server-error'
  return 'unknown'
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('hr-HR')
}

onMounted(() => {
  refreshInterval.value = window.setInterval(refreshData, 10000) // Refresh every 10 seconds
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.performance-dashboard {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.performance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.health-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.health-indicator.good {
  background-color: var(--success-bg);
  color: var(--success);
}

.health-indicator.warning {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.health-indicator.critical {
  background-color: var(--error-bg);
  color: var(--error);
}

.health-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn, .export-btn, .clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.refresh-btn:hover, .export-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.clear-btn:hover {
  background: var(--error-bg);
  color: var(--error);
  border-color: var(--error);
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.metric-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon.response-time {
  background-color: var(--primary-light);
  color: var(--primary);
}

.metric-icon.requests {
  background-color: var(--success-bg);
  color: var(--success);
}

.metric-icon.error-rate {
  background-color: var(--success-bg);
  color: var(--success);
}

.metric-icon.error-rate.warning {
  background-color: var(--error-bg);
  color: var(--error);
}

.metric-icon.slow-requests {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.metric-icon.slow-requests.warning {
  background-color: var(--error-bg);
  color: var(--error);
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.metric-value.error {
  color: var(--error);
}

.metric-value.warning {
  color: var(--warning);
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.slowest-requests, .recent-errors {
  margin-bottom: 1.5rem;
}

.slowest-requests h4, .recent-errors h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.requests-list, .errors-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-item, .error-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-info, .error-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.method {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
}

.method.get {
  background-color: var(--success-bg);
  color: var(--success);
}

.method.post {
  background-color: var(--primary-light);
  color: var(--primary);
}

.method.put {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.method.delete {
  background-color: var(--error-bg);
  color: var(--error);
}

.endpoint {
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.request-metrics {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.duration {
  font-weight: 600;
  color: var(--text-primary);
}

.duration.slow {
  color: var(--error);
}

.status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.status.success {
  background-color: var(--success-bg);
  color: var(--success);
}

.status.client-error {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.status.server-error {
  background-color: var(--error-bg);
  color: var(--error);
}

.error-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.error-message {
  font-size: 0.875rem;
  color: var(--text-secondary);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .performance-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .performance-metrics {
    grid-template-columns: 1fr;
  }
  
  .request-item, .error-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .request-metrics, .error-details {
    align-items: flex-start;
  }
}
</style>