#!/usr/bin/env bash
set -euo pipefail

# Simple bash deploy script for *nix environments
# Usage: ./scripts/deploy_partner1.sh 160.30.112.42 root /www/wwwroot/partner1.mojistudio.vn /path/to/id_rsa

HOST=${1:-}
USER=${2:-}
TARGET=${3:-}
KEY=${4:-}
PORT=${5:-22}

if [[ -z "$HOST" || -z "$USER" || -z "$TARGET" ]]; then
  echo "Usage: $0 <host> <user> <target-dir> [key-path] [port]"
  exit 2
fi

TS=$(date +%Y%m%d%H%M%S)
ARCH="partner1_deploy_${TS}.tar.gz"
TMP_LOCAL="/tmp/$ARCH"

echo "Creating archive $TMP_LOCAL"
tar -czf "$TMP_LOCAL" partner-demos/website-1-video/public partner-demos/website-1-video/routes/api.js

REMOTE_TMP="/tmp/$ARCH"

SCP_OPTS=( -P "$PORT" )
if [[ -n "$KEY" ]]; then
  SCP_OPTS=( -i "$KEY" -P "$PORT" )
fi

echo "Uploading to $USER@$HOST:$REMOTE_TMP"
scp "${SCP_OPTS[@]}" "$TMP_LOCAL" "$USER@$HOST:$REMOTE_TMP"

read -r -d '' REMOTE_CMDS <<'EOF'
set -e
TS="$TS"
TARGET="$TARGET"
BACKUP_DIR="$TARGET/backups"
mkdir -p "$BACKUP_DIR"
cd "$TARGET"
echo "Backing up current public and api.js"
cp -a "$TARGET/public" "$BACKUP_DIR/public.$TS"
cp -a "$TARGET/routes/api.js" "$BACKUP_DIR/api.js.$TS" || true
echo "Extracting"
mkdir -p /tmp/partner1_deploy_$TS
tar -xzf "$REMOTE_TMP" -C /tmp/partner1_deploy_$TS
rsync -a --delete /tmp/partner1_deploy_$TS/partner-demos/website-1-video/public/ "$TARGET/public/"
rsync -a --delete /tmp/partner1_deploy_$TS/partner-demos/website-1-video/routes/api.js "$TARGET/routes/api.js"
chown -R www:www "$TARGET/public" || true
chmod -R 644 "$TARGET/public" || true
chmod 644 "$TARGET/routes/api.js" || true
rm -rf /tmp/partner1_deploy_$TS
rm -f "$REMOTE_TMP"
pm2 restart partner1-video || pm2 reload all || true
echo "Deploy finished"
EOF

echo "Running remote commands"
if [[ -n "$KEY" ]]; then
  ssh -i "$KEY" -p "$PORT" "$USER@$HOST" "$REMOTE_CMDS"
else
  ssh -p "$PORT" "$USER@$HOST" "$REMOTE_CMDS"
fi

echo "Cleaning local archive"
rm -f "$TMP_LOCAL"
echo "Done"
