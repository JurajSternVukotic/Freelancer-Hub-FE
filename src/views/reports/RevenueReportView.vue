<template>
  <div class="revenue-report-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Izvještaj prihoda</h1>
        <p class="page-subtitle">Analiza prihoda i financijskih pokazatelja</p>
      </div>
      
      <div class="content">
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M3,3V21H21V3H3M7,19H5V17H7V19M11,19H9V17H11V19M15,19H13V17H15V19M19,19H17V17H19V19M7,15H5V13H7V15M11,15H9V13H11V15M15,15H13V13H15V15M19,15H17V13H19V15M7,11H5V9H7V11M11,11H9V9H11V11M15,11H13V9H15V11M19,11H17V9H19V11M7,7H5V5H7V7M11,7H9V5H11V7M15,7H13V5H15V7M19,7H17V5H19V7Z"/>
          </svg>
          <h3>Izvještaj prihoda</h3>
          <p>Funkcionalnost za analizu prihoda je u razvoju.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.revenue-report-view {
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
</style>