import { ref, reactive } from 'vue'

export interface ToastMessage {
  id: string
  message: string
  title?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  autoClose?: boolean
}

class ToastService {
  private toasts = ref<ToastMessage[]>([])
  private nextId = 0

  getToasts() {
    return this.toasts
  }

  show(options: Omit<ToastMessage, 'id'>): string {
    const id = `toast-${++this.nextId}-${Date.now()}`
    const toast: ToastMessage = {
      id,
      type: 'info',
      duration: 5000,
      autoClose: true,
      ...options
    }

    this.toasts.value.push(toast)

    if (toast.autoClose) {
      setTimeout(() => {
        this.remove(id)
      }, toast.duration)
    }

    return id
  }

  success(message: string, title?: string, duration?: number): string {
    return this.show({
      message,
      title,
      type: 'success',
      duration: duration || 4000
    })
  }

  error(message: string, title?: string, duration?: number): string {
    return this.show({
      message,
      title,
      type: 'error',
      duration: duration || 8000
    })
  }

  warning(message: string, title?: string, duration?: number): string {
    return this.show({
      message,
      title,
      type: 'warning',
      duration: duration || 6000
    })
  }

  info(message: string, title?: string, duration?: number): string {
    return this.show({
      message,
      title,
      type: 'info',
      duration: duration || 5000
    })
  }

  remove(id: string): void {
    const index = this.toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      this.toasts.value.splice(index, 1)
    }
  }

  clear(): void {
    this.toasts.value = []
  }
}

export const toastService = new ToastService()