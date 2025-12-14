# Neo Learn System - Hướng Dẫn Khởi Động

## 📋 Yêu Cầu Hệ Thống

### Phần mềm cần cài đặt:

- **Go**: 1.21 trở lên - [Download](https://go.dev/dl/)
- **Node.js**: 18.x trở lên - [Download](https://nodejs.org/)
- **Python**: 3.9 trở lên - [Download](https://www.python.org/downloads/)
- **Git**: [Download](https://git-scm.com/)

### Optional (cho production):

- **PostgreSQL**: 14+ - [Download](https://www.postgresql.org/download/)
- **Redis**: 7+ - [Download](https://redis.io/download/)
- **Docker**: [Download](https://www.docker.com/products/docker-desktop/)

---

## 🚀 Khởi Động Nhanh (Development Mode)

### 1️⃣ Backend (Golang) - Port 8080

```powershell
# Mở Terminal 1
cd g:\Datas\Projects\neo_learn_system\backend

# Cài đặt dependencies
go mod download
go mod tidy

# Chạy server
go run cmd/api/main.go
```

✅ Backend sẽ chạy tại: **http://localhost:8080**

---

### 2️⃣ Frontend (Vue.js) - Port 5173

```powershell
# Mở Terminal 2
cd g:\Datas\Projects\neo_learn_system\frontend

# Cài đặt dependencies (chỉ chạy lần đầu)
npm install

# Chạy development server
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:5173**

**Truy cập ứng dụng:**

- Mở trình duyệt: http://localhost:5173
- Đăng nhập với tài khoản demo:
  - Email: `demo@example.com`
  - Password: `password123`

---

### 3️⃣ Face Recognition Service (Python FastAPI) - Port 8000

```powershell
# Mở Terminal 3
cd g:\Datas\Projects\neo_learn_system\face-recognition-service

# Tạo virtual environment (chỉ lần đầu)
python -m venv venv

# Kích hoạt virtual environment
.\venv\Scripts\Activate.ps1

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy FastAPI server
python app/main.py
```

✅ Face Recognition API sẽ chạy tại: **http://localhost:8000**

**Xem API Documentation:**

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📁 Cấu Trúc Dự Án Hiện Tại

```
neo_learn_system/
├── backend/                    ✅ Golang REST API
│   ├── cmd/api/
│   │   └── main.go            # Entry point
│   ├── go.mod
│   └── .env.example           # Copy thành .env và cấu hình
│
├── frontend/                   ✅ Vue.js Web App
│   ├── src/
│   │   ├── views/             # Các trang
│   │   ├── components/        # Components
│   │   ├── api/               # API clients
│   │   └── router/            # Routing
│   ├── package.json
│   └── vite.config.js
│
└── face-recognition-service/   ✅ Python FastAPI
    ├── app/
    │   └── main.py            # FastAPI application
    ├── datasets/              # Dữ liệu khuôn mặt
    ├── face_detection/        # Module phát hiện
    ├── face_recognition/      # Module nhận diện
    └── requirements.txt
```

---

## 🎯 Các Tính Năng Đã Có

### Backend (Golang)

- ✅ RESTful API endpoints
- ✅ CORS configuration
- ✅ Health check
- ✅ Auth endpoints (login, register, logout)
- ✅ Student management (CRUD)
- ✅ Attendance management
- ✅ Face recognition proxy

### Frontend (Vue.js)

- ✅ Login page với UI đẹp
- ✅ Dashboard với thống kê
- ✅ Quản lý học sinh
- ✅ Điểm danh với camera
- ✅ Responsive design
- ✅ Element Plus UI components

### Face Recognition Service (Python)

- ✅ FastAPI server
- ✅ Face detection endpoint
- ✅ Face recognition endpoint
- ✅ Face enrollment endpoint
- ✅ Auto API documentation

---

## 🧪 Kiểm Tra API

### Test Backend API:

```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:8080/health

# Get students
Invoke-WebRequest -Uri http://localhost:8080/api/v1/students

# Login
$body = @{
    email = "demo@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8080/api/v1/auth/login -Method POST -Body $body -ContentType "application/json"
```

### Test Face Recognition API:

```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:8000/health

# Hoặc mở trình duyệt
# http://localhost:8000/docs
```

---

## 🔧 Cấu Hình Môi Trường

### Backend (.env)

```bash
cd backend
copy .env.example .env
# Chỉnh sửa file .env nếu cần
```

---

## 📝 Workflow Sử Dụng

1. **Khởi động cả 3 services** (Backend, Frontend, Face Service)
2. **Truy cập Frontend**: http://localhost:5173
3. **Đăng nhập** với tài khoản demo
4. **Dashboard**: Xem thống kê tổng quan
5. **Quản lý học sinh**: Thêm, sửa, xóa học sinh
6. **Điểm danh**:
   - Bật camera
   - Chụp ảnh
   - Hệ thống tự động nhận diện và điểm danh

---

## 🐛 Troubleshooting

### Backend không khởi động được:

```powershell
# Kiểm tra Go version
go version

# Clean và rebuild
go clean -modcache
go mod download
go mod tidy
```

### Frontend không khởi động được:

```powershell
# Xóa node_modules và reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### Python service lỗi:

```powershell
# Deactivate và activate lại venv
deactivate
.\venv\Scripts\Activate.ps1

# Reinstall packages
pip install --upgrade pip
pip install -r requirements.txt
```

### Port đã được sử dụng:

```powershell
# Kiểm tra port đang sử dụng
netstat -ano | findstr :8080
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# Kill process nếu cần
taskkill /PID <PID> /F
```

---

## 📚 API Endpoints

### Backend (http://localhost:8080)

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| GET    | `/health`                     | Health check       |
| POST   | `/api/v1/auth/login`          | Đăng nhập          |
| POST   | `/api/v1/auth/register`       | Đăng ký            |
| GET    | `/api/v1/students`            | Danh sách học sinh |
| POST   | `/api/v1/students`            | Thêm học sinh      |
| GET    | `/api/v1/attendance`          | Lịch sử điểm danh  |
| POST   | `/api/v1/attendance/check-in` | Điểm danh          |

### Face Recognition (http://localhost:8000)

| Method | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| GET    | `/health`           | Health check          |
| POST   | `/api/v1/detect`    | Phát hiện khuôn mặt   |
| POST   | `/api/v1/recognize` | Nhận diện khuôn mặt   |
| POST   | `/api/v1/enroll`    | Đăng ký khuôn mặt mới |
| GET    | `/api/v1/faces`     | Danh sách khuôn mặt   |

---

## 🎨 Giao Diện

### 1. Trang Đăng Nhập

- Gradient background đẹp mắt
- Form đăng nhập clean và hiện đại
- Responsive design

### 2. Dashboard

- 4 thẻ thống kê với gradient và icons
- Bảng điểm danh gần đây
- Timeline thông báo
- Real-time updates

### 3. Quản Lý Học Sinh

- Danh sách học sinh dạng bảng
- Chức năng thêm/sửa/xóa
- Dialog form đẹp mắt

### 4. Điểm Danh

- Camera preview real-time
- Nút chụp và nhận diện
- Hiển thị kết quả ngay lập tức
- Lịch sử điểm danh trong ngày

---

## 🚢 Next Steps

### Để phát triển thêm:

1. **Tích hợp Database**:

   - Setup PostgreSQL
   - Tạo models và migrations
   - Implement GORM trong backend

2. **Tích hợp Face Recognition thực tế**:

   - Kết nối code face detection hiện có
   - Implement ArcFace recognition
   - Sử dụng ByteTrack tracking

3. **Authentication**:

   - Implement JWT tokens
   - Middleware authentication
   - Role-based access control

4. **Mobile App**:

   - Tạo Flutter project
   - Implement UI tương tự web
   - Camera integration

5. **Docker**:
   - Viết Dockerfile cho từng service
   - Docker-compose cho full stack
   - Production deployment

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:

1. Tất cả services đang chạy
2. Ports không bị conflict
3. Dependencies đã được cài đặt đầy đủ
4. Check console logs để debug

---

## 🎉 Chúc Bạn Làm Việc Hiệu Quả!

**Tóm tắt lệnh chạy nhanh:**

```powershell
# Terminal 1 - Backend
cd backend ; go run cmd/api/main.go

# Terminal 2 - Frontend
cd frontend ; npm run dev

# Terminal 3 - Face Service
cd face-recognition-service ; .\venv\Scripts\Activate.ps1 ; python app/main.py
```

**Truy cập:** http://localhost:5173
