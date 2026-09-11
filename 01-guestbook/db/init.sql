-- Guestbook schema. Drop-in for /docker-entrypoint-initdb.d in the postgres image.
-- The backend also applies this same shape on boot (see backend-api/db.js).

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
