import { defineStore } from 'pinia';
import { resourceService, type Resource, type CreateResourceData, type UpdateResourceData } from '../services/resource.service';

interface ResourceState {
  resources: Resource[];
  loading: boolean;
  error: string | null;
}

export const useResourceStore = defineStore('resources', {
  state: (): ResourceState => ({
    resources: [],
    loading: false,
    error: null,
  }),

  getters: {
    resourcesByType: (state) => (type: string) => {
      return state.resources.filter(resource => resource.resource_type === type);
    },
    brands: (state) => state.resources.filter(r => r.resource_type === 'brand'),
    articles: (state) => state.resources.filter(r => r.resource_type === 'article'),
    videos: (state) => state.resources.filter(r => r.resource_type === 'video'),
  },

  actions: {
    async fetchResources() {
      this.loading = true;
      this.error = null;
      try {
        const response = await resourceService.getAll();
        this.resources = response.resources;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch resources';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchResourcesByType(type: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await resourceService.getByType(type);
        this.resources = response.resources;
        return response.resources;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch resources';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createResource(data: CreateResourceData) {
      this.loading = true;
      this.error = null;
      try {
        const resource = await resourceService.create(data);
        this.resources.unshift(resource);
        return resource;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to create resource';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateResource(id: number, data: UpdateResourceData) {
      this.loading = true;
      this.error = null;
      try {
        const updatedResource = await resourceService.update(id, data);
        const index = this.resources.findIndex(r => r.id === id);
        if (index !== -1) {
          this.resources[index] = updatedResource;
        }
        return updatedResource;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to update resource';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteResource(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await resourceService.delete(id);
        this.resources = this.resources.filter(r => r.id !== id);
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to delete resource';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchResources(query: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await resourceService.search(query);
        this.resources = response.resources;
        return response.resources;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to search resources';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
