import { neon, neonConfig } from '@neondatabase/serverless';
import { config } from '../config';

// Configure Neon for Workers
neonConfig.fetchConnectionCache = true;

// Create a SQL query function using Neon serverless driver
const getSql = () => neon(config.databaseUrl);

export const query = async (text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> => {
  const sql = getSql();
  
  // Neon's sql function supports parameterized queries with array
  const result = await sql(text, params || []) as any[];
  return { rows: result || [], rowCount: result?.length || 0 };
};

// For migration script compatibility
export const pool = {
  query: async (text: string, params?: any[]) => {
    return query(text, params);
  },
  end: async () => {
    // No-op for serverless
  }
};
