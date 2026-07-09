<template>
  <div class="court-detail-container">
    <div v-if="loading" class="loading">Loading court details...</div>

    <div v-else-if="!court" class="not-found">
      <h2>Court Not Found</h2>
      <button @click="$router.push('/courts')" class="btn-primary">Back to Courts</button>
    </div>

    <div v-else class="court-detail">
      <div class="detail-header">
        <button @click="$router.back()" class="btn-back">← Back</button>
        <div v-if="authStore.isAdmin" class="admin-actions">
          <button @click="editCourt" class="btn-primary">Edit</button>
          <button @click="deleteCourtConfirm" class="btn-danger">Delete</button>
        </div>
      </div>

      <div class="court-hero">
        <div v-if="court.image_url" class="hero-image">
          <img :src="court.image_url" :alt="court.name" />
        </div>
        <div v-else class="hero-placeholder">
          <span>🏸</span>
        </div>
      </div>

      <div class="court-content">
        <div class="content-main">
          <h1>{{ court.name }}</h1>
          
          <div class="info-section">
            <h3>📍 Location</h3>
            <p>{{ court.address }}</p>
            <p>{{ court.city }}, {{ court.zip || 'UT' }}</p>
          </div>

          <div class="info-section">
            <h3>🎾 Court Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Number of Courts:</strong>
                <span>{{ court.num_courts }}</span>
              </div>
              <div class="info-item">
                <strong>Lighting:</strong>
                <span>{{ court.has_lighting ? '✅ Yes' : '❌ No' }}</span>
              </div>
              <div v-if="court.surface_type" class="info-item">
                <strong>Surface Type:</strong>
                <span>{{ court.surface_type }}</span>
              </div>
            </div>
          </div>

          <div v-if="court.description" class="info-section">
            <h3>ℹ️ Description</h3>
            <p>{{ court.description }}</p>
          </div>

          <div v-if="court.amenities" class="info-section">
            <h3>🏗️ Amenities</h3>
            <div class="amenities-list">
              <span
                v-for="(amenity, index) in court.amenities.split(',')"
                :key="index"
                class="amenity-badge"
              >
                {{ amenity.trim() }}
              </span>
            </div>
          </div>
        </div>

        <div class="content-sidebar">
          <div class="map-container">
            <div v-if="court.latitude && court.longitude" ref="mapElement" class="map"></div>
            <div v-else class="map-placeholder">
              <p>📍 Map not available</p>
              <p class="map-note">GPS coordinates not set for this court</p>
            </div>
          </div>

          <div class="directions-card">
            <a
              v-if="court.latitude && court.longitude"
              :href="getDirectionsUrl()"
              target="_blank"
              rel="noopener"
              class="btn-directions"
            >
              🗺️ Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Court Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>Edit Court</h2>
        
        <form @submit.prevent="handleUpdate">
          <div class="form-group">
            <label for="name">Court Name *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
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
              />
            </div>

            <div class="form-group">
              <label for="city">City *</label>
              <input
                id="city"
                v-model="formData.city"
                type="text"
                required
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
              />
            </div>

            <div class="form-group">
              <label for="num_courts">Number of Courts</label>
              <input
                id="num_courts"
                v-model.number="formData.num_courts"
                type="number"
                min="1"
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
              />
            </div>

            <div class="form-group">
              <label for="longitude">Longitude</label>
              <input
                id="longitude"
                v-model.number="formData.longitude"
                type="number"
                step="any"
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
            ></textarea>
          </div>

          <div class="form-group">
            <label for="amenities">Amenities</label>
            <input
              id="amenities"
              v-model="formData.amenities"
              type="text"
            />
          </div>

          <div class="form-group">
            <label for="image_url">Image URL</label>
            <input
              id="image_url"
              v-model="formData.image_url"
              type="url"
            />
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn-primary">
              {{ loading ? 'Updating...' : 'Update Court' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourtStore } from '../stores/court.store';
import { useAuthStore } from '../stores/auth.store';
import type { Court } from '../services/court.service';

const route = useRoute();
const router = useRouter();
const courtStore = useCourtStore();
const authStore = useAuthStore();

const court = ref<Court | null>(null);
const loading = ref(false);
const error = ref('');
const showEditModal = ref(false);
const mapElement = ref<HTMLElement | null>(null);

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

const initMap = async () => {
  if (!court.value?.latitude || !court.value?.longitude || !mapElement.value) {
    return;
  }

  await nextTick();

  // Simple Google Maps integration - in production, load the Google Maps API
  const mapPlaceholder = document.createElement('iframe');
  mapPlaceholder.width = '100%';
  mapPlaceholder.height = '100%';
  mapPlaceholder.style.border = '0';
  mapPlaceholder.loading = 'lazy';
  mapPlaceholder.referrerPolicy = 'no-referrer-when-downgrade';
  mapPlaceholder.src = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${court.value.latitude},${court.value.longitude}&zoom=15`;
  
  mapElement.value.innerHTML = '';
  mapElement.value.appendChild(mapPlaceholder);
};

const getDirectionsUrl = (): string => {
  if (!court.value?.latitude || !court.value?.longitude) return '#';
  return `https://www.google.com/maps/dir/?api=1&destination=${court.value.latitude},${court.value.longitude}`;
};

const editCourt = () => {
  if (!court.value) return;
  
  formData.value = {
    name: court.value.name,
    address: court.value.address,
    city: court.value.city,
    zip: court.value.zip || '',
    latitude: court.value.latitude,
    longitude: court.value.longitude,
    description: court.value.description || '',
    surface_type: court.value.surface_type || '',
    num_courts: court.value.num_courts,
    has_lighting: court.value.has_lighting,
    amenities: court.value.amenities || '',
    image_url: court.value.image_url || '',
  };
  showEditModal.value = true;
};

const handleUpdate = async () => {
  if (!court.value) return;
  
  loading.value = true;
  error.value = '';

  try {
    const updated = await courtStore.updateCourt(court.value.id, formData.value as any);
    court.value = updated;
    closeModal();
    await initMap(); // Reinitialize map with new coordinates
  } catch (err: any) {
    error.value = err.message || 'Failed to update court';
  } finally {
    loading.value = false;
  }
};

const deleteCourtConfirm = async () => {
  if (!court.value) return;
  
  if (confirm(`Are you sure you want to delete "${court.value.name}"?`)) {
    try {
      await courtStore.deleteCourt(court.value.id);
      router.push('/courts');
    } catch (err: any) {
      error.value = err.message || 'Failed to delete court';
    }
  }
};

const closeModal = () => {
  showEditModal.value = false;
  error.value = '';
};

onMounted(async () => {
  loading.value = true;
  try {
    const id = parseInt(route.params.id as string);
    court.value = await courtStore.fetchCourtById(id);
    await initMap();
  } catch (err) {
    console.error('Failed to load court:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.court-detail-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading,
.not-found {
  text-align: center;
  padding: 3rem;
}

.not-found h2 {
  margin-bottom: 1.5rem;
  color: #666;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn-back:hover {
  background-color: #e0e0e0;
}

.admin-actions {
  display: flex;
  gap: 1rem;
}

.court-hero {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4CAF50, #81C784);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8rem;
}

.court-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.content-main {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.content-main h1 {
  margin: 0 0 2rem 0;
  color: #333;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h3 {
  color: #4CAF50;
  margin-bottom: 1rem;
}

.info-section p {
  color: #666;
  line-height: 1.6;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.amenity-badge {
  padding: 0.5rem 1rem;
  background: #e8f5e9;
  color: #4CAF50;
  border-radius: 20px;
  font-size: 0.9rem;
}

.content-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.map-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 400px;
}

.map {
  width: 100%;
  height: 100%;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 2rem;
}

.map-note {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.directions-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn-directions {
  display: block;
  width: 100%;
  padding: 1rem;
  background-color: #4CAF50;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.btn-directions:hover {
  background-color: #45a049;
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
.btn-secondary,
.btn-danger {
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

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #da190b;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

@media (max-width: 1024px) {
  .court-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .court-detail-container {
    padding: 1rem;
  }

  .court-hero {
    height: 250px;
  }

  .hero-placeholder {
    font-size: 4rem;
  }

  .detail-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
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
