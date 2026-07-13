import { query } from '../database';
import { Event, CreateEventData, UpdateEventData, EVENT_TYPE_COLORS } from '../types/event.types';

export class EventModel {
  static async findAll(limit: number = 100, offset: number = 0): Promise<Event[]> {
    const result = await query(
      `SELECT * FROM events 
       ORDER BY start_date DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async findById(id: number): Promise<Event | null> {
    const result = await query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const result = await query(
      `SELECT * FROM events 
       WHERE start_date >= $1 AND start_date <= $2 
       ORDER BY start_date ASC`,
      [startDate, endDate]
    );
    return result.rows;
  }

  static async findByType(eventType: string, limit: number = 100): Promise<Event[]> {
    const result = await query(
      `SELECT * FROM events 
       WHERE event_type = $1 
       ORDER BY start_date DESC 
       LIMIT $2`,
      [eventType, limit]
    );
    return result.rows;
  }

  static async create(eventData: CreateEventData, userId: number): Promise<Event> {
    const color = eventData.color || EVENT_TYPE_COLORS[eventData.event_type] || '#4CAF50';

    const result = await query(
      `INSERT INTO events (title, description, event_type, start_date, end_date, external_link, color, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        eventData.title,
        eventData.description,
        eventData.event_type,
        eventData.start_date,
        eventData.end_date,
        eventData.external_link,
        color,
        userId,
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, eventData: UpdateEventData): Promise<Event | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (eventData.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(eventData.title);
      paramCount++;
    }
    if (eventData.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(eventData.description);
      paramCount++;
    }
    if (eventData.event_type !== undefined) {
      fields.push(`event_type = $${paramCount}`);
      values.push(eventData.event_type);
      paramCount++;
    }
    if (eventData.start_date !== undefined) {
      fields.push(`start_date = $${paramCount}`);
      values.push(eventData.start_date);
      paramCount++;
    }
    if (eventData.end_date !== undefined) {
      fields.push(`end_date = $${paramCount}`);
      values.push(eventData.end_date);
      paramCount++;
    }
    if (eventData.external_link !== undefined) {
      fields.push(`external_link = $${paramCount}`);
      values.push(eventData.external_link);
      paramCount++;
    }
    if (eventData.color !== undefined) {
      fields.push(`color = $${paramCount}`);
      values.push(eventData.color);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async search(searchTerm: string, limit: number = 50): Promise<Event[]> {
    const result = await query(
      `SELECT * FROM events 
       WHERE title ILIKE $1 OR description ILIKE $1 
       ORDER BY start_date DESC 
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return result.rows;
  }
}
