'use strict';

// Load .env before anything else: db.js builds the pg Pool at import time,
// so the env vars must exist before `require('./db')` runs.
require('dotenv').config();

const express = require('express');
const { pool, connectWithRetry, ensureSchema, ping } = require('./db');

const app = express();
app.use(express.json());

// Minimal stdout request log.
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health: used for the "stop the DB, watch it flip to 503" practice check.
app.get('/healthz', async (_req, res) => {
  try {
    await ping();
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' });
  }
});

app.get('/api/messages', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, body, created_at FROM messages ORDER BY id DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

app.post('/api/messages', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
  if (!name || !body) return res.status(400).json({ error: 'name and body are required' });
  if (name.length > 80) return res.status(400).json({ error: 'name too long (max 80)' });
  if (body.length > 2000) return res.status(400).json({ error: 'body too long (max 2000)' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO messages (name, body) VALUES ($1, $2) RETURNING id, name, body, created_at',
      [name, body]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

const PORT = parseInt(process.env.PORT, 10);

(async () => {
  await connectWithRetry();
  await ensureSchema();
  app.listen(PORT, '0.0.0.0', () => console.log(`[api] listening on 0.0.0.0:${PORT}`));
})();
