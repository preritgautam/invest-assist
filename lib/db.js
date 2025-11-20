import { Pool } from 'pg';

// Create connection pool using environment variables
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'invest assist',
  password: 'P@ssw0rd123',
  port: '5432',
});

// Test the connection
pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('[Database] Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('[Database] Query error:', error);
    throw error;
  }
}
