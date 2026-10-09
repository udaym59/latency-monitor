# @uptime/api

Express 5 + MongoDB (official driver) + in-process `node-cron` checker.

## Setup

```bash
cp .env.example .env   # then fill in MONGO_URI from Atlas (Connect → Drivers)
pnpm dev               # from repo root, or: pnpm --filter @uptime/api dev
```

Expected startup log:

```
Mongo indexes ensured: id_unique, monitor_checkedAt, checkedAt_ttl, monitor_startedAt, monitor_open_unique
Mongo connected (db: uptime-monitor)
Checker scheduled: every minute
API listening on http://localhost:3001
```

Requires MongoDB **7.0+** (`$percentile` in the stats pipeline). Atlas M0 runs 8.0.
In Atlas → Network Access, allow your current IP.

## Endpoints

| Method | Path                    | Notes                                                       |
| ------ | ----------------------- | ----------------------------------------------------------- |
| GET    | `/monitors`             | newest first                                                |
| POST   | `/monitors`             | `{ name, url, intervalMinutes }` → `201` + monitor          |
| GET    | `/monitors/:id`         | `404` if missing                                            |
| PATCH  | `/monitors/:id`         | any of `name`, `url`, `intervalMinutes`, `isPaused`         |
| DELETE | `/monitors/:id`         | `204`; cascades checks + incidents                          |
| GET    | `/monitors/:id/checks`  | newest first, `?limit=1..500` (default 100)                 |
| GET    | `/monitors/:id/stats`   | `MonitorStats` over the last 24h                            |
| GET    | `/monitors/:id/incidents` | open first, then newest; resolved ones from last 30 days  |

`intervalMinutes` ∈ `1, 5, 10, 15, 30, 60`. Validation errors → `400 { error, issues }`.

## Manual verification

```bash
# create a monitor
curl -X POST http://localhost:3001/monitors \
  -H 'content-type: application/json' \
  -d '{"name":"GitHub","url":"https://github.com","intervalMinutes":1}'

# list
curl http://localhost:3001/monitors

# checks (wait ~1–2 min after creating)
curl "http://localhost:3001/monitors/<id>/checks?limit=5"

# stats
curl http://localhost:3001/monitors/<id>/stats
```

### Incident lifecycle

```bash
# 1. a monitor that returns 500
curl -X POST http://localhost:3001/monitors \
  -H 'content-type: application/json' \
  -d '{"name":"Broken","url":"https://httpbin.org/status/500","intervalMinutes":1}'
# → within ~2 min the log shows "1 incidents opened"; an open doc appears in `incidents`

# 2. point it at a healthy URL
curl -X PATCH http://localhost:3001/monitors/<id> \
  -H 'content-type: application/json' \
  -d '{"url":"https://httpbin.org/status/200"}'
# → next tick logs "1 resolved"; the incident gets resolvedAt

# 3. delete → monitor, checks and incidents are gone
curl -i -X DELETE http://localhost:3001/monitors/<id>
```

## Checker semantics

- Runs every minute (`noOverlap`). A monitor is **due** when its last check (or `createdAt`, if never
  checked) is older than `intervalMinutes`, minus 10s of slack for cron jitter.
- All due monitors are probed in parallel: `GET`, redirects followed, 10s timeout, `ok` = 2xx.
  `latencyMs` = time to response headers; `null` on timeout / network error.
- Checks expire after 7 days (TTL index). Stats only look at the last 24h.
- Incidents: down + none open → open; down + open → refresh `lastError`; up + open → resolve.
  A partial unique index guarantees at most one open incident per monitor.
- Single-process only: two API instances would both run the cron and double-check.
