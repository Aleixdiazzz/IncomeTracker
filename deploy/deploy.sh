#!/usr/bin/env bash
# Build + (re)start incometracker on the VPS.
# Run from the project root on the VPS:  bash deploy/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"

if [ ! -f .env.production ]; then
  echo "ERROR: .env.production not found. cp .env.production.example .env.production and fill it in." >&2
  exit 1
fi

echo ">> Pulling latest code (skip if you deploy by other means)"
git pull --ff-only || echo "(git pull skipped/failed — continuing with working tree)"

echo ">> Building images"
$COMPOSE build

echo ">> Running migrations (one-shot)"
$COMPOSE run --rm migrate

echo ">> Starting / updating services"
$COMPOSE up -d

echo ">> Pruning old images"
docker image prune -f >/dev/null || true

echo ">> Status"
$COMPOSE ps
echo ">> Done. Tail logs with: $COMPOSE logs -f app"
