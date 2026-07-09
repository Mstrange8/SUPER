import { Response } from 'express';
import { AuthRequest } from '../types/request.types';
import { ResourceModel } from '../models/resource.model';

export class ResourceController {
  static async getAllResources(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limitParam = req.query.limit as string | undefined;
      const offsetParam = req.query.offset as string | undefined;
      
      const limit = limitParam ? parseInt(limitParam, 10) : 100;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      const resources = await ResourceModel.findAll(limit, offset);
      res.status(200).json({ resources, limit, offset });
    } catch (error) {
      console.error('Get resources error:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  }

  static async getResourceById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resourceId = req.params.id;
      
      if (!resourceId) {
        res.status(400).json({ error: 'Resource ID is required' });
        return;
      }

      const resourceIdStr = Array.isArray(resourceId) ? resourceId[0] : resourceId;
      if (!resourceIdStr) {
        res.status(400).json({ error: 'Invalid Resource ID' });
        return;
      }

      const resource = await ResourceModel.findById(parseInt(resourceIdStr, 10));
      if (!resource) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      res.status(200).json(resource);
    } catch (error) {
      console.error('Get resource error:', error);
      res.status(500).json({ error: 'Failed to fetch resource' });
    }
  }

  static async getResourcesByType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const type = req.params.type;
      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : 100;

      if (!type) {
        res.status(400).json({ error: 'Resource type is required' });
        return;
      }

      const typeStr = Array.isArray(type) ? type[0] : type;
      if (!typeStr) {
        res.status(400).json({ error: 'Invalid resource type' });
        return;
      }

      const resources = await ResourceModel.findByType(typeStr, limit);
      res.status(200).json({ resources });
    } catch (error) {
      console.error('Get resources by type error:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  }

  static async createResource(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { title, description, resource_type, url } = req.body;

      if (!title || !resource_type || !url) {
        res.status(400).json({ error: 'Title, resource type, and URL are required' });
        return;
      }

      const validTypes = ['brand', 'article', 'video', 'other'];
      if (!validTypes.includes(resource_type)) {
        res.status(400).json({ error: 'Invalid resource type' });
        return;
      }

      const resource = await ResourceModel.create({
        title,
        description,
        resource_type,
        url,
      });

      res.status(201).json(resource);
    } catch (error) {
      console.error('Create resource error:', error);
      res.status(500).json({ error: 'Failed to create resource' });
    }
  }

  static async updateResource(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resourceId = req.params.id;
      
      if (!resourceId) {
        res.status(400).json({ error: 'Resource ID is required' });
        return;
      }

      const resourceIdStr = Array.isArray(resourceId) ? resourceId[0] : resourceId;
      if (!resourceIdStr) {
        res.status(400).json({ error: 'Invalid Resource ID' });
        return;
      }

      const { title, description, resource_type, url } = req.body;

      if (resource_type && !['brand', 'article', 'video', 'other'].includes(resource_type)) {
        res.status(400).json({ error: 'Invalid resource type' });
        return;
      }

      const resource = await ResourceModel.update(parseInt(resourceIdStr, 10), {
        title,
        description,
        resource_type,
        url,
      });

      if (!resource) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      res.status(200).json(resource);
    } catch (error) {
      console.error('Update resource error:', error);
      res.status(500).json({ error: 'Failed to update resource' });
    }
  }

  static async deleteResource(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resourceId = req.params.id;
      
      if (!resourceId) {
        res.status(400).json({ error: 'Resource ID is required' });
        return;
      }

      const resourceIdStr = Array.isArray(resourceId) ? resourceId[0] : resourceId;
      if (!resourceIdStr) {
        res.status(400).json({ error: 'Invalid Resource ID' });
        return;
      }

      const deleted = await ResourceModel.delete(parseInt(resourceIdStr, 10));
      
      if (!deleted) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
      console.error('Delete resource error:', error);
      res.status(500).json({ error: 'Failed to delete resource' });
    }
  }

  static async searchResources(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : 100;

      const resources = await ResourceModel.search(q as string, limit);
      res.status(200).json({ resources });
    } catch (error) {
      console.error('Search resources error:', error);
      res.status(500).json({ error: 'Failed to search resources' });
    }
  }
}
