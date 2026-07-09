export interface Event {
  id: number;
  title: string;
  description?: string;
  event_type: 'tournament' | 'league' | 'fundraiser' | 'social' | 'other';
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
  event_type: 'tournament' | 'league' | 'fundraiser' | 'social' | 'other';
  start_date: string | Date;
  end_date?: string | Date;
  external_link?: string;
  color?: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  event_type?: 'tournament' | 'league' | 'fundraiser' | 'social' | 'other';
  start_date?: string | Date;
  end_date?: string | Date;
  external_link?: string;
  color?: string;
}

export const EVENT_TYPE_COLORS: Record<string, string> = {
  tournament: '#FF5722', // Red-Orange
  league: '#2196F3',     // Blue
  fundraiser: '#4CAF50', // Green
  social: '#9C27B0',     // Purple
  other: '#607D8B',      // Grey
};
