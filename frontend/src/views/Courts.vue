<template>
  <div class="courts-page">
    <!-- Page Header -->
    <section class="page-header">
      <h1 class="page-title">Sanpete Courts</h1>
      <p class="page-subtitle">
        Explore our local directory of pickleball courts across Sanpete County. Find the perfect spot to play, whether it's lit or unlit.
      </p>
    </section>

    <!-- Courts Grid -->
    <section class="courts-section">
      <div v-if="loading" class="loading">Loading courts...</div>
      
      <div v-else-if="courtStore.courts.length === 0" class="no-courts">
        <p>No courts found.</p>
      </div>

      <div v-else class="courts-grid">
        <div
          v-for="court in courtStore.courts"
          :key="court.id"
          class="court-card"
        >
          <div class="court-badge">
            <span :class="court.has_lighting ? 'badge-lit' : 'badge-unlit'">
              {{ court.has_lighting ? 'LIT' : 'UNLIT' }}
            </span>
          </div>
          
          <h3 class="court-name">{{ court.name }}</h3>
          
          <p class="court-description">{{ court.description || 'No description available.' }}</p>
          
          <button @click="goToCourtDetail(court.id)" class="btn-primary">
            MORE DETAILS
          </button>
        </div>    
      </div>
      <div style="margin-top: 2rem; text-align: center; width: fit-content; align-items: center; margin-left: auto; margin-right: auto;">
        <button
          v-if="authStore.isAdmin"
          @click="showCreateModal = true"
          class="btn-primary">
          + ADD COURT
        </button>
      </div>
      
    </section>

    <!-- Create Court Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>Add New Court</h2>
        <form @submit.prevent="handleCreateCourt">
          <div class="form-group">
            <label>Court Name *</label>
            <input v-model="form.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Address *</label>
            <input v-model="form.address" type="text" required />
          </div>

          <div class="form-group">
            <label>City *</label>
            <input v-model="form.city" type="text" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Number of Courts</label>
            <input v-model.number="form.number_of_courts" type="number" min="1" />
          </div>

          <div class="form-group">
            <label>
              <input v-model="form.has_lights" type="checkbox" />
              Has Lights
            </label>
          </div>

          <div class="form-group">
            <label>Surface Type</label>
            <input v-model="form.surface_type" type="text" placeholder="e.g., Asphalt, Concrete" />
          </div>

          <div class="form-group">
            <label>Google Maps Embedding</label>
            <input v-model="form.map_embedding" type="text"/>
          </div>

          <div class="form-group">
            <label for="image">Court Image</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              @change="handleImageChange"
            />

            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Preview"
              class="image-preview"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Creating...' : 'Create Court' }}
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
import { useRouter } from 'vue-router';
import { useCourtStore } from '../stores/court.store';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const courtStore = useCourtStore();
const authStore = useAuthStore();

const loading = ref(true);
const showCreateModal = ref(false);
const submitting = ref(false);

const selectedImage = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

const form = ref({
  name: '',
  address: '',
  city: '',
  description: '',
  number_of_courts: 1,
  has_lights: false,
  surface_type: '',
  map_embedding: '',
  image_url: ''
});

onMounted(async () => {
  try {
    await courtStore.fetchCourts();
  } catch (error) {
    console.error('Failed to fetch courts:', error);
  } finally {
    loading.value = false;
  }
});

const goToCourtDetail = (courtId: number) => {
  router.push(`/courts/${courtId}`);
};

const closeModal = () => {
  showCreateModal.value = false;
  resetForm();
};

const resetForm = () => {
  form.value = {
    name: '',
    address: '',
    city: '',
    description: '',
    number_of_courts: 1,
    has_lights: false,
    surface_type: '',
    map_embedding: '',
    image_url: ''
  };
};

const handleCreateCourt = async () => {
  submitting.value = true;
  try {
    const formData = new FormData();

    formData.append("name", form.value.name);
    formData.append("address", form.value.address);
    formData.append("city", form.value.city);
    formData.append("description", form.value.description);
    formData.append("num_courts", form.value.number_of_courts.toString());
    formData.append("has_lighting", form.value.has_lights.toString());
    formData.append("surface_type", form.value.surface_type);
    formData.append("map_embedding", form.value.map_embedding);

    if (selectedImage.value) {
      formData.append("image_url", selectedImage.value);
    }

    await courtStore.createCourt(
      formData
    );
    closeModal();
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to create court');
  } finally {
    submitting.value = false;
  }
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) {
    selectedImage.value = null;
    imagePreview.value = null;
    return;
  }

  selectedImage.value = input.files[0];
  imagePreview.value = URL.createObjectURL(selectedImage.value);
};
</script>

<style scoped>
.courts-page {
  width: 100%;
  background: var(--color-background);
  min-height: calc(100vh - 200px);
}

.page-header {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
}

.page-title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: 1rem;
  letter-spacing: -1px;
}

.page-subtitle {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--color-secondary);
  max-width: 900px;
}

.courts-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.no-courts {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-secondary);
  font-size: 1.25rem;
}

.no-courts p {
  margin-bottom: 2rem;
}

.courts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.court-card {
  background: var(--color-surface);
  border: 3px solid var(--color-secondary);
  padding: 2rem;
  position: relative;
  transition: transform var(--transition-base);
}

.court-card:hover {
  transform: translateY(-4px);
}

.court-badge {
  position: absolute;
  top: 0;
  left: 0;
}

.badge-lit,
.badge-unlit {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.badge-lit {
  background: var(--color-primary);
  color: white;
}

.badge-unlit {
  background: var(--color-primary);
  color: white;
}

.court-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-secondary);
  margin: 1.5rem 0 1rem;
  line-height: 1.3;
}

.court-description {
  color: var(--color-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  min-height: 3rem;
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
  width: 100%;
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

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .courts-section {
    padding: 1rem;
  }

  .courts-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
