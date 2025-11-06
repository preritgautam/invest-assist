import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',       // e.g., 'postgres'
  host: 'localhost',           // your DB host
  database: 'invest assist',   // e.g., 'testdb'
  password: 'P@ssw0rd123',   // your DB password
  port: 5432,                  // default PostgreSQL port
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}
