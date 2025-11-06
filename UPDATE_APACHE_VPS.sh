#!/bin/bash
# Update Apache config on VPS to fix CORS duplicate issue

echo "=== Updating Apache Config on VPS ==="

# 1. Pull latest code
cd /www/wwwroot/api-eduwallet.mojistudio.vn
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Backup current Apache config
echo "💾 Backing up current Apache config..."
cp /www/server/panel/vhost/apache/api-eduwallet.mojistudio.vn.conf /www/server/panel/vhost/apache/api-eduwallet.mojistudio.vn.conf.backup

# 3. Copy new Apache config
echo "📋 Copying new Apache config..."
cp apache-production.conf /www/server/panel/vhost/apache/api-eduwallet.mojistudio.vn.conf

# 4. Test Apache config
echo "🧪 Testing Apache config syntax..."
/www/server/apache/bin/apachectl -t

if [ $? -eq 0 ]; then
    echo "✅ Apache config syntax OK!"

    # 5. Reload Apache gracefully
    echo "🔄 Reloading Apache..."
    /www/server/apache/bin/apachectl graceful

    echo ""
    echo "✅ ✅ ✅ DONE! Apache reloaded successfully!"
    echo ""
    echo "🧪 Test ngay:"
    echo "   curl -I https://api-eduwallet.mojistudio.vn/health"
    echo ""
else
    echo "❌ Apache config has errors!"
    echo "Restoring backup..."
    cp /www/server/panel/vhost/apache/api-eduwallet.mojistudio.vn.conf.backup /www/server/panel/vhost/apache/api-eduwallet.mojistudio.vn.conf
    exit 1
fi
