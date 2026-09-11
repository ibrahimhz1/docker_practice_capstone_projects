# 01 - Guestbook

Easiest of the trio. One table, one form, one list. Best first target for the
volume-persistence check: post messages, destroy the DB container, recreate it on
the same named volume, reload &mdash; messages are still there.

## Nodes

| Node        | What it is                          | Talks to            |
|-------------|-------------------------------------|---------------------|
| frontend    | static HTML/CSS/JS, served by nginx | backend-api (proxy) |
| backend-api | Node/Express JSON API               | sql-db              |
| sql-db      | PostgreSQL                          | &mdash;             |

Frontend calls `/api/*` with relative paths. Point nginx `location /api/` (and
`/healthz` if you want it exposed) at `http://backend-api:3000`.

## backend-api env vars

| Var         | Default    | Notes                          |
|-------------|------------|--------------------------------|
| PORT        | 3000       | listens on 0.0.0.0             |
| PGHOST      | localhost  | set to your DB container name  |
| PGPORT      | 5432       |                                |
| PGUSER      | postgres   |                                |
| PGPASSWORD  | postgres   |                                |
| PGDATABASE  | postgres   |                                |

Backend retries the DB connection (~15x, 2s apart) on startup, then applies the
schema idempotently. `db/init.sql` is the same schema for
`/docker-entrypoint-initdb.d` if you prefer the DB to own it.

## API

| Method | Path              | Body                | Result                          |
|--------|-------------------|---------------------|---------------------------------|
| GET    | /healthz          | &mdash;             | `{status,db}` &mdash; 200 or 503 |
| GET    | /api/messages     | &mdash;             | latest 100, newest first        |
| POST   | /api/messages     | `{name, body}`      | 201 created row; 400 on bad input |

## Quick local check (no Docker)

```
cd backend-api
npm install
PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres PGDATABASE=postgres PORT=3000 npm start
curl localhost:3000/healthz
curl -X POST localhost:3000/api/messages -H 'content-type: application/json' -d '{"name":"ada","body":"hello"}'
curl localhost:3000/api/messages
```

Backend API runs on port : 4000
Frontend app runs on port : 3000
