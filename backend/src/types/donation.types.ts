export interface DonationRequest {
  amount: number; // in cents
  currency?: string;
  donorName?: string;
  donorEmail?: string;
  message?: string;
}

export interface DonationResponse {
  sessionId: string;
  url: string;
}

export interface DonationRecord {
  id: number;
  stripe_session_id: string;
  amount: number;
  currency: string;
  donor_name: string | null;
  donor_email: string | null;
  message: string | null;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}
