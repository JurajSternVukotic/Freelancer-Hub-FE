import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import ClientsView from '../views/clients/ClientsView.vue';
import ClientFormView from '../views/clients/ClientFormView.vue';
import ClientDetailView from '../views/clients/ClientDetailView.vue';
import ProjectsView from '../views/projects/ProjectsView.vue';
import ProjectFormView from '../views/projects/ProjectFormView.vue';
import ProjectDetailView from '../views/projects/ProjectDetailView.vue';
import KanbanView from '../views/tasks/KanbanView.vue';
import TasksView from '../views/tasks/TasksView.vue';
import TimeTrackingView from '../views/time/TimeTrackingView.vue';
import TimeEntriesView from '../views/time/TimeEntriesView.vue';
import TimesheetView from '../views/time/TimesheetView.vue';
import InvoicesListView from '../views/invoices/InvoicesListView.vue';
import InvoiceGenerateView from '../views/invoices/InvoiceGenerateView.vue';
import FinancialDashboardView from '../views/reports/FinancialDashboardView.vue';
import ExpensesView from '../views/reports/ExpensesView.vue';
import ProposalsView from '../views/reports/ProposalsView.vue';
import ProposalFormView from '../views/reports/ProposalFormView.vue';
import ProposalDetailView from '../views/reports/ProposalDetailView.vue';
import RetainersView from '../views/reports/RetainersView.vue';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/clients',
    name: 'clients',
    component: ClientsView
  },
  {
    path: '/clients/new',
    name: 'client-form',
    component: ClientFormView
  },
  {
    path: '/clients/:id',
    name: 'client-detail',
    component: ClientDetailView
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView
  },
  {
    path: '/projects/new',
    name: 'project-form',
    component: ProjectFormView
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: ProjectDetailView
  },
  {
    path: '/kanban',
    name: 'kanban',
    component: KanbanView
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TasksView
  },
  {
    path: '/projects/:id/kanban',
    name: 'project-kanban',
    component: () => import('../views/projects/KanbanView.vue')
  },
  {
    path: '/time-tracking',
    name: 'time-tracking',
    component: TimeTrackingView
  },
  {
    path: '/time-entries',
    name: 'time-entries',
    component: TimeEntriesView
  },
  {
    path: '/timesheet',
    name: 'timesheet',
    component: TimesheetView
  },
  {
    path: '/invoices',
    name: 'invoices',
    component: InvoicesListView
  },
  {
    path: '/invoices/generate',
    name: 'invoice-generate',
    component: InvoiceGenerateView
  },
  {
    path: '/projects/:id/expenses',
    name: 'project-expenses',
    component: () => import('../views/projects/ProjectExpensesView.vue')
  },
  {
    path: '/financial',
    name: 'financial-dashboard',
    component: FinancialDashboardView
  },
  {
    path: '/expenses',
    name: 'expenses',
    component: ExpensesView
  },
  {
    path: '/proposals',
    name: 'proposals',
    component: ProposalsView
  },
  {
    path: '/proposals/new',
    name: 'proposal-form',
    component: ProposalFormView
  },
  {
    path: '/proposals/:id',
    name: 'proposal-detail',
    component: ProposalDetailView
  },
  {
    path: '/retainers',
    name: 'retainers',
    component: RetainersView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;