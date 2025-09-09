import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import ClientsView from '../views/clients/ClientsView.vue';
import ClientFormView from '../views/clients/ClientFormView.vue';
import ClientDetailView from '../views/clients/ClientDetailView.vue';

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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;