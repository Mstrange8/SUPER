<template>
  <div class="resources-container">
    <div class="resources-header">
      <h1>📚 Resources</h1>
      <div class="header-actions">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search resources..."
          class="search-input"
          @input="handleSearch"
        />
        <button
          v-if="authStore.isAdmin"
          @click="showCreateModal = true"
          class="btn-primary"
        >
          + Add Resource
        </button>
      </div>
    </div>

    <div class="filter-tabs">
      <button
        :class="['tab', { active: selectedType === 'all' }]"
        @click="filterByType('all')"
      >
        All Resources
      </button>
      <button
        :class="['tab', { active: selectedType === 'brand' }]"
        @click="filterByType('brand')"
      >
        🏷️ Brands
      </button>
      <button
        :class="['tab', { active: selectedType === 'article' }]"
        @click="filterByType('article')"
      >
        📰 Articles
      </button>
      <button
        :class="['tab', { active: selectedType === 'video' }]"
        @click="filterByType('video')"
      >
        🎥 Videos
      </button>
      <button
        :class="['tab', { active: selectedType === 'other' }]"
        @click="filterByType('other')"
      >
        📎 Other
      </button>
    </div>

    <div v-if="loading" class="loading">Loading resources...</div>

    <div v-else-if="filteredResources.length === 0" class="no-resources">
      <p>No resources found. {{ authStore.isAdmin ? 'Add the first one!' : 'Check back soon!' }}</p>
    </div>

    <div v-else class="resources-grid">
      <div
        v-for="resource in filteredResources"
        :key="resource.id"
        class="resource-card"
      >
        <div class="card-header">
          <span class="resource-icon">{{ getTypeIcon(resource.resource_type) }}</span>
          <span class="resource-type-badge">{{ getTypeLabel(resource.resource_type) }}</span>
        </div>

        <h3>{{ resource.title }}</h3>

        <p v-if="resource.description" class="resource-description">
          {{ resource.description }}
        </p>

        <div class="card-actions">
          <a
            :href="resource.url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-visit"
          >
            Visit →
          </a>

          <div v-if="authStore.isAdmin" class="admin-actions">
            <button @click="editResource(resource)" class="btn-icon" title="Edit">
              ✏️
            </button>
            <button @click="deleteResourceConfirm(resource.id)" class="btn-icon" title="Delete">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Resource Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <h2>{{ showEditModal ? 'Edit Resource' : 'Add New Resource' }}</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="title">Title *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              required
              placeholder="Enter resource title"
            />
          </div>

          <div class="form-group">
            <label for="resource_type">Resource Type *</label>
            <select id="resource_type" v-model="formData.resource_type" required>
              <option value="">Select type...</option>
              <option value="brand">🏷️ Brand</option>
              <option value="article">📰 Article</option>
              <option value="video">🎥 Video</option>
              <option value="other">📎 Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="url">URL *</label>
            <input
              id="url"
              v-model="formData.url"
              type="url"
              required
              placeholder="https://example.com"
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="4"
              placeholder="Brief description of the resource..."
            ></textarea>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn-primary">
              {{ loading ? 'Saving...' : showEditModal ? 'Update' : 'Add Resource' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useResourceStore } from '../stores/resource.store';
import { useAuthStore } from '../stores/auth.store';
import { RESOURCE_TYPE_ICONS, RESOURCE_TYPE_LABELS, type Resource } from '../services/resource.service';

const resourceStore = useResourceStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const selectedType = ref<string>('all');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedResource = ref<Resource | null>(null);
const loading = ref(false);
const error = ref('');

const formData = ref({
  title: '',
  description: '',
  resource_type: '',
  url: '',
});

let searchTimeout: ReturnType<typeof setTimeout>;

const filteredResources = computed(() => {
  if (selectedType.value === 'all') {
    return resourceStore.resources;
  }
  return resourceStore.resourcesByType(selectedType.value);
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      await resourceStore.searchResources(searchQuery.value);
    } else {
      await resourceStore.fetchResources();
    }
  }, 300);
};

const filterByType = async (type: string) => {
  selectedType.value = type;
  if (type === 'all') {
    await resourceStore.fetchResources();
  } else {
    await resourceStore.fetchResourcesByType(type);
  }
};

const getTypeIcon = (type: string): string => {
  return RESOURCE_TYPE_ICONS[type] || '📎';
};

const getTypeLabel = (type: string): string => {
  return RESOURCE_TYPE_LABELS[type] || 'Other';
};

const editResource = (resource: Resource) => {
  selectedResource.value = resource;
  formData.value = {
    title: resource.title,
    description: resource.description || '',
    resource_type: resource.resource_type,
    url: resource.url,
  };
  showEditModal.value = true;
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  selectedResource.value = null;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    resource_type: '',
    url: '',
  };
  error.value = '';
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    if (showEditModal.value && selectedResource.value) {
      await resourceStore.updateResource(selectedResource.value.id, formData.value as any);
    } else {
      await resourceStore.createResource(formData.value as any);
    }
    closeModals();
  } catch (err: any) {
    error.value = err.message || 'Failed to save resource';
  } finally {
    loading.value = false;
  }
};

const deleteResourceConfirm = async (id: number) => {
  if (confirm('Are you sure you want to delete this resource?')) {
    try {
      await resourceStore.deleteResource(id);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete resource';
    }
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await resourceStore.fetchResources();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.resources-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.resources-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.resources-header h1 {
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

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.tab:hover {
  border-color: #4CAF50;
}

.tab.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.2rem;
}

.no-resources {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.resource-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.resource-icon {
  font-size: 2rem;
}

.resource-type-badge {
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #555;
}

.resource-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.3rem;
}

.resource-description {
  color: #666;
  margin: 0 0 1.5rem 0;
  flex-grow: 1;
  line-height: 1.6;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.btn-visit {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-visit:hover {
  background-color: #45a049;
}

.admin-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.btn-icon:hover {
  transform: scale(1.2);
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
  max-width: 600px;
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

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input,
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
  .resources-container {
    padding: 1rem;
  }

  .resources-header {
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

  .resources-grid {
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
