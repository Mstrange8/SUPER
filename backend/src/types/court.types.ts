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
  created_at: Date;
  updated_at: Date;
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
