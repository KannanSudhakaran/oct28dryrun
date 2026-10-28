import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: new URL('../../.env', import.meta.url) });
dotenv.config({ path: new URL('../.env', import.meta.url) });

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Render requires SSL
});

const COLS = 'customer_id, name, email, phone, created_at';

export const customers = {
  async list() {
    return (await pool.query(`SELECT ${COLS} FROM customer ORDER BY customer_id`)).rows;
  },
  async get(id) {
    return (await pool.query(`SELECT ${COLS} FROM customer WHERE customer_id = $1`, [id])).rows[0];
  },
  async searchByName(name) {
    return (await pool.query(
      `SELECT ${COLS} FROM customer WHERE name ILIKE $1 ORDER BY customer_id`, [`%${name}%`])).rows;
  },
  async create({ name, email, phone }) {
    return (await pool.query(
      `INSERT INTO customer (name, email, phone) VALUES ($1, $2, $3) RETURNING ${COLS}`,
      [name, email ?? null, phone ?? null])).rows[0];
  },
  async update(id, { name, email, phone }) {
    return (await pool.query(
      `UPDATE customer SET name = COALESCE($2, name), email = COALESCE($3, email), phone = COALESCE($4, phone)
       WHERE customer_id = $1 RETURNING ${COLS}`,
      [id, name ?? null, email ?? null, phone ?? null])).rows[0];
  },
  async remove(id) {
    return (await pool.query(`DELETE FROM customer WHERE customer_id = $1 RETURNING ${COLS}`, [id])).rows[0];
  },
};
