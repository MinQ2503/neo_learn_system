# 🎯 HƯỚNG DẪN KHỞI ĐỘNG - NEO LEARN SYSTEM

## ⚡ KHỞI ĐỘNG CỰC NHANH (2 Bước)

### Bước 1: Setup (chỉ chạy 1 lần đầu tiên)

```powershell
.\setup.ps1
```

Script này sẽ tự động:

- ✅ Cài đặt Go dependencies
- ✅ Cài đặt Node.js dependencies
- ✅ Tạo Python virtual environment
- ✅ Cài đặt Python packages

### Bước 2: Khởi động tất cả services

```powershell
.\start-all.ps1
```

Script này sẽ mở 3 cửa sổ terminal mới và tự động chạy:

- 🔧 Backend (Golang) - Port 8080
- 🌐 Frontend (Vue.js) - Port 5173
- 👤 Face Recognition Service (Python) - Port 8000

### Bước 3: Sử dụng

1. Mở trình duyệt: **http://localhost:5173**
2. Đăng nhập với:
   - **Email**: `demo@example.com`
   - **Password**: `password123`

---

## 📱 KHỞI ĐỘNG THỦ CÔNG (Nếu cần)

### Terminal 1 - Backend

```powershell
cd backend
go run cmd/api/main.go
```

### Terminal 2 - Frontend

```powershell
cd frontend
npm run dev
```

### Terminal 3 - Face Recognition Service

```powershell
cd face-recognition-service
.\venv\Scripts\Activate.ps1
python app/main.py
```

---

## 🧪 KIỂM TRA HỆ THỐNG

### Test API Endpoints

**Backend:**

```powershell
Invoke-WebRequest -Uri http://localhost:8080/health
```

**Face Recognition:**

```powershell
Invoke-WebRequest -Uri http://localhost:8000/health
```

---

## 📍 CÁC ĐƯỜNG DẪN QUAN TRỌNG

| Service            | URL                          | Mô tả                |
| ------------------ | ---------------------------- | -------------------- |
| **Frontend**       | http://localhost:5173        | Giao diện web chính  |
| **Backend**        | http://localhost:8080        | REST API             |
| **Backend Health** | http://localhost:8080/health | Kiểm tra backend     |
| **Face API Docs**  | http://localhost:8000/docs   | Swagger UI           |
| **Face API**       | http://localhost:8000        | Face Recognition API |

---

## 🎨 TÍNH NĂNG CÓ SẴN

### ✅ Dashboard

- Thống kê tổng quan
- Biểu đồ điểm danh
- Thông báo real-time

### ✅ Quản lý học sinh

- Xem danh sách học sinh
- Thêm học sinh mới
- Sửa thông tin
- Xóa học sinh

### ✅ Điểm danh

- Bật camera
- Chụp ảnh
- Nhận diện khuôn mặt tự động
- Lưu lịch sử điểm danh

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: "Port already in use"

```powershell
# Kiểm tra port đang sử dụng
netstat -ano | findstr :8080
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F
```

### ❌ Lỗi: "go: command not found"

- Cài đặt Go: https://go.dev/dl/
- Khởi động lại terminal

### ❌ Lỗi: "npm: command not found"

- Cài đặt Node.js: https://nodejs.org/
- Khởi động lại terminal

### ❌ Lỗi: "python: command not found"

- Cài đặt Python: https://www.python.org/downloads/
- Chọn "Add to PATH" khi cài đặt

### ❌ Lỗi Frontend không load được

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### ❌ Lỗi Backend không compile

```powershell
cd backend
go clean -modcache
go mod download
go mod tidy
```

### ❌ Lỗi Python import

```powershell
cd face-recognition-service
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📊 CẤU TRÚC DỰ ÁN

```
neo_learn_system/
│
├── 📄 QUICK_START.md          ← Bạn đang đọc file này!
├── 📄 README_NEW.md           ← README chính của dự án
├── 📄 PROJECT_STRUCTURE.md    ← Chi tiết cấu trúc
├── 📄 SETUP_GUIDE.md          ← Hướng dẫn setup chi tiết
│
├── 🔧 setup.ps1               ← Script setup tự động
├── 🚀 start-all.ps1           ← Script khởi động tất cả
│
├── 📁 backend/                ← Golang API
│   ├── cmd/api/main.go        (Entry point)
│   └── go.mod
│
├── 📁 frontend/               ← Vue.js Web
│   ├── src/
│   │   ├── views/            (Các trang)
│   │   ├── api/              (API calls)
│   │   └── router/           (Routes)
│   └── package.json
│
└── 📁 face-recognition-service/ ← Python FastAPI
    ├── app/main.py           (Entry point)
    ├── datasets/             (Face data)
    └── requirements.txt
```

---

## 🎓 WORKFLOW SỬ DỤNG

1. **Đăng nhập** vào hệ thống
2. **Dashboard**: Xem tổng quan thống kê
3. **Quản lý học sinh**:
   - Thêm học sinh mới
   - Cập nhật thông tin
4. **Điểm danh**:
   - Bật camera
   - Học sinh đứng trước camera
   - Hệ thống tự động nhận diện
   - Lưu vào database

---

## 📚 TÀI LIỆU THAM KHẢO

- **QUICK_START.md** (file này): Hướng dẫn khởi động
- **PROJECT_STRUCTURE.md**: Chi tiết cấu trúc dự án
- **SETUP_GUIDE.md**: Hướng dẫn setup từng bước
- **README_NEW.md**: Giới thiệu dự án

---

## 🎯 API ENDPOINTS

### Backend (http://localhost:8080/api/v1)

#### Authentication

- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/logout` - Đăng xuất

#### Students

- `GET /students` - Danh sách học sinh
- `GET /students/:id` - Chi tiết học sinh
- `POST /students` - Thêm học sinh
- `PUT /students/:id` - Cập nhật học sinh
- `DELETE /students/:id` - Xóa học sinh

#### Attendance

- `GET /attendance` - Lịch sử điểm danh
- `POST /attendance/check-in` - Điểm danh
- `GET /attendance/report` - Báo cáo thống kê

#### Face Recognition Proxy

- `POST /face/detect` - Phát hiện khuôn mặt
- `POST /face/recognize` - Nhận diện khuôn mặt
- `POST /face/enroll` - Đăng ký khuôn mặt mới

### Face Recognition API (http://localhost:8000/api/v1)

- `POST /detect` - Phát hiện khuôn mặt trong ảnh
- `POST /recognize` - Nhận diện khuôn mặt
- `POST /enroll` - Đăng ký khuôn mặt mới
- `POST /track` - Theo dõi khuôn mặt trong video
- `GET /faces` - Danh sách khuôn mặt đã đăng ký

---

## 💡 TIPS & TRICKS

### Debug Mode

```powershell
# Backend với debug logs
cd backend
go run cmd/api/main.go --debug

# Frontend với network logs
cd frontend
npm run dev -- --debug
```

### Clear Cache

```powershell
# Clear Go cache
go clean -cache -modcache

# Clear npm cache
npm cache clean --force

# Clear Python cache
Remove-Item -Recurse -Force __pycache__
```

---

## 🔐 BẢO MẬT

### Development (Mặc định)

- JWT Secret: `your_super_secret_key_change_this_in_production`
- CORS: Cho phép localhost

### Production

1. Đổi JWT_SECRET trong `.env`
2. Cấu hình CORS cho domain thật
3. Enable HTTPS
4. Sử dụng database thật

---

## 🚀 NEXT STEPS

### Để phát triển tiếp:

1. **Setup Database**

   - Cài PostgreSQL
   - Tạo database schema
   - Implement migrations

2. **Tích hợp Face Recognition thực**

   - Kết nối code detection hiện có
   - Train model mới nếu cần
   - Optimize performance

3. **Mobile App**

   - Setup Flutter project
   - Implement UI
   - Camera integration

4. **Deploy Production**
   - Docker containers
   - CI/CD pipeline
   - Cloud hosting

---

## 📞 HỖ TRỢ

### Nếu gặp vấn đề:

1. ✅ Kiểm tra tất cả services đang chạy
2. ✅ Kiểm tra ports không bị conflict
3. ✅ Xem logs trong terminal
4. ✅ Check console trong browser (F12)

### Các file log:

- Backend: Terminal output
- Frontend: Browser console (F12)
- Python: Terminal output

---

## ✨ SUMMARY

**Setup một lần:**

```powershell
.\setup.ps1
```

**Khởi động mọi lúc:**

```powershell
.\start-all.ps1
```

**Truy cập:**

```
http://localhost:5173
```

**Đăng nhập:**

```
Email: demo@example.com
Password: password123
```

**Thế là xong! Chúc bạn code vui vẻ! 🎉**

---

Made with ❤️ by MinQ2503
