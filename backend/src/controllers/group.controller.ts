import type { Request, Response } from 'express';
import { GroupModel } from '../models/group.model';
import type { CreateGroupRequest, UpdateGroupRequest } from '../types/group.types';

export class GroupController {
  // Get all groups
  static async getAllGroups(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = (req as any).user?.id;

      const result = await GroupModel.getAll(userId, limit, offset);
      res.json({ ...result, limit, offset });
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ error: 'Failed to fetch groups' });
    }
  }

  // Get group by ID
  static async getGroupById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const userId = (req as any).user?.id;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid group ID' });
        return;
      }

      const group = await GroupModel.findById(id, userId);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }

      res.json(group);
    } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).json({ error: 'Failed to fetch group' });
    }
  }

  // Create a new group (authenticated users)
  static async createGroup(req: Request, res: Response): Promise<void> {
    try {
      const { name, description }: CreateGroupRequest = req.body;
      const userId = (req as any).user.id;

      if (!name || name.trim().length === 0) {
        res.status(400).json({ error: 'Group name is required' });
        return;
      }

      if (name.length > 255) {
        res.status(400).json({ error: 'Group name must be 255 characters or less' });
        return;
      }

      const group = await GroupModel.create({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: userId,
      });

      // Automatically join the creator to the group
      await GroupModel.joinGroup(group.id, userId);

      res.status(201).json(group);
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  }

  // Update group (creator or admin only)
  static async updateGroup(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const { name, description }: UpdateGroupRequest = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid group ID' });
        return;
      }

      const group = await GroupModel.findById(id);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }

      // Only creator or admin can update
      if (group.created_by !== userId && userRole !== 'admin' && userRole !== 'sub_admin') {
        res.status(403).json({ error: 'Not authorized to update this group' });
        return;
      }

      if (name !== undefined && name.trim().length === 0) {
        res.status(400).json({ error: 'Group name cannot be empty' });
        return;
      }

      const updated = await GroupModel.update(id, {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(500).json({ error: 'Failed to update group' });
    }
  }

  // Delete group (creator or admin only)
  static async deleteGroup(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid group ID' });
        return;
      }

      const group = await GroupModel.findById(id);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }

      // Only creator or admin can delete
      if (group.created_by !== userId && userRole !== 'admin' && userRole !== 'sub_admin') {
        res.status(403).json({ error: 'Not authorized to delete this group' });
        return;
      }

      await GroupModel.delete(id);
      res.json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Error deleting group:', error);
      res.status(500).json({ error: 'Failed to delete group' });
    }
  }

  // Search groups
  static async searchGroups(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const userId = (req as any).user?.id;

      if (!searchTerm || searchTerm.trim().length === 0) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }

      const groups = await GroupModel.search(searchTerm.trim(), userId);
      res.json({ groups });
    } catch (error) {
      console.error('Error searching groups:', error);
      res.status(500).json({ error: 'Failed to search groups' });
    }
  }

  // Join a group
  static async joinGroup(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const userId = (req as any).user.id;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid group ID' });
        return;
      }

      const group = await GroupModel.findById(id);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }

      const success = await GroupModel.joinGroup(id, userId);
      if (!success) {
        res.status(400).json({ error: 'Already a member of this group' });
        return;
      }

      res.json({ message: 'Joined group successfully' });
    } catch (error) {
      console.error('Error joining group:', error);
      res.status(500).json({ error: 'Failed to join group' });
    }
  }

  // Leave a group
  static async leaveGroup(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const userId = (req as any).user.id;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid group ID' });
        return;
      }

      const success = await GroupModel.leaveGroup(id, userId);
      if (!success) {
        res.status(400).json({ error: 'Not a member of this group' });
        return;
      }

      res.json({ message: 'Left group successfully' });
    } catch (error) {
      console.error('Error leaving group:', error);
      res.status(500).json({ error: 'Failed to leave group' });
    }
  }

  // Get group members
  static async getGroupMembers(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid group ID' });
        return;
      }

      const result = await GroupModel.getMembers(id, limit, offset);
      res.json({ ...result, limit, offset });
    } catch (error) {
      console.error('Error fetching group members:', error);
      res.status(500).json({ error: 'Failed to fetch group members' });
    }
  }
}
