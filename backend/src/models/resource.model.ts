import { query } from '../database';
import { Resource, CreateResourceData, UpdateResourceData } from '../types/resource.types';

export class ResourceModel {
  static async findAll(limit: number = 100, offset: number = 0): Promise<Resource[]> {
    const result = await query(
      `SELECT * FROM resources 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async findById(id: number): Promise<Resource | null> {
    const result = await query('SELECT * FROM resources WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByType(resourceType: string, limit: number = 100): Promise<Resource[]> {
    const result = await query(
      `SELECT * FROM resources 
       WHERE resource_type = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [resourceType, limit]
    );
    return result.rows;
  }

  static async create(resourceData: CreateResourceData): Promise<Resource> {
    const result = await query(
      `INSERT INTO resources (title, description, resource_type, url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        resourceData.title,
        resourceData.description,
        resourceData.resource_type,
        resourceData.url,
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, resourceData: UpdateResourceData): Promise<Resource | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (resourceData.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(resourceData.title);
      paramCount++;
    }
    if (resourceData.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(resourceData.description);
      paramCount++;
    }
    if (resourceData.resource_type !== undefined) {
      fields.push(`resource_type = $${paramCount}`);
      values.push(resourceData.resource_type);
      paramCount++;
    }
    if (resourceData.url !== undefined) {
      fields.push(`url = $${paramCount}`);
      values.push(resourceData.url);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE resources SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM resources WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async search(searchTerm: string, limit: number = 100): Promise<Resource[]> {
    const result = await query(
      `SELECT * FROM resources 
       WHERE title ILIKE $1 OR description ILIKE $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return result.rows;
  }
}
