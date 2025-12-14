# Script setup database và test API
# Chạy: .\test-auth.ps1

Write-Host "🧪 Testing Neo Learn Authentication System" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:8080"

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health Check: " -NoNewline -ForegroundColor Green
    Write-Host "$($response.message)"
}
catch {
    Write-Host "❌ Health Check Failed: Server not running?" -ForegroundColor Red
    Write-Host "   Please start the backend server first: go run cmd/api/main.go" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Register
Write-Host "2️⃣  Testing Registration..." -ForegroundColor Cyan
$registerData = @{
    name     = "Test User"
    email    = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration: " -NoNewline -ForegroundColor Green
    Write-Host "$($response.message)"
    Write-Host "   User ID: $($response.data.id)" -ForegroundColor Gray
    Write-Host "   Name: $($response.data.name)" -ForegroundColor Gray
    Write-Host "   Email: $($response.data.email)" -ForegroundColor Gray
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  Registration: Email already exists (expected if running again)" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Login
Write-Host "3️⃣  Testing Login..." -ForegroundColor Cyan
$loginData = @{
    email    = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login: " -NoNewline -ForegroundColor Green
    Write-Host "$($response.message)"
    
    $token = $response.data.token
    $user = $response.data.user
    
    Write-Host "   User: $($user.name) ($($user.email))" -ForegroundColor Gray
    Write-Host "   Roles: $($user.roles -join ', ')" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    
    Write-Host ""
    
    # Test 4: Get Profile
    Write-Host "4️⃣  Testing Get Profile (Protected)..." -ForegroundColor Cyan
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/profile" -Method Get -Headers $headers
        Write-Host "✅ Get Profile: " -NoNewline -ForegroundColor Green
        Write-Host "$($response.message)"
        Write-Host "   ID: $($response.data.id)" -ForegroundColor Gray
        Write-Host "   Name: $($response.data.name)" -ForegroundColor Gray
        Write-Host "   Email: $($response.data.email)" -ForegroundColor Gray
        Write-Host "   Roles: $($response.data.roles -join ', ')" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Get Profile Failed" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Test 5: Logout
    Write-Host "5️⃣  Testing Logout..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/logout" -Method Post -Headers $headers
        Write-Host "✅ Logout: " -NoNewline -ForegroundColor Green
        Write-Host "$($response.message)"
    }
    catch {
        Write-Host "❌ Logout Failed" -ForegroundColor Red
    }
    
}
catch {
    Write-Host "❌ Login Failed: Invalid credentials" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 API Endpoints:" -ForegroundColor Yellow
Write-Host "   POST /api/v1/auth/register     - Register new user"
Write-Host "   POST /api/v1/auth/login        - Login"
Write-Host "   GET  /api/v1/auth/profile      - Get profile (protected)"
Write-Host "   POST /api/v1/auth/logout       - Logout (protected)"
Write-Host "   POST /api/v1/auth/change-password - Change password (protected)"
Write-Host ""
