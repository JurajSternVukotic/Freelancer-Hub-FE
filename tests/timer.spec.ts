import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { server } from './setup'
import { rest } from 'msw'

const TimerWidget = {
  template: `
    <div class="timer-widget" :class="{ 'timer-running': isRunning }" data-testid="timer-widget">
      <div class="timer-header">
        <h3>Time Tracker</h3>
        <button 
          v-if="!isRunning" 
          @click="showTaskSelector = true"
          data-testid="select-task-button"
          class="select-task-btn"
        >
          Select Task
        </button>
      </div>
      
      <div v-if="currentTask" class="current-task" data-testid="current-task">
        <span class="task-title">{{ currentTask.title }}</span>
        <span class="project-name">{{ currentTask.project?.name }}</span>
      </div>
      
      <div class="timer-display" data-testid="timer-display">
        <span class="time-text">{{ formatTime(elapsedSeconds) }}</span>
      </div>
      
      <div class="timer-controls">
        <button 
          v-if="!isRunning"
          @click="startTimer"
          :disabled="!currentTask"
          data-testid="start-timer-button"
          class="btn-start"
        >
          Start
        </button>
        
        <button 
          v-if="isRunning"
          @click="pauseTimer"
          data-testid="pause-timer-button"
          class="btn-pause"
        >
          Pause
        </button>
        
        <button 
          v-if="isRunning"
          @click="stopTimer"
          data-testid="stop-timer-button"
          class="btn-stop"
        >
          Stop
        </button>
      </div>
      
      <div class="timer-description" v-if="isRunning || isPaused">
        <textarea 
          v-model="workDescription"
          placeholder="What are you working on?"
          data-testid="work-description"
          rows="2"
        ></textarea>
      </div>

      <div v-if="showTaskSelector" class="modal-overlay" data-testid="task-selector-modal">
        <div class="modal">
          <h3>Select Task</h3>
          <div class="task-list">
            <div 
              v-for="task in availableTasks" 
              :key="task.id"
              class="task-option"
              :data-testid="'task-option-' + task.id"
              @click="selectTask(task)"
            >
              <div class="task-info">
                <span class="task-title">{{ task.title }}</span>
                <span class="project-name">{{ task.project?.name }}</span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button 
              @click="showTaskSelector = false"
              data-testid="cancel-task-selection"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div class="recent-entries" v-if="recentEntries.length > 0" data-testid="recent-entries">
        <h4>Recent Entries</h4>
        <div 
          v-for="entry in recentEntries.slice(0, 5)" 
          :key="entry.id"
          class="time-entry"
          :data-testid="'time-entry-' + entry.id"
        >
          <div class="entry-info">
            <span class="entry-task">{{ entry.task?.title }}</span>
            <span class="entry-duration">{{ formatTime(entry.duration * 60) }}</span>
            <span class="entry-date">{{ formatDate(entry.date) }}</span>
          </div>
          <div class="entry-description">{{ entry.description }}</div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      startTime: null,
      pausedTime: 0,
      currentTask: null,
      workDescription: '',
      showTaskSelector: false,
      timerInterval: null,
      currentTimerId: null,
      availableTasks: [
        {
          id: 'task-1',
          title: 'Frontend Development',
          project: { id: 'proj-1', name: 'Website Project' },
        },
        {
          id: 'task-2',
          title: 'API Integration',
          project: { id: 'proj-1', name: 'Website Project' },
        },
        {
          id: 'task-3',
          title: 'Database Design',
          project: { id: 'proj-2', name: 'Mobile App' },
        },
      ],
      recentEntries: [
        {
          id: 'entry-1',
          task: { title: 'Bug Fixes' },
          duration: 120, // minutes
          date: '2025-02-01T10:00:00Z',
          description: 'Fixed authentication issues',
        },
        {
          id: 'entry-2',
          task: { title: 'UI Design' },
          duration: 90,
          date: '2025-02-01T14:30:00Z',
          description: 'Created mockups for dashboard',
        },
      ],
    }
  },
  methods: {
    formatTime(seconds: number): string {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    
    formatDate(dateString: string): string {
      return new Date(dateString).toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },
    
    selectTask(task: any) {
      this.currentTask = task
      this.showTaskSelector = false
      this.$emit('task-selected', task)
    },
    
    async startTimer() {
      if (!this.currentTask) return
      
      try {
        const response = await fetch('/api/timer/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: this.currentTask.id,
            description: this.workDescription,
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          this.currentTimerId = data.timerId
          this.startTime = new Date()
          this.isRunning = true
          this.isPaused = false
          this.startTicking()
          this.$emit('timer-started', data)
        }
      } catch (error) {
        console.error('Failed to start timer:', error)
        this.$emit('timer-error', error)
      }
    },
    
    pauseTimer() {
      this.isRunning = false
      this.isPaused = true
      this.pausedTime = this.elapsedSeconds
      this.stopTicking()
      this.$emit('timer-paused', { elapsedSeconds: this.elapsedSeconds })
    },
    
    async stopTimer() {
      if (!this.currentTimerId) return
      
      try {
        const response = await fetch('/api/timer/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timerId: this.currentTimerId,
            description: this.workDescription,
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          this.resetTimer()
          this.$emit('timer-stopped', data)

          const newEntry = {
            id: data.timerId,
            task: this.currentTask,
            duration: Math.round(data.duration / 60), // Convert seconds to minutes
            date: new Date().toISOString(),
            description: this.workDescription,
          }
          this.recentEntries.unshift(newEntry)
        }
      } catch (error) {
        console.error('Failed to stop timer:', error)
        this.$emit('timer-error', error)
      }
    },
    
    startTicking() {
      this.timerInterval = setInterval(() => {
        if (this.startTime) {
          const now = new Date().getTime()
          const started = this.startTime.getTime()
          this.elapsedSeconds = Math.floor((now - started) / 1000) + this.pausedTime
        }
      }, 1000)
    },
    
    stopTicking() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },
    
    resetTimer() {
      this.isRunning = false
      this.isPaused = false
      this.elapsedSeconds = 0
      this.pausedTime = 0
      this.startTime = null
      this.currentTimerId = null
      this.workDescription = ''
      this.stopTicking()
    },
    
    resumeTimer() {
      if (this.isPaused) {
        this.isRunning = true
        this.isPaused = false
        this.startTime = new Date()
        this.startTicking()
        this.$emit('timer-resumed', { elapsedSeconds: this.elapsedSeconds })
      }
    },
  },
  
  mounted() {

    this.checkExistingTimer()
  },
  
  async checkExistingTimer() {
    try {
      const response = await fetch('/api/timer/current')
      if (response.ok) {
        const data = await response.json()
        if (data && data.isRunning) {

          this.currentTimerId = data.timerId
          this.currentTask = data.task
          this.isRunning = true
          this.startTime = new Date(data.startTime)
          this.startTicking()
          this.$emit('timer-resumed', data)
        }
      }
    } catch (error) {
      console.error('Failed to check existing timer:', error)
    }
  },
  
  beforeUnmount() {
    this.stopTicking()
  },
}

describe('TimerWidget Component', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(TimerWidget)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Component Rendering', () => {
    it('renders timer widget with initial state', () => {
      expect(wrapper.find('[data-testid="timer-widget"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="timer-display"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="select-task-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="start-timer-button"]').exists()).toBe(true)
    })

    it('displays initial time as 00:00', () => {
      const timerDisplay = wrapper.find('[data-testid="timer-display"]')
      expect(timerDisplay.text()).toBe('00:00')
    })

    it('shows recent time entries', () => {
      expect(wrapper.find('[data-testid="recent-entries"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="time-entry-entry-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="time-entry-entry-2"]').exists()).toBe(true)
    })

    it('formats recent entry durations correctly', () => {
      const entry1 = wrapper.find('[data-testid="time-entry-entry-1"]')
      expect(entry1.text()).toContain('02:00:00') // 120 minutes = 2 hours
      
      const entry2 = wrapper.find('[data-testid="time-entry-entry-2"]')
      expect(entry2.text()).toContain('01:30:00') // 90 minutes = 1.5 hours
    })
  })

  describe('Task Selection', () => {
    it('opens task selector modal', async () => {
      const selectTaskButton = wrapper.find('[data-testid="select-task-button"]')
      await selectTaskButton.trigger('click')
      
      expect(wrapper.find('[data-testid="task-selector-modal"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="task-option-task-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="task-option-task-2"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="task-option-task-3"]').exists()).toBe(true)
    })

    it('selects task from modal', async () => {
      const selectTaskButton = wrapper.find('[data-testid="select-task-button"]')
      await selectTaskButton.trigger('click')
      
      const taskOption = wrapper.find('[data-testid="task-option-task-1"]')
      await taskOption.trigger('click')
      
      expect(wrapper.emitted('task-selected')).toBeTruthy()
      expect(wrapper.emitted('task-selected')?.[0]?.[0].id).toBe('task-1')

      expect(wrapper.find('[data-testid="task-selector-modal"]').exists()).toBe(false)

      expect(wrapper.find('[data-testid="current-task"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="current-task"]').text()).toContain('Frontend Development')
    })

    it('cancels task selection', async () => {
      const selectTaskButton = wrapper.find('[data-testid="select-task-button"]')
      await selectTaskButton.trigger('click')
      
      const cancelButton = wrapper.find('[data-testid="cancel-task-selection"]')
      await cancelButton.trigger('click')
      
      expect(wrapper.find('[data-testid="task-selector-modal"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="current-task"]').exists()).toBe(false)
    })

    it('disables start button when no task is selected', () => {
      const startButton = wrapper.find('[data-testid="start-timer-button"]')
      expect(startButton.attributes('disabled')).toBeDefined()
    })

    it('enables start button when task is selected', async () => {
      await wrapper.setData({
        currentTask: {
          id: 'task-1',
          title: 'Test Task',
          project: { name: 'Test Project' },
        },
      })
      
      const startButton = wrapper.find('[data-testid="start-timer-button"]')
      expect(startButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Timer Functionality', () => {
    beforeEach(async () => {

      await wrapper.setData({
        currentTask: {
          id: 'task-1',
          title: 'Test Task',
          project: { name: 'Test Project' },
        },
      })
    })

    it('starts timer successfully', async () => {
      const startButton = wrapper.find('[data-testid="start-timer-button"]')
      await startButton.trigger('click')

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.emitted('timer-started')).toBeTruthy()
      expect(wrapper.vm.isRunning).toBe(true)

      expect(wrapper.find('[data-testid="start-timer-button"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="pause-timer-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="stop-timer-button"]').exists()).toBe(true)
    })

    it('increments elapsed time while running', async () => {
      const startButton = wrapper.find('[data-testid="start-timer-button"]')
      await startButton.trigger('click')
      await nextTick()

      vi.advanceTimersByTime(65000)
      
      const timerDisplay = wrapper.find('[data-testid="timer-display"]')
      expect(timerDisplay.text()).toBe('01:05') // 1 minute 5 seconds
    })

    it('displays hours when time exceeds 60 minutes', async () => {
      await wrapper.setData({ elapsedSeconds: 3665 }) // 1 hour, 1 minute, 5 seconds
      
      const timerDisplay = wrapper.find('[data-testid="timer-display"]')
      expect(timerDisplay.text()).toBe('01:01:05')
    })

    it('pauses timer correctly', async () => {

      const startButton = wrapper.find('[data-testid="start-timer-button"]')
      await startButton.trigger('click')
      await nextTick()

      vi.advanceTimersByTime(30000) // 30 seconds

      const pauseButton = wrapper.find('[data-testid="pause-timer-button"]')
      await pauseButton.trigger('click')
      
      expect(wrapper.emitted('timer-paused')).toBeTruthy()
      expect(wrapper.vm.isRunning).toBe(false)
      expect(wrapper.vm.isPaused).toBe(true)
      expect(wrapper.vm.elapsedSeconds).toBe(30)

      const timeAtPause = wrapper.vm.elapsedSeconds
      vi.advanceTimersByTime(10000)
      expect(wrapper.vm.elapsedSeconds).toBe(timeAtPause)
    })

    it('resumes timer from paused state', async () => {

      await wrapper.setData({
        isPaused: true,
        elapsedSeconds: 45,
        pausedTime: 45,
      })
      
      wrapper.vm.resumeTimer()
      await nextTick()
      
      expect(wrapper.emitted('timer-resumed')).toBeTruthy()
      expect(wrapper.vm.isRunning).toBe(true)
      expect(wrapper.vm.isPaused).toBe(false)

      vi.advanceTimersByTime(15000)
      expect(wrapper.vm.elapsedSeconds).toBe(60) // 45 + 15
    })

    it('stops timer and saves entry', async () => {

      await wrapper.setData({
        isRunning: true,
        currentTimerId: 'timer-123',
        elapsedSeconds: 120,
        workDescription: 'Completed feature implementation',
      })
      
      const stopButton = wrapper.find('[data-testid="stop-timer-button"]')
      await stopButton.trigger('click')
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.emitted('timer-stopped')).toBeTruthy()
      expect(wrapper.vm.isRunning).toBe(false)
      expect(wrapper.vm.elapsedSeconds).toBe(0)

      expect(wrapper.vm.recentEntries.length).toBe(3) // 2 existing + 1 new
      expect(wrapper.vm.recentEntries[0].description).toBe('Completed feature implementation')
    })

    it('handles work description input', async () => {

      await wrapper.setData({ isRunning: true })
      
      const descriptionField = wrapper.find('[data-testid="work-description"]')
      expect(descriptionField.exists()).toBe(true)
      
      await descriptionField.setValue('Working on user authentication')
      expect(wrapper.vm.workDescription).toBe('Working on user authentication')
    })
  })

  describe('Time Formatting', () => {
    it('formats time correctly for different durations', () => {
      const testCases = [
        { seconds: 0, expected: '00:00' },
        { seconds: 30, expected: '00:30' },
        { seconds: 60, expected: '01:00' },
        { seconds: 90, expected: '01:30' },
        { seconds: 3600, expected: '01:00:00' },
        { seconds: 3665, expected: '01:01:05' },
        { seconds: 7200, expected: '02:00:00' },
      ]
      
      testCases.forEach(({ seconds, expected }) => {
        const formatted = wrapper.vm.formatTime(seconds)
        expect(formatted).toBe(expected)
      })
    })

    it('formats Croatian dates correctly', () => {
      const testDate = '2025-02-15T14:30:00Z'
      const formatted = wrapper.vm.formatDate(testDate)

      expect(formatted).toMatch(/\d{2}\.\d{2}\.\d{4}/)
    })
  })

  describe('API Integration', () => {
    it('handles timer start API error', async () => {
      server.use(
        rest.post('/api/timer/start', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }))
        })
      )
      
      await wrapper.setData({
        currentTask: { id: 'task-1', title: 'Test Task' },
      })
      
      const startButton = wrapper.find('[data-testid="start-timer-button"]')
      await startButton.trigger('click')
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.emitted('timer-error')).toBeTruthy()
      expect(wrapper.vm.isRunning).toBe(false)
    })

    it('handles timer stop API error', async () => {
      server.use(
        rest.post('/api/timer/stop', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }))
        })
      )
      
      await wrapper.setData({
        isRunning: true,
        currentTimerId: 'timer-123',
      })
      
      const stopButton = wrapper.find('[data-testid="stop-timer-button"]')
      await stopButton.trigger('click')
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.emitted('timer-error')).toBeTruthy()
    })

    it('resumes existing timer on mount', async () => {
      server.use(
        rest.get('/api/timer/current', (req, res, ctx) => {
          return res(
            ctx.json({
              timerId: 'existing-timer',
              taskId: 'task-1',
              task: { title: 'Existing Task' },
              startTime: new Date(Date.now() - 30000).toISOString(), // Started 30 seconds ago
              isRunning: true,
            })
          )
        })
      )

      const newWrapper = mount(TimerWidget)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(newWrapper.emitted('timer-resumed')).toBeTruthy()
      expect(newWrapper.vm.isRunning).toBe(true)
      expect(newWrapper.vm.currentTimerId).toBe('existing-timer')
    })

    it('handles no existing timer on mount', async () => {
      server.use(
        rest.get('/api/timer/current', (req, res, ctx) => {
          return res(ctx.json(null))
        })
      )
      
      const newWrapper = mount(TimerWidget)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(newWrapper.vm.isRunning).toBe(false)
      expect(newWrapper.vm.currentTimerId).toBeNull()
    })
  })

  describe('User Interface States', () => {
    it('shows different UI states based on timer status', async () => {

      expect(wrapper.find('[data-testid="select-task-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="start-timer-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="work-description"]').exists()).toBe(false)

      await wrapper.setData({ isRunning: true })
      expect(wrapper.find('[data-testid="start-timer-button"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="pause-timer-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="stop-timer-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="work-description"]').exists()).toBe(true)

      await wrapper.setData({ isRunning: false, isPaused: true })
      expect(wrapper.find('[data-testid="pause-timer-button"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="work-description"]').exists()).toBe(true)
    })

    it('applies correct CSS classes based on state', async () => {
      const timerWidget = wrapper.find('[data-testid="timer-widget"]')

      expect(timerWidget.classes()).not.toContain('timer-running')

      await wrapper.setData({ isRunning: true })
      expect(timerWidget.classes()).toContain('timer-running')
    })

    it('hides task selector when timer is running', async () => {
      await wrapper.setData({ isRunning: true })
      expect(wrapper.find('[data-testid="select-task-button"]').exists()).toBe(false)
    })
  })

  describe('Memory Management', () => {
    it('clears interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.setData({ isRunning: true })
      wrapper.vm.startTicking()
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('handles multiple start/stop cycles without memory leaks', async () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      await wrapper.setData({
        currentTask: { id: 'task-1', title: 'Test Task' },
      })

      for (let i = 0; i < 3; i++) {
        wrapper.vm.startTicking()
        wrapper.vm.stopTicking()
      }
      
      expect(setIntervalSpy).toHaveBeenCalledTimes(3)
      expect(clearIntervalSpy).toHaveBeenCalledTimes(3)
    })
  })

  describe('Edge Cases', () => {
    it('handles starting timer without task gracefully', async () => {
      const startButton = wrapper.find('[data-testid="start-timer-button"]')
      await startButton.trigger('click')

      expect(wrapper.vm.isRunning).toBe(false)
      expect(wrapper.emitted('timer-started')).toBeFalsy()
    })

    it('handles stopping timer without ID gracefully', async () => {
      await wrapper.setData({
        isRunning: true,
        currentTimerId: null, // No timer ID
      })
      
      const stopButton = wrapper.find('[data-testid="stop-timer-button"]')
      await stopButton.trigger('click')

      expect(wrapper.vm.isRunning).toBe(true) // Stays running since API call didn't happen
    })

    it('handles pause/resume cycle correctly', async () => {
      await wrapper.setData({
        currentTask: { id: 'task-1', title: 'Test Task' },
      })

      wrapper.vm.startTicking()
      vi.advanceTimersByTime(30000)

      wrapper.vm.pauseTimer()
      const pausedTime = wrapper.vm.elapsedSeconds

      vi.advanceTimersByTime(10000)
      expect(wrapper.vm.elapsedSeconds).toBe(pausedTime)

      wrapper.vm.resumeTimer()
      vi.advanceTimersByTime(15000)
      
      expect(wrapper.vm.elapsedSeconds).toBe(45) // 30 + 15 (10 seconds during pause don't count)
    })
  })
})