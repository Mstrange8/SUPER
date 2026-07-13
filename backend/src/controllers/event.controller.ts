import { Response } from 'express';
import { AuthRequest } from '../types/request.types';
import { EventModel } from '../models/event.model';

export class EventController {
  static async getAllEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limitParam = req.query.limit as string | undefined;
      const offsetParam = req.query.offset as string | undefined;

      const limit = limitParam ? parseInt(limitParam, 10) : 100;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      const events = await EventModel.findAll(limit, offset);
      res.status(200).json({ events, limit, offset });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  static async getEventById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;

      if (!eventId) {
        res.status(400).json({ error: 'Event ID is required' });
        return;
      }

      const eventIdStr = Array.isArray(eventId) ? eventId[0] : eventId;
      if (!eventIdStr) {
        res.status(400).json({ error: 'Invalid Event ID' });
        return;
      }

      const event = await EventModel.findById(parseInt(eventIdStr, 10));
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.status(200).json(event);
    } catch (error) {
      console.error('Get event error:', error);
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  }

  static async getEventsByDateRange(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        res.status(400).json({ error: 'Start and end dates are required' });
        return;
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      const events = await EventModel.findByDateRange(startDate, endDate);
      res.status(200).json({ events });
    } catch (error) {
      console.error('Get events by date range error:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  static async getEventsByType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const type = req.params.type;
      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : 100;

      if (!type) {
        res.status(400).json({ error: 'Event type is required' });
        return;
      }

      const typeStr = Array.isArray(type) ? type[0] : type;
      if (!typeStr) {
        res.status(400).json({ error: 'Invalid event type' });
        return;
      }

      const events = await EventModel.findByType(typeStr, limit);
      res.status(200).json({ events });
    } catch (error) {
      console.error('Get events by type error:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  static async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { title, description, event_type, start_date, end_date, external_link, color } = req.body;

      if (!title || !event_type || !start_date) {
        res.status(400).json({ error: 'Title, event type, and start date are required' });
        return;
      }

      const validTypes = ['tournament', 'league', 'fundraiser', 'social', 'other'];
      if (!validTypes.includes(event_type)) {
        res.status(400).json({ error: 'Invalid event type' });
        return;
      }

      const event = await EventModel.create(
        {
          title,
          description,
          event_type,
          start_date,
          end_date,
          external_link,
          color,
        },
        req.user.userId
      );

      res.status(201).json(event);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }

  static async updateEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;

      if (!eventId) {
        res.status(400).json({ error: 'Event ID is required' });
        return;
      }

      const eventIdStr = Array.isArray(eventId) ? eventId[0] : eventId;
      if (!eventIdStr) {
        res.status(400).json({ error: 'Invalid Event ID' });
        return;
      }

      const { title, description, event_type, start_date, end_date, external_link, color } = req.body;

      if (event_type && !['tournament', 'league', 'fundraiser', 'social', 'other'].includes(event_type)) {
        res.status(400).json({ error: 'Invalid event type' });
        return;
      }

      const event = await EventModel.update(parseInt(eventIdStr, 10), {
        title,
        description,
        event_type,
        start_date,
        end_date,
        external_link,
        color,
      });

      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.status(200).json(event);
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  }

  static async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;

      if (!eventId) {
        res.status(400).json({ error: 'Event ID is required' });
        return;
      }

      const eventIdStr = Array.isArray(eventId) ? eventId[0] : eventId;
      if (!eventIdStr) {
        res.status(400).json({ error: 'Invalid Event ID' });
        return;
      }

      const deleted = await EventModel.delete(parseInt(eventIdStr, 10));

      if (!deleted) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  }

  static async searchEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : 50;

      const events = await EventModel.search(q as string, limit);
      res.status(200).json({ events });
    } catch (error) {
      console.error('Search events error:', error);
      res.status(500).json({ error: 'Failed to search events' });
    }
  }
}
