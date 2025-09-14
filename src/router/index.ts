import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useClientAuthStore } from '../stores/clientAuth'
import { useAppStore } from '../stores/app'

const DashboardLayout = () => import('../components/layouts/DashboardLayout.vue')
const AuthLayout = () => import('../components/layouts/AuthLayout.vue')
const ClientPortalLayout = () => import('../components/layouts/ClientPortalLayout.vue')

const LoginView = () => import('../views/auth/LoginView.vue')
const RegisterView = () => import('../views/auth/RegisterView.vue')
const ForgotPasswordView = () => import('../views/auth/ForgotPasswordView.vue')
const ResetPasswordView = () => import('../views/auth/ResetPasswordView.vue')

const DashboardView = () => import('../views/DashboardView.vue')

const ClientsView = () => import('../views/clients/ClientsView.vue')
const ClientDetailView = () => import('../views/clients/ClientDetailView.vue')
const ClientFormView = () => import('../views/clients/ClientFormView.vue')

const ProjectsView = () => import('../views/projects/ProjectsView.vue')
const ProjectDetailView = () => import('../views/projects/ProjectDetailView.vue')
const ProjectFormView = () => import('../views/projects/ProjectFormView.vue')
const ProjectExpensesView = () => import('../views/projects/ProjectExpensesView.vue')

const TasksView = () => import('../views/tasks/TasksView.vue')
const KanbanView = () => import('../views/tasks/KanbanView.vue')

const TimeTrackingView = () => import('../views/time/TimeTrackingView.vue')
const TimesheetView = () => import('../views/time/TimesheetView.vue')

const InvoicesView = () => import('../views/reports/InvoicesView.vue')
const InvoiceDetailView = () => import('../views/reports/InvoiceDetailView.vue')
const InvoiceFormView = () => import('../views/reports/InvoiceFormView.vue')
const ProposalsView = () => import('../views/reports/ProposalsView.vue')
const ProposalDetailView = () => import('../views/reports/ProposalDetailView.vue')
const ProposalFormView = () => import('../views/reports/ProposalFormView.vue')
const ExpensesView = () => import('../views/reports/ExpensesView.vue')
const RetainersView = () => import('../views/reports/RetainersView.vue')

const ReportsView = () => import('../views/reports/ReportsView.vue')
const RevenueReportView = () => import('../views/reports/RevenueReportView.vue')
const ProjectReportView = () => import('../views/reports/ProjectReportView.vue')
const TimeReportView = () => import('../views/reports/TimeReportView.vue')

const ProfileView = () => import('../views/ProfileView.vue')
const SettingsView = () => import('../views/SettingsView.vue')

const AiAssistantView = () => import('../views/ai/AiAssistantView.vue')

const NotFoundView = () => import('../views/errors/NotFoundView.vue')

const ClientDashboardView = () => import('../views/client/ClientDashboardView.vue')
const ClientProjectRequestsView = () => import('../views/client/ClientProjectRequestsView.vue')
const ClientInvoicesView = () => import('../views/client/ClientInvoicesView.vue')

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresGuest: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView,
        meta: { title: 'Prijava' }
      },
      {
        path: 'register',
        name: 'Register',
        component: RegisterView,
        meta: { title: 'Registracija' }
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: ForgotPasswordView,
        meta: { title: 'Zaboravljena lozinka' }
      },
      {
        path: 'reset-password/:token',
        name: 'ResetPassword',
        component: ResetPasswordView,
        meta: { title: 'Resetiranje lozinke' },
        props: true
      }
    ]
  },
  
  {
    path: '/client',
    component: ClientPortalLayout,
    meta: { requiresClientAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'ClientDashboard',
        component: ClientDashboardView,
        meta: { title: 'Klijentski Portal - Nadzorna ploča' }
      },
      {
        path: 'project-requests',
        name: 'ClientProjectRequests',
        component: ClientProjectRequestsView,
        meta: { title: 'Klijentski Portal - Zahtjevi za projekt' }
      },
      {
        path: 'invoices',
        name: 'ClientInvoices',
        component: ClientInvoicesView,
        meta: { title: 'Klijentski Portal - Računi' }
      },
      
      {
        path: '',
        redirect: '/client/dashboard'
      }
    ]
  },
  
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: 'Nadzorna ploča' }
      },
      
      {
        path: 'clients',
        name: 'Clients',
        component: ClientsView,
        meta: { title: 'Klijenti' }
      },
      {
        path: 'clients/new',
        name: 'ClientCreate',
        component: ClientFormView,
        meta: { title: 'Novi klijent' }
      },
      {
        path: 'clients/:id',
        name: 'ClientDetail',
        component: ClientDetailView,
        meta: { title: 'Detalji klijenta' },
        props: true
      },
      {
        path: 'clients/:id/edit',
        name: 'ClientEdit',
        component: ClientFormView,
        meta: { title: 'Uređivanje klijenta' },
        props: true
      },
      
      {
        path: 'projects',
        name: 'Projects',
        component: ProjectsView,
        meta: { title: 'Projekti' }
      },
      {
        path: 'projects/new',
        name: 'ProjectCreate',
        component: ProjectFormView,
        meta: { title: 'Novi projekt' }
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: ProjectDetailView,
        meta: { title: 'Detalji projekta' },
        props: true
      },
      {
        path: 'projects/:id/edit',
        name: 'ProjectEdit',
        component: ProjectFormView,
        meta: { title: 'Uređivanje projekta' },
        props: true
      },
      {
        path: 'projects/:id/expenses',
        name: 'ProjectExpenses',
        component: ProjectExpensesView,
        meta: { title: 'Troškovi projekta' },
        props: true
      },
      
      {
        path: 'tasks',
        name: 'Tasks',
        component: TasksView,
        meta: { title: 'Zadaci' }
      },
      {
        path: 'kanban',
        name: 'Kanban',
        component: KanbanView,
        meta: { title: 'Kanban ploča' }
      },
      
      {
        path: 'time',
        name: 'TimeTracking',
        component: TimeTrackingView,
        meta: { title: 'Praćenje vremena' }
      },
      {
        path: 'timesheet',
        name: 'Timesheet',
        component: TimesheetView,
        meta: { title: 'Evidencija rada' }
      },
      
      { path: 'finances', redirect: '/reports' },
      { path: 'expenses', redirect: '/reports/expenses' },
      { path: 'proposals', redirect: '/reports/proposals' },
      { path: 'retainers', redirect: '/reports/retainers' },
      { path: 'invoices', redirect: '/reports/invoices' },
      { path: 'invoices/new', redirect: '/reports/invoices/new' },
      
      {
        path: 'reports',
        name: 'Reports',
        component: ReportsView,
        meta: { title: 'Financije & Izvještaji' }
      },
      {
        path: 'reports/revenue',
        name: 'RevenueReport',
        component: RevenueReportView,
        meta: { title: 'Izvještaj prihoda' }
      },
      {
        path: 'reports/projects',
        name: 'ProjectReport',
        component: ProjectReportView,
        meta: { title: 'Izvještaj projekata' }
      },
      {
        path: 'reports/time',
        name: 'TimeReport',
        component: TimeReportView,
        meta: { title: 'Izvještaj vremena' }
      },
      {
        path: 'reports/invoices',
        name: 'InvoicesManagement',
        component: InvoicesView,
        meta: { title: 'Upravljanje računima' }
      },
      {
        path: 'reports/invoices/new',
        name: 'InvoiceCreate',
        component: InvoiceFormView,
        meta: { title: 'Novi račun' }
      },
      {
        path: 'reports/invoices/:id',
        name: 'InvoiceDetail',
        component: InvoiceDetailView,
        meta: { title: 'Detalji računa' },
        props: true
      },
      {
        path: 'reports/invoices/:id/edit',
        name: 'InvoiceEdit',
        component: InvoiceFormView,
        meta: { title: 'Uređivanje računa' },
        props: true
      },
      {
        path: 'reports/proposals',
        name: 'ProposalsManagement',
        component: ProposalsView,
        meta: { title: 'Upravljanje ponudama' }
      },
      {
        path: 'reports/proposals/new',
        name: 'ProposalCreate',
        component: ProposalFormView,
        meta: { title: 'Nova ponuda' }
      },
      {
        path: 'reports/proposals/:id',
        name: 'ProposalDetail',
        component: ProposalDetailView,
        meta: { title: 'Detalji ponude' },
        props: true
      },
      {
        path: 'reports/proposals/:id/edit',
        name: 'ProposalEdit',
        component: ProposalFormView,
        meta: { title: 'Uređivanje ponude' },
        props: true
      },
      {
        path: 'reports/expenses',
        name: 'ExpensesManagement',
        component: ExpensesView,
        meta: { title: 'Upravljanje troškovima' }
      },
      {
        path: 'reports/retainers',
        name: 'RetainersManagement',
        component: RetainersView,
        meta: { title: 'Upravljanje honorarima' }
      },
      
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileView,
        meta: { title: 'Profil' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView,
        meta: { title: 'Postavke' }
      },
      
      {
        path: 'ai-assistant',
        name: 'AiAssistant',
        component: AiAssistantView,
        meta: { title: 'AI Asistent' }
      }
    ]
  },
  
  
  {
    path: '/login',
    redirect: '/auth/login'
  },
  {
    path: '/register',
    redirect: '/auth/register'
  },
  
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: 'Stranica nije pronađena' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const clientAuthStore = useClientAuthStore()
  const appStore = useAppStore()
  
  appStore.setLoading(true)
  
  if (to.meta.title) {
    document.title = `${to.meta.title} - FreelancerHub`
  } else {
    document.title = 'FreelancerHub'
  }
  
  if (to.meta.requiresClientAuth) {
    if (!clientAuthStore.isAuthenticated) {
      next('/auth/login')
      return
    }
  }
  
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      const isAuthenticated = await authStore.checkAuth()
      
      if (!isAuthenticated) {
        next('/auth/login')
        return
      }
    }
  }
  
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

router.afterEach(() => {
  const appStore = useAppStore()
  appStore.setLoading(false)
})

export default router