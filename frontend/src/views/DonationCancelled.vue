<template>
  <div class="cancelled-container">
    <div class="cancelled-card">
      <div class="cancelled-icon">❌</div>
      <h1>Donation Cancelled</h1>
      <p class="cancelled-message">
        Your donation was not completed. No charges were made to your account.
      </p>

      <div class="actions">
        <router-link to="/donate" class="btn-try-again">Try Again</router-link>
        <router-link to="/" class="btn-home">Return to Home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.cancelled-container {
  max-width: 600px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.cancelled-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 3rem 2rem;
  text-align: center;
}

.cancelled-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.cancelled-card h1 {
  color: #333;
  margin-bottom: 1rem;
}

.cancelled-message {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-try-again,
.btn-home {
  display: inline-block;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-try-again {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-home {
  background: #f0f0f0;
  color: #333;
}

.btn-try-again:hover,
.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
