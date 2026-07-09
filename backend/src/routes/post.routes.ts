import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (anyone can view posts)
router.get('/', PostController.getAllPosts);
router.get('/search', PostController.searchPosts);
router.get('/:id', PostController.getPostById);

// Authenticated routes (require login to create/update/delete)
router.post('/', authenticate, PostController.createPost);
router.patch('/:id', authenticate, PostController.updatePost);
router.delete('/:id', authenticate, PostController.deletePost);

export default router;
