export interface Resource {
  id: number;
  title: string;
  description?: string;
  resource_type: 'brand' | 'article' | 'video' | 'other';
  url: string;
  created_at: Date;
  updated_at: Date;
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
