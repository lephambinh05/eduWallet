<#
PowerShell deploy script for partner1 demo

Usage (local dev machine):
  .\scripts\deploy_partner1.ps1 -Host 160.30.112.42 -User root -TargetDir /www/wwwroot/partner1.mojistudio.vn -KeyPath C:\path\to\id_rsa

This script will:
 - create a timestamped archive of the website public folder and the routes/api.js file
 - upload the archive to the remote server /tmp
 - on the remote server create backups and extract the archive into the target dir
 - set permissions and restart pm2 service `partner1-video`

Important: have `ssh` and `scp` available on Windows (Git Bash, OpenSSH client). If you use a password instead of key, scp/ssh will prompt.
#>

param(
    [Parameter(Mandatory = $true)] [string]$RemoteHost,
    [Parameter(Mandatory = $true)] [string]$User,
    [Parameter(Mandatory = $true)] [string]$TargetDir,
    [string]$KeyPath = '',
    [int]$Port = 22
)

Set-StrictMode -Version Latest

$ts = Get-Date -Format "yyyyMMddHHmmss"
$tmpArchive = "partner1_deploy_$ts.zip"
$localArchivePath = Join-Path -Path $env:TEMP -ChildPath $tmpArchive

Write-Host "Creating deploy archive -> $localArchivePath"
if (Test-Path $localArchivePath) { Remove-Item $localArchivePath -Force }

$items = @(
    "partner-demos/website-1-video/public",
    "partner-demos/website-1-video/routes/api.js"
)

# Create zip
Compress-Archive -Path $items -DestinationPath $localArchivePath -Force

$remoteTmp = "/tmp/$($tmpArchive)"

$scpArgs = @()
Write-Host ("Uploading archive to {0}@{1}:{2}" -f $User, $RemoteHost, $remoteTmp)
$scpArgs = @()
if ($KeyPath) { $scpArgs += "-i"; $scpArgs += $KeyPath }
$scpArgs += "-P"; $scpArgs += $Port.ToString()
$scpArgs += $localArchivePath
$scpArgs += ("{0}@{1}:{2}" -f $User, $RemoteHost, $remoteTmp)

# Use platform scp
& scp @scpArgs
if ($LASTEXITCODE -ne 0) { throw "scp failed with exit code $LASTEXITCODE" }

Write-Host "Running remote deploy commands"
$remoteCmd = @"
set -e
TS="$ts"
TARGET="$TargetDir"
BACKUP_DIR="$TargetDir/backups"
mkdir -p "$BACKUP_DIR"
cd "$TARGET"
echo "Creating backups of public files"
cp -a "$TARGET/public" "$BACKUP_DIR/public.$TS"
cp -a "$TARGET/routes/api.js" "$BACKUP_DIR/api.js.$TS" || true
echo "Extracting archive"
unzip -o "$remoteTmp" -d /tmp/partner1_deploy_$TS
# rsync the public folder and routes
rsync -a --delete /tmp/partner1_deploy_$TS/partner-demos/website-1-video/public/ "$TARGET/public/"
rsync -a --delete /tmp/partner1_deploy_$TS/partner-demos/website-1-video/routes/api.js "$TARGET/routes/api.js"
chown -R www:www "$TARGET/public" || true
chmod -R 644 "$TARGET/public" || true
chmod 644 "$TARGET/routes/api.js" || true
rm -rf /tmp/partner1_deploy_$TS
rm -f "$remoteTmp"
echo "Restarting pm2 app partner1-video"
pm2 restart partner1-video || pm2 reload all || true
echo "Deploy finished"
"@

$sshArgs = @()
if ($KeyPath) { $sshArgs += "-i"; $sshArgs += $KeyPath }
$sshArgs += "-p"; $sshArgs += $Port.ToString()
$sshArgs += ("{0}@{1}" -f $User, $RemoteHost)

# Start ssh remote execution
Write-Host "SSH to $User@$Host to run remote commands"
& ssh @sshArgs $remoteCmd
if ($LASTEXITCODE -ne 0) { throw "Remote deploy commands failed (exit code $LASTEXITCODE)" }

Write-Host "Cleaning local archive"
Remove-Item $localArchivePath -Force

Write-Host "Deploy completed successfully."
