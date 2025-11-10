dr#!/usr/bin/env bash
set -euo pipefail

# Simple deploy helper for replacing backend/src/routes/partner.js on the server
# Usage:
#   ./deploy_partnerjs.sh /tmp/partner.js.new /www/wwwroot/api-eduwallet.mojistudio.vn apieduwallet [owner]
# Defaults:
#   NEW_FILE=/tmp/partner.js.new
#   BACKEND_ROOT=/www/wwwroot/api-eduwallet.mojistudio.vn
#   PM2_NAME=apieduwallet
#   OWNER=www-data

NEW_FILE=${1:-/tmp/partner.js.new}
BACKEND_ROOT=${2:-/www/wwwroot/api-eduwallet.mojistudio.vn}
PM2_NAME=${3:-apieduwallet}
OWNER=${4:-www-data}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  sed -n '1,120p' "$0"
  exit 0
fi

if [ "$1" = "--rollback" ]; then
  # find the most recent backup and restore it
  LATEST_BACKUP=$(ls -1t "$BACKEND_ROOT/src/routes/partner.js.bak."* 2>/dev/null | head -n1 || true)
  if [ -z "$LATEST_BACKUP" ]; then
    echo "No backup found in $BACKEND_ROOT/src/routes/"
    exit 1
  fi
  echo "Restoring $LATEST_BACKUP -> $BACKEND_ROOT/src/routes/partner.js"
  sudo mv "$LATEST_BACKUP" "$BACKEND_ROOT/src/routes/partner.js"
  sudo chown -R "$OWNER":"$OWNER" "$BACKEND_ROOT/src/routes/partner.js" || true
  sudo chmod 644 "$BACKEND_ROOT/src/routes/partner.js"
  echo "Restarting pm2 ($PM2_NAME)"
  pm2 restart "$PM2_NAME" || pm2 reload "$PM2_NAME" --update-env
  echo "Rollback complete. Check pm2 status and logs."
  exit 0
fi

echo "Deploy helper starting"
echo "New file: $NEW_FILE"
echo "Backend root: $BACKEND_ROOT"
echo "pm2 name: $PM2_NAME"
echo "owner: $OWNER"

if [ ! -f "$NEW_FILE" ]; then
  echo "ERROR: new file not found: $NEW_FILE"
  exit 2
fi

TARGET="$BACKEND_ROOT/src/routes/partner.js"

if [ ! -d "$BACKEND_ROOT/src/routes" ]; then
  echo "ERROR: target routes directory does not exist: $BACKEND_ROOT/src/routes"
  exit 3
fi

TS=$(date +%Y%m%d%H%M%S)
BACKUP="$TARGET.bak.$TS"

echo "Creating backup: $BACKUP"
sudo cp "$TARGET" "$BACKUP"
echo "Backup created"

echo "Moving new file into place"
sudo mv "$NEW_FILE" "$TARGET"
sudo chown -R "$OWNER":"$OWNER" "$TARGET" || true
sudo chmod 644 "$TARGET"
echo "File replaced: $TARGET"

echo "Restarting pm2 process: $PM2_NAME"
if pm2 restart "$PM2_NAME" 2>/dev/null; then
  echo "pm2 restart succeeded"
else
  echo "pm2 restart failed, attempting reload --update-env"
  pm2 reload "$PM2_NAME" --update-env
fi

echo
echo "pm2 status for $PM2_NAME:"
pm2 status "$PM2_NAME" || true

OUT_LOG="$HOME/.pm2/logs/${PM2_NAME}-out.log"
ERR_LOG="$HOME/.pm2/logs/${PM2_NAME}-error.log"

echo
echo "Last 200 lines from out log (if exists): $OUT_LOG"
if [ -f "$OUT_LOG" ]; then
  tail -n 200 "$OUT_LOG" || true
else
  echo "No out log at $OUT_LOG"
fi

echo
echo "Last 200 lines from error log (if exists): $ERR_LOG"
if [ -f "$ERR_LOG" ]; then
  tail -n 200 "$ERR_LOG" || true
else
  echo "No error log at $ERR_LOG"
fi

echo
echo "Deploy finished. If you see errors in the logs, restore the backup with:"
echo "  sudo $0 --rollback"

exit 0
