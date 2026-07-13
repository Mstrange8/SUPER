import { defineStore } from 'pinia';
import { courtService, type Court, type CreateCourtData, type UpdateCourtData } from '../services/court.service';

interface CourtState {
  courts: Court[];
  selectedCourt: Court | null;
  loading: boolean;
  error: string | null;
}

export const useCourtStore = defineStore('courts', {
  state: (): CourtState => ({
    courts: [],
    selectedCourt: null,
    loading: false,
    error: null,
  }),

  getters: {
    courtsByCity: (state) => (city: string) => {
      return state.courts.filter(court =>
        court.city.toLowerCase().includes(city.toLowerCase())
      );
    },
    courtsWithLighting: (state) => {
      return state.courts.filter(court => court.has_lighting);
    },
  },

  actions: {
    async fetchCourts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await courtService.getAll();
        this.courts = response.courts;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch courts';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCourtById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const court = await courtService.getById(id);
        this.selectedCourt = court;
        return court;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch court';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createCourt(data: CreateCourtData) {
      this.loading = true;
      this.error = null;
      try {
        const court = await courtService.create(data);
        this.courts.push(court);
        return court;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to create court';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCourt(id: number, data: UpdateCourtData) {
      this.loading = true;
      this.error = null;
      try {
        const updatedCourt = await courtService.update(id, data);
        const index = this.courts.findIndex(c => c.id === id);
        if (index !== -1) {
          this.courts[index] = updatedCourt;
        }
        if (this.selectedCourt?.id === id) {
          this.selectedCourt = updatedCourt;
        }
        return updatedCourt;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to update court';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteCourt(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await courtService.delete(id);
        this.courts = this.courts.filter(c => c.id !== id);
        if (this.selectedCourt?.id === id) {
          this.selectedCourt = null;
        }
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to delete court';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchCourts(query: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await courtService.search(query);
        this.courts = response.courts;
        return response.courts;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to search courts';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
