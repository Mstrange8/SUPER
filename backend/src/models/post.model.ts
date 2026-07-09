import { query } from '../database';
import type { Post } from '../types/group.types';

export class PostModel {
  static async create(data: {
    group_id: number;
    user_id: number;
    title: string;
    content: string;
  }): Promise<Post> {
    const result = await query(
      `INSERT INTO posts (group_id, user_id, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.group_id, data.user_id, data.title, data.content]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<Post | null> {
    const result = await query(
      `SELECT p.*, u.username, g.name as group_name,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN groups g ON p.group_id = g.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async getByGroupId(groupId: number, limit = 50, offset = 0): Promise<{
    posts: Post[];
    total: number;
  }> {
    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT p.*, u.username,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
         FROM posts p
         LEFT JOIN users u ON p.user_id = u.id
         WHERE p.group_id = $1
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [groupId, limit, offset]
      ),
      query('SELECT COUNT(*) FROM posts WHERE group_id = $1', [groupId]),
    ]);

    return {
      posts: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  static async getAll(limit = 50, offset = 0): Promise<{
    posts: Post[];
    total: number;
  }> {
    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT p.*, u.username, g.name as group_name,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
         FROM posts p
         LEFT JOIN users u ON p.user_id = u.id
         LEFT JOIN groups g ON p.group_id = g.id
         ORDER BY p.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      query('SELECT COUNT(*) FROM posts'),
    ]);

    return {
      posts: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  static async update(id: number, data: {
    title?: string;
    content?: string;
  }): Promise<Post | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(data.title);
      paramCount++;
    }
    if (data.content !== undefined) {
      fields.push(`content = $${paramCount}`);
      values.push(data.content);
      paramCount++;
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(
      `UPDATE posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM posts WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  static async search(searchTerm: string, groupId?: number, limit = 50): Promise<Post[]> {
    const searchPattern = `%${searchTerm}%`;
    const whereClause = groupId 
      ? 'WHERE (p.title ILIKE $1 OR p.content ILIKE $1) AND p.group_id = $3'
      : 'WHERE p.title ILIKE $1 OR p.content ILIKE $1';
    
    const params = groupId 
      ? [searchPattern, limit, groupId]
      : [searchPattern, limit];

    const result = await query(
      `SELECT p.*, u.username, g.name as group_name,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN groups g ON p.group_id = g.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $2`,
      params
    );
    return result.rows;
  }
}
