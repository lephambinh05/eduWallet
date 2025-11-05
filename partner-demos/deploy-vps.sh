#!/bin/bash
# Deploy Partner Demos to VPS

echo "🚀 Deploying Partner Demos..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
cd /www/wwwroot/partner-demos

cd website-1-video && npm install && cd ..
cd website-2-quiz && npm install && cd ..
cd website-3-hybrid && npm install && cd ..

# 2. Stop old PM2 processes
echo "🛑 Stopping old processes..."
pm2 stop partner1-video || true
pm2 stop partner2-quiz || true
pm2 stop partner3-hybrid || true
pm2 delete partner1-video || true
pm2 delete partner2-quiz || true
pm2 delete partner3-hybrid || true

# 3. Start with PM2
echo "▶️  Starting with PM2..."
pm2 start ecosystem.config.js

# 4. Save PM2 config
pm2 save

# 5. Check status
echo "✅ Deployment completed!"
pm2 list

echo ""
echo "🌐 Partner Demos:"
echo "   Partner 1 (Video):  https://partner1.mojistudio.vn"
echo "   Partner 2 (Quiz):   https://partner2.mojistudio.vn"
echo "   Partner 3 (Hybrid): https://partner3.mojistudio.vn"
