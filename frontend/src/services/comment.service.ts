import api from './api';
import type { Comment, CreateCommentRequest } from '../types/group.types';

export const commentService = {
  async getCommentsByPost(postId: number, limit = 100, offset = 0): Promise<{ comments: Comment[]; total: number }> {
    const response = await api.get(`/comments`, {
      params: { post_id: postId, limit, offset },
    });
    return response.data;
  },

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await api.post('/comments', data);
    return response.data;
  },

  async updateComment(id: number, content: string): Promise<Comment> {
    const response = await api.patch(`/comments/${id}`, { content });
    return response.data;
  },

  async deleteComment(id: number): Promise<void> {
    await api.delete(`/comments/${id}`);
  },
};
