<template>
  <div id="app">
    <a href="#main-content" class="skip-to-main">Skip to main content</a>
    
    <header class="header">
      <nav class="navbar">
        <div class="nav-brand">
          <router-link to="/" class="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#E57353"/>
              <circle cx="20" cy="20" r="12" fill="none" stroke="#2F5F5F" stroke-width="2"/>
              <line x1="20" y1="8" x2="20" y2="32" stroke="#2F5F5F" stroke-width="2"/>
              <line x1="8" y1="20" x2="32" y2="20" stroke="#2F5F5F" stroke-width="2"/>
            </svg>
            <span class="logo-text">
              <strong>SUPER</strong> Pickleball
            </span>
          </router-link>
        </div>
        
        <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="nav-links" :class="{ 'mobile-open': mobileMenuOpen }">
          <router-link to="/events" @click="mobileMenuOpen = false">EVENTS CALENDAR</router-link>
          <router-link to="/courts" @click="mobileMenuOpen = false">COURT DIRECTORY</router-link>
          <router-link to="/resources" @click="mobileMenuOpen = false">RESOURCES</router-link>
          <router-link to="/groups" @click="mobileMenuOpen = false">GROUPS</router-link>
          
          <div class="nav-auth">
            <template v-if="authStore.isAuthenticated">
              <span class="user-info">{{ authStore.user?.username }}</span>
              <button @click="handleLogout" class="btn-logout">Log Out</button>
            </template>
            <template v-else>
              <router-link to="/login" class="btn-login" @click="mobileMenuOpen = false">Log In</router-link>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <main id="main-content">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.store';
import Footer from './components/Footer.vue';

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/');
  mobileMenuOpen.value = false;
};
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.header {
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-text {
  font-size: 1.25rem;
  color: var(--color-secondary);
}

.logo-text strong {
  color: var(--color-secondary);
  font-weight: 700;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-btn span {
  width: 24px;
  height: 3px;
  background: var(--color-secondary);
  transition: all 0.3s;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: color var(--transition-base);
  position: relative;
}

.nav-links a:hover {
  color: var(--color-primary);
}

.nav-links a.router-link-active {
  color: var(--color-primary);
}

.nav-links a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 1rem;
  border-left: 2px solid var(--color-border);
}

.user-info {
  color: var(--color-secondary);
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-logout,
.btn-login {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 0;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all var(--transition-base);
  text-decoration: none;
  display: inline-block;
}

.btn-logout:hover,
.btn-login:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

@media (max-width: 968px) {
  .navbar {
    padding: 1rem;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    background: var(--color-surface);
    flex-direction: column;
    gap: 0;
    padding: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    box-shadow: var(--shadow-lg);
  }

  .nav-links.mobile-open {
    max-height: 500px;
  }

  .nav-links a {
    width: 100%;
    padding: 1rem 2rem;
    border-bottom: 1px solid var(--color-border);
  }

  .nav-links a.router-link-active::after {
    display: none;
  }

  .nav-auth {
    width: 100%;
    padding: 1rem 2rem;
    border-left: none;
    border-top: 2px solid var(--color-border);
    justify-content: center;
  }
}
</style>
