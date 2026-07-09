import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (anyone can view comments)
router.get('/post/:postId', CommentController.getCommentsByPost);

// Authenticated routes (require login to create/update/delete)
router.post('/', authenticate, CommentController.createComment);
router.patch('/:id', authenticate, CommentController.updateComment);
router.delete('/:id', authenticate, CommentController.deleteComment);

export default router;
