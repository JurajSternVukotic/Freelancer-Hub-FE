import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import timerService, { TimerSession, StartTimerRequest } from '../services/timerService'

export const useTimerStore = defineStore('timer', () => {

  const currentTimer = ref<TimerSession | null>(null)
  const isLoading = ref(false)
  const elapsedTime = ref(0)
  const isPaused = ref(false)
  const pausedTime = ref(0) // Time accumulated before pausing
  let timerInterval: NodeJS.Timeout | null = null

  const isRunning = computed(() => !!currentTimer.value?.isRunning && !isPaused.value)
  const hasActiveTimer = computed(() => !!currentTimer.value)
  
  const formattedTime = computed(() => {
    const totalSeconds = Math.floor(elapsedTime.value / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  async function startTimer(data: StartTimerRequest) {
    isLoading.value = true
    try {
      const timerData = await timerService.startTimer(data)

      if (timerData) {
        currentTimer.value = timerData
        if (timerData.startTime) {
          startLocalTimer(new Date(timerData.startTime))
        }
        console.log(`Timer pokrenut za zadatak: ${timerData.task?.title || 'Nepoznati zadatak'}`)
      } else {
        currentTimer.value = null
        console.warn('Nema podataka o timeru u odgovoru')
      }
      
      return timerData
    } catch (error: any) {
      currentTimer.value = null
      stopLocalTimer()
      const message = error.response?.data?.message || 'Greška pri pokretanju timera'
      console.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function stopTimer() {
    isLoading.value = true
    try {
      const response = await timerService.stopTimer()
      
      stopLocalTimer()
      currentTimer.value = null

      if (response?.data && typeof response.data.duration === 'number') {
        const durationMinutes = Math.round(response.data.duration)
        const hours = Math.floor(durationMinutes / 60)
        const minutes = durationMinutes % 60
        const durationText = hours > 0 
          ? `${hours}h ${minutes}m` 
          : `${minutes}m`
        
        console.log(`Timer zaustavljen. Zabilježeno vrijeme: ${durationText}`)
      } else {
        console.log('Timer zaustavljen')
      }
      
      return response
    } catch (error: any) {
      stopLocalTimer()
      currentTimer.value = null
      const message = error.response?.data?.message || 'Greška pri zaustavljanju timera'
      console.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function getCurrentTimer() {
    try {
      const timerData = await timerService.getCurrentTimer()

      if (timerData && timerData.startTime) {
        currentTimer.value = timerData
        startLocalTimer(new Date(timerData.startTime))
      } else {
        currentTimer.value = null
        stopLocalTimer()
      }
      
      return timerData
    } catch (error: any) {
      console.error('Error getting current timer:', error)
      currentTimer.value = null
      stopLocalTimer()
      throw error
    }
  }
  
  function startLocalTimer(startTime: Date) {
    stopLocalTimer() // Clear any existing interval

    if (!startTime || isNaN(startTime.getTime())) {
      console.warn('Invalid start time provided to startLocalTimer')
      return
    }

    elapsedTime.value = Math.max(0, Date.now() - startTime.getTime())

    timerInterval = setInterval(() => {
      elapsedTime.value = Math.max(0, Date.now() - startTime.getTime())
    }, 1000)
  }
  
  function stopLocalTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    elapsedTime.value = 0
    pausedTime.value = 0
    isPaused.value = false
  }
  
  function pauseTimer() {
    if (!currentTimer.value || !isRunning.value) return

    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    
    pausedTime.value = elapsedTime.value
    isPaused.value = true
  }
  
  function resumeTimer() {
    if (!currentTimer.value || !currentTimer.value.startTime || !isPaused.value) return
    
    isPaused.value = false

    const startTime = new Date(currentTimer.value.startTime)
    const now = Date.now()
    const actualElapsedFromStart = now - startTime.getTime()

    elapsedTime.value = pausedTime.value

    timerInterval = setInterval(() => {
      elapsedTime.value = pausedTime.value + (Date.now() - now)
    }, 1000)
  }

  async function initialize() {
    try {
      await getCurrentTimer()
    } catch (error) {
      console.error('Failed to initialize timer store:', error)

      currentTimer.value = null
      stopLocalTimer()
    }
  }

  async function refresh() {
    console.log('🔄 Refreshing timer state from server...')
    try {

      currentTimer.value = null
      stopLocalTimer()

      await getCurrentTimer()
      console.log('✅ Timer state refreshed successfully')
    } catch (error) {
      console.error('❌ Failed to refresh timer state:', error)
      currentTimer.value = null
      stopLocalTimer()
    }
  }

  function cleanup() {
    stopLocalTimer()
  }
  
  return {

    currentTimer,
    isLoading,
    elapsedTime,
    isPaused,

    isRunning,
    hasActiveTimer,
    formattedTime,

    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    getCurrentTimer,
    initialize,
    refresh,
    cleanup
  }
})