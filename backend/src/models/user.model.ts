import { query } from '../database';
import { User, UserRegistrationData } from '../types/auth.types';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(userData: UserRegistrationData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    
    const result = await query(
      `INSERT INTO users (email, username, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, role, created_at, updated_at`,
      [userData.email, userData.username, hashedPassword, 'user']
    );
    
    return result.rows[0];
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateRole(userId: number, role: string): Promise<User | null> {
    const result = await query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, username, role, created_at, updated_at`,
      [role, userId]
    );
    return result.rows[0] || null;
  }

  static async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    const result = await query(
      `SELECT id, email, username, role, created_at, updated_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }
}
