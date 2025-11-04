#!/bin/bash

# ========================================================
# DEBUG SCRIPT - Tìm nguyên nhân localhost:3001
# ========================================================

echo "=================================================="
echo "🔍 DEBUGGING VPS BUILD ISSUE"
echo "=================================================="

cd /www/wwwroot/eduwallet.mojistudio.vn

# ==========================================
# BƯỚC 1: KIỂM TRA .ENV
# ==========================================
echo ""
echo "📄 BƯỚC 1: Kiểm tra .env files"
echo "=========================================="

echo "--- .env trong root folder ---"
if [ -f ".env" ]; then
    cat .env | grep -E "REACT_APP_BACKEND_URL|NODE_ENV"
else
    echo "❌ .env KHÔNG TỒN TẠI!"
fi

echo ""
echo "--- .env.production ---"
if [ -f ".env.production" ]; then
    cat .env.production | grep -E "REACT_APP_BACKEND_URL|NODE_ENV"
else
    echo "⚠️  .env.production không tồn tại"
fi

echo ""
echo "--- .env.development ---"
if [ -f ".env.development" ]; then
    cat .env.development | grep -E "REACT_APP_BACKEND_URL|NODE_ENV"
else
    echo "⚠️  .env.development không tồn tại"
fi

# ==========================================
# BƯỚC 2: KIỂM TRA SOURCE CODE
# ==========================================
echo ""
echo "📝 BƯỚC 2: Kiểm tra source code"
echo "=========================================="

echo "--- Tìm localhost:3001 trong src/ ---"
LOCALHOST_COUNT=$(grep -r "localhost:3001" src/ 2>/dev/null | wc -l)
echo "Số lượng: $LOCALHOST_COUNT"
if [ $LOCALHOST_COUNT -gt 0 ]; then
    echo "⚠️  Tìm thấy localhost:3001 trong source:"
    grep -r "localhost:3001" src/ 2>/dev/null | head -5
fi

echo ""
echo "--- Kiểm tra src/config/api.js ---"
if [ -f "src/config/api.js" ]; then
    grep -A 2 "API_BASE_URL" src/config/api.js | head -5
else
    echo "❌ src/config/api.js không tồn tại!"
fi

# ==========================================
# BƯỚC 3: KIỂM TRA BUILD FOLDER
# ==========================================
echo ""
echo "🔨 BƯỚC 3: Kiểm tra build folder"
echo "=========================================="

if [ -d "build" ]; then
    echo "✅ Build folder tồn tại"
    echo "Build date: $(stat -c %y build/ 2>/dev/null || stat -f %Sm build/)"
    
    echo ""
    echo "--- Tìm localhost:3001 trong build ---"
    BUILD_LOCALHOST=$(grep -r "localhost:3001" build/static/js/ 2>/dev/null | wc -l)
    echo "Số lượng match: $BUILD_LOCALHOST"
    
    if [ $BUILD_LOCALHOST -gt 0 ]; then
        echo "❌ BUILD VẪN CÒN localhost:3001!"
        grep -o "localhost:3001" build/static/js/main.*.js | head -3
    else
        echo "✅ Build KHÔNG có localhost:3001"
    fi
    
    echo ""
    echo "--- Tìm production URL trong build ---"
    PROD_URL_COUNT=$(grep -o "api-eduwallet.mojistudio.vn" build/static/js/main.*.js 2>/dev/null | wc -l)
    echo "Số lượng production URL: $PROD_URL_COUNT"
    
    if [ $PROD_URL_COUNT -gt 0 ]; then
        echo "✅ Build có production URL"
        grep -o "api-eduwallet.mojistudio.vn" build/static/js/main.*.js | head -3
    else
        echo "❌ Build KHÔNG CÓ production URL!"
    fi
    
    echo ""
    echo "--- Kiểm tra .htaccess trong build ---"
    if [ -f "build/.htaccess" ]; then
        echo "✅ build/.htaccess tồn tại"
        echo "CSP Header:"
        grep "Content-Security-Policy" build/.htaccess | head -1
    else
        echo "❌ build/.htaccess KHÔNG TỒN TẠI!"
    fi
else
    echo "❌ Build folder KHÔNG TỒN TẠI!"
fi

# ==========================================
# BƯỚC 4: KIỂM TRA PACKAGE.JSON
# ==========================================
echo ""
echo "📦 BƯỚC 4: Kiểm tra package.json"
echo "=========================================="

echo "--- Build scripts ---"
grep -A 5 '"scripts"' package.json | grep -E "build|prebuild|postbuild"

# ==========================================
# BƯỚC 5: KIỂM TRA NODE_MODULES
# ==========================================
echo ""
echo "📚 BƯỚC 5: Kiểm tra node_modules"
echo "=========================================="

if [ -d "node_modules" ]; then
    echo "✅ node_modules tồn tại"
    echo "Size: $(du -sh node_modules 2>/dev/null | cut -f1)"
    
    if [ -d "node_modules/.cache" ]; then
        echo "⚠️  node_modules/.cache tồn tại (có thể cache cũ)"
        echo "Cache size: $(du -sh node_modules/.cache 2>/dev/null | cut -f1)"
    fi
else
    echo "❌ node_modules KHÔNG TỒN TẠI!"
fi

# ==========================================
# BƯỚC 6: KIỂM TRA APACHE CONFIG
# ==========================================
echo ""
echo "🌐 BƯỚC 6: Kiểm tra Apache config"
echo "=========================================="

APACHE_CONF="/www/server/panel/vhost/apache/eduwallet.mojistudio.vn.conf"
if [ -f "$APACHE_CONF" ]; then
    echo "--- DocumentRoot ---"
    grep "DocumentRoot" $APACHE_CONF
    
    echo ""
    echo "--- Directory paths ---"
    grep "<Directory" $APACHE_CONF
else
    echo "❌ Apache config không tìm thấy!"
fi

# ==========================================
# BƯỚC 7: TEST BUILD PROCESS
# ==========================================
echo ""
echo "🧪 BƯỚC 7: Test biến môi trường"
echo "=========================================="

echo "--- Giá trị env khi build ---"
export NODE_ENV=production
export REACT_APP_BACKEND_URL=https://api-eduwallet.mojistudio.vn
echo "NODE_ENV=$NODE_ENV"
echo "REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL"

# ==========================================
# KẾT LUẬN
# ==========================================
echo ""
echo "=================================================="
echo "📊 KẾT LUẬN"
echo "=================================================="

if [ -f ".env" ]; then
    BACKEND_URL=$(grep "REACT_APP_BACKEND_URL" .env | cut -d '=' -f2)
    if [[ "$BACKEND_URL" == *"localhost"* ]]; then
        echo "❌ NGUYÊN NHÂN: .env chứa localhost!"
        echo "   Fix: Đổi REACT_APP_BACKEND_URL=https://api-eduwallet.mojistudio.vn"
    elif [[ "$BACKEND_URL" == *"api-eduwallet"* ]]; then
        echo "✅ .env đúng: $BACKEND_URL"
        
        if [ $BUILD_LOCALHOST -gt 0 ]; then
            echo "❌ NGUYÊN NHÂN: Build cũ vẫn còn localhost"
            echo "   Fix: Cần rebuild với lệnh:"
            echo "   rm -rf build/ node_modules/.cache/ && npm run build"
        else
            echo "✅ Build đúng"
            echo "⚠️  Nguyên nhân có thể là BROWSER CACHE"
            echo "   Fix: Hard refresh browser (Ctrl+Shift+R)"
        fi
    else
        echo "⚠️  .env có URL lạ: $BACKEND_URL"
    fi
else
    echo "❌ NGUYÊN NHÂN: Không có .env file!"
    echo "   Fix: Tạo .env với REACT_APP_BACKEND_URL production"
fi

echo ""
echo "=================================================="
echo "✅ DEBUG HOÀN TẤT"
echo "=================================================="
