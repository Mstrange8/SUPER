<template>
  <div class="court-detail-page">
    <div v-if="loading" class="loading">Loading court details...</div>

    <div v-else-if="!courtStore.selectedCourt" class="not-found">
      <p>Court not found</p>
      <router-link to="/courts" class="btn-primary">Back to Courts</router-link>
    </div>

    <div v-else class="court-detail">
      <!-- Hero Section with Split Layout -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="court-title">{{ courtStore.selectedCourt.name.toUpperCase() }}</h1>
          
          <!-- Court Info Grid -->
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">LOCATION</div>
              <div class="info-value">{{ courtStore.selectedCourt.city }}, UT</div>
            </div>

            <div class="info-card">
              <div class="info-label">COURTS</div>
              <div class="info-value">{{ courtStore.selectedCourt.num_courts || 'N/A' }} Dedicated</div>
            </div>

            <div class="info-card">
              <div class="info-label">SURFACE</div>
              <div class="info-value">{{ courtStore.selectedCourt.surface_type || 'N/A' }}</div>
            </div>

            <div class="info-card">
              <div class="info-label">TYPE</div>
              <div class="info-value">Outdoor</div>
            </div>

            <div class="info-card">
              <div class="info-label">LIGHTS</div>
              <div class="info-value">{{ courtStore.selectedCourt.has_lighting ? 'LED High-Mast' : 'None' }}</div>
            </div>

            <div class="info-card">
              <div class="info-label">HOURS</div>
              <div class="info-value">24/7</div>
            </div>
          </div>
        </div>

        <div class="hero-image">
          <div v-if="courtStore.selectedCourt.image_url" class="image-wrapper">
            <img :src="courtStore.selectedCourt.image_url" :alt="courtStore.selectedCourt.name" />
          </div>
          <div v-else class="image-placeholder">
            <span>🏓</span>
          </div>
        </div>
      </section>

      <!-- Description Section -->
      <section class="description-section" v-if="courtStore.selectedCourt.description">
        <div class="container">
          <h2>About This Court</h2>
          <p>{{ courtStore.selectedCourt.description }}</p>
        </div>
      </section>

      <!-- Map Section -->
      <section class="map-section">
        <div class="container">
          <h2>Location & Directions</h2>
          <p class="address">
            📍 {{ courtStore.selectedCourt.address }}, {{ courtStore.selectedCourt.city }}, UT
          </p>
          
          <div class="map-container">
            <iframe
              width="100%"
              height="450"
              style="border:0"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              :src="courtStore.selectedCourt.map_embedding">
            </iframe>
          </div>
          <!-- <div v-else class="no-map">
            <p>Map coordinates not available</p>
          </div> -->
        </div>
      </section>

      <!-- Admin Actions -->
      <section v-if="authStore.isAdmin" class="admin-actions">
        <div class="container">
          <button @click="showEditModal = true" class="btn-secondary">Edit Court</button>
          <button @click="handleDeleteCourt" class="btn-danger">Delete Court</button>
        </div>
      </section>

      <div class="back-link">
        <router-link to="/courts" class="btn-secondary">← Back to Courts</router-link>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h2>Edit Court</h2>
        <form @submit.prevent="handleUpdateCourt">
          <div class="form-group">
            <label>Court Name *</label>
            <input v-model="editForm.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Address *</label>
            <input v-model="editForm.address" type="text" required />
          </div>

          <div class="form-group">
            <label>City *</label>
            <input v-model="editForm.city" type="text" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editForm.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Number of Courts</label>
            <input v-model.number="editForm.number_of_courts" type="number" min="1" />
          </div>

          <div class="form-group">
            <label>
              <input v-model="editForm.has_lights" type="checkbox" />
              Has Lights
            </label>
          </div>

          <div class="form-group">
            <label>Surface Type</label>
            <input v-model="editForm.surface_type" type="text" />
          </div>

          <div class="form-group">
            <label>Google Map Embedding</label>
            <input v-model="editForm.map_embedding" type="text" />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Updating...' : 'Update Court' }}
            </button>
            <button type="button" @click="closeEditModal" class="btn-secondary">
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
import { useRoute, useRouter } from 'vue-router';
import { useCourtStore } from '../stores/court.store';
import { useAuthStore } from '../stores/auth.store';

const route = useRoute();
const router = useRouter();
const courtStore = useCourtStore();
const authStore = useAuthStore();

const loading = ref(true);
const showEditModal = ref(false);
const submitting = ref(false);

const editForm = ref({
  name: '',
  address: '',
  city: '',
  description: '',
  number_of_courts: 1,
  has_lights: false,
  surface_type: '',
});

onMounted(async () => {
  const courtId = parseInt(route.params.id as string);
  try {
    await courtStore.fetchCourtById(courtId);
    if (courtStore.selectedCourt) {
      editForm.value = {
        name: courtStore.selectedCourt.name,
        address: courtStore.selectedCourt.address,
        city: courtStore.selectedCourt.city,
        description: courtStore.selectedCourt.description || '',
        number_of_courts: courtStore.selectedCourt.num_courts || 1,
        has_lights: courtStore.selectedCourt.has_lighting || false,
        surface_type: courtStore.selectedCourt.surface_type || '',
        map_embedding: courtStore.selectedCourt.map_embedding || '',
      };
    }
  } catch (error) {
    console.error('Failed to fetch court:', error);
  } finally {
    loading.value = false;
  }
});

const closeEditModal = () => {
  showEditModal.value = false;
};

const handleUpdateCourt = async () => {
  if (!courtStore.selectedCourt) return;
  
  submitting.value = true;
  try {
    await courtStore.updateCourt(courtStore.selectedCourt.id, {
      name: editForm.value.name,
      address: editForm.value.address,
      city: editForm.value.city,
      description: editForm.value.description,
      num_courts: editForm.value.number_of_courts,
      has_lighting: editForm.value.has_lights,
      surface_type: editForm.value.surface_type,
      map_embedding: editForm.value.map_embedding,
    });
    closeEditModal();
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to update court');
  } finally {
    submitting.value = false;
  }
};

const handleDeleteCourt = async () => {
  if (!courtStore.selectedCourt) return;
  
  if (confirm(`Are you sure you want to delete ${courtStore.selectedCourt.name}?`)) {
    try {
      await courtStore.deleteCourt(courtStore.selectedCourt.id);
      router.push('/courts');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete court');
    }
  }
};
</script>

<style scoped>
.court-detail-page {
  width: 100%;
  background: var(--color-background);
}

.loading,
.not-found {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-secondary);
  font-size: 1.25rem;
}

.not-found .btn-primary {
  margin-top: 2rem;
  display: inline-block;
}

.hero-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.hero-content {
  padding-right: 2rem;
}

.court-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  color: var(--color-secondary);
  line-height: 1.1;
  margin-bottom: 3rem;
  letter-spacing: -1px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-card {
  background: var(--color-primary);
  padding: 1.5rem;
  border: none;
}

.info-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.info-value {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-secondary);
  line-height: 1.4;
}

.hero-image {
  background: linear-gradient(135deg, #B8D4E8 0%, #A8C7DB 100%);
  min-height: 500px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  font-size: 8rem;
  opacity: 0.3;
}

.description-section,
.map-section {
  background: var(--color-background);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.container h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: 1.5rem;
}

.container p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-secondary);
}

.address {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.map-container {
  width: 100%;
  height: 450px;
  border: 3px solid var(--color-secondary);
}

.no-map {
  padding: 3rem;
  text-align: center;
  background: var(--color-surface);
  border: 3px solid var(--color-secondary);
}

.admin-actions {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 1rem;
}

.back-link {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: var(--color-secondary);
  border: 2px solid var(--color-secondary);
}

.btn-secondary:hover {
  background: var(--color-secondary);
  color: white;
}

.btn-danger {
  background: #D32F2F;
  color: white;
}

.btn-danger:hover {
  background: #B71C1C;
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

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-secondary);
  font-size: 1rem;
}

.form-group input[type="text"]:focus,
.form-group input[type="number"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group input[type="checkbox"] {
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions button {
  flex: 1;
}

@media (max-width: 968px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 1rem;
  }

  .hero-content {
    padding-right: 0;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .hero-image {
    min-height: 300px;
  }

  .admin-actions {
    flex-direction: column;
  }
}
</style>
