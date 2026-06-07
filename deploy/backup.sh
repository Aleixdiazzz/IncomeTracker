#!/usr/bin/env bash
# Timestamped logical backup of the incometracker Postgres database.
# Run on the VPS:  bash deploy/backup.sh   (writes to ./backups/)
# Restore:  gunzip -c backups/FILE.sql.gz | docker exec -i incometracker_postgres psql -U incometracker -d incometracker
set -euo pipefail

cd "$(dirname "$0")/.."
set -a; . ./.env.production; set +a

mkdir -p backups
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/incometracker-${STAMP}.sql.gz"

docker exec -t incometracker_postgres \
  pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists \
  | gzip > "$OUT"

echo ">> Wrote $OUT ($(du -h "$OUT" | cut -f1))"
# Keep the 14 most recent backups.
ls -1t backups/incometracker-*.sql.gz | tail -n +15 | xargs -r rm -v
