import type { Request, Response } from 'express';
import { CommentModel } from '../models/comment.model';
import { PostModel } from '../models/post.model';
import type { CreateCommentRequest, UpdateCommentRequest } from '../types/group.types';

export class CommentController {
  // Get comments for a post
  static async getCommentsByPost(req: Request, res: Response): Promise<void> {
    try {
      const postIdParam = req.params.postId;
      const postId = parseInt((Array.isArray(postIdParam) ? postIdParam[0] : postIdParam) || '0');
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      if (isNaN(postId)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }

      const result = await CommentModel.getByPostId(postId, limit, offset);
      res.json({ ...result, limit, offset });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  // Create a new comment (authenticated users)
  static async createComment(req: Request, res: Response): Promise<void> {
    try {
      const { content }: CreateCommentRequest = req.body;
      const postId = parseInt(req.body.post_id);
      const userId = (req as any).user.id;

      if (isNaN(postId)) {
        res.status(400).json({ error: 'Valid post_id is required' });
        return;
      }

      if (!content || content.trim().length === 0) {
        res.status(400).json({ error: 'Comment content is required' });
        return;
      }

      // Check if post exists
      const post = await PostModel.findById(postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      const comment = await CommentModel.create({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }

  // Update comment (author or admin only)
  static async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const { content }: UpdateCommentRequest = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid comment ID' });
        return;
      }

      const comment = await CommentModel.findById(id);
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      // Only author or admin can update
      if (comment.user_id !== userId && userRole !== 'admin' && userRole !== 'sub_admin') {
        res.status(403).json({ error: 'Not authorized to update this comment' });
        return;
      }

      if (!content || content.trim().length === 0) {
        res.status(400).json({ error: 'Comment content cannot be empty' });
        return;
      }

      const updated = await CommentModel.update(id, content.trim());
      res.json(updated);
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  }

  // Delete comment (author or admin only)
  static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt((Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || '0');
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid comment ID' });
        return;
      }

      const comment = await CommentModel.findById(id);
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      // Only author or admin can delete
      if (comment.user_id !== userId && userRole !== 'admin' && userRole !== 'sub_admin') {
        res.status(403).json({ error: 'Not authorized to delete this comment' });
        return;
      }

      await CommentModel.delete(id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
}
