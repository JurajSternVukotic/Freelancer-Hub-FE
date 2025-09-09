<template>
  <div class="auth-layout">
    <div class="auth-bg"></div>
    
    <div class="auth-container">
      <div class="auth-branding">
        <div class="brand-content">
          <div class="brand-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="logo-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <h1 class="brand-title">FreelancerHub</h1>
          </div>
          
          <p class="brand-subtitle">
            Sustav za upravljanje freelancer projektima, klijentima, zadacima i računima
          </p>
          
          <div class="brand-features">
            <div class="feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <span>Upravljanje klijentima i projektima</span>
            </div>
            <div class="feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <span>Kanban ploča za zadatke</span>
            </div>
            <div class="feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <span>Praćenje vremena i troškova</span>
            </div>
            <div class="feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <span>Računi i ponude</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="auth-content">
        <div class="auth-card">
          <button @click="toggleTheme" class="theme-toggle" :title="isDarkMode ? 'Prebaci na svijetlu temu' : 'Prebaci na tamnu temu'">
            <svg v-if="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </button>
          
          <router-view />
        </div>
        
        <div class="auth-footer">
          <p>&copy; 2024 FreelancerHub. Sva prava pridržana.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app'

const appStore = useAppStore()

const isDarkMode = computed(() => appStore.isDarkMode)

function toggleTheme() {
  appStore.toggleTheme()
}
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.auth-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, #3730a3 100%);
  opacity: 0.05;
}

.dark-theme .auth-bg {
  opacity: 0.1;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.auth-branding {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, #3730a3 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.auth-branding::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.brand-content {
  max-width: 400px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.brand-logo {
  margin-bottom: 2rem;
}

.logo-icon {
  margin-bottom: 1rem;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  margin-bottom: 0.5rem;
}

.brand-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.brand-features {
  text-align: left;
  space-y: 1rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.feature svg {
  flex-shrink: 0;
}

.auth-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: var(--bg-primary);
  position: relative;
}

.theme-toggle {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  z-index: 10;
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  position: relative;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
}

.auth-footer p {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .auth-branding {
    padding: 2rem 1rem;
    text-align: center;
  }
  
  .brand-title {
    font-size: 2rem;
  }
  
  .brand-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .brand-features {
    display: none;
  }
  
  .auth-content {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 1.5rem;
    border: none;
    box-shadow: none;
    background: transparent;
  }
  
  .theme-toggle {
    top: 1rem;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .auth-branding::before {
    display: none;
  }
  
  .auth-content {
    justify-content: flex-start;
    padding-top: 2rem;
  }
}</style>