# Quick Test Script for Admin Institutions Feature
# PowerShell Version

Write-Host "🧪 Testing Admin Institutions Feature" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check files exist
Write-Host "✅ Test 1: Checking files exist..." -ForegroundColor Green
$files = @(
    "src\features\admin\pages\AdminInstitutions.js",
    "src\features\admin\components\InstitutionDetailModal.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file NOT FOUND" -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: Check exports
Write-Host "✅ Test 2: Checking exports..." -ForegroundColor Green
$pagesIndex = Get-Content "src\features\admin\pages\index.js" -Raw
if ($pagesIndex -match "AdminInstitutions") {
    Write-Host "   ✓ AdminInstitutions exported in pages/index.js" -ForegroundColor Green
} else {
    Write-Host "   ✗ AdminInstitutions NOT exported" -ForegroundColor Red
}

$componentsIndex = Get-Content "src\features\admin\components\index.js" -Raw
if ($componentsIndex -match "InstitutionDetailModal") {
    Write-Host "   ✓ InstitutionDetailModal exported in components/index.js" -ForegroundColor Green
} else {
    Write-Host "   ✗ InstitutionDetailModal NOT exported" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check route
Write-Host "✅ Test 3: Checking route..." -ForegroundColor Green
$appJs = Get-Content "src\App.js" -Raw
if ($appJs -match "institutions.*AdminInstitutions") {
    Write-Host "   ✓ Route configured in App.js" -ForegroundColor Green
} else {
    Write-Host "   ✗ Route NOT configured" -ForegroundColor Red
}
Write-Host ""

# Test 4: Check menu item
Write-Host "✅ Test 4: Checking menu item..." -ForegroundColor Green
$adminLayout = Get-Content "src\features\admin\components\AdminLayout.js" -Raw
if ($adminLayout -match "institutions") {
    Write-Host "   ✓ Menu item added to AdminLayout" -ForegroundColor Green
} else {
    Write-Host "   ✗ Menu item NOT added" -ForegroundColor Red
}
Write-Host ""

# Test 5: Check API methods
Write-Host "✅ Test 5: Checking API methods..." -ForegroundColor Green
$adminService = Get-Content "src\features\admin\services\adminService.js" -Raw
$apiMethods = @("getInstitutions", "approveInstitution", "rejectInstitution")

foreach ($method in $apiMethods) {
    if ($adminService -match $method) {
        Write-Host "   ✓ $method method exists" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $method method NOT FOUND" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎉 All Tests Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start backend: cd backend; node app-with-api.js"
Write-Host "2. Start frontend: npm start"
Write-Host "3. Navigate to: http://localhost:3000/admin/institutions"
Write-Host ""
Write-Host "🔑 Login credentials:" -ForegroundColor Yellow
Write-Host "   Email: admin@example.com"
Write-Host "   Password: Admin123456"
Write-Host ""
