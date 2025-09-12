import { apiHelper } from './api'

export interface DashboardStats {
  totalClients: number
  activeProjects: number
  monthlyRevenue: number
  monthlyHours: number
  pendingInvoices: number
}

export interface RecentActivity {
  id: string
  description: string
  project: string
  projectId: string
  duration: number
  createdAt: string
  type: 'timer' | 'task' | 'invoice'
}

class DashboardService {
  
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiHelper.get<any>('/reports/stats')
      const data = response.data || response

      return {
        totalClients: data.totalClients || 0,
        activeProjects: data.activeProjects || 0,
        monthlyRevenue: data.totalRevenue || 0, // Backend uses totalRevenue for the period
        monthlyHours: Math.round((data.billableHours || 0)), // Convert to integer hours
        pendingInvoices: data.pendingInvoices || 0
      }
    } catch (error) {

      return this.calculateStats()
    }
  }

  private async calculateStats(): Promise<DashboardStats> {
    try {
      const [clients, projects, timeEntries, invoices] = await Promise.all([
        apiHelper.get('/clients'),
        apiHelper.get('/projects'),
        apiHelper.get('/time-entries'),
        apiHelper.get('/invoices')
      ])

      const clientsData = Array.isArray(clients?.data) ? clients.data : 
                         Array.isArray(clients) ? clients : []
      const projectsData = Array.isArray(projects?.data) ? projects.data : 
                          Array.isArray(projects) ? projects : []
      const timeEntriesData = Array.isArray(timeEntries?.data) ? timeEntries.data : 
                             Array.isArray(timeEntries) ? timeEntries : []
      const invoicesData = Array.isArray(invoices?.data) ? invoices.data : 
                          Array.isArray(invoices) ? invoices : []

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const monthlyInvoices = invoicesData.filter((inv: any) => {
        const invDate = new Date(inv.createdAt || inv.date)
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear
      })

      const monthlyRevenue = monthlyInvoices.reduce((sum: number, inv: any) => {
        const amount = Number(inv.total || inv.amount || 0)
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)

      const monthlyEntries = timeEntriesData.filter((entry: any) => {
        const entryDate = new Date(entry.startTime || entry.createdAt)
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
      })

      const totalSeconds = monthlyEntries.reduce((sum: number, entry: any) => {
        const duration = Number(entry.duration || 0)
        return sum + (isNaN(duration) ? 0 : duration)
      }, 0)
      
      const monthlyHours = Math.round(totalSeconds / 3600)

      const pendingInvoices = invoicesData.filter((inv: any) => 
        inv.status === 'pending' || inv.status === 'sent' || inv.status === 'unpaid'
      ).length

      const activeProjects = projectsData.filter((proj: any) => 
        proj.status === 'ACTIVE' || proj.status === 'IN_PROGRESS' || proj.status === 'active' || proj.status === 'in_progress'
      ).length

      return {
        totalClients: clientsData.length,
        activeProjects,
        monthlyRevenue,
        monthlyHours,
        pendingInvoices
      }
    } catch (error) {
      console.error('Error calculating stats:', error)

      return {
        totalClients: 0,
        activeProjects: 0,
        monthlyRevenue: 0,
        monthlyHours: 0,
        pendingInvoices: 0
      }
    }
  }

  async getRecentActivity(limit = 5): Promise<RecentActivity[]> {
    try {
      const response = await apiHelper.get(`/time-entries?limit=${limit}&sort=-createdAt`)
      const entries = Array.isArray(response?.data) ? response.data : 
                     Array.isArray(response) ? response : []
      
      return entries.map((entry: any) => ({
        id: entry.id,
        description: entry.description || entry.task?.title || 'Rad na projektu',
        project: entry.project?.name || entry.task?.project?.name || 'Nepoznat projekt',
        projectId: entry.projectId || entry.task?.projectId || '',
        duration: Math.round((entry.duration || 0) / 60), // Convert seconds to minutes
        createdAt: entry.createdAt || entry.startTime,
        type: 'timer' as const
      }))
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  async getRevenueData(period = 'monthly'): Promise<any> {
    try {
      const response = await apiHelper.get(`/reports/revenue?period=${period}`)
      return response.data || response
    } catch (error) {
      console.error('Revenue data endpoint not available:', error)

      return {
        labels: ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip'],
        data: [0, 0, 0, 0, 0, 0]
      }
    }
  }
}

export default new DashboardService()