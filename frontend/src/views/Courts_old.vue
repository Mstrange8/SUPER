<template>
  <div class="courts-container">
    <div class="courts-header">
      <h1>🏛️ Court Directory</h1>
      <div class="header-actions">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search courts..."
          class="search-input"
          @input="handleSearch"
        />
        <button
          v-if="authStore.isAdmin"
          @click="showCreateModal = true"
          class="btn-primary"
        >
          + Add Court
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading courts...</div>

    <div v-else-if="courtStore.courts.length === 0" class="no-courts">
      <p>No courts found. {{ authStore.isAdmin ? 'Add the first court!' : 'Check back soon!' }}</p>
    </div>

    <div v-else class="courts-grid">
      <div
        v-for="court in courtStore.courts"
        :key="court.id"
        class="court-card"
        @click="goToCourtDetail(court.id)"
      >
        <div v-if="court.image_url" class="court-image">
          <img :src="court.image_url" :alt="court.name" />
        </div>
        <div v-else class="court-image-placeholder">
          <span>🏸</span>
        </div>

        <div class="court-info">
          <h3>{{ court.name }}</h3>
          <p class="court-location">
            📍 {{ court.city }}, {{ court.address }}
          </p>

          <div class="court-details">
            <span class="detail-badge">
              🎾 {{ court.num_courts }} {{ court.num_courts === 1 ? 'Court' : 'Courts' }}
            </span>
            <span v-if="court.has_lighting" class="detail-badge">💡 Lighting</span>
            <span v-if="court.surface_type" class="detail-badge">
              {{ court.surface_type }}
            </span>
          </div>

          <p v-if="court.description" class="court-description">
            {{ truncateText(court.description, 100) }}
          </p>

          <div v-if="court.distance" class="court-distance">
            📏 {{ court.distance.toFixed(1) }} miles away
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Court Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <h2>{{ showEditModal ? 'Edit Court' : 'Add New Court' }}</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">Court Name *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="Enter court name"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="address">Address *</label>
              <input
                id="address"
                v-model="formData.address"
                type="text"
                required
                placeholder="Street address"
              />
            </div>

            <div class="form-group">
              <label for="city">City *</label>
              <input
                id="city"
                v-model="formData.city"
                type="text"
                required
                placeholder="City"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="zip">ZIP Code</label>
              <input
                id="zip"
                v-model="formData.zip"
                type="text"
                placeholder="84626"
              />
            </div>

            <div class="form-group">
              <label for="num_courts">Number of Courts</label>
              <input
                id="num_courts"
                v-model.number="formData.num_courts"
                type="number"
                min="1"
                placeholder="1"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="latitude">Latitude</label>
              <input
                id="latitude"
                v-model.number="formData.latitude"
                type="number"
                step="any"
                placeholder="39.3639"
              />
            </div>

            <div class="form-group">
              <label for="longitude">Longitude</label>
              <input
                id="longitude"
                v-model.number="formData.longitude"
                type="number"
                step="any"
                placeholder="-111.5919"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="surface_type">Surface Type</label>
            <select id="surface_type" v-model="formData.surface_type">
              <option value="">Select surface...</option>
              <option value="Asphalt">Asphalt</option>
              <option value="Concrete">Concrete</option>
              <option value="Sport Court">Sport Court</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="formData.has_lighting" />
              Court has lighting
            </label>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="4"
              placeholder="Court description, rules, notes..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="amenities">Amenities</label>
            <input
              id="amenities"
              v-model="formData.amenities"
              type="text"
              placeholder="Parking, Restrooms, Water fountain..."
            />
          </div>

          <div class="form-group">
            <label for="image_url">Image URL</label>
            <input
              id="image_url"
              v-model="formData.image_url"
              type="url"
              placeholder="https://example.com/court-image.jpg"
            />
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn-primary">
              {{ loading ? 'Saving...' : showEditModal ? 'Update' : 'Create' }}
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

const searchQuery = ref('');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const loading = ref(false);
const error = ref('');

const formData = ref({
  name: '',
  address: '',
  city: '',
  zip: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  description: '',
  surface_type: '',
  num_courts: 1,
  has_lighting: false,
  amenities: '',
  image_url: '',
});

let searchTimeout: ReturnType<typeof setTimeout>;

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      await courtStore.searchCourts(searchQuery.value);
    } else {
      await courtStore.fetchCourts();
    }
  }, 300);
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    name: '',
    address: '',
    city: '',
    zip: '',
    latitude: undefined,
    longitude: undefined,
    description: '',
    surface_type: '',
    num_courts: 1,
    has_lighting: false,
    amenities: '',
    image_url: '',
  };
  error.value = '';
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    await courtStore.createCourt(formData.value as any);
    closeModals();
  } catch (err: any) {
    error.value = err.message || 'Failed to save court';
  } finally {
    loading.value = false;
  }
};

const goToCourtDetail = (id: number) => {
  router.push(`/courts/${id}`);
};

const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

onMounted(async () => {
  loading.value = true;
  try {
    await courtStore.fetchCourts();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.courts-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.courts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.courts-header h1 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 250px;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.2rem;
}

.no-courts {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.courts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.court-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.court-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.court-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.court-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.court-image-placeholder {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #4CAF50, #81C784);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
}

.court-info {
  padding: 1.5rem;
}

.court-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.3rem;
}

.court-location {
  color: #666;
  margin: 0 0 1rem 0;
}

.court-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-badge {
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #555;
}

.court-description {
  color: #666;
  margin: 1rem 0 0 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.court-distance {
  margin-top: 1rem;
  color: #4CAF50;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input[type="text"],
input[type="number"],
input[type="url"],
select,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

input[type="checkbox"] {
  margin-right: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .courts-container {
    padding: 1rem;
  }

  .courts-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .courts-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>
