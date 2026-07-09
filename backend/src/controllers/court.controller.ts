import { Response } from 'express';
import { AuthRequest } from '../types/request.types';
import { CourtModel } from '../models/court.model';

export class CourtController {
  static async getAllCourts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limitParam = req.query.limit as string | undefined;
      const offsetParam = req.query.offset as string | undefined;
      
      const limit = limitParam ? parseInt(limitParam, 10) : 50;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      const courts = await CourtModel.findAll(limit, offset);
      res.status(200).json({ courts, limit, offset });
    } catch (error) {
      console.error('Get courts error:', error);
      res.status(500).json({ error: 'Failed to fetch courts' });
    }
  }

  static async getCourtById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const courtId = req.params.id;
      
      if (!courtId) {
        res.status(400).json({ error: 'Court ID is required' });
        return;
      }

      const courtIdStr = Array.isArray(courtId) ? courtId[0] : courtId;
      if (!courtIdStr) {
        res.status(400).json({ error: 'Invalid Court ID' });
        return;
      }

      const court = await CourtModel.findById(parseInt(courtIdStr, 10));
      if (!court) {
        res.status(404).json({ error: 'Court not found' });
        return;
      }

      res.status(200).json(court);
    } catch (error) {
      console.error('Get court error:', error);
      res.status(500).json({ error: 'Failed to fetch court' });
    }
  }

  static async getCourtsByCity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const city = req.params.city;
      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : 50;

      if (!city) {
        res.status(400).json({ error: 'City is required' });
        return;
      }

      const cityStr = Array.isArray(city) ? city[0] : city;
      if (!cityStr) {
        res.status(400).json({ error: 'Invalid city' });
        return;
      }

      const courts = await CourtModel.findByCity(cityStr, limit);
      res.status(200).json({ courts });
    } catch (error) {
      console.error('Get courts by city error:', error);
      res.status(500).json({ error: 'Failed to fetch courts' });
    }
  }

  static async getNearby(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { lat, lng, radius } = req.query;

      if (!lat || !lng) {
        res.status(400).json({ error: 'Latitude and longitude are required' });
        return;
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusMiles = radius ? parseFloat(radius as string) : 25;

      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json({ error: 'Invalid latitude or longitude' });
        return;
      }

      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : 50;

      const courts = await CourtModel.findNearby(latitude, longitude, radiusMiles, limit);
      res.status(200).json({ courts });
    } catch (error) {
      console.error('Get nearby courts error:', error);
      res.status(500).json({ error: 'Failed to fetch nearby courts' });
    }
  }

  static async createCourt(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const {
        name,
        address,
        city,
        zip,
        latitude,
        longitude,
        description,
        surface_type,
        num_courts,
        has_lighting,
        amenities,
        image_url,
      } = req.body;

      if (!name || !address || !city) {
        res.status(400).json({ error: 'Name, address, and city are required' });
        return;
      }

      const court = await CourtModel.create({
        name,
        address,
        city,
        zip,
        latitude,
        longitude,
        description,
        surface_type,
        num_courts,
        has_lighting,
        amenities,
        image_url,
      });

      res.status(201).json(court);
    } catch (error) {
      console.error('Create court error:', error);
      res.status(500).json({ error: 'Failed to create court' });
    }
  }

  static async updateCourt(req: AuthRequest, res: Response): Promise<void> {
    try {
      const courtId = req.params.id;
      
      if (!courtId) {
        res.status(400).json({ error: 'Court ID is required' });
        return;
      }

      const courtIdStr = Array.isArray(courtId) ? courtId[0] : courtId;
      if (!courtIdStr) {
        res.status(400).json({ error: 'Invalid Court ID' });
        return;
      }

      const {
        name,
        address,
        city,
        zip,
        latitude,
        longitude,
        description,
        surface_type,
        num_courts,
        has_lighting,
        amenities,
        image_url,
      } = req.body;

      const court = await CourtModel.update(parseInt(courtIdStr, 10), {
        name,
        address,
        city,
        zip,
        latitude,
        longitude,
        description,
        surface_type,
        num_courts,
        has_lighting,
        amenities,
        image_url,
      });

      if (!court) {
        res.status(404).json({ error: 'Court not found' });
        return;
      }

      res.status(200).json(court);
    } catch (error) {
      console.error('Update court error:', error);
      res.status(500).json({ error: 'Failed to update court' });
    }
  }

  static async deleteCourt(req: AuthRequest, res: Response): Promise<void> {
    try {
      const courtId = req.params.id;
      
      if (!courtId) {
        res.status(400).json({ error: 'Court ID is required' });
        return;
      }

      const courtIdStr = Array.isArray(courtId) ? courtId[0] : courtId;
      if (!courtIdStr) {
        res.status(400).json({ error: 'Invalid Court ID' });
        return;
      }

      const deleted = await CourtModel.delete(parseInt(courtIdStr, 10));
      
      if (!deleted) {
        res.status(404).json({ error: 'Court not found' });
        return;
      }

      res.status(200).json({ message: 'Court deleted successfully' });
    } catch (error) {
      console.error('Delete court error:', error);
      res.status(500).json({ error: 'Failed to delete court' });
    }
  }

  static async searchCourts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : 50;

      const courts = await CourtModel.search(q as string, limit);
      res.status(200).json({ courts });
    } catch (error) {
      console.error('Search courts error:', error);
      res.status(500).json({ error: 'Failed to search courts' });
    }
  }
}
