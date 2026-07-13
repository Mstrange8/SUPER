<template>
  <div class="resources-page">
    <!-- Rules Section -->
    <section class="rules-section">
      <div class="rules-container">
        <h1 class="section-number">01 RULES</h1>
        
        <div class="rule-item">
          <h2 class="rule-title">THE COURT</h2>
          <p class="rule-text">
            The court is 34 feet long and 17 feet wide. It is divided into two equal halves by a net. Players must stay on the court and cannot step over the baseline or net.
          </p>
          <div class="rule-divider"></div>
        </div>

        <div class="rule-item">
          <h2 class="rule-title">THE BALL</h2>
          <p class="rule-text">
            The ball must be struck with a paddle. It is served diagonally from the baseline to the diagonally opposite service court. The ball must be in play until it hits the ground or a paddle.
          </p>
          <div class="rule-divider"></div>
        </div>

        <div class="rule-item">
          <h2 class="rule-title">SCORING</h2>
          <p class="rule-text">
            Points are scored when the ball lands in the opponent's court. A rally ends when the ball hits the ground or a paddle. The game is played to 11 points, with a two-point margin to win.
          </p>
          <div class="rule-divider"></div>
        </div>
      </div>
    </section>

    <!-- Helpful Links Section -->
    <section class="links-section">
      <div class="links-container">
        <h1 class="links-title">HELPFUL LINKS</h1>
        <div class="title-divider"></div>

        <div v-if="loading" class="loading">Loading resources...</div>

        <div v-else class="links-list">
          <div
            v-for="resource in resourceStore.resources"
            :key="resource.id"
            class="link-item"
          >
            <h3 class="link-title">{{ resource.title }}</h3>
            <p class="link-description">{{ resource.description || 'Still to come...' }}</p>
            <a
              v-if="resource.url"
              :href="resource.url"
              target="_blank"
              rel="noopener noreferrer"
              class="link-url"
            >
              Visit Link →
            </a>
          </div>

          <div v-if="resourceStore.resources.length === 0" class="no-resources">
            <p>No resources available yet.</p>
          </div>
        </div>
      </div>
      <div style="margin-top: 2rem; text-align: center; width: fit-content; align-items: center; margin-left: auto; margin-right: auto;">
        <button
          v-if="authStore.isAdmin"
          @click="showCreateModal = true"
          class="btn-primary">
          + ADD RESOURCE
        </button>
      </div>
    </section>

    <!-- Create Resource Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>Add New Resource</h2>
        <form @submit.prevent="handleCreateResource">
          <div class="form-group">
            <label>Title *</label>
            <input v-model="form.title" type="text" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>URL *</label>
            <input v-model="form.url" type="url" required />
          </div>

          <div class="form-group">
            <label>Type</label>
            <select v-model="form.resource_type">
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="brand">Brand</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Creating...' : 'Create Resource' }}
            </button>
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useResourceStore } from '../stores/resource.store';
import { useAuthStore } from '../stores/auth.store';

const resourceStore = useResourceStore();
const authStore = useAuthStore();

const loading = ref(true);
const showCreateModal = ref(false);
const submitting = ref(false);

const form = ref({
  title: '',
  description: '',
  url: '',
  resource_type: 'article' as 'article' | 'brand' | 'video' | 'other',
});

onMounted(async () => {
  try {
    await resourceStore.fetchResources();
  } catch (error) {
    console.error('Failed to fetch resources:', error);
  } finally {
    loading.value = false;
  }
});

const closeModal = () => {
  showCreateModal.value = false;
  resetForm();
};

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    url: '',
    resource_type: 'article' as 'article' | 'brand' | 'video' | 'other',
  };
};

const handleCreateResource = async () => {
  submitting.value = true;
  try {
    await resourceStore.createResource(form.value);
    closeModal();
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to create resource');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.resources-page {
  width: 100%;
}

/* Rules Section */
.rules-section {
  background: #4A7C59;
  padding: 4rem 2rem;
}

.rules-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-number {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 700;
  color: white;
  margin-bottom: 3rem;
  letter-spacing: 2px;
}

.rule-item {
  margin-bottom: 3rem;
}

.rule-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: 1px;
}

.rule-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: white;
  max-width: 1000px;
  margin-bottom: 2rem;
}

.rule-divider {
  width: 100%;
  height: 3px;
  background: var(--color-primary);
}

/* Links Section */
.links-section {
  background: var(--color-background);
  padding: 4rem 2rem;
}

.links-container {
  max-width: 1400px;
  margin: 0 auto;
}

.links-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: 1rem;
  letter-spacing: -1px;
}

.title-divider {
  width: 100%;
  height: 3px;
  background: var(--color-primary);
  margin-bottom: 3rem;
}

.loading {
  text-align: center;
  padding: 3rem 0;
  color: var(--color-secondary);
  font-size: 1.25rem;
}

.links-list {
  display: grid;
  gap: 3rem;
}

.link-item {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
  padding-bottom: 2rem;
}

.link-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-secondary);
}

.link-description {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--color-secondary);
  opacity: 0.8;
}

.link-url {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  display: inline-block;
  margin-top: 0.5rem;
  transition: color var(--transition-base);
}

.link-url:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.no-resources {
  text-align: center;
  padding: 3rem 0;
  color: var(--color-secondary);
}

.no-resources p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: var(--color-secondary);
  border: 2px solid var(--color-secondary);
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-secondary:hover {
  background: var(--color-secondary);
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--color-surface);
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 3px solid var(--color-secondary);
}

.modal-content h2 {
  font-size: 1.75rem;
  color: var(--color-secondary);
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-secondary);
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions button {
  flex: 1;
}

@media (max-width: 768px) {
  .rules-section,
  .links-section {
    padding: 2rem 1rem;
  }

  .link-item {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
