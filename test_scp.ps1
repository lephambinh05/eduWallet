# Test SCP connection to server
# Usage: .\test_scp.ps1

Write-Host "Testing SCP connection to server..." -ForegroundColor Cyan

$VPS_HOST = "root@160.30.112.42"
$TEST_FILE = "README.md"
$REMOTE_PATH = "/tmp/test_scp.txt"

# Create a test file
"Test SCP connection - $(Get-Date)" | Out-File -FilePath $TEST_FILE -Encoding UTF8

try {
    # Test SCP upload
    Write-Host "Uploading test file..." -ForegroundColor Yellow
    scp $TEST_FILE "${VPS_HOST}:${REMOTE_PATH}"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SCP upload successful" -ForegroundColor Green

        # Test SSH command
        Write-Host "Testing SSH command..." -ForegroundColor Yellow
        ssh $VPS_HOST "ls -la ${REMOTE_PATH}"

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SSH command successful" -ForegroundColor Green
            Write-Host "✅ SCP connection is working!" -ForegroundColor Green
        }
        else {
            Write-Host "❌ SSH command failed" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ SCP upload failed" -ForegroundColor Red
        Write-Host "Possible issues:" -ForegroundColor Yellow
        Write-Host "1. SSH key not configured" -ForegroundColor Yellow
        Write-Host "2. Wrong IP address" -ForegroundColor Yellow
        Write-Host "3. Firewall blocking port 22" -ForegroundColor Yellow
        Write-Host "4. Server not responding" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # Clean up
    if (Test-Path $TEST_FILE) {
        Remove-Item $TEST_FILE -Force
    }
}