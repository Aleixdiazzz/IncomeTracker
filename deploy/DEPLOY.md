# Deploying Income Tracker to the Hetzner VPS

A Docker Compose deployment: the Next.js app + Postgres run as containers; your
**existing** reverse proxy on the box terminates TLS and forwards to the app on
localhost. Postgres is never exposed to the network.

```
Internet ──▶ xpose-static (Caddy container, :443, TLS)
                     │  reverse_proxy incometracker_app:3000
                     │  over external `xpose-network`
                     ▼
        incometracker_app (Next.js standalone, container)
                     │  private `internal` compose network
                     ▼
        incometracker_postgres (no host port, no public net)
```

The app joins **two** networks: `internal` (DB-only) and the existing external
`xpose-network` so the already-running Caddy container can reach it by name.
No host port is published — the only public entry point stays Caddy.

## Files this adds to the repo

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build → small standalone runtime image + a `migrator` target |
| `.dockerignore` | Keeps the build context lean |
| `docker-compose.prod.yml` | app + postgres + one-shot migrate service |
| `.env.production.example` | Template for production secrets (copy on the VPS) |
| `deploy/recon.sh` | Read-only audit of the VPS (run first) |
| `deploy/deploy.sh` | Build + migrate + (re)start |
| `deploy/backup.sh` | Timestamped `pg_dump`, keeps last 14 |
| `deploy/nginx.incometracker.conf` | nginx site (if the box runs nginx) |
| `deploy/Caddyfile.snippet` | Caddy block (if the box runs Caddy) |

`next.config.ts` was set to `output: "standalone"`.

---

## Step 0 — Recon (do this first)

The box already runs other apps, so confirm what's there before deploying:

```bash
# on the VPS, from the repo (or scp the file over)
bash deploy/recon.sh
```

Use the output to pick:
- **APP_PORT** — any free localhost port (e.g. 3000, 3100…). Check the
  "LISTENING TCP PORTS" section.
- **reverse proxy** — nginx vs Caddy (the "REVERSE PROXY DETECTION" section).
- confirm **Docker + compose plugin** are installed; if not:
  `curl -fsSL https://get.docker.com | sh`.

## Step 1 — Get the code onto the VPS

Either `git clone`/`git pull` your repo, or rsync the working tree:

```bash
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  ./ youruser@YOUR_VPS:/opt/incometracker/
```

Target dir suggestion: `/opt/incometracker`.

## Step 2 — Production secrets

```bash
cd /opt/incometracker
cp .env.production.example .env.production
nano .env.production
```

Set, at minimum:
- `POSTGRES_PASSWORD` → `openssl rand -base64 24` (avoid `:/@` chars)
- `DATABASE_URL` → same user/password/db, host stays `postgres`
- `BETTER_AUTH_SECRET` → **fresh** `openssl rand -base64 32` (do not reuse dev)
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` → `https://your.domain`
- `APP_PORT` → the free port from recon

## Step 3 — DNS

Point an A/AAAA record for your domain/subdomain at the VPS IP. Verify:
`dig +short your.domain`.

## Step 4 — Build, migrate, start

```bash
bash deploy/deploy.sh
```

This builds the images, runs drizzle migrations once (the `migrate` service),
then starts `app` + `postgres`. Check:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
curl -I http://127.0.0.1:$(grep APP_PORT .env.production | cut -d= -f2)
```

The `curl` should return an HTTP redirect/200 from Next.

## Step 5 — Wire up the reverse proxy + TLS

**If nginx:**
```bash
sudo cp deploy/nginx.incometracker.conf /etc/nginx/sites-available/incometracker
# edit server_name + proxy_pass port to match .env.production
sudo ln -s /etc/nginx/sites-available/incometracker /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your.domain      # TLS + auto-renew
```

**If Caddy on the host (`/etc/caddy/Caddyfile`):**
```bash
# append deploy/Caddyfile.snippet, edit domain, then:
sudo systemctl reload caddy               # TLS is automatic
```

**If Caddy in a container (this VPS — `xpose-static`):**
```bash
# 1. Append deploy/Caddyfile.snippet to the xpose Caddyfile, e.g.:
nano ~/astro-portfolio/XposePortfolio/Caddyfile.static

# 2. Rebuild the Caddy image so the file is baked in, then recreate:
cd ~/astro-portfolio/XposePortfolio
docker compose -f docker-compose.static.yml up -d --build caddy
```
Verify Caddy can resolve the app by name (both on `xpose-network`):
```bash
docker exec xpose-static getent hosts incometracker_app
```

Then open `https://your.domain`, sign up, and confirm the dashboard loads with
the default categories.

---

## Updating after code changes

```bash
cd /opt/incometracker
git pull            # or rsync again
bash deploy/deploy.sh
```

Migrations run automatically on each deploy. New migration SQL is generated in
dev with `npm run db:generate` and committed — deploy just applies it.

## Backups

```bash
bash deploy/backup.sh        # -> backups/incometracker-<stamp>.sql.gz
```

Automate daily via cron:
```cron
15 3 * * * cd /opt/incometracker && bash deploy/backup.sh >> backups/backup.log 2>&1
```

Restore:
```bash
gunzip -c backups/incometracker-STAMP.sql.gz \
  | docker exec -i incometracker_postgres psql -U incometracker -d incometracker
```

## Rollback

```bash
git checkout <previous-good-commit>
bash deploy/deploy.sh
```
Note: a rollback does **not** undo a migration. If a release included a
destructive migration, restore from the backup taken before the deploy.

## Troubleshooting

- **Build fails on `next build`** — the build sets placeholder `DATABASE_URL`/
  `BETTER_AUTH_SECRET` (see Dockerfile). Real values come from `.env.production`
  at runtime. If a new page does static DB work at build time, mark it
  `export const dynamic = "force-dynamic"`.
- **502 from the proxy** — app not up or wrong `APP_PORT`. Check
  `docker compose -f docker-compose.prod.yml --env-file .env.production logs app`.
- **Login works but session drops / "insecure cookie"** — the proxy isn't
  passing `X-Forwarded-Proto: https`, or `BETTER_AUTH_URL` isn't the https URL.
- **`kysely` / migration errors** — the `overrides: { kysely: 0.28.7 }` pin in
  package.json must be present (it is); rebuild with `--no-cache` if needed.
- **Migrate service errors on connect** — `DATABASE_URL` host must be `postgres`
  (the service name), not `localhost`.
```
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm migrate
```
