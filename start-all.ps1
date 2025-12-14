# Script tự động khởi động tất cả services
# Chạy: .\start-all.ps1

Write-Host "🚀 Starting Neo Learn System..." -ForegroundColor Green
Write-Host ""

# Kiểm tra Go
Write-Host "Checking Go installation..." -ForegroundColor Yellow
if (!(Get-Command go -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Go is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Go found: $(go version)" -ForegroundColor Green

# Kiểm tra Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js found: $(node --version)" -ForegroundColor Green

# Kiểm tra Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python found: $(python --version)" -ForegroundColor Green
Write-Host ""

# Lưu thư mục hiện tại
$rootDir = Get-Location

# 1. Start Backend
Write-Host "📦 Starting Backend (Golang)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Green; go run cmd/api/main.go"
Start-Sleep -Seconds 2

# 2. Start Frontend
Write-Host "🎨 Starting Frontend (Vue.js)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; Write-Host '🌐 Frontend Server Starting...' -ForegroundColor Blue; npm run dev"
Start-Sleep -Seconds 2

# 3. Start Face Recognition Service
Write-Host "🤖 Starting Face Recognition Service (Python)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\face-recognition-service'; Write-Host '👤 Face Recognition Service Starting...' -ForegroundColor Magenta; .\venv\Scripts\Activate.ps1; python app/main.py"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✨ All services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access points:" -ForegroundColor Yellow
Write-Host "   - Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend:   http://localhost:8080" -ForegroundColor White
Write-Host "   - Face API:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "👤 Login credentials:" -ForegroundColor Yellow
Write-Host "   Email:    demo@example.com" -ForegroundColor White
Write-Host "   Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Gray
Write-Host ""

# Đợi user nhấn Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Stopping all services..." -ForegroundColor Red
}
