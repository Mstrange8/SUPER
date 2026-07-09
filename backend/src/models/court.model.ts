import { query } from '../database';
import { Court, CreateCourtData, UpdateCourtData } from '../types/court.types';

export class CourtModel {
  static async findAll(limit: number = 50, offset: number = 0): Promise<Court[]> {
    const result = await query(
      `SELECT * FROM courts 
       ORDER BY name ASC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async findById(id: number): Promise<Court | null> {
    const result = await query('SELECT * FROM courts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByCity(city: string, limit: number = 50): Promise<Court[]> {
    const result = await query(
      `SELECT * FROM courts 
       WHERE city ILIKE $1 
       ORDER BY name ASC 
       LIMIT $2`,
      [`%${city}%`, limit]
    );
    return result.rows;
  }

  static async create(courtData: CreateCourtData): Promise<Court> {
    const result = await query(
      `INSERT INTO courts (name, address, city, zip, latitude, longitude, description, 
                          surface_type, num_courts, has_lighting, amenities, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        courtData.name,
        courtData.address,
        courtData.city,
        courtData.zip,
        courtData.latitude,
        courtData.longitude,
        courtData.description,
        courtData.surface_type,
        courtData.num_courts || 1,
        courtData.has_lighting || false,
        courtData.amenities,
        courtData.image_url,
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, courtData: UpdateCourtData): Promise<Court | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (courtData.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(courtData.name);
      paramCount++;
    }
    if (courtData.address !== undefined) {
      fields.push(`address = $${paramCount}`);
      values.push(courtData.address);
      paramCount++;
    }
    if (courtData.city !== undefined) {
      fields.push(`city = $${paramCount}`);
      values.push(courtData.city);
      paramCount++;
    }
    if (courtData.zip !== undefined) {
      fields.push(`zip = $${paramCount}`);
      values.push(courtData.zip);
      paramCount++;
    }
    if (courtData.latitude !== undefined) {
      fields.push(`latitude = $${paramCount}`);
      values.push(courtData.latitude);
      paramCount++;
    }
    if (courtData.longitude !== undefined) {
      fields.push(`longitude = $${paramCount}`);
      values.push(courtData.longitude);
      paramCount++;
    }
    if (courtData.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(courtData.description);
      paramCount++;
    }
    if (courtData.surface_type !== undefined) {
      fields.push(`surface_type = $${paramCount}`);
      values.push(courtData.surface_type);
      paramCount++;
    }
    if (courtData.num_courts !== undefined) {
      fields.push(`num_courts = $${paramCount}`);
      values.push(courtData.num_courts);
      paramCount++;
    }
    if (courtData.has_lighting !== undefined) {
      fields.push(`has_lighting = $${paramCount}`);
      values.push(courtData.has_lighting);
      paramCount++;
    }
    if (courtData.amenities !== undefined) {
      fields.push(`amenities = $${paramCount}`);
      values.push(courtData.amenities);
      paramCount++;
    }
    if (courtData.image_url !== undefined) {
      fields.push(`image_url = $${paramCount}`);
      values.push(courtData.image_url);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE courts SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM courts WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async search(searchTerm: string, limit: number = 50): Promise<Court[]> {
    const result = await query(
      `SELECT * FROM courts 
       WHERE name ILIKE $1 OR city ILIKE $1 OR address ILIKE $1 OR description ILIKE $1
       ORDER BY name ASC 
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return result.rows;
  }

  static async findNearby(latitude: number, longitude: number, radiusMiles: number = 25, limit: number = 50): Promise<Court[]> {
    // Using the Haversine formula to calculate distance
    // 3959 is the approximate radius of the earth in miles
    const result = await query(
      `SELECT *, 
        (3959 * acos(
          cos(radians($1)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance
       FROM courts
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL
       HAVING distance < $3
       ORDER BY distance ASC
       LIMIT $4`,
      [latitude, longitude, radiusMiles, limit]
    );
    return result.rows;
  }
}
