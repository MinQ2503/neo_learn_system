# Requires -Version 5.1
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Script setup ban đầu
# Chạy: .\setup.ps1

Write-Host "🔧 Neo Learn System - Initial Setup" -ForegroundColor Green
Write-Host ""

$rootDir = Get-Location

# 1. Setup Backend
Write-Host "1️⃣  Setting up Backend (Golang)..." -ForegroundColor Cyan
Set-Location "$rootDir\backend"

if (Test-Path "go.mod") {
    Write-Host "   Installing Go dependencies..." -ForegroundColor Yellow
    go mod download
    go mod tidy
    Write-Host "   ✅ Backend setup complete!" -ForegroundColor Green
}
else {
    Write-Host "   ❌ go.mod not found!" -ForegroundColor Red
}

# 2. Setup Frontend
Write-Host ""
Write-Host "2️⃣  Setting up Frontend (Vue.js)..." -ForegroundColor Cyan
Set-Location "$rootDir\frontend"

if (Test-Path "package.json") {
    Write-Host "   Installing Node dependencies (this may take a while)..." -ForegroundColor Yellow
    npm install
    Write-Host "   ✅ Frontend setup complete!" -ForegroundColor Green
}
else {
    Write-Host "   ❌ package.json not found!" -ForegroundColor Red
}

# 3. Setup Face Recognition Service
Write-Host ""
Write-Host "3️⃣  Setting up Face Recognition Service (Python)..." -ForegroundColor Cyan
Set-Location "$rootDir\face-recognition-service"

if (!(Test-Path "venv")) {
    Write-Host "   Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "   Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host "   Installing Python dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt

Write-Host "   ✅ Face Recognition Service setup complete!" -ForegroundColor Green

# Back to root
Set-Location $rootDir

Write-Host ""
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run: .\start-all.ps1" -ForegroundColor White
Write-Host "   2. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host "   3. Login with: demo@example.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "📖 For more information, see: QUICK_START.md" -ForegroundColor Gray
Write-Host ""
