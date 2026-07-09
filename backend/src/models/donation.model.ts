import { query } from '../database';
import type { DonationRecord } from '../types/donation.types';

export class DonationModel {
  static async create(data: {
    stripe_session_id: string;
    amount: number;
    currency: string;
    donor_name: string | null;
    donor_email: string | null;
    message: string | null;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
  }): Promise<DonationRecord> {
    const result = await query(
      `INSERT INTO donations (stripe_session_id, amount, currency, donor_name, donor_email, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.stripe_session_id,
        data.amount,
        data.currency,
        data.donor_name,
        data.donor_email,
        data.message,
        data.status,
      ]
    );
    return result.rows[0];
  }

  static async updateStatus(
    stripeSessionId: string,
    status: 'completed' | 'failed' | 'cancelled'
  ): Promise<DonationRecord | null> {
    const result = await query(
      `UPDATE donations 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE stripe_session_id = $2
       RETURNING *`,
      [status, stripeSessionId]
    );
    return result.rows[0] || null;
  }

  static async findBySessionId(stripeSessionId: string): Promise<DonationRecord | null> {
    const result = await query(
      'SELECT * FROM donations WHERE stripe_session_id = $1',
      [stripeSessionId]
    );
    return result.rows[0] || null;
  }

  static async getAll(limit = 100, offset = 0): Promise<{
    donations: DonationRecord[];
    total: number;
  }> {
    const [dataResult, countResult] = await Promise.all([
      query(
        'SELECT * FROM donations ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      query('SELECT COUNT(*) FROM donations'),
    ]);

    return {
      donations: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  static async getStats(): Promise<{
    totalAmount: number;
    totalDonations: number;
    completedAmount: number;
    completedCount: number;
  }> {
    const result = await query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) as total_donations,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as completed_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
      FROM donations
    `);

    const row = result.rows[0];
    return {
      totalAmount: parseInt(row.total_amount),
      totalDonations: parseInt(row.total_donations),
      completedAmount: parseInt(row.completed_amount),
      completedCount: parseInt(row.completed_count),
    };
  }
}
