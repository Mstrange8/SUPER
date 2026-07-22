import api from './api';

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_type: 'signups' | 'tournament' | 'league' | 'roundRobin' | 'kingsCourt' | 'other';
  start_date: string;
  end_date?: string;
  recurrence_rule?: string[];
  recurrence_end?: string;
  external_link?: string;
  color: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_type: 'signups' | 'tournament' | 'league' | 'roundRobin' | 'kingsCourt' | 'other';
  start_date: string;
  end_date?: string;
  external_link?: string;
  color?: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  event_type?: 'signups' | 'tournament' | 'league' | 'roundRobin' | 'kingsCourt' | 'other';
  start_date?: string;
  end_date?: string;
  external_link?: string;
  color?: string;
}

export const EVENT_TYPE_COLORS: Record<string, string> = {
  signups: '#FF5722',
  tournament: '#4CAF50',
  league: '#2196F3',
  roundRobin: '#8B1FFF',
  kingsCourt: '#FF1FE5',
  other: '#607D8B',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  signups: 'Signups',
  tournament: 'Tournament',
  league: 'League',
  roundRobin: 'Round Robin',
  kingsCourt: 'Kings Court',
  other: 'Other',
};

export const eventService = {
  async getAll(limit = 100, offset = 0): Promise<{ events: Event[]; limit: number; offset: number }> {
    const response = await api.get('/events', {
      params: { limit, offset },
    });
    return response.data;
  },

  async getById(id: number): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  async getByDateRange(start: string, end: string): Promise<{ events: Event[] }> {
    const response = await api.get('/events/date-range', {
      params: { start, end },
    });
    return response.data;
  },

  async getByType(type: string, limit = 100): Promise<{ events: Event[] }> {
    const response = await api.get(`/events/type/${type}`, {
      params: { limit },
    });
    return response.data;
  },

  async create(data: CreateEventData): Promise<Event> {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  async update(id: number, data: UpdateEventData): Promise<Event> {
    const response = await api.patch<Event>(`/events/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  async search(query: string, limit = 50): Promise<{ events: Event[] }> {
    const response = await api.get('/events/search', {
      params: { q: query, limit },
    });
    return response.data;
  },
};
