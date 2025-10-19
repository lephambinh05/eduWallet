# Test Scripts cho EduWallet Integration

## 🧪 Scripts để test từng chức năng

### 1. Test Contract Deployment

```bash
#!/bin/bash
# test-deploy.sh

echo "🚀 Testing Contract Deployment..."

cd contract-project

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it first."
    exit 1
fi

# Check if private key is set
if ! grep -q "PRIVATE_KEY=" .env || grep -q "PRIVATE_KEY=your_private_key_here" .env; then
    echo "❌ Please set your PRIVATE_KEY in .env file"
    exit 1
fi

echo "✅ Environment configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile contract
echo "🔨 Compiling contract..."
npm run compile

if [ $? -eq 0 ]; then
    echo "✅ Contract compiled successfully"
else
    echo "❌ Contract compilation failed"
    exit 1
fi

# Deploy contract
echo "🚀 Deploying contract..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Contract deployed successfully"
    
    # Extract contract address
    CONTRACT_ADDRESS=$(npm run deploy 2>&1 | grep "Contract address:" | cut -d' ' -f3)
    echo "📋 Contract Address: $CONTRACT_ADDRESS"
    
    # Update .env with contract address
    if [ ! -z "$CONTRACT_ADDRESS" ]; then
        sed -i "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
        echo "✅ Contract address updated in .env"
    fi
else
    echo "❌ Contract deployment failed"
    exit 1
fi

echo "🎉 Deployment test completed!"
```

### 2. Test Backend Integration

```bash
#!/bin/bash
# test-backend.sh

echo "🔧 Testing Backend Integration..."

cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it first."
    exit 1
fi

# Check if contract address is set
if ! grep -q "EDUWALLET_DATASTORE_ADDRESS=" .env || grep -q "EDUWALLET_DATASTORE_ADDRESS=$" .env; then
    echo "❌ Please set EDUWALLET_DATASTORE_ADDRESS in .env file"
    exit 1
fi

echo "✅ Environment configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start backend in background
echo "🚀 Starting backend server..."
npm start &
BACKEND_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)

if echo "$HEALTH_RESPONSE" | grep -q "success"; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server is not responding"
    kill $BACKEND_PID
    exit 1
fi

# Test contract info endpoint
echo "📋 Testing contract info endpoint..."
CONTRACT_INFO=$(curl -s http://localhost:3001/api/eduwallet/contract-info)

if echo "$CONTRACT_INFO" | grep -q "contractAddress"; then
    echo "✅ Contract integration working"
    echo "📊 Contract Info:"
    echo "$CONTRACT_INFO" | jq '.'
else
    echo "❌ Contract integration failed"
    kill $BACKEND_PID
    exit 1
fi

# Stop backend
kill $BACKEND_PID
echo "🛑 Backend server stopped"

echo "🎉 Backend integration test completed!"
```

### 3. Test API Endpoints

```bash
#!/bin/bash
# test-api.sh

echo "🧪 Testing API Endpoints..."

# Configuration
BASE_URL="http://localhost:3001"
API_BASE="$BASE_URL/api/eduwallet"

# Test data
STUDENT_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
ISSUER_ADDRESS="0x1234567890abcdef1234567890abcdef12345678"

echo "📋 Test Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Student Address: $STUDENT_ADDRESS"
echo "  Issuer Address: $ISSUER_ADDRESS"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_field=$4
    
    echo "🔍 Testing $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$API_BASE$endpoint")
    else
        response=$(curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    if echo "$response" | grep -q "$expected_field"; then
        echo "✅ $method $endpoint - SUCCESS"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo "❌ $method $endpoint - FAILED"
        echo "Response: $response"
    fi
    echo ""
}

# Test 1: Contract Info
test_endpoint "GET" "/contract-info" "" "contractAddress"

# Test 2: Counts
test_endpoint "GET" "/counts" "" "records"

# Test 3: Owner
test_endpoint "GET" "/owner" "" "owner"

# Test 4: Check Issuer (should return false for unknown address)
test_endpoint "GET" "/check-issuer/$ISSUER_ADDRESS" "" "isAuthorized"

# Test 5: Student Records (should return empty array)
test_endpoint "GET" "/students/$STUDENT_ADDRESS/records" "" "success"

# Test 6: Student Badges (should return empty array)
test_endpoint "GET" "/students/$STUDENT_ADDRESS/badges" "" "success"

# Test 7: Student Portfolios (should return empty array)
test_endpoint "GET" "/students/$STUDENT_ADDRESS/portfolios" "" "success"

echo "🎉 API endpoints test completed!"
echo ""
echo "📝 Note: Write operations (POST) require authentication."
echo "   Please test them manually with proper JWT tokens."
```

### 4. Test với Authentication

```bash
#!/bin/bash
# test-auth.sh

echo "🔐 Testing with Authentication..."

# Configuration
BASE_URL="http://localhost:3001"
API_BASE="$BASE_URL/api/eduwallet"

# Test credentials (adjust as needed)
EMAIL="admin@example.com"
PASSWORD="admin123456"

echo "📋 Test Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Email: $EMAIL"
echo ""

# Function to get auth token
get_auth_token() {
    echo "🔑 Getting authentication token..."
    
    login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    
    if echo "$login_response" | grep -q "token"; then
        token=$(echo "$login_response" | jq -r '.token')
        echo "✅ Authentication successful"
        echo "🔑 Token: ${token:0:20}..."
        echo "$token"
    else
        echo "❌ Authentication failed"
        echo "Response: $login_response"
        echo ""
        return 1
    fi
}

# Function to test authenticated endpoint
test_auth_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local expected_field=$5
    
    echo "🔍 Testing $method $endpoint (authenticated)"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token")
    else
        response=$(curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data")
    fi
    
    if echo "$response" | grep -q "$expected_field"; then
        echo "✅ $method $endpoint - SUCCESS"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo "❌ $method $endpoint - FAILED"
        echo "Response: $response"
    fi
    echo ""
}

# Get authentication token
TOKEN=$(get_auth_token)

if [ $? -eq 0 ]; then
    # Test authenticated endpoints
    
    # Test 1: Add Learning Record
    test_auth_endpoint "POST" "/learning-records" '{
        "studentName": "Test Student",
        "institution": "Test University",
        "courseName": "Test Course",
        "certificateHash": "0x1234567890abcdef",
        "score": 95,
        "studentAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    }' "$TOKEN" "success"
    
    # Test 2: Add Badge
    test_auth_endpoint "POST" "/badges" '{
        "name": "Test Badge",
        "description": "Test badge description",
        "imageHash": "0xabcdef1234567890",
        "studentAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    }' "$TOKEN" "success"
    
    # Test 3: Create Portfolio
    test_auth_endpoint "POST" "/portfolios" '{
        "title": "Test Portfolio",
        "description": "Test portfolio description",
        "projectHash": "0x9876543210fedcba",
        "skills": ["JavaScript", "React", "Node.js"]
    }' "$TOKEN" "success"
    
    # Test 4: Authorize Issuer (admin only)
    test_auth_endpoint "POST" "/authorize-issuer" '{
        "issuerAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "authorized": true
    }' "$TOKEN" "success"
    
    echo "🎉 Authenticated API test completed!"
else
    echo "❌ Cannot proceed without authentication token"
    echo "   Please check your credentials and ensure backend is running"
fi
```

### 5. Complete Integration Test

```bash
#!/bin/bash
# test-complete.sh

echo "🎯 Complete Integration Test"
echo "=============================="

# Run all tests in sequence
echo "1️⃣ Testing Contract Deployment..."
./test-deploy.sh

if [ $? -eq 0 ]; then
    echo "✅ Contract deployment test passed"
    echo ""
    
    echo "2️⃣ Testing Backend Integration..."
    ./test-backend.sh
    
    if [ $? -eq 0 ]; then
        echo "✅ Backend integration test passed"
        echo ""
        
        echo "3️⃣ Testing API Endpoints..."
        ./test-api.sh
        
        if [ $? -eq 0 ]; then
            echo "✅ API endpoints test passed"
            echo ""
            
            echo "4️⃣ Testing with Authentication..."
            ./test-auth.sh
            
            if [ $? -eq 0 ]; then
                echo "✅ Authentication test passed"
                echo ""
                echo "🎉 ALL TESTS PASSED! 🎉"
                echo "Your EduWallet + Smart Contract integration is working perfectly!"
            else
                echo "❌ Authentication test failed"
            fi
        else
            echo "❌ API endpoints test failed"
        fi
    else
        echo "❌ Backend integration test failed"
    fi
else
    echo "❌ Contract deployment test failed"
fi

echo ""
echo "📊 Test Summary:"
echo "  - Contract Deployment: $([ $? -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "  - Backend Integration: $([ $? -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "  - API Endpoints: $([ $? -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "  - Authentication: $([ $? -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")"
```

## 🚀 Cách sử dụng

### 1. Tạo các script files
```bash
# Tạo thư mục test
mkdir test-scripts
cd test-scripts

# Copy nội dung từ TEST_SCRIPTS.md vào các file tương ứng
# test-deploy.sh, test-backend.sh, test-api.sh, test-auth.sh, test-complete.sh
```

### 2. Cấp quyền thực thi
```bash
chmod +x *.sh
```

### 3. Chạy test
```bash
# Test từng phần
./test-deploy.sh
./test-backend.sh
./test-api.sh
./test-auth.sh

# Hoặc test tất cả
./test-complete.sh
```

## 📝 Lưu ý

1. **Điều chỉnh thông tin**: Cập nhật email, password, addresses trong scripts theo môi trường của bạn
2. **Kiểm tra dependencies**: Đảm bảo có `jq` để parse JSON responses
3. **Network**: Đảm bảo có kết nối internet để truy cập PZO network
4. **Wallet**: Đảm bảo wallet có đủ balance để deploy và test

## 🐛 Troubleshooting

- Nếu script fail, kiểm tra logs và error messages
- Đảm bảo tất cả services đang chạy
- Kiểm tra network connectivity
- Verify wallet balance và private key
