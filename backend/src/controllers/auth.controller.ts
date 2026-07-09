import { Response } from 'express';
import { AuthRequest } from '../types/request.types';
import { UserModel } from '../models/user.model';
import { generateToken } from '../utils/jwt.util';
import { validateEmail, validatePassword, validateUsername } from '../utils/validation.util';
import { AuthResponse } from '../types/auth.types';

export class AuthController {
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body;

      // Validate input
      if (!email || !username || !password) {
        res.status(400).json({ error: 'Email, username, and password are required' });
        return;
      }

      if (!validateEmail(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      const usernameValidation = validateUsername(username);
      if (!usernameValidation.valid) {
        res.status(400).json({ error: usernameValidation.message });
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        res.status(400).json({ error: passwordValidation.message });
        return;
      }

      // Check if user already exists
      const existingUserByEmail = await UserModel.findByEmail(email);
      if (existingUserByEmail) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const existingUserByUsername = await UserModel.findByUsername(username);
      if (existingUserByUsername) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }

      // Create user
      const user = await UserModel.create({ email, username, password });

      // Generate JWT token
      const token = generateToken({id: user.id, 
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        token,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Verify password
      const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Generate JWT token
      const token = generateToken({id: user.id, 
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        token,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limitParam = req.query.limit as string | undefined;
      const offsetParam = req.query.offset as string | undefined;
      
      const limit = limitParam ? parseInt(limitParam, 10) : 50;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      const users = await UserModel.getAllUsers(limit, offset);

      res.status(200).json({
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          created_at: user.created_at,
        })),
        limit,
        offset,
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { role } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      if (!role || !['user', 'admin', 'sub_admin'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      // Ensure userId is a string, not an array or undefined
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;
      if (!userIdStr) {
        res.status(400).json({ error: 'Invalid User ID' });
        return;
      }
      
      const user = await UserModel.updateRole(parseInt(userIdStr, 10), role);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
}
