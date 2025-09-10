import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import ClientsView from '../views/clients/ClientsView.vue';
import ClientFormView from '../views/clients/ClientFormView.vue';
import ClientDetailView from '../views/clients/ClientDetailView.vue';
import ProjectsView from '../views/projects/ProjectsView.vue';
import ProjectFormView from '../views/projects/ProjectFormView.vue';
import ProjectDetailView from '../views/projects/ProjectDetailView.vue';

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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;