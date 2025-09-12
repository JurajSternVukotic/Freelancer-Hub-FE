<template>
  <div class="proposal-detail-view">
    <div class="container">
      <div class="page-header">
        <router-link to="/proposals" class="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          Natrag na ponude
        </router-link>
        <h1 class="page-title">Detalji ponude</h1>
      </div>
      
      <div class="content">
        <div class="empty-state">
          <h3>Detalji ponude</h3>
          <p>Funkcionalnost je u razvoju.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.proposal-detail-view {
  padding: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}
</style>