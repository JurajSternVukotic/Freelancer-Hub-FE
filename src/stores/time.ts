import { defineStore } from 'pinia'
import { ref } from 'vue'
import timeService, { TimeEntry, CreateTimeEntryRequest } from '../services/timeService'
import { useTimerStore } from './timer'

export const useTimeStore = defineStore('time', () => {

  const timeEntries = ref<TimeEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const timerStore = useTimerStore()

  async function fetchTimeEntries(projectId?: string) {
    isLoading.value = true
    error.value = null
    try {
      const entries = await timeService.getTimeEntries(projectId)
      timeEntries.value = entries
      return entries
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch time entries'
      console.error('Error fetching time entries:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createTimeEntry(data: CreateTimeEntryRequest) {
    isLoading.value = true
    error.value = null
    try {
      const entry = await timeService.createTimeEntry(data)
      timeEntries.value.unshift(entry)
      return entry
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create time entry'
      console.error('Error creating time entry:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateTimeEntry(id: string, data: any) {
    isLoading.value = true
    error.value = null
    try {
      const updatedEntry = await timeService.updateTimeEntry(id, data)
      const index = timeEntries.value.findIndex(e => e.id === id)
      if (index !== -1) {
        timeEntries.value[index] = updatedEntry
      }
      return updatedEntry
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update time entry'
      console.error('Error updating time entry:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTimeEntry(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await timeService.deleteTimeEntry(id)
      timeEntries.value = timeEntries.value.filter(e => e.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete time entry'
      console.error('Error deleting time entry:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function startTimer(data: { taskId: string; description?: string }) {
    try {
      const response = await timerStore.startTimer(data)

      return response
    } catch (err) {
      console.error('Error starting timer:', err)
      throw err
    }
  }

  async function stopTimer() {
    try {
      const result = await timerStore.stopTimer()

      await fetchTimeEntries()
      return result
    } catch (err) {
      console.error('Error stopping timer:', err)
      throw err
    }
  }

  async function getActiveTimer() {
    try {
      await timerStore.getCurrentTimer()
      return timerStore.currentTimer
    } catch (err) {
      console.error('Error getting active timer:', err)
      return null
    }
  }

  return {

    timeEntries,
    isLoading,
    error,

    fetchTimeEntries,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    startTimer,
    stopTimer,
    getActiveTimer
  }
})