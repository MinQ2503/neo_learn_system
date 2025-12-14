# Neo Learn System - Setup Guide

## Hướng dẫn tạo cấu trúc thư mục

### Bước 1: Tạo thư mục Backend (Golang)

```powershell
# Từ thư mục gốc neo_learn_system
New-Item -ItemType Directory -Force -Path backend\cmd\api
New-Item -ItemType Directory -Force -Path backend\internal\config
New-Item -ItemType Directory -Force -Path backend\internal\middleware
New-Item -ItemType Directory -Force -Path backend\internal\models
New-Item -ItemType Directory -Force -Path backend\internal\handlers
New-Item -ItemType Directory -Force -Path backend\internal\services
New-Item -ItemType Directory -Force -Path backend\internal\repository
New-Item -ItemType Directory -Force -Path backend\internal\utils
New-Item -ItemType Directory -Force -Path backend\pkg
New-Item -ItemType Directory -Force -Path backend\migrations
New-Item -ItemType Directory -Force -Path backend\docs
```

### Bước 2: Tạo thư mục Frontend (Vue.js)

```powershell
# Cách 1: Sử dụng npm create vue@latest
cd frontend
npm create vue@latest .

# Sau đó tạo các thư mục bổ sung
New-Item -ItemType Directory -Force -Path src\api
New-Item -ItemType Directory -Force -Path src\composables
```

### Bước 3: Tạo thư mục Mobile (Flutter)

```powershell
# Sử dụng Flutter CLI
flutter create mobile

# Sau đó tạo cấu trúc thư mục clean architecture
cd mobile
New-Item -ItemType Directory -Force -Path lib\core
New-Item -ItemType Directory -Force -Path lib\data\models
New-Item -ItemType Directory -Force -Path lib\data\repositories
New-Item -ItemType Directory -Force -Path lib\data\services
New-Item -ItemType Directory -Force -Path lib\presentation\screens
New-Item -ItemType Directory -Force -Path lib\presentation\widgets
New-Item -ItemType Directory -Force -Path lib\presentation\controllers
New-Item -ItemType Directory -Force -Path lib\routes
```

### Bước 4: Tạo thư mục Face Recognition Service (Python FastAPI)

```powershell
# Tái cấu trúc từ code hiện tại
New-Item -ItemType Directory -Force -Path face-recognition-service\app\api\v1\endpoints
New-Item -ItemType Directory -Force -Path face-recognition-service\app\core
New-Item -ItemType Directory -Force -Path face-recognition-service\app\models
New-Item -ItemType Directory -Force -Path face-recognition-service\app\utils
New-Item -ItemType Directory -Force -Path face-recognition-service\tests
New-Item -ItemType Directory -Force -Path face-recognition-service\weights

# Di chuyển code hiện tại
Move-Item -Path face_detection -Destination face-recognition-service\app\services\face_detection
Move-Item -Path face_recognition -Destination face-recognition-service\app\services\face_recognition
Move-Item -Path face_tracking -Destination face-recognition-service\app\services\face_tracking
Move-Item -Path face_alignment -Destination face-recognition-service\app\services\face_alignment
Move-Item -Path datasets -Destination face-recognition-service\datasets
```

### Bước 5: Tạo thư mục Docker và Database

```powershell
New-Item -ItemType Directory -Force -Path docker
New-Item -ItemType Directory -Force -Path database\migrations
New-Item -ItemType Directory -Force -Path database\seeds
New-Item -ItemType Directory -Force -Path docs\api
New-Item -ItemType Directory -Force -Path docs\architecture
New-Item -ItemType Directory -Force -Path docs\guides
New-Item -ItemType Directory -Force -Path scripts
```

## Khởi tạo các Project

### Backend (Golang)

```powershell
cd backend
go mod init github.com/yourusername/neo_learn_system/backend
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
go get -u github.com/golang-jwt/jwt/v5
go get -u github.com/joho/godotenv
```

### Frontend (Vue.js)

```powershell
cd frontend
npm create vue@latest .
# Chọn: TypeScript, Router, Pinia, ESLint, Prettier

npm install
npm install axios
npm install @vueuse/core
npm install element-plus  # hoặc UI framework khác
```

### Mobile (Flutter)

```powershell
cd mobile
flutter create .
flutter pub add http
flutter pub add provider  # hoặc riverpod/bloc
flutter pub add go_router
flutter pub add shared_preferences
flutter pub add camera
```

### Face Recognition Service (Python)

```powershell
cd face-recognition-service
python -m venv venv
.\venv\Scripts\Activate.ps1

pip install fastapi
pip install uvicorn[standard]
pip install python-multipart
pip install pillow
pip install numpy
pip install opencv-python
pip install torch torchvision
pip install onnxruntime
```

## Cấu trúc File Hoàn chỉnh

Sau khi chạy các lệnh trên, cấu trúc thư mục sẽ như sau:

```
neo_learn_system/
├── backend/                 (Golang)
├── frontend/                (Vue.js)
├── mobile/                  (Flutter)
├── face-recognition-service/ (Python FastAPI)
├── docker/
├── database/
├── docs/
├── scripts/
├── .gitignore
├── README.md
├── PROJECT_STRUCTURE.md
├── SETUP_GUIDE.md
└── LICENSE.md
```

## Next Steps

1. **Backend**: Tạo file `main.go`, cấu hình database connection
2. **Frontend**: Thiết lập routing, state management, API services
3. **Mobile**: Cấu hình camera permissions, API client
4. **Face Service**: Tạo FastAPI endpoints, migrate code hiện tại
5. **Docker**: Viết docker-compose.yml cho tất cả services
6. **Database**: Thiết kế schema, tạo migrations

## Lưu ý

- Đảm bảo cài đặt: Go 1.21+, Node.js 18+, Flutter 3.0+, Python 3.9+
- Cấu hình các biến môi trường (.env files)
- Thiết lập Git repository và .gitignore phù hợp
- Tạo CI/CD pipeline nếu cần
