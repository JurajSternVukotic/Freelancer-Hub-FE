import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {

  const isLoading = ref(false)
  const isDarkMode = ref(false)
  const showTimer = ref(true)
  const sidebarCollapsed = ref(false)

  const theme = computed(() => isDarkMode.value ? 'dark' : 'light')

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }
  
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    updateTheme()
  }
  
  function setTheme(theme: 'light' | 'dark') {
    isDarkMode.value = theme === 'dark'
    localStorage.setItem('theme', theme)
    updateTheme()
  }
  
  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {

      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateTheme()
  }
  
  function updateTheme() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }
  
  function toggleTimer() {
    showTimer.value = !showTimer.value
    localStorage.setItem('showTimer', showTimer.value.toString())
  }
  
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
  }
  
  function initializePreferences() {

    const savedTimerState = localStorage.getItem('showTimer')
    if (savedTimerState !== null) {
      showTimer.value = savedTimerState === 'true'
    }

    const savedSidebarState = localStorage.getItem('sidebarCollapsed')
    if (savedSidebarState !== null) {
      sidebarCollapsed.value = savedSidebarState === 'true'
    }
  }
  
  return {

    isLoading,
    isDarkMode,
    showTimer,
    sidebarCollapsed,

    theme,

    setLoading,
    toggleTheme,
    setTheme,
    initializeTheme,
    toggleTimer,
    toggleSidebar,
    initializePreferences
  }
})