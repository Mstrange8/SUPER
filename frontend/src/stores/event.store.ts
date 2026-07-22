import { defineStore } from 'pinia';
import { eventService, type Event, type CreateEventData, type UpdateEventData } from '../services/event.service';

interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export const useEventStore = defineStore('events', {
  state: (): EventState => ({
    events: [],
    loading: false,
    error: null,
  }),

  getters: {
    eventsByType: (state) => (type: string) => {
      return state.events.filter(event => event.event_type === type);
    },
    upcomingEvents: (state) => {
      const now = new Date();
      return state.events.filter(event => new Date(event.start_date) >= now);
    },
  },

  actions: {
    async fetchEvents() {
      this.loading = true;
      this.error = null;
      try {
        const response = await eventService.getAll();
        this.events = response.events;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch events';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchEventsByDateRange(start: string, end: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await eventService.getByDateRange(start, end);
        this.events = response.events;
        return response.events;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch events';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createEvent(data: CreateEventData) {
      this.loading = true;
      this.error = null;
      try {
        console.log(data);
        const event = await eventService.create(data);
        this.events.push(event);
        return event;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to create event';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateEvent(id: number, data: UpdateEventData) {
      this.loading = true;
      this.error = null;
      try {
        const updatedEvent = await eventService.update(id, data);
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
          this.events[index] = updatedEvent;
        }
        return updatedEvent;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to update event';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteEvent(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await eventService.delete(id);
        this.events = this.events.filter(e => e.id !== id);
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to delete event';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchEvents(query: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await eventService.search(query);
        this.events = response.events;
        return response.events;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to search events';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
