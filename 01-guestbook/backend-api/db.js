'use strict';

const { Pool } = require('pg');

// Connection config comes from env only, so the user wires it in compose.
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 5,
});

pool.on('error', (err) => {
  console.error('[db] idle client error:', err.message);
});

// Same shape as db/init.sql, applied on boot so the app works whether or not
// the user mounts init.sql into /docker-entrypoint-initdb.d.
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS messages (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    body       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

async function connectWithRetry(attempts = 15, delayMs = 2000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log(`[db] connected (attempt ${i}/${attempts})`);
      return;
    } catch (err) {
      console.warn(`[db] connect attempt ${i}/${attempts} failed: ${err.message}`);
      if (i === attempts) {
        console.error('[db] out of retries, exiting');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function ensureSchema() {
  await pool.query(SCHEMA_SQL);
  console.log('[db] schema ensured');
}

async function ping() {
  await pool.query('SELECT 1');
}

module.exports = { pool, connectWithRetry, ensureSchema, ping };
