#!/usr/bin/env bash
# VPS recon for incometracker deployment.
# Run ON THE VPS:  bash recon.sh
# Read-only. Paste the whole output back so the deploy config avoids conflicts.
set -uo pipefail

line() { printf '\n==================== %s ====================\n' "$1"; }

line "OS / ARCH"
. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME"
uname -m

line "DOCKER"
if command -v docker >/dev/null 2>&1; then
  docker --version
  docker compose version 2>/dev/null || echo "compose plugin: NOT FOUND"
  echo "--- running containers ---"
  docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
else
  echo "docker: NOT INSTALLED"
fi

line "LISTENING TCP PORTS (who owns what)"
# ss is on most modern distros; falls back to netstat.
(ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | sort -u

line "REVERSE PROXY DETECTION"
for p in nginx caddy traefik apache2 httpd; do
  if command -v "$p" >/dev/null 2>&1 || pgrep -x "$p" >/dev/null 2>&1; then
    echo "FOUND: $p"
  fi
done
docker ps --format '{{.Image}}' 2>/dev/null | grep -Ei 'nginx|caddy|traefik|proxy' && echo "(proxy running as a container ^)" || true
echo "--- nginx sites (if any) ---"
ls -1 /etc/nginx/sites-enabled/ 2>/dev/null || echo "no /etc/nginx/sites-enabled"
ls -1 /etc/nginx/conf.d/ 2>/dev/null || true
echo "--- caddy ---"
ls -1 /etc/caddy/ 2>/dev/null || echo "no /etc/caddy"

line "EXISTING POSTGRES?"
command -v psql >/dev/null 2>&1 && psql --version || echo "no host psql"
docker ps --format '{{.Names}} {{.Image}}' 2>/dev/null | grep -i postgres || echo "no postgres container"

line "TLS / CERTBOT"
command -v certbot >/dev/null 2>&1 && certbot --version && (certbot certificates 2>/dev/null | grep -E 'Certificate Name|Domains|Expiry' || true) || echo "no certbot"

line "RESOURCES"
echo "--- memory ---"; free -h
echo "--- disk ---";   df -h / /var 2>/dev/null
echo "--- cpu ---";    nproc

line "FIREWALL"
ufw status 2>/dev/null || echo "no ufw"
command -v hcloud >/dev/null 2>&1 && echo "(remember to also check Hetzner Cloud Firewall in the console)" || true

line "DONE — paste everything above"
