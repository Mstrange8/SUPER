export interface Event {
  id: number;
  title: string;
  description?: string;
  event_type: 'signups' | 'tournament' | 'league' | 'roundRobin' | 'kingsCourt' | 'other';
  start_date: Date;
  end_date?: Date;
  external_link?: string;
  color: string;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_type: 'signups' | 'tournament' | 'league' | 'roundRobin' | 'kingsCourt' | 'other';
  start_date: string | Date;
  end_date?: string | Date;
  external_link?: string;
  color?: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  event_type?: 'signups' | 'tournament' | 'league' | 'roundRobin' | 'kingsCourt' | 'other';
  start_date?: string | Date;
  end_date?: string | Date;
  external_link?: string;
  color?: string;
}

export const EVENT_TYPE_COLORS: Record<string, string> = {
  signups: '#FF5722',
  tournament: '#4CAF50',
  league: '#2196F3',
  roundRobin: '#531FFF',
  kingsCourt: '#FF1FE5',
  other: '#607D8B',
};
