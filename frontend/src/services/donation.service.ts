import api from './api';
import type { DonationRequest, DonationResponse, DonationRecord, DonationStats } from '../types/donation.types';

export const donationService = {
  async createCheckoutSession(data: DonationRequest): Promise<DonationResponse> {
    const response = await api.post<DonationResponse>('/donations/create-checkout-session', data);
    return response.data;
  },

  async getDonationBySession(sessionId: string): Promise<DonationRecord> {
    const response = await api.get<DonationRecord>(`/donations/session/${sessionId}`);
    return response.data;
  },

  async getAllDonations(limit = 100, offset = 0): Promise<{ donations: DonationRecord[]; total: number; limit: number; offset: number }> {
    const response = await api.get('/donations', {
      params: { limit, offset },
    });
    return response.data;
  },

  async getStats(): Promise<DonationStats> {
    const response = await api.get<DonationStats>('/donations/stats');
    return response.data;
  },
};
