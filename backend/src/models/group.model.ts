import { query } from '../database';
import type { Group } from '../types/group.types';

export class GroupModel {
  static async create(data: {
    name: string;
    description: string | null;
    created_by: number;
  }): Promise<Group> {
    const result = await query(
      `INSERT INTO groups (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.description, data.created_by]
    );
    return result.rows[0];
  }

  static async findById(id: number, userId?: number): Promise<Group | null> {
    const result = await query(
      `SELECT g.*, u.username as creator_username,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
        ${userId ? `, EXISTS(SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = $2) as is_member` : ''}
       FROM groups g
       LEFT JOIN users u ON g.created_by = u.id
       WHERE g.id = $1`,
      userId ? [id, userId] : [id]
    );
    return result.rows[0] || null;
  }

  static async getAll(userId?: number, limit = 100, offset = 0): Promise<{
    groups: Group[];
    total: number;
  }> {
    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT g.*, u.username as creator_username,
          (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
          ${userId ? `, EXISTS(SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = $${userId ? 3 : 0}) as is_member` : ''}
         FROM groups g
         LEFT JOIN users u ON g.created_by = u.id
         ORDER BY g.created_at DESC
         LIMIT $1 OFFSET $2`,
        userId ? [limit, offset, userId] : [limit, offset]
      ),
      query('SELECT COUNT(*) FROM groups'),
    ]);

    return {
      groups: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  static async update(id: number, data: {
    name?: string;
    description?: string | null;
  }): Promise<Group | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(data.description);
      paramCount++;
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(
      `UPDATE groups SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM groups WHERE id = $1 RETURNING *', [id]);
    return (result.rowCount || 0) > 0;
  }

  static async search(searchTerm: string, userId?: number, limit = 50): Promise<Group[]> {
    const result = await query(
      `SELECT g.*, u.username as creator_username,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
        ${userId ? `, EXISTS(SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = $${userId ? 3 : 0}) as is_member` : ''}
       FROM groups g
       LEFT JOIN users u ON g.created_by = u.id
       WHERE g.name ILIKE $1 OR g.description ILIKE $1
       ORDER BY g.created_at DESC
       LIMIT $2`,
      userId ? [`%${searchTerm}%`, limit, userId] : [`%${searchTerm}%`, limit]
    );
    return result.rows;
  }

  // Group membership methods
  static async joinGroup(groupId: number, userId: number): Promise<boolean> {
    try {
      await query(
        'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
        [groupId, userId]
      );
      return true;
    } catch (error) {
      return false; // Already a member or constraint violation
    }
  }

  static async leaveGroup(groupId: number, userId: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *',
      [groupId, userId]
    );
    return (result.rowCount || 0) > 0;
  }

  static async getMembers(groupId: number, limit = 100, offset = 0): Promise<{
    members: Array<{ id: number; username: string; email: string; joined_at: Date }>;
    total: number;
  }> {
    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT u.id, u.username, u.email, gm.joined_at
         FROM group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = $1
         ORDER BY gm.joined_at DESC
         LIMIT $2 OFFSET $3`,
        [groupId, limit, offset]
      ),
      query('SELECT COUNT(*) FROM group_members WHERE group_id = $1', [groupId]),
    ]);

    return {
      members: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  static async isMember(groupId: number, userId: number): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
    return result.rows.length > 0;
  }
}
