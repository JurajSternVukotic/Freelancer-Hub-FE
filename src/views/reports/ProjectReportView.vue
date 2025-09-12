<template>
  <div class="project-report-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Izvještaj projekata</h1>
        <p class="page-subtitle">Analiza performansi projekata</p>
      </div>
      
      <div class="content">
        <div class="empty-state">
          <h3>Izvještaj projekata</h3>
          <p>Funkcionalnost za analizu projekata je u razvoju.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.project-report-view {
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

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
</style>