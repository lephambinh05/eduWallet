# Start all 3 partner demo websites

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting All 3 Partner Demo Websites" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Function to start a website
function Start-Website {
    param(
        [string]$Name,
        [string]$Dir,
        [int]$Port
    )
    
    Write-Host "[Starting] $Name on port $Port..." -ForegroundColor Yellow
    
    $fullPath = Join-Path $scriptDir $Dir
    
    # Start in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$fullPath'; Write-Host 'Starting $Name...' -ForegroundColor Green; node server.js"
    
    # Wait a bit
    Start-Sleep -Seconds 2
    
    Write-Host "[Started] $Name - http://localhost:$Port" -ForegroundColor Green
    Write-Host ""
}

# Start all 3 websites
Start-Website -Name "Website 1 (Video)" -Dir "website-1-video" -Port 3002
Start-Website -Name "Website 2 (Quiz)" -Dir "website-2-quiz" -Port 3003
Start-Website -Name "Website 3 (Hybrid)" -Dir "website-3-hybrid" -Port 3004

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All websites started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Website 1 (Video):  http://localhost:3002" -ForegroundColor White
Write-Host "Website 2 (Quiz):   http://localhost:3003" -ForegroundColor White
Write-Host "Website 3 (Hybrid): http://localhost:3004" -ForegroundColor White
Write-Host ""

# Ask to open in browser
$open = Read-Host "Open all websites in browser? (Y/N)"

if ($open -eq 'Y' -or $open -eq 'y') {
    Write-Host "Opening websites..." -ForegroundColor Yellow
    
    Start-Process "http://localhost:3002?student=68ecef57f2d3ddc8fd99e5be"
    Start-Sleep -Milliseconds 500
    Start-Process "http://localhost:3003?student=68ecef57f2d3ddc8fd99e5be"
    Start-Sleep -Milliseconds 500
    Start-Process "http://localhost:3004?student=68ecef57f2d3ddc8fd99e5be"
    
    Write-Host "All websites opened!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
