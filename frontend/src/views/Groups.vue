<template>
  <div class="groups-container">
    <div class="groups-header">
      <h1>Community Groups</h1>
      <p class="subtitle">Join groups to connect with fellow pickleball players</p>
      
      <div class="header-actions">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search groups..."
            @input="handleSearch"
            class="search-input"
          />
        </div>
        <button
          v-if="authStore.isAuthenticated"
          @click="showCreateModal = true"
          class="btn-create"
        >
          + Create Group
        </button>
      </div>
    </div>

    <div v-if="groupStore.loading" class="loading">Loading groups...</div>
    
    <div v-else-if="groupStore.error" class="error">{{ groupStore.error }}</div>

    <div v-else-if="groupStore.groups.length === 0" class="empty-state">
      <p>No groups found.</p>
      <button
        v-if="authStore.isAuthenticated"
        @click="showCreateModal = true"
        class="btn-primary"
      >
        Create the first group
      </button>
    </div>

    <div v-else class="groups-grid">
      <div
        v-for="group in groupStore.groups"
        :key="group.id"
        class="group-card"
        @click="navigateToGroup(group.id)"
      >
        <div class="group-header">
          <h3>{{ group.name }}</h3>
          <span class="member-count">👥 {{ group.member_count || 0 }}</span>
        </div>
        
        <p class="group-description">
          {{ group.description || 'No description' }}
        </p>
        
        <div class="group-footer">
          <span class="creator">Created by {{ group.creator_username || 'Unknown' }}</span>
          <span v-if="group.is_member" class="badge-member">Member</span>
        </div>
      </div>
    </div>

    <!-- Create Group Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Create New Group</h2>
          <button @click="showCreateModal = false" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="handleCreateGroup" class="modal-body">
          <div class="form-group">
            <label for="groupName">Group Name *</label>
            <input
              id="groupName"
              v-model="newGroup.name"
              type="text"
              required
              maxlength="255"
              class="form-input"
              placeholder="e.g., Tuesday Morning Players"
            />
          </div>

          <div class="form-group">
            <label for="groupDescription">Description</label>
            <textarea
              id="groupDescription"
              v-model="newGroup.description"
              class="form-textarea"
              rows="4"
              placeholder="Describe your group..."
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create Group' }}
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
import { useGroupStore } from '../stores/group.store';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const groupStore = useGroupStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const showCreateModal = ref(false);
const creating = ref(false);
const newGroup = ref({
  name: '',
  description: '',
});

let searchTimeout: ReturnType<typeof setTimeout>;

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      await groupStore.searchGroups(searchQuery.value);
    } else {
      await groupStore.fetchGroups();
    }
  }, 300);
};

const handleCreateGroup = async () => {
  creating.value = true;
  try {
    const group = await groupStore.createGroup(newGroup.value);
    showCreateModal.value = false;
    newGroup.value = { name: '', description: '' };
    router.push(`/groups/${group.id}`);
  } catch (error) {
    console.error('Failed to create group:', error);
  } finally {
    creating.value = false;
  }
};

const navigateToGroup = (id: number) => {
  router.push(`/groups/${id}`);
};

onMounted(async () => {
  await groupStore.fetchGroups();
});
</script>

<style scoped>
.groups-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.groups-header {
  margin-bottom: 2rem;
}

.groups-header h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.subtitle {
  color: #666;
  margin: 0 0 1.5rem 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.btn-create {
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create:hover {
  background: #45a049;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #c33;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.group-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.group-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.member-count {
  font-size: 0.9rem;
  color: #666;
}

.group-description {
  color: #555;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.group-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.creator {
  font-size: 0.85rem;
  color: #888;
}

.badge-member {
  background: #4CAF50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-textarea {
  resize: vertical;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .groups-container {
    padding: 1rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>
