<template>
  <div class="client-form">
    <h1>{{ isEdit ? 'Uredi klijenta' : 'Novi klijent' }}</h1>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Naziv tvrtke</label>
        <input v-model="form.company" type="text" class="form-input">
      </div>

      <div class="form-group">
        <label>Kontakt osoba *</label>
        <input v-model="form.contactPerson" type="text" required class="form-input">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Email *</label>
          <input v-model="form.email" type="email" required class="form-input">
        </div>
        <div class="form-group">
          <label>Telefon</label>
          <input v-model="form.phone" type="tel" class="form-input">
        </div>
      </div>

      <div class="form-group">
        <label>OIB</label>
        <input v-model="form.oib" type="text" pattern="[0-9]{11}" class="form-input">
      </div>

      <div class="form-group">
        <label>Adresa</label>
        <input v-model="form.address" type="text" class="form-input">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Grad</label>
          <input v-model="form.city" type="text" class="form-input">
        </div>
        <div class="form-group">
          <label>Država</label>
          <input v-model="form.country" type="text" class="form-input">
        </div>
      </div>

      <div class="form-group">
        <label>Napomene</label>
        <textarea v-model="form.notes" rows="3" class="form-input"></textarea>
      </div>

      <div class="form-actions">
        <router-link to="/clients" class="btn btn-secondary">Odustani</router-link>
        <button type="submit" class="btn btn-primary">
          {{ isEdit ? 'Spremi promjene' : 'Stvori klijenta' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClientsStore } from '@/stores/clients';

const route = useRoute();
const router = useRouter();
const clientsStore = useClientsStore();

const isEdit = computed(() => !!route.params.id);

const form = ref({
  contactPerson: '',
  company: '',
  email: '',
  phone: '',
  oib: '',
  address: '',
  city: '',
  country: 'Hrvatska',
  notes: '',
  status: 'ACTIVE' as const
});

onMounted(async () => {
  if (isEdit.value) {
    try {
      await clientsStore.fetchClient(route.params.id as string);
      const client = clientsStore.currentClient;
      
      console.log('Client loaded for editing:', client);
      
      if (client) {

        form.value = {
          contactPerson: client.contactPerson || '',
          company: client.company || '',
          email: client.email || '',
          phone: client.phone || '',
          oib: client.oib || '',
          address: client.address || '',
          city: client.city || '',
          country: client.country || 'Hrvatska',
          notes: client.notes || '',
          status: client.status || 'ACTIVE'
        };
      } else {
        throw new Error('Client not found');
      }
    } catch (error) {
      console.error('Failed to load client:', error);
      router.push('/clients');
    }
  }
});

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await clientsStore.updateClient(route.params.id as string, form.value);
    } else {
      await clientsStore.createClient(form.value);
    }
    router.push('/clients');
  } catch (error) {
    console.error('Failed to save client:', error);
  }
};
</script>

<style scoped>
.client-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
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

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
</style>