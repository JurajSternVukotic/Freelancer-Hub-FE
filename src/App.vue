<template>
  <div id="app" :class="{ 'dark-theme': isDarkMode }">
    <router-view />
    
    <div v-if="isLoading" class="global-loader">
      <div class="spinner"></div>
    </div>
    
    <TimerWidget v-if="isAuthenticated && showTimer" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useAppStore } from './stores/app'
import { useTimerStore } from './stores/timer'
import TimerWidget from './components/timer/TimerWidget.vue'

const authStore = useAuthStore()
const appStore = useAppStore()
const timerStore = useTimerStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isLoading = computed(() => appStore.isLoading)
const isDarkMode = computed(() => appStore.isDarkMode)
const showTimer = computed(() => appStore.showTimer)

onMounted(async () => {
  appStore.initializeTheme()
  appStore.initializePreferences()
  
  await authStore.checkAuth()
})

watch(isAuthenticated, async (authenticated) => {
  if (authenticated) {
    await timerStore.initialize()
  } else {
    timerStore.cleanup()
  }
}, { immediate: true })
</script>

<style>
:root {
  --primary-color: #4f46e5;
  --primary-dark: #3730a3;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #3b82f6;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.dark-theme {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --border-color: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}

#app {
  min-height: 100vh;
}

.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dark-theme .global-loader {
  background: rgba(15, 23, 42, 0.8);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}
</style>