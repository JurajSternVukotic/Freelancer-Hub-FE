<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :message="toast.message"
          :title="toast.title"
          :type="toast.type"
          :duration="toast.duration"
          :auto-close="toast.autoClose"
          @close="handleClose(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Toast from './Toast.vue'
import { toastService } from '../../services/toastService'

const toasts = computed(() => toastService.getToasts().value)

function handleClose(id: string) {
  toastService.remove(id)
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}

.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 480px) {
  .toast-container {
    left: 20px;
    right: 20px;
  }
}
</style>