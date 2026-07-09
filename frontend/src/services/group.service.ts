import api from './api';
import type { Group, CreateGroupRequest } from '../types/group.types';

export const groupService = {
  async getAllGroups(limit = 100, offset = 0): Promise<{ groups: Group[]; total: number }> {
    const response = await api.get('/groups', {
      params: { limit, offset },
    });
    return response.data;
  },

  async getGroupById(id: number): Promise<Group> {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  async createGroup(data: CreateGroupRequest): Promise<Group> {
    const response = await api.post('/groups', data);
    return response.data;
  },

  async updateGroup(id: number, data: Partial<CreateGroupRequest>): Promise<Group> {
    const response = await api.patch(`/groups/${id}`, data);
    return response.data;
  },

  async deleteGroup(id: number): Promise<void> {
    await api.delete(`/groups/${id}`);
  },

  async joinGroup(id: number): Promise<void> {
    await api.post(`/groups/${id}/join`);
  },

  async leaveGroup(id: number): Promise<void> {
    await api.post(`/groups/${id}/leave`);
  },

  async getGroupMembers(id: number, limit = 100, offset = 0): Promise<{
    members: Array<{ id: number; username: string; email: string; joined_at: string }>;
    total: number;
  }> {
    const response = await api.get(`/groups/${id}/members`, {
      params: { limit, offset },
    });
    return response.data;
  },

  async searchGroups(query: string): Promise<{ groups: Group[] }> {
    const response = await api.get('/groups/search', {
      params: { q: query },
    });
    return response.data;
  },
};
