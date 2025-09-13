<template>
  <div v-if="visible" :class="['toast', type]" @click="close">
    <div class="toast-icon">
      <svg v-if="type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <svg v-else-if="type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <svg v-else-if="type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <div class="toast-content">
      <div class="toast-title" v-if="title">{{ title }}</div>
      <div class="toast-message">{{ message }}</div>
    </div>
    <button @click.stop="close" class="toast-close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  message: string
  title?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  autoClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000,
  autoClose: true
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(true)
let timeoutId: number | null = null

function close() {
  visible.value = false
  emit('close')
}

onMounted(() => {
  if (props.autoClose) {
    timeoutId = window.setTimeout(close, props.duration)
  }
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

<style scoped>
.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 400px;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-left: 4px solid;
  cursor: pointer;
}

.toast.success {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.toast.success .toast-icon {
  color: #10b981;
}

.toast.error {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.toast.error .toast-icon {
  color: #ef4444;
}

.toast.warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.toast.warning .toast-icon {
  color: #f59e0b;
}

.toast.info {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

.toast.info .toast-icon {
  color: #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: #6b7280;
}

@media (max-width: 480px) {
  .toast {
    max-width: none;
  }
}
</style>