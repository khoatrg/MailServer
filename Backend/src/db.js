const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || null;

const pool = new Pool(connectionString ? { connectionString } : {
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || process.env.PGUSER,
  password: process.env.PGPASSWORD || process.env.PGPASSWORD,
  database: process.env.PGDATABASE || process.env.PGDATABASE,
});

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

module.exports = {
  // create user, throws if exists
  createUser: async ({ email, name, passwordHash }) => {
    try {
      const res = await query('INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, created_at', [email, name || null, passwordHash]);
      return res.rows[0];
    } catch (err) {
      if (err.code === '23505') { // unique_violation
        const e = new Error('User exists');
        e.code = 'USER_EXISTS';
        throw e;
      }
      throw err;
    }
  },
  getUserByEmail: async (email) => {
    const res = await query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [email]);
    return res.rows[0] || null;
  },
  getUserById: async (id) => {
    const res = await query('SELECT id, email, name FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  // messages
  insertMessage: async ({ from_email, to_email, subject, body }) => {
    const res = await query('INSERT INTO messages (from_email, to_email, subject, body) VALUES ($1, $2, $3, $4) RETURNING id, from_email, to_email, subject, body, created_at', [from_email, to_email, subject || null, body || null]);
    return res.rows[0];
  },
  getMessagesForEmail: async (email, limit = 100) => {
    const res = await query('SELECT id, from_email AS from, to_email AS to, subject, body, created_at FROM messages WHERE to_email = $1 OR from_email = $1 ORDER BY created_at DESC LIMIT $2', [email, limit]);
    return res.rows;
  },
  getMessageById: async (id) => {
    const res = await query('SELECT id, from_email AS from, to_email AS to, subject, body, created_at FROM messages WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
  pool,
  query,
};

