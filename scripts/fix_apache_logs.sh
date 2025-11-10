#!/bin/bash
set -e

# Find vhost
if [ -f /etc/apache2/sites-available/partner1.conf ]; then
  VHOST="/etc/apache2/sites-available/partner1.conf"
  APACHE="apache2"
elif [ -f /etc/httpd/conf.d/partner1.conf ]; then
  VHOST="/etc/httpd/conf.d/partner1.conf"
  APACHE="httpd"
else
  echo "[ERROR] partner vhost not found"
  exit 2
fi

echo "[STEP] using vhost: $VHOST"
BACKUP="$VHOST.fixlog.bak.$(date +%s)"
cp "$VHOST" "$BACKUP"
echo "[STEP] backup created: $BACKUP"

echo "[STEP] showing vhost header"
sed -n '1,60p' "$VHOST" || true

# Replace problematic APACHE_LOG_DIR variable usages with absolute path
# Replace occurrences like ${APACHE_LOG_DIR:-/var/log/apache2}/ or ${APACHE_LOG_DIR}/
sed -E -e 's#\$\{APACHE_LOG_DIR:-/var/log/apache2\}/?#/var/log/apache2/#g' -e 's#\$\{APACHE_LOG_DIR\}/?#/var/log/apache2/#g' "$VHOST" > "$VHOST.tmp"
mv "$VHOST.tmp" "$VHOST"

echo "[STEP] replaced APACHE_LOG_DIR references with /var/log/apache2/"

# Ensure log directory exists and has sane perms
mkdir -p /var/log/apache2
chown root:adm /var/log/apache2 || true
chmod 750 /var/log/apache2 || true

echo "[STEP] running apache configtest"
if apachectl configtest 2>&1 | tee /tmp/apache_configtest.out; then
  echo "[STEP] configtest OK, restarting $APACHE"
  systemctl restart "$APACHE" || (journalctl -n 200 -u "$APACHE" --no-pager | tail -n 60; exit 1)
  echo "[STEP] restarted $APACHE"
else
  echo "[ERROR] apache configtest failed, printing /tmp/apache_configtest.out"
  cat /tmp/apache_configtest.out
  exit 1
fi

# Verify example URL
echo "[STEP] curl check"
curl -I "https://partner1.mojistudio.vn/course/quiz_1762592496189_zpq5tvapt?student=690f05b1e086901f037d6748" -s -S -D - -o /dev/null -w "%{http_code}\n"
