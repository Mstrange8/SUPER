import api from './api';
import type { Post, CreatePostRequest } from '../types/group.types';

export const postService = {
  async getAllPosts(groupId?: number, limit = 50, offset = 0): Promise<{ posts: Post[]; total: number }> {
    const response = await api.get('/posts', {
      params: { group_id: groupId, limit, offset },
    });
    return response.data;
  },

  async getPostById(id: number): Promise<Post> {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  async createPost(data: CreatePostRequest): Promise<Post> {
    const response = await api.post('/posts', data);
    return response.data;
  },

  async updatePost(id: number, data: { title?: string; content?: string }): Promise<Post> {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data;
  },

  async deletePost(id: number): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async searchPosts(query: string, groupId?: number): Promise<{ posts: Post[] }> {
    const response = await api.get('/posts/search', {
      params: { q: query, group_id: groupId },
    });
    return response.data;
  },
};
