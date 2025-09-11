<template>
  <div class="time-tracking-view">
    <div class="page-header">
      <h1>Praćenje vremena</h1>
      <div class="header-actions">
        <button @click="refreshTimerState" class="btn btn-outline" title="Osvježi status timera">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px;">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Osvježi
        </button>
        <router-link to="/timesheet" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px;">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          Evidencija rada
        </router-link>
      </div>
    </div>

    <div class="timer-section">
      <div class="current-timer" v-if="activeTimer">
        <h2>Aktivni tajmer</h2>
        <div class="timer-display">
          <div class="timer-info">
            <h3>{{ activeTimer.task?.title || 'Bez zadatka' }}</h3>
            <p>{{ activeTimer.project?.name || 'Bez projekta' }}</p>
          </div>
          <div class="timer-time">
            <span class="time-display">{{ formattedTime }}</span>
          </div>
          <button @click="stopTimer" class="btn btn-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px;">
              <rect x="6" y="6" width="12" height="12"/>
            </svg>
            Zaustavi
          </button>
        </div>
      </div>

      <div class="start-timer" v-else>
        <h2>Pokreni novi tajmer</h2>
        <form @submit.prevent="startTimer" class="timer-form">
          <div class="form-row">
            <div class="form-group">
              <label>Projekt *</label>
              <select v-model="timerForm.projectId" @change="loadProjectTasks" required class="form-input">
                <option value="">Odaberi projekt</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Zadatak *</label>
              <select v-model="timerForm.taskId" required class="form-input" :disabled="!timerForm.projectId">
                <option value="">Odaberi zadatak</option>
                <option v-for="task in projectTasks" :key="task.id" :value="task.id">
                  {{ task.title }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Opis rada</label>
            <input v-model="timerForm.description" type="text" class="form-input" placeholder="Što radite?">
          </div>
          <button type="submit" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px;">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Pokreni tajmer
          </button>
        </form>
      </div>
    </div>

    <div class="recent-entries">
      <h2>Nedavni unosi</h2>
      <div v-if="recentEntries.length === 0" class="empty-state">
        <p>Nema nedavnih unosa vremena</p>
      </div>
      <div v-else class="entries-list">
        <div v-for="entry in recentEntries" :key="entry.id" class="time-entry">
          <div class="entry-info">
            <h4>{{ entry.task?.title }}</h4>
            <p>{{ entry.project?.name }} • {{ formatDate(entry.startTime) }}</p>
            <p v-if="entry.description" class="entry-description">{{ entry.description }}</p>
          </div>
          <div class="entry-time">
            <span class="duration">{{ formatDuration(entry.duration) }}</span>
            <span v-if="entry.billable" class="billable-badge">Naplativo</span>
          </div>
          <div class="entry-actions">
            <button @click="editEntry(entry)" class="btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button 
              v-if="entry.endTime" 
              @click="deleteEntry(entry.id)" 
              class="btn-icon btn-danger" 
              title="Obriši unos"
            >
              🗑️
            </button>
            <span v-else class="running-timer-label" title="Timer u tijeku - zaustavite timer za brisanje">
              Timer u tijeku
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showManualEntry" class="modal-overlay" @click.self="closeManualEntry">
      <div class="modal">
        <h2>Ručni unos vremena</h2>
        <form @submit.prevent="saveManualEntry">
          <div class="form-group">
            <label>Projekt *</label>
            <select v-model="manualForm.projectId" @change="loadProjectTasksForManual" required class="form-input">
              <option value="">Odaberi projekt</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Zadatak *</label>
            <select v-model="manualForm.taskId" required class="form-input">
              <option value="">Odaberi zadatak</option>
              <option v-for="task in manualProjectTasks" :key="task.id" :value="task.id">
                {{ task.title }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Datum *</label>
              <input v-model="manualForm.date" type="date" required class="form-input">
            </div>
            <div class="form-group">
              <label>Trajanje (sati) *</label>
              <input v-model.number="manualForm.hours" type="number" step="0.25" required class="form-input">
            </div>
          </div>
          <div class="form-group">
            <label>Opis</label>
            <textarea v-model="manualForm.description" rows="3" class="form-input"></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="manualForm.billable" type="checkbox">
              Naplativo
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeManualEntry" class="btn btn-secondary">Odustani</button>
            <button type="submit" class="btn btn-primary">Spremi</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showEditEntry" class="modal-overlay" @click.self="closeEditEntry">
      <div class="modal">
        <h2>Uređivanje unosa vremena</h2>
        <form @submit.prevent="saveEditedEntry">
          <div class="form-row">
            <div class="form-group">
              <label>Početno vrijeme *</label>
              <input v-model="editForm.startTime" type="datetime-local" required class="form-input">
            </div>
            <div class="form-group">
              <label>Završno vrijeme *</label>
              <input v-model="editForm.endTime" type="datetime-local" required class="form-input">
            </div>
          </div>
          <div class="form-group">
            <label>Opis</label>
            <textarea v-model="editForm.description" rows="3" class="form-input"></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="editForm.billable" type="checkbox">
              Naplativo
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeEditEntry" class="btn btn-secondary">Odustani</button>
            <button type="submit" class="btn btn-primary">Spremi</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTimeStore } from '@/stores/time';
import { useTimerStore } from '@/stores/timer';
import { useProjectsStore } from '@/stores/projects';
import { useTasksStore } from '@/stores/tasks';

const timeStore = useTimeStore();
const timerStore = useTimerStore();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();

const projects = ref<any[]>([]);
const projectTasks = ref<any[]>([]);
const manualProjectTasks = ref<any[]>([]);
const recentEntries = ref<any[]>([]);
const showManualEntry = ref(false);
const showEditEntry = ref(false);
const editingEntry = ref<any>(null);

const activeTimer = computed(() => timerStore.currentTimer);
const elapsedTime = computed(() => timerStore.elapsedTime);
const isRunning = computed(() => timerStore.isRunning);
const formattedTime = computed(() => timerStore.formattedTime);

const timerForm = ref({
  projectId: '',
  taskId: '',
  description: ''
});

const manualForm = ref({
  projectId: '',
  taskId: '',
  date: new Date().toISOString().split('T')[0],
  hours: 0,
  description: '',
  billable: true
});

const editForm = ref({
  startTime: '',
  endTime: '',
  description: '',
  billable: true
});

onMounted(async () => {
  await Promise.all([
    loadData(),
    timerStore.initialize() // This will check for and restore any active timer
  ]);
});

onUnmounted(() => {

});

const loadData = async () => {
  try {
    await Promise.all([
      projectsStore.fetchProjects(),
      timeStore.fetchTimeEntries()
    ]);
    projects.value = projectsStore.projects;
    recentEntries.value = timeStore.timeEntries.slice(0, 10);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};

const loadProjectTasks = async () => {
  if (timerForm.value.projectId) {
    try {
      await tasksStore.fetchTasksForProject(timerForm.value.projectId);
      projectTasks.value = tasksStore.tasks.filter(t => t.projectId === timerForm.value.projectId);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  } else {
    projectTasks.value = [];
  }
  timerForm.value.taskId = '';
};

const loadProjectTasksForManual = async () => {
  if (manualForm.value.projectId) {
    try {
      await tasksStore.fetchTasksForProject(manualForm.value.projectId);
      manualProjectTasks.value = tasksStore.tasks.filter(t => t.projectId === manualForm.value.projectId);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  } else {
    manualProjectTasks.value = [];
  }
  manualForm.value.taskId = '';
};

const startTimer = async () => {
  try {
    await timerStore.startTimer({
      taskId: timerForm.value.taskId,
      description: timerForm.value.description
    });

    timerForm.value = {
      projectId: '',
      taskId: '',
      description: ''
    };
  } catch (error: any) {
    console.error('Failed to start timer:', error);

    if (error.response?.status === 409) {
      const confirmRefresh = confirm(
        'Već imate pokrenuti timer u pozadini. Želite li osvježiti stanje timera da ga vidite?'
      );
      if (confirmRefresh) {
        await refreshTimerState();
      }
    } else {
      const message = error.response?.data?.message || 'Greška pri pokretanju timera';
      alert(message);
    }
  }
};

const stopTimer = async () => {
  if (activeTimer.value) {
    try {
      await timerStore.stopTimer();
      await loadData(); // Refresh recent entries to show the completed timer
    } catch (error: any) {
      console.error('Failed to stop timer:', error);
      const message = error.response?.data?.message || 'Greška pri zaustavljanju timera';
      alert(message);
    }
  }
};

const refreshTimerState = async () => {
  try {
    console.log('🔄 Manually refreshing timer state...');
    await timerStore.refresh();
    await loadData(); // Also refresh recent entries
    console.log('✅ Timer state refreshed successfully');
  } catch (error: any) {
    console.error('❌ Failed to refresh timer state:', error);
    const message = error.response?.data?.message || 'Greška pri osvježavanju stanja timera';
    alert(message);
  }
};

const editEntry = (entry: any) => {
  if (!entry.endTime) {
    alert('Ne možete uređivati timer koji je u tijeku. Zaustavite timer prvo.');
    return;
  }
  
  editingEntry.value = entry;
  editForm.value = {
    startTime: new Date(entry.startTime).toISOString().slice(0, 16), // Format for datetime-local input
    endTime: new Date(entry.endTime).toISOString().slice(0, 16),
    description: entry.description || '',
    billable: entry.billable !== false
  };
  showEditEntry.value = true;
};

const deleteEntry = async (id: string) => {
  if (confirm('Jeste li sigurni da želite obrisati ovaj unos?')) {
    try {
      await timeStore.deleteTimeEntry(id);
      await loadData();
    } catch (error: any) {
      console.error('Failed to delete entry:', error);

      const message = error.response?.data?.message || 'Greška pri brisanju unosa vremena';
      alert(message);
    }
  }
};

const saveManualEntry = async () => {
  try {
    const startTime = new Date(manualForm.value.date);
    const duration = manualForm.value.hours * 3600;
    
    await timeStore.createTimeEntry({
      taskId: manualForm.value.taskId,
      startTime: startTime.toISOString(),
      endTime: new Date(startTime.getTime() + duration * 1000).toISOString(),
      duration,
      description: manualForm.value.description,
      billable: manualForm.value.billable
    });
    
    closeManualEntry();
    await loadData();
  } catch (error) {
    console.error('Failed to save manual entry:', error);
  }
};

const closeManualEntry = () => {
  showManualEntry.value = false;
  manualForm.value = {
    projectId: '',
    taskId: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    description: '',
    billable: true
  };
};

const saveEditedEntry = async () => {
  if (!editingEntry.value) return;
  
  try {
    const startTime = new Date(editForm.value.startTime);
    const endTime = new Date(editForm.value.endTime);
    
    if (endTime <= startTime) {
      alert('Završno vrijeme mora biti nakon početnog vremena');
      return;
    }
    
    await timeStore.updateTimeEntry(editingEntry.value.id, {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      description: editForm.value.description,
      billable: editForm.value.billable
    });
    
    closeEditEntry();
    await loadData();
  } catch (error: any) {
    console.error('Failed to update entry:', error);
    const message = error.response?.data?.message || 'Greška pri ažuriranju unosa vremena';
    alert(message);
  }
};

const closeEditEntry = () => {
  showEditEntry.value = false;
  editingEntry.value = null;
  editForm.value = {
    startTime: '',
    endTime: '',
    description: '',
    billable: true
  };
};

const formatDuration = (seconds: number) => {
  if (!seconds) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('hr-HR');
};
</script>

<style scoped>
.time-tracking-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--text-primary);
  margin: 0;
}

.timer-section {
  margin-bottom: 40px;
}

.current-timer, .start-timer {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 30px;
}

.current-timer h2, .start-timer h2 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 30px;
}

.timer-info {
  flex: 1;
}

.timer-info h3 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.timer-info p {
  margin: 0;
  color: var(--text-secondary);
}

.timer-time {
  flex: 0 0 auto;
}

.time-display {
  font-size: 48px;
  font-weight: bold;
  color: var(--primary-color);
  font-family: monospace;
}

.timer-form {
  max-width: 600px;
}

.recent-entries h2 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.time-entry {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.entry-info {
  flex: 1;
}

.entry-info h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.entry-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.entry-description {
  margin-top: 5px !important;
}

.entry-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.duration {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  font-family: monospace;
}

.billable-badge {
  background: #4caf50;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
}

.entry-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-icon:hover {
  background: var(--bg-secondary);
}

.btn-icon.btn-danger {
  color: #f44336;
}

.running-timer-label {
  font-size: 12px;
  color: var(--primary-color);
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
}

.modal h2 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-outline {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>