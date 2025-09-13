<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-illustration">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" class="error-icon">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      
      <div class="error-text">
        <h1 class="error-title">404</h1>
        <h2 class="error-subtitle">Stranica nije pronađena</h2>
        <p class="error-description">
          Stranica koju tražite ne postoji ili je premještena.
        </p>
      </div>
      
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary btn-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          Povratak na početnu
        </router-link>
        
        <button @click="$router.back()" class="btn btn-secondary btn-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Natrag
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-secondary);
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-illustration {
  margin-bottom: 2rem;
}

.error-icon {
  color: var(--text-muted);
  opacity: 0.5;
}

.error-title {
  font-size: 6rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.error-subtitle {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1rem 0;
}

.error-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .error-title {
    font-size: 4rem;
  }
  
  .error-subtitle {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .btn {
    width: 100%;
    max-width: 200px;
  }
}</style>