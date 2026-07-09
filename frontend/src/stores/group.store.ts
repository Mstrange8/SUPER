import { defineStore } from 'pinia';
import { groupService } from '../services/group.service';
import type { Group } from '../types/group.types';

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
}

export const useGroupStore = defineStore('group', {
  state: (): GroupState => ({
    groups: [],
    currentGroup: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchGroups() {
      this.loading = true;
      this.error = null;
      try {
        const response = await groupService.getAllGroups();
        this.groups = response.groups;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch groups';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchGroupById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        this.currentGroup = await groupService.getGroupById(id);
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch group';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createGroup(data: { name: string; description?: string }) {
      this.loading = true;
      this.error = null;
      try {
        const group = await groupService.createGroup(data);
        this.groups.unshift(group);
        return group;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to create group';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateGroup(id: number, data: { name?: string; description?: string }) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await groupService.updateGroup(id, data);
        const index = this.groups.findIndex(g => g.id === id);
        if (index !== -1) {
          this.groups[index] = updated;
        }
        if (this.currentGroup?.id === id) {
          this.currentGroup = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to update group';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteGroup(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await groupService.deleteGroup(id);
        this.groups = this.groups.filter(g => g.id !== id);
        if (this.currentGroup?.id === id) {
          this.currentGroup = null;
        }
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to delete group';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async joinGroup(id: number) {
      this.error = null;
      try {
        await groupService.joinGroup(id);
        // Update membership status
        const group = this.groups.find(g => g.id === id);
        if (group) {
          group.is_member = true;
          group.member_count = (group.member_count || 0) + 1;
        }
        if (this.currentGroup?.id === id) {
          this.currentGroup.is_member = true;
          this.currentGroup.member_count = (this.currentGroup.member_count || 0) + 1;
        }
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to join group';
        throw error;
      }
    },

    async leaveGroup(id: number) {
      this.error = null;
      try {
        await groupService.leaveGroup(id);
        // Update membership status
        const group = this.groups.find(g => g.id === id);
        if (group) {
          group.is_member = false;
          group.member_count = Math.max((group.member_count || 1) - 1, 0);
        }
        if (this.currentGroup?.id === id) {
          this.currentGroup.is_member = false;
          this.currentGroup.member_count = Math.max((this.currentGroup.member_count || 1) - 1, 0);
        }
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to leave group';
        throw error;
      }
    },

    async searchGroups(query: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await groupService.searchGroups(query);
        this.groups = response.groups;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to search groups';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
