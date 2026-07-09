import { query } from '../database';
import type { Comment } from '../types/group.types';

export class CommentModel {
  static async create(data: {
    post_id: number;
    user_id: number;
    content: string;
  }): Promise<Comment> {
    const result = await query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.post_id, data.user_id, data.content]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<Comment | null> {
    const result = await query(
      `SELECT c.*, u.username
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async getByPostId(postId: number, limit = 100, offset = 0): Promise<{
    comments: Comment[];
    total: number;
  }> {
    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT c.*, u.username
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.post_id = $1
         ORDER BY c.created_at ASC
         LIMIT $2 OFFSET $3`,
        [postId, limit, offset]
      ),
      query('SELECT COUNT(*) FROM comments WHERE post_id = $1', [postId]),
    ]);

    return {
      comments: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  static async update(id: number, content: string): Promise<Comment | null> {
    const result = await query(
      `UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [content, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM comments WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }
}
