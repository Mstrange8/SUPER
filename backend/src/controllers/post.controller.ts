import type { Request, Response } from 'express';
import { PostModel } from '../models/post.model';
import { GroupModel } from '../models/group.model';
import type { CreatePostRequest, UpdatePostRequest } from '../types/group.types';

export class PostController {
  // Get all posts (optionally filtered by group)
  static async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const groupId = req.query.group_id ? parseInt(req.query.group_id as string) : undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (groupId !== undefined && isNaN(groupId)) {
        res.status(400).json({ error: 'Invalid group ID' });
        return;
      }

      const result = groupId
        ? await PostModel.getByGroupId(groupId, limit, offset)
        : await PostModel.getAll(limit, offset);

      res.json({ ...result, limit, offset });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  // Get post by ID
  static async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }

      const post = await PostModel.findById(id);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  }

  // Create a new post (authenticated users, must be group member)
  static async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { title, content }: CreatePostRequest = req.body;
      const groupId = parseInt(req.body.group_id);
      const userId = (req as any).user.id;

      if (isNaN(groupId)) {
        res.status(400).json({ error: 'Valid group_id is required' });
        return;
      }

      if (!title || title.trim().length === 0) {
        res.status(400).json({ error: 'Post title is required' });
        return;
      }

      if (!content || content.trim().length === 0) {
        res.status(400).json({ error: 'Post content is required' });
        return;
      }

      if (title.length > 255) {
        res.status(400).json({ error: 'Title must be 255 characters or less' });
        return;
      }

      // Check if group exists
      const group = await GroupModel.findById(groupId);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }

      // Check if user is a member of the group
      const isMember = await GroupModel.isMember(groupId, userId);
      if (!isMember) {
        res.status(403).json({ error: 'Must be a group member to post' });
        return;
      }

      const post = await PostModel.create({
        group_id: groupId,
        user_id: userId,
        title: title.trim(),
        content: content.trim(),
      });

      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  // Update post (author or admin only)
  static async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const { title, content }: UpdatePostRequest = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }

      const post = await PostModel.findById(id);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Only author or admin can update
      if (post.user_id !== userId && userRole !== 'admin' && userRole !== 'sub_admin') {
        res.status(403).json({ error: 'Not authorized to update this post' });
        return;
      }

      if (title !== undefined && title.trim().length === 0) {
        res.status(400).json({ error: 'Post title cannot be empty' });
        return;
      }

      if (content !== undefined && content.trim().length === 0) {
        res.status(400).json({ error: 'Post content cannot be empty' });
        return;
      }

      const updated = await PostModel.update(id, {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  }

  // Delete post (author or admin only)
  static async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }

      const post = await PostModel.findById(id);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Only author or admin can delete
      if (post.user_id !== userId && userRole !== 'admin' && userRole !== 'sub_admin') {
        res.status(403).json({ error: 'Not authorized to delete this post' });
        return;
      }

      await PostModel.delete(id);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  }

  // Search posts
  static async searchPosts(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const groupId = req.query.group_id ? parseInt(req.query.group_id as string) : undefined;

      if (!searchTerm || searchTerm.trim().length === 0) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }

      if (groupId !== undefined && isNaN(groupId)) {
        res.status(400).json({ error: 'Invalid group ID' });
        return;
      }

      const posts = await PostModel.search(searchTerm.trim(), groupId);
      res.json({ posts });
    } catch (error) {
      console.error('Error searching posts:', error);
      res.status(500).json({ error: 'Failed to search posts' });
    }
  }
}
