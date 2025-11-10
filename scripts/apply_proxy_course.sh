#!/bin/bash
set -e

echo "[STEP] check pm2 partner1-video"
pm2 describe partner1-video || true

# find vhost file
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
BACKUP="$VHOST.bak.$(date +%s)"
cp "$VHOST" "$BACKUP"
echo "[STEP] backup created: $BACKUP"

# insert ProxyPass for /course if not present
if grep -q "ProxyPass[[:space:]]*/course" "$VHOST"; then
  echo "[INFO] ProxyPass /course already present"
else
  # try to insert after ProxyPass /api occurrence, fallback to end of VirtualHost
  if grep -q "ProxyPass[[:space:]]*/api" "$VHOST"; then
    awk 'BEGIN{insert=0} /ProxyPass[ \t]*\/api/ && !insert{print; print "  ProxyPass /course http://127.0.0.1:6000/course"; print "  ProxyPassReverse /course http://127.0.0.1:6000/course"; insert=1; next} {print}' "$VHOST" > "$VHOST.tmp" && mv "$VHOST.tmp" "$VHOST"
    echo "[STEP] inserted ProxyPass after /api"
  else
    # append before closing VirtualHost
    awk 'BEGIN{done=0} /<\/VirtualHost>/ && !done{print "  ProxyPass /course http://127.0.0.1:6000/course"; print "  ProxyPassReverse /course http://127.0.0.1:6000/course"; done=1} {print}' "$VHOST" > "$VHOST.tmp" && mv "$VHOST.tmp" "$VHOST"
    echo "[STEP] appended ProxyPass before </VirtualHost>"
  fi
fi

# enable modules for apache2 if needed
if [ "$APACHE" = "apache2" ]; then
  a2enmod proxy proxy_http headers || true
fi

# reload apache
systemctl reload "$APACHE" || systemctl restart "$APACHE"
echo "[STEP] reloaded $APACHE"

# verify URL
echo "[STEP] curl check"
curl -I "https://partner1.mojistudio.vn/course/quiz_1762592496189_zpq5tvapt?student=690f05b1e086901f037d6748" -s -S -D - -o /dev/null -w "%{http_code}\n"
