<template>
  <div class="home">
    <h1>Welcome to Sanpete Pickleball</h1>
    <p>Your hub for pickleball in Sanpete County, Utah</p>
    
    <div v-if="authStore.isAuthenticated" class="welcome-user">
      <p>Welcome back, {{ authStore.user?.username }}!</p>
      <button @click="handleLogout" class="btn-secondary">Logout</button>
    </div>
    
    <div v-else class="auth-buttons">
      <router-link to="/login" class="btn-primary">Login</router-link>
      <router-link to="/register" class="btn-secondary">Register</router-link>
    </div>

    <div class="features">
      <div class="feature-card">
        <h2>📅 Events Calendar</h2>
        <p>Stay updated on tournaments, leagues, and social events</p>
      </div>
      <div class="feature-card">
        <h2>🏛️ Court Directory</h2>
        <p>Find pickleball courts near you with maps and details</p>
      </div>
      <div class="feature-card">
        <h2>💬 Community Groups</h2>
        <p>Connect with other players and join discussions</p>
      </div>
      <div class="feature-card">
        <h2>📚 Resources</h2>
        <p>Access helpful articles, brands, and pickleball tips</p>
      </div>
    </div>

    <!-- Donation CTA -->
    <div class="donation-cta">
      <div class="cta-content">
        <h2>💚 Support Our Community</h2>
        <p>Help us maintain courts, organize events, and grow pickleball in Sanpete County</p>
        <router-link to="/donate" class="btn-donate">Make a Donation</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.home {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
}

.home > p {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.welcome-user {
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-user p {
  font-size: 1.2rem;
  color: #4CAF50;
  margin-bottom: 1rem;
}

.auth-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #fff;
  color: #4CAF50;
  border: 2px solid #4CAF50;
}

.btn-secondary:hover {
  background-color: #f0f0f0;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h2 {
  color: #333;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
}

.donation-cta {
  margin-top: 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem;
  border-radius: 12px;
  text-align: center;
  color: white;
}

.cta-content h2 {
  color: white;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.cta-content p {
  color: white;
  opacity: 0.95;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.btn-donate {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s;
}

.btn-donate:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
</style>
