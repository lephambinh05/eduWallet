#!/bin/bash
set -e

echo "Detecting OS..."
if [ -f /etc/debian_version ]; then
  echo "Debian/Ubuntu detected"
  VHOST="/etc/apache2/sites-available/partner1.conf"
  BACKUP="$VHOST.bak.$(date +%s)"
  if [ -f "$VHOST" ]; then
    echo "Backing up existing $VHOST to $BACKUP"
    cp "$VHOST" "$BACKUP"
  fi
  cat > "$VHOST" <<'APACHE'
<VirtualHost *:80>
  ServerName partner1.mojistudio.vn
  DocumentRoot /www/wwwroot/partner1.mojistudio.vn/public

  ProxyRequests Off
  ProxyPreserveHost On
  ProxyPass /api http://127.0.0.1:6001/api
  ProxyPassReverse /api http://127.0.0.1:6001/api

  <Location /api>
    Require all granted
  </Location>

  <Directory /www/wwwroot/partner1.mojistudio.vn/public>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>

  ErrorLog ${APACHE_LOG_DIR:-/var/log/apache2}/partner1_error.log
  CustomLog ${APACHE_LOG_DIR:-/var/log/apache2}/partner1_access.log combined
</VirtualHost>
APACHE
  echo "Enabling proxy modules and site..."
  a2enmod proxy proxy_http proxy_wstunnel headers || true
  a2ensite partner1.conf || true
  echo "Reloading apache2..."
  systemctl reload apache2
  echo "Reloaded apache2"
else
  echo "Assuming RHEL/CentOS"
  VHOST="/etc/httpd/conf.d/partner1.conf"
  BACKUP="$VHOST.bak.$(date +%s)"
  if [ -f "$VHOST" ]; then
    echo "Backing up existing $VHOST to $BACKUP"
    cp "$VHOST" "$BACKUP"
  fi
  cat > "$VHOST" <<'APACHE'
<VirtualHost *:80>
  ServerName partner1.mojistudio.vn
  DocumentRoot /www/wwwroot/partner1.mojistudio.vn/public

  ProxyRequests Off
  ProxyPreserveHost On
  ProxyPass /api http://127.0.0.1:6001/api
  ProxyPassReverse /api http://127.0.0.1:6001/api

  <Location /api>
    Require all granted
  </Location>

  <Directory /www/wwwroot/partner1.mojistudio.vn/public>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>

  ErrorLog /var/log/httpd/partner1_error.log
  CustomLog /var/log/httpd/partner1_access.log combined
</VirtualHost>
APACHE
  echo "Restarting httpd..."
  systemctl restart httpd
  echo "Restarted httpd"
fi

# Give apache a sec
sleep 1

echo "Testing proxied endpoint (local) http://127.0.0.1/api/partner/courses"
curl -i http://127.0.0.1/api/partner/courses || true

echo "Testing public endpoint https://partner1.mojistudio.vn/api/partner/courses (first 20 lines)"
curl -i -m 10 https://partner1.mojistudio.vn/api/partner/courses 2>/dev/null | head -n 20 || true

echo "Script finished"
