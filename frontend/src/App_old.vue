<template>
  <div id="app">
    <header>
      <nav class="navbar">
        <div class="nav-brand">
          <router-link to="/">🏓 Sanpete Pickleball</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/events">Events</router-link>
          <router-link to="/courts">Courts</router-link>
          <router-link to="/resources">Resources</router-link>
          <router-link to="/groups">Groups</router-link>
          <router-link to="/donate" class="donate-link">💚 Donate</router-link>
          <template v-if="authStore.isAuthenticated">
            <span class="user-info">{{ authStore.user?.username }}</span>
            <button @click="handleLogout" class="btn-logout">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login">Login</router-link>
            <router-link to="/register">Register</router-link>
          </template>
        </div>
      </nav>
    </header>
    
    <main>
      <router-view />
    </main>
    
    <footer>
      <p>&copy; 2026 Sanpete Pickleball. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #4CAF50;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

.nav-links a:hover {
  opacity: 0.8;
}

.nav-links .donate-link {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s;
}

.nav-links .donate-link:hover {
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(72, 187, 120, 0.3);
}

.user-info {
  color: white;
  font-weight: 500;
}

.btn-logout {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

main {
  flex: 1;
}

footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>

