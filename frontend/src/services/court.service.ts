import api from './api';

export interface Court {
  id: number;
  name: string;
  address: string;
  city: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  surface_type?: string;
  num_courts: number;
  has_lighting: boolean;
  amenities?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  distance?: number;
}

export interface CreateCourtData {
  name: string;
  address: string;
  city: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  surface_type?: string;
  num_courts?: number;
  has_lighting?: boolean;
  amenities?: string;
  image_url?: string;
}

export interface UpdateCourtData {
  name?: string;
  address?: string;
  city?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  surface_type?: string;
  num_courts?: number;
  has_lighting?: boolean;
  amenities?: string;
  image_url?: string;
}

export const courtService = {
  async getAll(limit = 50, offset = 0): Promise<{ courts: Court[]; limit: number; offset: number }> {
    const response = await api.get('/courts', {
      params: { limit, offset },
    });
    return response.data;
  },

  async getById(id: number): Promise<Court> {
    const response = await api.get<Court>(`/courts/${id}`);
    return response.data;
  },

  async getByCity(city: string, limit = 50): Promise<{ courts: Court[] }> {
    const response = await api.get(`/courts/city/${city}`, {
      params: { limit },
    });
    return response.data;
  },

  async getNearby(
    lat: number,
    lng: number,
    radius = 25,
    limit = 50
  ): Promise<{ courts: Court[] }> {
    const response = await api.get('/courts/nearby', {
      params: { lat, lng, radius, limit },
    });
    return response.data;
  },

  async create(data: CreateCourtData): Promise<Court> {
    const response = await api.post<Court>('/courts', data);
    return response.data;
  },

  async update(id: number, data: UpdateCourtData): Promise<Court> {
    const response = await api.patch<Court>(`/courts/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/courts/${id}`);
    return response.data;
  },

  async search(query: string, limit = 50): Promise<{ courts: Court[] }> {
    const response = await api.get('/courts/search', {
      params: { q: query, limit },
    });
    return response.data;
  },
};
