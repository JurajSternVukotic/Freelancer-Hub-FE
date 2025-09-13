import { toastService } from './toastService'

interface PerformanceMetric {
  endpoint: string
  method: string
  duration: number
  timestamp: Date
  status: number
  success: boolean
}

interface ErrorMetric {
  endpoint: string
  method: string
  error: string
  timestamp: Date
  userAgent: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private errors: ErrorMetric[] = []
  private slowRequestThreshold = 2000 // 2 seconds
  private maxMetrics = 100
  private maxErrors = 50

  trackRequest(
    endpoint: string, 
    method: string, 
    startTime: number, 
    status: number,
    success: boolean
  ): void {
    const duration = performance.now() - startTime
    
    const metric: PerformanceMetric = {
      endpoint: this.sanitizeEndpoint(endpoint),
      method: method.toUpperCase(),
      duration: Math.round(duration),
      timestamp: new Date(),
      status,
      success
    }

    this.metrics.push(metric)

    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    if (duration > this.slowRequestThreshold) {
      console.warn(`Slow request detected: ${method} ${endpoint} took ${Math.round(duration)}ms`)

      if (duration > 5000) {
        toastService.warning(
          `Zahtjev je bio spor (${Math.round(duration/1000)}s). Možda je potrebno provjeriti internetsku vezu.`,
          'Spor odgovor'
        )
      }
    }
  }

  trackError(
    endpoint: string,
    method: string,
    error: string
  ): void {
    const errorMetric: ErrorMetric = {
      endpoint: this.sanitizeEndpoint(endpoint),
      method: method.toUpperCase(),
      error: error.slice(0, 200), // Limit error message length
      timestamp: new Date(),
      userAgent: navigator.userAgent
    }

    this.errors.push(errorMetric)

    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }
  }

  private sanitizeEndpoint(endpoint: string): string {

    return endpoint
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/{id}')
      .replace(/\/\d+/g, '/{id}')
      .replace(/[?&]token=[^&]*/g, '?token=***')
      .replace(/[?&]key=[^&]*/g, '?key=***')
  }

  getPerformanceReport(): {
    averageResponseTime: number
    slowRequests: number
    errorRate: number
    totalRequests: number
    recentErrors: ErrorMetric[]
    slowestRequests: PerformanceMetric[]
  } {
    const totalRequests = this.metrics.length
    
    if (totalRequests === 0) {
      return {
        averageResponseTime: 0,
        slowRequests: 0,
        errorRate: 0,
        totalRequests: 0,
        recentErrors: [],
        slowestRequests: []
      }
    }

    const totalTime = this.metrics.reduce((sum, m) => sum + m.duration, 0)
    const averageResponseTime = Math.round(totalTime / totalRequests)
    
    const slowRequests = this.metrics.filter(m => m.duration > this.slowRequestThreshold).length
    const successfulRequests = this.metrics.filter(m => m.success).length
    const errorRate = Math.round(((totalRequests - successfulRequests) / totalRequests) * 100)
    
    const recentErrors = this.errors.slice(-10)
    const slowestRequests = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)

    return {
      averageResponseTime,
      slowRequests,
      errorRate,
      totalRequests,
      recentErrors,
      slowestRequests
    }
  }

  getHealthStatus(): 'good' | 'warning' | 'critical' {
    const report = this.getPerformanceReport()
    
    if (report.totalRequests === 0) return 'good'

    if (report.errorRate > 25 || report.averageResponseTime > 5000) {
      return 'critical'
    }

    if (report.errorRate > 10 || report.averageResponseTime > 2000 || report.slowRequests > 3) {
      return 'warning'
    }
    
    return 'good'
  }

  clearMetrics(): void {
    this.metrics = []
    this.errors = []
  }

  exportReport(): string {
    const report = this.getPerformanceReport()
    const healthStatus = this.getHealthStatus()
    
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      healthStatus,
      ...report,
      userAgent: navigator.userAgent,
      url: window.location.href
    }, null, 2)
  }
}

export const performanceMonitor = new PerformanceMonitor()