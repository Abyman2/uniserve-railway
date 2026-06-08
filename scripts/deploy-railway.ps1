# UniServe Railway deployment — run AFTER: railway login
# Usage: powershell -ExecutionPolicy Bypass -File uniserve_project/scripts/deploy-railway.ps1

$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\nodejs;C:\Users\25194\AppData\Roaming\npm;" + $env:Path

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "=== UniServe Railway Deploy ===" -ForegroundColor Cyan

railway whoami | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Run: railway login" -ForegroundColor Red
    exit 1
}

# 1. Create project (from repo root)
$repoRoot = Resolve-Path (Join-Path $root "..")
Push-Location $repoRoot
if (-not (Test-Path ".railway")) {
    railway init --name uniserve -y
}
Pop-Location

# 2. Postgres
Write-Host "Adding PostgreSQL..."
railway add --database postgres --json 2>$null | Out-Null

# 3. Backend service
Write-Host "Creating backend service..."
railway add --service uniserve-backend --json 2>$null | Out-Null

Push-Location $backend
railway link -y 2>$null | Out-Null

$jwt = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
railway variable set SPRING_PROFILES_ACTIVE=prod --service uniserve-backend --skip-deploys
railway variable set JWT_SECRET=$jwt --service uniserve-backend --skip-deploys
railway variable set "DATABASE_URL=`${{Postgres.DATABASE_URL}}" --service uniserve-backend --skip-deploys

Write-Host "Deploying backend (this may take several minutes)..."
railway up --service uniserve-backend --detach -y

$backendDomain = railway domain --service uniserve-backend --json | ConvertFrom-Json
if (-not $backendDomain) {
    railway domain --service uniserve-backend -y 2>$null | Out-Null
    Start-Sleep -Seconds 3
}
$backendUrl = (railway domain --service uniserve-backend 2>$null | Select-Object -Last 1)
if ($backendUrl -notmatch "^https?://") { $backendUrl = "https://$backendUrl" }
Write-Host "Backend: $backendUrl" -ForegroundColor Green
Pop-Location

# 4. Frontend service
Write-Host "Creating frontend service..."
railway add --service uniserve-frontend --json 2>$null | Out-Null

Push-Location $frontend
railway variable set "VITE_API_BASE_URL=$backendUrl" --service uniserve-frontend --skip-deploys

Write-Host "Deploying frontend..."
railway up --service uniserve-frontend --detach -y

$frontendUrl = (railway domain --service uniserve-frontend 2>$null | Select-Object -Last 1)
if (-not $frontendUrl) {
    railway domain --service uniserve-frontend -y 2>$null | Out-Null
    Start-Sleep -Seconds 3
    $frontendUrl = (railway domain --service uniserve-frontend 2>$null | Select-Object -Last 1)
}
if ($frontendUrl -notmatch "^https?://") { $frontendUrl = "https://$frontendUrl" }
Write-Host "Frontend: $frontendUrl" -ForegroundColor Green
Pop-Location

# 5. CORS
Push-Location $backend
railway variable set "CORS_ALLOWED_ORIGINS=$frontendUrl" --service uniserve-backend
Write-Host "CORS set to $frontendUrl" -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "Deploy started! Check status: railway logs --service uniserve-backend" -ForegroundColor Cyan
Write-Host "Open: $frontendUrl"
Write-Host "Admin: admin@uniconnect.com / admin123"
