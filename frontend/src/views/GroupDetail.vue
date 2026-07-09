<template>
  <div class="group-detail-container">
    <div v-if="groupStore.loading" class="loading">Loading group...</div>
    
    <div v-else-if="groupStore.error" class="error">{{ groupStore.error }}</div>

    <div v-else-if="group" class="group-detail">
      <!-- Group Header -->
      <div class="group-banner">
        <div class="group-info">
          <h1>{{ group.name }}</h1>
          <p class="group-description">{{ group.description || 'No description' }}</p>
          <div class="group-meta">
            <span>👥 {{ group.member_count || 0 }} members</span>
            <span>• Created by {{ group.creator_username || 'Unknown' }}</span>
          </div>
        </div>
        
        <div class="group-actions">
          <button
            v-if="authStore.isAuthenticated && !group.is_member"
            @click="handleJoinGroup"
            class="btn-join"
            :disabled="joining"
          >
            {{ joining ? 'Joining...' : '+ Join Group' }}
          </button>
          
          <button
            v-if="authStore.isAuthenticated && group.is_member"
            @click="handleLeaveGroup"
            class="btn-leave"
            :disabled="leaving"
          >
            {{ leaving ? 'Leaving...' : 'Leave Group' }}
          </button>

          <button
            v-if="canModifyGroup"
            @click="showEditModal = true"
            class="btn-secondary"
          >
            ✏️ Edit
          </button>
          
          <button
            v-if="canModifyGroup"
            @click="handleDeleteGroup"
            class="btn-danger"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <!-- Posts Section -->
      <div class="posts-section">
        <div class="posts-header">
          <h2>Discussions</h2>
          <button
            v-if="group.is_member"
            @click="showCreatePostModal = true"
            class="btn-create-post"
          >
            + New Post
          </button>
          <p v-else-if="!authStore.isAuthenticated" class="join-prompt">
            Please login to post
          </p>
          <p v-else class="join-prompt">
            Join this group to create posts
          </p>
        </div>

        <div v-if="loadingPosts" class="loading">Loading posts...</div>
        
        <div v-else-if="posts.length === 0" class="empty-posts">
          <p>No posts yet. Be the first to start a discussion!</p>
        </div>

        <div v-else class="posts-list">
          <div
            v-for="post in posts"
            :key="post.id"
            class="post-card"
            @click="selectedPost = post"
          >
            <h3>{{ post.title }}</h3>
            <p class="post-preview">{{ post.content }}</p>
            <div class="post-meta">
              <span>By {{ post.username || 'Unknown' }}</span>
              <span>💬 {{ post.comment_count || 0 }} comments</span>
              <span>{{ formatDate(post.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Group Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Edit Group</h2>
          <button @click="showEditModal = false" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="handleUpdateGroup" class="modal-body">
          <div class="form-group">
            <label for="editName">Group Name *</label>
            <input
              id="editName"
              v-model="editForm.name"
              type="text"
              required
              maxlength="255"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="editDescription">Description</label>
            <textarea
              id="editDescription"
              v-model="editForm.description"
              class="form-textarea"
              rows="4"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showEditModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Post Modal -->
    <div v-if="showCreatePostModal" class="modal-overlay" @click.self="showCreatePostModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Create New Post</h2>
          <button @click="showCreatePostModal = false" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="handleCreatePost" class="modal-body">
          <div class="form-group">
            <label for="postTitle">Title *</label>
            <input
              id="postTitle"
              v-model="newPost.title"
              type="text"
              required
              maxlength="255"
              class="form-input"
              placeholder="What's your topic?"
            />
          </div>
          <div class="form-group">
            <label for="postContent">Content *</label>
            <textarea
              id="postContent"
              v-model="newPost.content"
              required
              class="form-textarea"
              rows="6"
              placeholder="Share your thoughts..."
            ></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showCreatePostModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="creatingPost">
              {{ creatingPost ? 'Posting...' : 'Create Post' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <div v-if="selectedPost" class="modal-overlay" @click.self="selectedPost = null">
      <div class="modal modal-large">
        <div class="modal-header">
          <h2>{{ selectedPost.title }}</h2>
          <button @click="selectedPost = null" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="post-content">
            <div class="post-author">
              By {{ selectedPost.username || 'Unknown' }} • {{ formatDate(selectedPost.created_at) }}
            </div>
            <p>{{ selectedPost.content }}</p>
          </div>

          <!-- Comments Section -->
          <div class="comments-section">
            <h3>Comments ({{ comments.length }})</h3>
            
            <div v-if="authStore.isAuthenticated" class="comment-form">
              <textarea
                v-model="newComment"
                placeholder="Write a comment..."
                rows="3"
                class="form-textarea"
              ></textarea>
              <button
                @click="handleAddComment"
                class="btn-primary"
                :disabled="!newComment.trim() || addingComment"
              >
                {{ addingComment ? 'Posting...' : 'Add Comment' }}
              </button>
            </div>

            <div v-if="loadingComments" class="loading">Loading comments...</div>
            
            <div v-else-if="comments.length === 0" class="empty-comments">
              No comments yet. Be the first to comment!
            </div>

            <div v-else class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment">
                <div class="comment-header">
                  <strong>{{ comment.username || 'Unknown' }}</strong>
                  <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                </div>
                <p>{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGroupStore } from '../stores/group.store';
import { useAuthStore } from '../stores/auth.store';
import { postService } from '../services/post.service';
import { commentService } from '../services/comment.service';
import type { Post, Comment } from '../types/group.types';

const route = useRoute();
const router = useRouter();
const groupStore = useGroupStore();
const authStore = useAuthStore();

const group = computed(() => groupStore.currentGroup);
const posts = ref<Post[]>([]);
const comments = ref<Comment[]>([]);
const selectedPost = ref<Post | null>(null);

const loadingPosts = ref(false);
const loadingComments = ref(false);
const joining = ref(false);
const leaving = ref(false);
const creatingPost = ref(false);
const addingComment = ref(false);

const showEditModal = ref(false);
const showCreatePostModal = ref(false);

const editForm = ref({ name: '', description: '' });
const newPost = ref({ title: '', content: '' });
const newComment = ref('');

const canModifyGroup = computed(() => {
  if (!authStore.isAuthenticated || !group.value) return false;
  return (
    authStore.isAdmin ||
    group.value.created_by === authStore.user?.id
  );
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  if (diffMins < 43200) return `${Math.floor(diffMins / 1440)}d ago`;
  
  return date.toLocaleDateString();
};

const loadPosts = async () => {
  const groupId = parseInt(route.params.id as string);
  loadingPosts.value = true;
  try {
    const response = await postService.getAllPosts(groupId);
    posts.value = response.posts;
  } catch (error) {
    console.error('Failed to load posts:', error);
  } finally {
    loadingPosts.value = false;
  }
};

const loadComments = async (postId: number) => {
  loadingComments.value = true;
  try {
    const response = await commentService.getCommentsByPost(postId);
    comments.value = response.comments;
  } catch (error) {
    console.error('Failed to load comments:', error);
  } finally {
    loadingComments.value = false;
  }
};

const handleJoinGroup = async () => {
  const groupId = parseInt(route.params.id as string);
  joining.value = true;
  try {
    await groupStore.joinGroup(groupId);
  } catch (error) {
    console.error('Failed to join group:', error);
  } finally {
    joining.value = false;
  }
};

const handleLeaveGroup = async () => {
  const groupId = parseInt(route.params.id as string);
  leaving.value = true;
  try {
    await groupStore.leaveGroup(groupId);
  } catch (error) {
    console.error('Failed to leave group:', error);
  } finally {
    leaving.value = false;
  }
};

const handleUpdateGroup = async () => {
  const groupId = parseInt(route.params.id as string);
  try {
    await groupStore.updateGroup(groupId, editForm.value);
    showEditModal.value = false;
  } catch (error) {
    console.error('Failed to update group:', error);
  }
};

const handleDeleteGroup = async () => {
  if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
    return;
  }
  
  const groupId = parseInt(route.params.id as string);
  try {
    await groupStore.deleteGroup(groupId);
    router.push('/groups');
  } catch (error) {
    console.error('Failed to delete group:', error);
  }
};

const handleCreatePost = async () => {
  const groupId = parseInt(route.params.id as string);
  creatingPost.value = true;
  try {
    await postService.createPost({
      group_id: groupId,
      ...newPost.value,
    });
    showCreatePostModal.value = false;
    newPost.value = { title: '', content: '' };
    await loadPosts();
  } catch (error) {
    console.error('Failed to create post:', error);
  } finally {
    creatingPost.value = false;
  }
};

const handleAddComment = async () => {
  if (!selectedPost.value) return;
  
  addingComment.value = true;
  try {
    await commentService.createComment({
      post_id: selectedPost.value.id,
      content: newComment.value,
    });
    newComment.value = '';
    await loadComments(selectedPost.value.id);
    // Update comment count
    const post = posts.value.find(p => p.id === selectedPost.value?.id);
    if (post) {
      post.comment_count = (post.comment_count || 0) + 1;
    }
  } catch (error) {
    console.error('Failed to add comment:', error);
  } finally {
    addingComment.value = false;
  }
};

watch(selectedPost, (post) => {
  if (post) {
    loadComments(post.id);
    newComment.value = '';
  } else {
    comments.value = [];
  }
});

watch(() => group.value, (g) => {
  if (g) {
    editForm.value = {
      name: g.name,
      description: g.description || '',
    };
  }
});

onMounted(async () => {
  const groupId = parseInt(route.params.id as string);
  await groupStore.fetchGroupById(groupId);
  await loadPosts();
});
</script>

<style scoped>
.group-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #c33;
}

.group-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.group-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.group-description {
  margin: 0 0 1rem 0;
  opacity: 0.95;
  font-size: 1.1rem;
}

.group-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.group-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn-join,
.btn-leave,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-join {
  background: white;
  color: #4CAF50;
}

.btn-join:hover:not(:disabled) {
  background: #f0f0f0;
}

.btn-leave {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-leave:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

.posts-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.posts-header h2 {
  margin: 0;
  color: #333;
}

.btn-create-post {
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create-post:hover {
  background: #45a049;
}

.join-prompt {
  color: #666;
  font-style: italic;
  margin: 0;
}

.empty-posts,
.empty-comments {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.post-card:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.post-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.post-preview {
  color: #555;
  margin: 0 0 1rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #888;
}

.post-content {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1.5rem;
}

.post-author {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.post-content p {
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

.comments-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.comment-form .btn-primary {
  align-self: flex-end;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-header strong {
  color: #333;
}

.comment-date {
  font-size: 0.85rem;
  color: #888;
}

.comment p {
  margin: 0;
  color: #555;
  line-height: 1.5;
  white-space: pre-wrap;
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

.modal-large {
  max-width: 800px;
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

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .group-detail-container {
    padding: 1rem;
  }

  .group-banner {
    padding: 1.5rem;
  }

  .group-info h1 {
    font-size: 1.5rem;
  }

  .group-actions {
    flex-direction: column;
  }

  .posts-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
