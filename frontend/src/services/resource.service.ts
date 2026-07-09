import api from './api';

export interface Resource {
  id: number;
  title: string;
  description?: string;
  resource_type: 'brand' | 'article' | 'video' | 'other';
  url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateResourceData {
  title: string;
  description?: string;
  resource_type: 'brand' | 'article' | 'video' | 'other';
  url: string;
}

export interface UpdateResourceData {
  title?: string;
  description?: string;
  resource_type?: 'brand' | 'article' | 'video' | 'other';
  url?: string;
}

export const RESOURCE_TYPE_ICONS: Record<string, string> = {
  brand: '🏷️',
  article: '📰',
  video: '🎥',
  other: '📎',
};

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  brand: 'Brand',
  article: 'Article',
  video: 'Video',
  other: 'Other',
};

export const resourceService = {
  async getAll(limit = 100, offset = 0): Promise<{ resources: Resource[]; limit: number; offset: number }> {
    const response = await api.get('/resources', {
      params: { limit, offset },
    });
    return response.data;
  },

  async getById(id: number): Promise<Resource> {
    const response = await api.get<Resource>(`/resources/${id}`);
    return response.data;
  },

  async getByType(type: string, limit = 100): Promise<{ resources: Resource[] }> {
    const response = await api.get(`/resources/type/${type}`, {
      params: { limit },
    });
    return response.data;
  },

  async create(data: CreateResourceData): Promise<Resource> {
    const response = await api.post<Resource>('/resources', data);
    return response.data;
  },

  async update(id: number, data: UpdateResourceData): Promise<Resource> {
    const response = await api.patch<Resource>(`/resources/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },

  async search(query: string, limit = 100): Promise<{ resources: Resource[] }> {
    const response = await api.get('/resources/search', {
      params: { q: query, limit },
    });
    return response.data;
  },
};
