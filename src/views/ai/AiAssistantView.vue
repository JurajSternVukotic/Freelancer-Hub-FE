<template>
  <div class="ai-assistant-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">AI Asistent</h1>
        <p class="page-subtitle">Pametni pomoćnik za upravljanje freelancer poslovima</p>
      </div>
      
      <div class="content">
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M12.5,8C11.67,8 11,7.33 11,6.5C11,5.67 11.67,5 12.5,5C13.33,5 14,5.67 14,6.5C14,7.33 13.33,8 12.5,8M18,12C18,8.68 15.31,6 12,6H11.5C8.19,6 5.5,8.68 5.5,12V15.5C5.5,17.43 7.07,19 9,19H15C16.93,19 18.5,17.43 18.5,15.5V12M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10Z"/>
          </svg>
          <h3>AI Asistent</h3>
          <p>Funkcionalnost AI asistenta je u razvoju.</p>
          <p class="feature-note">Uskoro: Pomoć u planiranju projekata, predlaganje cjenovnih strategija i automatizacija rutinskih zadataka.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.ai-assistant-view {
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
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.feature-note {
  color: var(--text-muted);
  font-style: italic;
  margin-top: 1rem;
}
</style>