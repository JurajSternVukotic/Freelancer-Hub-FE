import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  RevenueData, 
  ProjectProfitability, 
  ClientDistribution, 
  UtilizationData, 
  ReportFilter,
  Project,
  TimeEntry,
  Client
} from '../types'
import { reportService, type ReportStats, type RevenueParams } from '../services/reportService'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useReportsStore = defineStore('reports', () => {

  const revenueData = ref<RevenueData[]>([])
  const projectStats = ref<ProjectProfitability[]>([])
  const clientStats = ref<ClientDistribution[]>([])
  const timeStats = ref<UtilizationData[]>([])
  const reportStats = ref<ReportStats | null>(null)
  const availableProjects = ref<Project[]>([])
  const timeEntries = ref<TimeEntry[]>([])
  
  const isLoading = ref(false)
  const currentFilters = ref<ReportFilter>({
    startDate: undefined,
    endDate: undefined,
    clientId: undefined,
    projectId: undefined,
    status: undefined
  })

  const totalRevenue = computed(() => 
    revenueData.value.reduce((sum, data) => sum + data.revenue, 0)
  )
  
  const totalProfit = computed(() => 
    revenueData.value.reduce((sum, data) => sum + data.profit, 0)
  )
  
  const totalExpenses = computed(() => 
    revenueData.value.reduce((sum, data) => sum + data.expenses, 0)
  )
  
  const mostProfitableProject = computed(() => {
    if (projectStats.value.length === 0) return null
    return projectStats.value.reduce((max, project) => 
      project.profit > max.profit ? project : max
    )
  })
  
  const topClient = computed(() => {
    if (clientStats.value.length === 0) return null
    return clientStats.value.reduce((max, client) => 
      client.revenue > max.revenue ? client : max
    )
  })
  
  const averageUtilization = computed(() => {
    if (timeStats.value.length === 0) return 0
    const total = timeStats.value.reduce((sum, data) => sum + data.utilizationRate, 0)
    return Math.round((total / timeStats.value.length) * 100) / 100
  })
  
  const revenueChartData = computed(() => ({
    labels: revenueData.value.map(data => data.period),
    datasets: [{
      label: 'Prihod',
      data: revenueData.value.map(data => data.revenue),
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 2,
      fill: true
    }, {
      label: 'Rashod',
      data: revenueData.value.map(data => data.expenses),
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
      borderColor: 'rgb(239, 68, 68)',
      borderWidth: 2,
      fill: true
    }, {
      label: 'Profit',
      data: revenueData.value.map(data => data.profit),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      fill: true
    }]
  }))
  
  const projectProfitabilityChartData = computed(() => ({
    labels: projectStats.value.map(data => data.projectName),
    datasets: [{
      label: 'Profit (€)',
      data: projectStats.value.map(data => data.profit),
      backgroundColor: projectStats.value.map(data => 
        data.profit >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
      ),
      borderColor: projectStats.value.map(data => 
        data.profit >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
      ),
      borderWidth: 2
    }]
  }))
  
  const clientDistributionChartData = computed(() => ({
    labels: clientStats.value.map(data => data.clientName),
    datasets: [{
      label: 'Prihod (€)',
      data: clientStats.value.map(data => data.revenue),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(245, 101, 101, 0.8)'
      ].slice(0, clientStats.value.length),
      borderWidth: 2
    }]
  }))
  
  const utilizationChartData = computed(() => ({
    labels: timeStats.value.map(data => data.period),
    datasets: [{
      label: 'Naplativi sati',
      data: timeStats.value.map(data => data.billableHours),
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 2
    }, {
      label: 'Ukupni sati',
      data: timeStats.value.map(data => data.totalHours),
      backgroundColor: 'rgba(156, 163, 175, 0.6)',
      borderColor: 'rgb(156, 163, 175)',
      borderWidth: 2
    }]
  }))

  async function fetchRevenueData(params: RevenueParams) {
    isLoading.value = true
    
    try {
      revenueData.value = await reportService.getRevenueData(params)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju podataka o prihodu'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchProjectStats(filters: ReportFilter = {}) {
    isLoading.value = true
    currentFilters.value = { ...currentFilters.value, ...filters }
    
    try {
      projectStats.value = await reportService.getProjectStats(filters)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju statistike projekata'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchClientStats(filters: ReportFilter = {}) {
    isLoading.value = true
    currentFilters.value = { ...currentFilters.value, ...filters }
    
    try {
      clientStats.value = await reportService.getClientStats(filters)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju statistike klijenata'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchTimeStats(filters: ReportFilter = {}) {
    isLoading.value = true
    currentFilters.value = { ...currentFilters.value, ...filters }
    
    try {
      timeStats.value = await reportService.getTimeStats(filters)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju statistike vremena'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchReportStats(filters: ReportFilter = {}) {
    isLoading.value = true
    currentFilters.value = { ...currentFilters.value, ...filters }
    
    try {
      console.log('📊 Fetching report stats with filters:', filters)
      reportStats.value = await reportService.getReportStats(filters)
      console.log('✅ Report stats received:', reportStats.value)
    } catch (error: any) {
      console.error('❌ Failed to fetch report stats:', error)
      const message = error.response?.data?.message || 'Greška pri dohvaćanju općenite statistike'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchAllReports(filters: ReportFilter = {}) {
    isLoading.value = true
    
    try {

      await Promise.all([
        fetchRevenueData({ period: 'monthly', ...filters }),
        fetchProjectStats(filters),
        fetchClientStats(filters),
        fetchTimeStats(filters),
        fetchReportStats(filters)
      ])
      
      toast.success('Izvještaji su uspješno učitani')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri učitavanju izvještaja'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchProjectsForFilter() {
    try {
      availableProjects.value = await reportService.getProjectsForReports()
    } catch (error: any) {
      console.error('Greška pri dohvaćanju projekata za filter:', error)
    }
  }
  
  async function fetchTimeEntriesForAnalysis(filters: ReportFilter = {}) {
    isLoading.value = true
    
    try {
      timeEntries.value = await reportService.getTimeEntriesForReports(filters)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri dohvaćanju unosa vremena'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function exportReport(type: 'revenue' | 'projects' | 'clients' | 'time', filters: ReportFilter = {}) {
    isLoading.value = true
    
    try {
      const blob = await reportService.exportReport(type, filters)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Izvještaj je uspješno izvezen')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri izvozu izvještaja'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  function clearFilters() {
    currentFilters.value = {
      startDate: undefined,
      endDate: undefined,
      clientId: undefined,
      projectId: undefined,
      status: undefined
    }
  }
  
  function setDateRange(startDate: string, endDate: string) {
    currentFilters.value.startDate = startDate
    currentFilters.value.endDate = endDate
  }

  function setLastMonth() {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    setDateRange(
      lastMonth.toISOString().split('T')[0],
      lastMonthEnd.toISOString().split('T')[0]
    )
  }
  
  function setThisMonth() {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    setDateRange(
      thisMonthStart.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    )
  }
  
  function setLastQuarter() {
    const now = new Date()
    const currentQuarter = Math.floor(now.getMonth() / 3)
    const lastQuarterStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1)
    const lastQuarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0)
    
    setDateRange(
      lastQuarterStart.toISOString().split('T')[0],
      lastQuarterEnd.toISOString().split('T')[0]
    )
  }
  
  function setThisYear() {
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    
    setDateRange(
      yearStart.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    )
  }
  
  return {

    revenueData,
    projectStats,
    clientStats,
    timeStats,
    reportStats,
    availableProjects,
    timeEntries,
    isLoading,
    currentFilters,

    totalRevenue,
    totalProfit,
    totalExpenses,
    mostProfitableProject,
    topClient,
    averageUtilization,
    revenueChartData,
    projectProfitabilityChartData,
    clientDistributionChartData,
    utilizationChartData,

    fetchRevenueData,
    fetchProjectStats,
    fetchClientStats,
    fetchTimeStats,
    fetchReportStats,
    fetchAllReports,
    fetchProjectsForFilter,
    fetchTimeEntriesForAnalysis,
    exportReport,
    clearFilters,
    setDateRange,
    setLastMonth,
    setThisMonth,
    setLastQuarter,
    setThisYear
  }
})