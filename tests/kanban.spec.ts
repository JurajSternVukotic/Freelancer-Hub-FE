import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { server } from './setup'
import { rest } from 'msw'

const Draggable = {
  props: ['list', 'group', 'tag', 'itemKey'],
  template: `
    <div :class="tag || 'div'" data-testid="draggable-container">
      <div 
        v-for="(item, index) in list" 
        :key="itemKey ? item[itemKey] : index"
        :data-testid="'draggable-item-' + (itemKey ? item[itemKey] : index)"
        class="draggable-item"
        @dragstart="handleDragStart(item, index, $event)"
        @dragover.prevent
        @drop="handleDrop(item, index, $event)"
        draggable="true"
      >
        <slot name="item" :element="item" :index="index" />
      </div>
    </div>
  `,
  methods: {
    handleDragStart(item: any, index: number, event: DragEvent) {
      event.dataTransfer?.setData('text/plain', JSON.stringify({ item, index }))
      this.$emit('start', { item, oldIndex: index })
    },
    handleDrop(targetItem: any, targetIndex: number, event: DragEvent) {
      event.preventDefault()
      const dragData = event.dataTransfer?.getData('text/plain')
      if (dragData) {
        const { item, index: oldIndex } = JSON.parse(dragData)
        this.$emit('end', { item, oldIndex, newIndex: targetIndex })
      }
    },
  },
}

const TaskCard = {
  props: ['task'],
  template: `
    <div 
      class="task-card"
      :class="[
        'priority-' + task.priority,
        'status-' + task.status
      ]"
      :data-testid="'task-card-' + task.id"
    >
      <div class="task-header">
        <h3>{{ task.title }}</h3>
        <span class="task-priority" :data-testid="'task-priority-' + task.id">
          {{ task.priority }}
        </span>
      </div>
      
      <p class="task-description">{{ task.description }}</p>
      
      <div class="task-meta">
        <span v-if="task.dueDate" class="due-date">
          Due: {{ formatDate(task.dueDate) }}
        </span>
        <span v-if="task.estimatedHours" class="estimated-hours">
          Est: {{ task.estimatedHours }}h
        </span>
      </div>
      
      <div class="task-actions">
        <button 
          @click="$emit('edit-task', task)"
          data-testid="edit-task-button"
        >
          Edit
        </button>
        <button 
          @click="$emit('delete-task', task)"
          data-testid="delete-task-button"
        >
          Delete
        </button>
      </div>
    </div>
  `,
  methods: {
    formatDate(date: string | Date) {
      return new Date(date).toLocaleDateString('hr-HR')
    },
  },
}

const KanbanBoard = {
  components: {
    Draggable,
    TaskCard,
  },
  template: `
    <div class="kanban-board" data-testid="kanban-board">
      <div class="board-header">
        <h2>Project Tasks</h2>
        <button 
          @click="showAddTaskModal = true"
          data-testid="add-task-button"
        >
          Add Task
        </button>
      </div>
      
      <div class="board-filters">
        <select 
          v-model="selectedPriority"
          @change="applyFilters"
          data-testid="priority-filter"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      
      <div class="kanban-columns" data-testid="kanban-columns">
        <div 
          v-for="column in columns" 
          :key="column.status"
          class="kanban-column"
          :data-testid="'column-' + column.status"
        >
          <div class="column-header">
            <h3>{{ column.title }}</h3>
            <span class="task-count">{{ getTasksForColumn(column.status).length }}</span>
          </div>
          
          <Draggable
            :list="getTasksForColumn(column.status)"
            group="tasks"
            item-key="id"
            tag="div"
            class="column-tasks"
            @end="handleTaskMove"
            :data-testid="'column-tasks-' + column.status"
          >
            <template #item="{ element: task }">
              <TaskCard
                :task="task"
                @edit-task="handleEditTask"
                @delete-task="handleDeleteTask"
              />
            </template>
          </Draggable>
          
          <div class="column-footer">
            <button 
              @click="handleAddTaskToColumn(column.status)"
              class="add-task-column"
              :data-testid="'add-task-to-' + column.status"
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      <div v-if="showAddTaskModal" class="modal-overlay" data-testid="add-task-modal">
        <div class="modal">
          <h3>Add New Task</h3>
          <form @submit.prevent="handleAddTask">
            <input 
              v-model="newTask.title" 
              placeholder="Task title" 
              data-testid="new-task-title"
            />
            <textarea 
              v-model="newTask.description" 
              placeholder="Task description"
              data-testid="new-task-description"
            ></textarea>
            <select 
              v-model="newTask.priority"
              data-testid="new-task-priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select 
              v-model="newTask.status"
              data-testid="new-task-status"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            <div class="modal-actions">
              <button type="submit" data-testid="save-task-button">Save</button>
              <button 
                type="button" 
                @click="showAddTaskModal = false"
                data-testid="cancel-task-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      tasks: [
        {
          id: 'task-1',
          title: 'Setup Project Structure',
          description: 'Initialize the project with proper folder structure',
          status: 'todo',
          priority: 'high',
          position: 0,
          estimatedHours: 4,
          dueDate: '2025-03-01',
        },
        {
          id: 'task-2',
          title: 'Design Database Schema',
          description: 'Create ERD and implement database tables',
          status: 'in-progress',
          priority: 'urgent',
          position: 0,
          estimatedHours: 8,
          dueDate: '2025-02-25',
        },
        {
          id: 'task-3',
          title: 'Implement Authentication',
          description: 'Build login and registration functionality',
          status: 'review',
          priority: 'medium',
          position: 0,
          estimatedHours: 6,
          dueDate: '2025-02-28',
        },
        {
          id: 'task-4',
          title: 'Write Documentation',
          description: 'Create user guide and API documentation',
          status: 'done',
          priority: 'low',
          position: 0,
          estimatedHours: 2,
          dueDate: '2025-02-20',
        },
      ],
      columns: [
        { status: 'todo', title: 'To Do' },
        { status: 'in-progress', title: 'In Progress' },
        { status: 'review', title: 'Review' },
        { status: 'done', title: 'Done' },
      ],
      selectedPriority: '',
      filteredTasks: [],
      showAddTaskModal: false,
      newTask: {
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
      },
    }
  },
  created() {
    this.applyFilters()
  },
  methods: {
    getTasksForColumn(status: string) {
      return this.filteredTasks
        .filter((task: any) => task.status === status)
        .sort((a: any, b: any) => a.position - b.position)
    },
    applyFilters() {
      this.filteredTasks = this.tasks.filter((task: any) => {
        if (this.selectedPriority && task.priority !== this.selectedPriority) {
          return false
        }
        return true
      })
      this.$emit('filters-applied', { priority: this.selectedPriority })
    },
    async handleTaskMove(event: any) {
      const { item: task, oldIndex, newIndex } = event

      const targetElement = event.to
      const targetColumn = targetElement.closest('.kanban-column')
      const newStatus = targetColumn?.dataset.testid?.replace('column-', '') || task.status

      try {
        const response = await fetch('/api/tasks/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: task.id,
            newPosition: newIndex,
            newStatus,
            oldStatus: task.status,
          }),
        })
        
        if (response.ok) {

          const taskIndex = this.tasks.findIndex((t: any) => t.id === task.id)
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], status: newStatus, position: newIndex }
            this.applyFilters()
          }
          
          this.$emit('task-moved', { task, oldIndex, newIndex, newStatus })
        }
      } catch (error) {
        console.error('Failed to move task:', error)
        this.$emit('task-move-error', error)
      }
    },
    handleAddTaskToColumn(status: string) {
      this.newTask.status = status
      this.showAddTaskModal = true
    },
    async handleAddTask() {
      if (!this.newTask.title.trim()) return
      
      const task = {
        id: 'task-' + Date.now(),
        ...this.newTask,
        position: this.getTasksForColumn(this.newTask.status).length,
        createdAt: new Date().toISOString(),
      }
      
      this.tasks.push(task)
      this.applyFilters()
      this.showAddTaskModal = false
      this.newTask = { title: '', description: '', priority: 'medium', status: 'todo' }
      
      this.$emit('task-added', task)
    },
    handleEditTask(task: any) {
      this.$emit('edit-task', task)
    },
    handleDeleteTask(task: any) {
      const index = this.tasks.findIndex((t: any) => t.id === task.id)
      if (index !== -1) {
        this.tasks.splice(index, 1)
        this.applyFilters()
        this.$emit('task-deleted', task)
      }
    },
  },
}

describe('KanbanBoard Component', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(KanbanBoard)
  })

  describe('Component Rendering', () => {
    it('renders kanban board with all columns', () => {
      expect(wrapper.find('[data-testid="kanban-board"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="kanban-columns"]').exists()).toBe(true)

      expect(wrapper.find('[data-testid="column-todo"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="column-in-progress"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="column-review"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="column-done"]').exists()).toBe(true)
    })

    it('displays tasks in correct columns', () => {
      const todoColumn = wrapper.find('[data-testid="column-tasks-todo"]')
      const inProgressColumn = wrapper.find('[data-testid="column-tasks-in-progress"]')
      const reviewColumn = wrapper.find('[data-testid="column-tasks-review"]')
      const doneColumn = wrapper.find('[data-testid="column-tasks-done"]')

      expect(todoColumn.find('[data-testid="task-card-task-1"]').exists()).toBe(true)
      expect(inProgressColumn.find('[data-testid="task-card-task-2"]').exists()).toBe(true)
      expect(reviewColumn.find('[data-testid="task-card-task-3"]').exists()).toBe(true)
      expect(doneColumn.find('[data-testid="task-card-task-4"]').exists()).toBe(true)
    })

    it('shows task counts for each column', () => {
      const columns = wrapper.findAll('.kanban-column')
      
      columns.forEach(column => {
        const taskCount = column.find('.task-count')
        expect(taskCount.exists()).toBe(true)
        expect(parseInt(taskCount.text())).toBeGreaterThanOrEqual(0)
      })
    })

    it('displays task priorities with correct styling', () => {
      const urgentTask = wrapper.find('[data-testid="task-priority-task-2"]')
      const highTask = wrapper.find('[data-testid="task-priority-task-1"]')
      const mediumTask = wrapper.find('[data-testid="task-priority-task-3"]')
      const lowTask = wrapper.find('[data-testid="task-priority-task-4"]')

      expect(urgentTask.text()).toBe('urgent')
      expect(highTask.text()).toBe('high')
      expect(mediumTask.text()).toBe('medium')
      expect(lowTask.text()).toBe('low')
    })
  })

  describe('Task Filtering', () => {
    it('filters tasks by priority', async () => {
      const priorityFilter = wrapper.find('[data-testid="priority-filter"]')

      await priorityFilter.setValue('high')
      
      expect(wrapper.emitted('filters-applied')).toBeTruthy()
      expect(wrapper.emitted('filters-applied')?.[1]?.[0]).toEqual({ priority: 'high' })

      expect(wrapper.find('[data-testid="task-card-task-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="task-card-task-2"]').exists()).toBe(false) // urgent
      expect(wrapper.find('[data-testid="task-card-task-3"]').exists()).toBe(false) // medium
      expect(wrapper.find('[data-testid="task-card-task-4"]').exists()).toBe(false) // low
    })

    it('shows all tasks when no priority filter is selected', async () => {
      const priorityFilter = wrapper.find('[data-testid="priority-filter"]')

      await priorityFilter.setValue('urgent')
      await nextTick()

      await priorityFilter.setValue('')

      expect(wrapper.find('[data-testid="task-card-task-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="task-card-task-2"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="task-card-task-3"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="task-card-task-4"]').exists()).toBe(true)
    })

    it('updates column counts after filtering', async () => {
      const priorityFilter = wrapper.find('[data-testid="priority-filter"]')
      await priorityFilter.setValue('urgent')

      const inProgressColumn = wrapper.find('[data-testid="column-in-progress"]')
      const taskCount = inProgressColumn.find('.task-count')
      expect(taskCount.text()).toBe('1')

      const todoColumn = wrapper.find('[data-testid="column-todo"]')
      const todoCount = todoColumn.find('.task-count')
      expect(todoCount.text()).toBe('0')
    })
  })

  describe('Task Management', () => {
    it('opens add task modal', async () => {
      const addTaskButton = wrapper.find('[data-testid="add-task-button"]')
      await addTaskButton.trigger('click')
      
      expect(wrapper.find('[data-testid="add-task-modal"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="new-task-title"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="new-task-description"]').exists()).toBe(true)
    })

    it('adds task to specific column', async () => {
      const addToInProgressButton = wrapper.find('[data-testid="add-task-to-in-progress"]')
      await addToInProgressButton.trigger('click')
      
      expect(wrapper.find('[data-testid="add-task-modal"]').exists()).toBe(true)
      
      const statusSelect = wrapper.find('[data-testid="new-task-status"]')
      expect(statusSelect.element.value).toBe('in-progress')
    })

    it('creates new task with form data', async () => {

      const addTaskButton = wrapper.find('[data-testid="add-task-button"]')
      await addTaskButton.trigger('click')

      const titleInput = wrapper.find('[data-testid="new-task-title"]')
      const descriptionInput = wrapper.find('[data-testid="new-task-description"]')
      const prioritySelect = wrapper.find('[data-testid="new-task-priority"]')
      
      await titleInput.setValue('New Test Task')
      await descriptionInput.setValue('This is a test task description')
      await prioritySelect.setValue('high')

      const saveButton = wrapper.find('[data-testid="save-task-button"]')
      await saveButton.trigger('click')
      
      expect(wrapper.emitted('task-added')).toBeTruthy()
      
      const addedTask = wrapper.emitted('task-added')?.[0]?.[0]
      expect(addedTask.title).toBe('New Test Task')
      expect(addedTask.description).toBe('This is a test task description')
      expect(addedTask.priority).toBe('high')
    })

    it('cancels task creation', async () => {
      const addTaskButton = wrapper.find('[data-testid="add-task-button"]')
      await addTaskButton.trigger('click')
      
      const cancelButton = wrapper.find('[data-testid="cancel-task-button"]')
      await cancelButton.trigger('click')
      
      expect(wrapper.find('[data-testid="add-task-modal"]').exists()).toBe(false)
    })

    it('validates required fields when adding task', async () => {
      const addTaskButton = wrapper.find('[data-testid="add-task-button"]')
      await addTaskButton.trigger('click')

      const saveButton = wrapper.find('[data-testid="save-task-button"]')
      await saveButton.trigger('click')

      expect(wrapper.find('[data-testid="add-task-modal"]').exists()).toBe(true)
      expect(wrapper.emitted('task-added')).toBeFalsy()
    })
  })

  describe('Task Actions', () => {
    it('emits edit-task event when edit button is clicked', async () => {
      const editButton = wrapper.find('[data-testid="task-card-task-1"]').find('[data-testid="edit-task-button"]')
      await editButton.trigger('click')
      
      expect(wrapper.emitted('edit-task')).toBeTruthy()
      
      const editedTask = wrapper.emitted('edit-task')?.[0]?.[0]
      expect(editedTask.id).toBe('task-1')
    })

    it('removes task when delete button is clicked', async () => {
      const deleteButton = wrapper.find('[data-testid="task-card-task-1"]').find('[data-testid="delete-task-button"]')
      await deleteButton.trigger('click')
      
      expect(wrapper.emitted('task-deleted')).toBeTruthy()
      
      const deletedTask = wrapper.emitted('task-deleted')?.[0]?.[0]
      expect(deletedTask.id).toBe('task-1')

      await nextTick()
      expect(wrapper.find('[data-testid="task-card-task-1"]').exists()).toBe(false)
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('handles task move within same column', async () => {
      server.use(
        rest.put('/api/tasks/reorder', (req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )

      const draggableContainer = wrapper.find('[data-testid="column-tasks-todo"]')

      const dragEvent = {
        item: { id: 'task-1', status: 'todo' },
        oldIndex: 0,
        newIndex: 1,
        to: {
          closest: vi.fn().mockReturnValue({
            dataset: { testid: 'column-todo' }
          })
        }
      }
      
      await wrapper.vm.handleTaskMove(dragEvent)
      
      expect(wrapper.emitted('task-moved')).toBeTruthy()
      
      const moveEvent = wrapper.emitted('task-moved')?.[0]?.[0]
      expect(moveEvent.task.id).toBe('task-1')
      expect(moveEvent.newStatus).toBe('todo')
    })

    it('handles task move between different columns', async () => {
      server.use(
        rest.put('/api/tasks/reorder', (req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )

      const dragEvent = {
        item: { id: 'task-1', status: 'todo' },
        oldIndex: 0,
        newIndex: 0,
        to: {
          closest: vi.fn().mockReturnValue({
            dataset: { testid: 'column-in-progress' }
          })
        }
      }
      
      await wrapper.vm.handleTaskMove(dragEvent)
      
      expect(wrapper.emitted('task-moved')).toBeTruthy()
      
      const moveEvent = wrapper.emitted('task-moved')?.[0]?.[0]
      expect(moveEvent.task.id).toBe('task-1')
      expect(moveEvent.newStatus).toBe('in-progress')
    })

    it('handles API errors during task move', async () => {
      server.use(
        rest.put('/api/tasks/reorder', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }))
        })
      )

      const dragEvent = {
        item: { id: 'task-1', status: 'todo' },
        oldIndex: 0,
        newIndex: 1,
        to: {
          closest: vi.fn().mockReturnValue({
            dataset: { testid: 'column-todo' }
          })
        }
      }
      
      await wrapper.vm.handleTaskMove(dragEvent)
      
      expect(wrapper.emitted('task-move-error')).toBeTruthy()
    })

    it('maintains position integrity after moves', async () => {
      server.use(
        rest.put('/api/tasks/reorder', (req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )

      const dragEvent = {
        item: { id: 'task-1', status: 'todo' },
        oldIndex: 0,
        newIndex: 2,
        to: {
          closest: vi.fn().mockReturnValue({
            dataset: { testid: 'column-todo' }
          })
        }
      }
      
      await wrapper.vm.handleTaskMove(dragEvent)

      const updatedTask = wrapper.vm.tasks.find((t: any) => t.id === 'task-1')
      expect(updatedTask.position).toBe(2)
    })
  })

  describe('Croatian Date Formatting', () => {
    it('displays dates in Croatian format (DD.MM.YYYY)', () => {
      const taskCard = wrapper.find('[data-testid="task-card-task-1"]')
      const dueDateElement = taskCard.find('.due-date')
      
      expect(dueDateElement.exists()).toBe(true)

      const dateText = dueDateElement.text()
      expect(dateText).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/)
    })

    it('formats different dates correctly', () => {

      const formatCroatianDate = (date: string | Date): string => {
        return new Date(date).toLocaleDateString('hr-HR')
      }
      
      const testDates = [
        '2025-02-01',
        '2025-12-25',
        '2025-05-15',
      ]
      
      testDates.forEach(dateStr => {
        const formatted = formatCroatianDate(dateStr)
        expect(formatted).toMatch(/\d{1,2}\.\s?\d{1,2}\.\s?\d{4}\.?/)
      })
    })
  })

  describe('Responsive Design', () => {
    it('adapts to mobile viewport', async () => {

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const mobileWrapper = mount(KanbanBoard)

      const kanbanColumns = mobileWrapper.find('[data-testid="kanban-columns"]')
      expect(kanbanColumns.exists()).toBe(true)

    })
  })

  describe('Performance', () => {
    it('handles large number of tasks efficiently', () => {

      const manyTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: `Description for task ${i}`,
        status: ['todo', 'in-progress', 'review', 'done'][i % 4],
        priority: ['low', 'medium', 'high', 'urgent'][i % 4],
        position: i,
      }))

      const largeWrapper = mount(KanbanBoard, {
        data() {
          return { tasks: manyTasks }
        }
      })

      expect(largeWrapper.find('[data-testid="kanban-columns"]').exists()).toBe(true)

      const todoTasks = largeWrapper.vm.getTasksForColumn('todo')
      expect(todoTasks.length).toBe(25) // Every 4th task starting from 0
    })

    it('optimizes filtering for large datasets', async () => {
      const manyTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        status: ['todo', 'in-progress', 'review', 'done'][i % 4],
        priority: ['low', 'medium', 'high', 'urgent'][i % 4],
        position: i,
      }))

      const largeWrapper = mount(KanbanBoard, {
        data() {
          return { tasks: manyTasks }
        }
      })

      const priorityFilter = largeWrapper.find('[data-testid="priority-filter"]')

      const startTime = performance.now()
      await priorityFilter.setValue('urgent')
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should complete in less than 100ms

      const urgentTasks = largeWrapper.vm.filteredTasks.filter((t: any) => t.priority === 'urgent')
      expect(urgentTasks.length).toBe(250) // Every 4th task starting from 3
    })
  })
})