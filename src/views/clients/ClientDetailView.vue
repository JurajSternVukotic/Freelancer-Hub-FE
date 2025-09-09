<template>
  <div class="client-detail">
    <div v-if="loading" class="loading">Učitavanje...</div>
    <div v-else-if="client" class="client-content">
      <div class="client-header">
        <h1>{{ client.company }}</h1>
        <div class="client-actions">
          <router-link v-if="client && client.id" :to="`/clients/${client.id}/edit`" class="btn btn-primary">
            Uredi
          </router-link>
          <button 
            v-if="client && client.id" 
            @click="deleteClient" 
            class="btn btn-danger"
          >
            Obriši
          </button>
        </div>
      </div>

      <div class="client-info">
        <div class="info-section">
          <h3>Osnovni podaci</h3>
          <div class="info-row">
            <span class="label">Kontakt osoba:</span>
            <span>{{ client.contactPerson }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span>{{ client.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">Telefon:</span>
            <span>{{ client.phone }}</span>
          </div>
          <div class="info-row">
            <span class="label">OIB:</span>
            <span>{{ client.oib }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Adresa</h3>
          <div class="info-row">
            <span class="label">Adresa:</span>
            <span>{{ client.address }}</span>
          </div>
          <div class="info-row">
            <span class="label">Grad:</span>
            <span>{{ client.city }}</span>
          </div>
          <div class="info-row">
            <span class="label">Država:</span>
            <span>{{ client.country }}</span>
          </div>
        </div>

        <div v-if="client.notes" class="info-section">
          <h3>Napomene</h3>
          <p>{{ client.notes }}</p>
        </div>
      </div>

      <div class="projects-section">
        <h3>Projekti</h3>
        <div v-if="projects.length > 0" class="projects-list">
          <div v-for="project in projects" :key="project.id" class="project-card">
            <router-link :to="`/projects/${project.id}`">
              <h4>{{ project.name }}</h4>
              <p>Status: {{ project.status }}</p>
            </router-link>
          </div>
        </div>
        <div v-else class="no-projects">
          Nema projekata za ovog klijenta.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClientsStore } from '@/stores/clients';

const route = useRoute();
const router = useRouter();
const clientsStore = useClientsStore();

const client = ref<any>(null);
const projects = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const clientId = route.params.id as string;
    console.log('Loading client with ID:', clientId);
    
    await clientsStore.fetchClient(clientId);

    client.value = clientsStore.currentClient;
    
    console.log('Client loaded:', client.value);

    projects.value = [];
  } catch (error) {
    console.error('Failed to load client:', error);
    router.push('/clients');
  } finally {
    loading.value = false;
  }
});

const deleteClient = async () => {
  if (!client.value || !client.value.id) {
    console.error('No client data available');
    return;
  }
  
  if (confirm('Jeste li sigurni da želite obrisati ovog klijenta?')) {
    try {
      await clientsStore.deleteClient(client.value.id);
      router.push('/clients');
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  }
};
</script>

<style scoped>
.client-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
}

.client-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
}

.client-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.client-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.info-section {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
}

.info-section h3 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: var(--text-secondary);
}

.projects-section {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
}

.projects-section h3 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.project-card {
  background: var(--bg-primary);
  padding: 15px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.project-card a {
  text-decoration: none;
  color: inherit;
}

.project-card h4 {
  margin-bottom: 8px;
  color: var(--text-primary);
}

.project-card p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.no-projects {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
}
</style>