<template>
  <div class="client-portal-layout">
    
    <header class="client-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="client-logo">
            <router-link to="/client/dashboard" class="logo-link">
              FreelancerHub
              <span class="client-badge">Klijentski Portal</span>
            </router-link>
          </h1>
        </div>
        
        <nav class="client-nav">
          <router-link 
            to="/client/dashboard" 
            class="nav-link"
            active-class="active"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            Nadzorna ploča
          </router-link>
          
          <router-link 
            to="/client/project-requests" 
            class="nav-link"
            active-class="active"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Zahtjevi za projekt
          </router-link>
          
          <router-link 
            to="/client/invoices" 
            class="nav-link"
            active-class="active"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Računi
          </router-link>
        </nav>
        
        <div class="header-right">
          <div class="client-info">
            <div class="client-details">
              <div class="client-name">{{ clientAuthStore.client?.contactPerson }}</div>
              <div class="client-company">{{ clientAuthStore.client?.company }}</div>
            </div>
            
            <div class="client-menu">
              <button @click="showDropdown = !showDropdown" class="client-menu-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
              
              <div v-if="showDropdown" class="dropdown-menu">
                <button @click="handleLogout" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Odjava
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="client-main">
      <div class="main-content">
        <router-view />
      </div>
    </main>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientAuthStore } from '../../stores/clientAuth'
import ToastContainer from '../ui/ToastContainer.vue'

const router = useRouter()
const clientAuthStore = useClientAuthStore()

const showDropdown = ref(false)

async function handleLogout() {
  showDropdown.value = false
  await clientAuthStore.logout()
  router.push('/auth/login')
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.client-menu')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.client-portal-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
}

.client-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.client-logo {
  margin: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--primary);
  font-size: 1.5rem;
  font-weight: 700;
}

.client-badge {
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--primary-light);
  color: var(--primary);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.client-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--primary);
  background-color: var(--primary-light);
}

.nav-link.active {
  color: var(--primary);
  background-color: var(--primary-light);
}

.header-right {
  display: flex;
  align-items: center;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-details {
  text-align: right;
}

.client-name {
  font-weight: 600;
  color: var(--text-primary);
}

.client-company {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.client-menu {
  position: relative;
}

.client-menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 0.375rem;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.client-menu-button:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 50;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.5rem;
}

.dropdown-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.client-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
}

@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .client-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
  
  .nav-link {
    font-size: 0.875rem;
    padding: 0.5rem;
  }
  
  .client-details {
    text-align: left;
  }
  
  .main-content {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .client-nav {
    gap: 0.5rem;
  }
  
  .nav-link {
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    padding: 0.5rem 0.25rem;
  }
  
  .nav-link svg {
    width: 16px;
    height: 16px;
  }
}
</style>