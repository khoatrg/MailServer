require('dotenv').config();
const db = require('./db');

async function migrate() {
  try {
    // create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_email TEXT NOT NULL,
        to_email TEXT NOT NULL,
        subject TEXT,
        body TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

if (require.main === module) migrate();
