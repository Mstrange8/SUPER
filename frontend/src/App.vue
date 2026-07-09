<template>
  <div id="app">
    <a href="#main-content" class="skip-to-main">Skip to main content</a>
    
    <!-- Main Header -->
    <header class="header">
      <nav class="navbar">
        <router-link to="/" class="logo">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="22" fill="#E57353"/>
            <circle cx="25" cy="25" r="14" fill="none" stroke="#2F5F5F" stroke-width="2.5"/>
            <line x1="25" y1="8" x2="25" y2="42" stroke="#2F5F5F" stroke-width="2.5"/>
            <line x1="8" y1="25" x2="42" y2="25" stroke="#2F5F5F" stroke-width="2.5"/>
          </svg>
          <div class="logo-text">
            <div class="logo-super">SUPER</div>
            <div class="logo-pb">Pickleball</div>
          </div>
        </router-link>

        <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="nav-menu" :class="{ 'mobile-open': mobileMenuOpen }">
          <router-link to="/events" @click="mobileMenuOpen = false">EVENTS CALENDAR</router-link>
          <router-link to="/courts" @click="mobileMenuOpen = false">COURT DIRECTORY</router-link>
          <router-link to="/resources" @click="mobileMenuOpen = false">RESOURCES</router-link>
          <router-link to="/groups" @click="mobileMenuOpen = false">GROUPS</router-link>
        </div>

        <div class="nav-auth">
          <template v-if="authStore.isAuthenticated">
            <div class="user-menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="#2F5F5F" stroke-width="2"/>
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="#2F5F5F" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="username">{{ authStore.user?.username }}</span>
              <button @click="handleLogout" class="logout-btn">Log Out</button>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="login-link" @click="mobileMenuOpen = false">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="#E57353" stroke-width="2"/>
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="#E57353" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>Log In</span>
            </router-link>
          </template>
        </div>
      </nav>
    </header>

    <!-- Ticker Bar -->
    <div class="ticker-bar">
      <div class="ticker-content">
        <span>FIND A COURT • UPCOMING TOURNAMENTS • JOIN OUR COMMUNITY • EXPLORE RULES • SUPPORT OUR PLAYERS • FIND A COURT • UPCOMING TOURNAMENTS • JOIN OUR COMMUNITY • EXPLORE RULES • SUPPORT OUR PLAYERS • </span>
        <span>FIND A COURT • UPCOMING TOURNAMENTS • JOIN OUR COMMUNITY • EXPLORE RULES • SUPPORT OUR PLAYERS • FIND A COURT • UPCOMING TOURNAMENTS • JOIN OUR COMMUNITY • EXPLORE RULES • SUPPORT OUR PLAYERS • </span>
      </div>
    </div>

    <!-- Main Content -->
    <main id="main-content">
      <router-view />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.store';
import Footer from './components/Footer.vue';

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

// Refresh user profile on app load to get updated role
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.fetchProfile();
  }
});

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
  background: var(--color-background);
}

main {
  flex: 1;
}

/* Header */
.header {
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-border);
}

.navbar {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-super {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-secondary);
  letter-spacing: 0.5px;
}

.logo-pb {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-secondary);
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-btn span {
  width: 28px;
  height: 3px;
  background: var(--color-secondary);
  transition: all 0.3s;
  border-radius: 2px;
}

.nav-menu {
  display: flex;
  gap: 2.5rem;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.nav-menu a {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.8px;
  transition: color var(--transition-base);
  position: relative;
  padding: 0.5rem 0;
}

.nav-menu a:hover {
  color: var(--color-primary);
}

.nav-menu a.router-link-active {
  color: var(--color-primary);
}

.nav-menu a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-primary);
}

.nav-auth {
  flex-shrink: 0;
}

.login-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: opacity var(--transition-base);
}

.login-link:hover {
  opacity: 0.8;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.username {
  color: var(--color-secondary);
  font-weight: 600;
  font-size: 0.9rem;
}

.logout-btn {
  background: transparent;
  color: var(--color-secondary);
  border: 2px solid var(--color-secondary);
  padding: 0.4rem 0.9rem;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-base);
  letter-spacing: 0.5px;
}

.logout-btn:hover {
  background: var(--color-secondary);
  color: white;
}

/* Ticker Bar */
.ticker-bar {
  background: #2D5F4F;
  overflow: hidden;
  padding: 0.75rem 0;
  position: relative;
}

.ticker-content {
  display: flex;
  white-space: nowrap;
  animation: scroll 30s linear infinite;
}

.ticker-content span {
  color: #FFA500;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 1px;
  padding-right: 2rem;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* Mobile Responsive */
@media (max-width: 968px) {
  .navbar {
    padding: 1rem;
    flex-wrap: wrap;
  }

  .mobile-menu-btn {
    display: flex;
    order: 3;
  }

  .nav-menu {
    order: 4;
    width: 100%;
    flex-direction: column;
    gap: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    background: var(--color-surface);
    margin: 0 -1rem -1rem;
  }

  .nav-menu.mobile-open {
    max-height: 400px;
    border-top: 1px solid var(--color-border);
    padding: 1rem 0;
  }

  .nav-menu a {
    width: 100%;
    padding: 1rem 1.5rem;
    text-align: center;
  }

  .nav-menu a.router-link-active::after {
    display: none;
  }

  .nav-auth {
    order: 2;
  }
}
</style>
