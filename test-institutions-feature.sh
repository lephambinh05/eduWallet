#!/bin/bash
# Quick Test Script for Admin Institutions Feature

echo "🧪 Testing Admin Institutions Feature"
echo "======================================"
echo ""

# Test 1: Check files exist
echo "✅ Test 1: Checking files exist..."
files=(
  "src/features/admin/pages/AdminInstitutions.js"
  "src/features/admin/components/InstitutionDetailModal.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✓ $file exists"
  else
    echo "   ✗ $file NOT FOUND"
  fi
done
echo ""

# Test 2: Check exports
echo "✅ Test 2: Checking exports..."
if grep -q "AdminInstitutions" "src/features/admin/pages/index.js"; then
  echo "   ✓ AdminInstitutions exported in pages/index.js"
else
  echo "   ✗ AdminInstitutions NOT exported"
fi

if grep -q "InstitutionDetailModal" "src/features/admin/components/index.js"; then
  echo "   ✓ InstitutionDetailModal exported in components/index.js"
else
  echo "   ✗ InstitutionDetailModal NOT exported"
fi
echo ""

# Test 3: Check route
echo "✅ Test 3: Checking route..."
if grep -q "institutions.*AdminInstitutions" "src/App.js"; then
  echo "   ✓ Route configured in App.js"
else
  echo "   ✗ Route NOT configured"
fi
echo ""

# Test 4: Check menu item
echo "✅ Test 4: Checking menu item..."
if grep -q "institutions" "src/features/admin/components/AdminLayout.js"; then
  echo "   ✓ Menu item added to AdminLayout"
else
  echo "   ✗ Menu item NOT added"
fi
echo ""

# Test 5: Check API methods
echo "✅ Test 5: Checking API methods..."
api_methods=(
  "getInstitutions"
  "approveInstitution"
  "rejectInstitution"
)

for method in "${api_methods[@]}"; do
  if grep -q "$method" "src/features/admin/services/adminService.js"; then
    echo "   ✓ $method method exists"
  else
    echo "   ✗ $method method NOT FOUND"
  fi
done
echo ""

echo "======================================"
echo "🎉 All Tests Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend: npm start"
echo "3. Navigate to: http://localhost:3000/admin/institutions"
echo ""
echo "🔑 Login credentials:"
echo "   Email: admin@example.com"
echo "   Password: Admin123456"
echo ""
