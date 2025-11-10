#!/bin/bash

# ========================================
# Deploy Partner Sources API to VPS
# ========================================

echo "🚀 Starting deployment..."

# VPS Configuration
VPS_HOST="root@your-vps-ip"
VPS_PATH="/www/wwwroot/api-eduwallet.mojistudio.vn"
LOCAL_BACKEND="./backend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Step 1: Creating backup on VPS...${NC}"
ssh $VPS_HOST "cd $VPS_PATH && cp -r src src.backup.\$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}📤 Step 2: Uploading PartnerSource model...${NC}"
scp $LOCAL_BACKEND/src/models/PartnerSource.js $VPS_HOST:$VPS_PATH/src/models/

echo -e "${YELLOW}📤 Step 3: Uploading updated PartnerCourse model...${NC}"
scp $LOCAL_BACKEND/src/models/PartnerCourse.js $VPS_HOST:$VPS_PATH/src/models/

echo -e "${YELLOW}📤 Step 4: Uploading updated partner routes...${NC}"
scp $LOCAL_BACKEND/src/routes/partner.js $VPS_HOST:$VPS_PATH/src/routes/

echo -e "${YELLOW}🔄 Step 5: Restarting PM2 process...${NC}"
ssh $VPS_HOST "cd $VPS_PATH && pm2 restart apieduwallet"

echo -e "${YELLOW}📋 Step 6: Checking PM2 status...${NC}"
ssh $VPS_HOST "pm2 list"

echo -e "${YELLOW}📝 Step 7: Checking logs...${NC}"
ssh $VPS_HOST "pm2 logs apieduwallet --lines 20 --nostream"

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo -e "${YELLOW}🧪 Test API:${NC}"
echo "curl -H 'Authorization: Bearer <TOKEN>' https://api-eduwallet.mojistudio.vn/api/partner/sources"
echo ""
echo -e "${YELLOW}📊 Monitor logs:${NC}"
echo "ssh $VPS_HOST 'pm2 logs apieduwallet'"
