# 🎓 Neo Learn System

Hệ thống học tập thông minh với công nghệ nhận diện khuôn mặt

## 🌟 Tính Năng

- ✅ **Quản lý học sinh**: CRUD operations đầy đủ
- ✅ **Điểm danh tự động**: Sử dụng nhận diện khuôn mặt
- ✅ **Dashboard thống kê**: Báo cáo real-time
- ✅ **Web & Mobile**: Hỗ trợ đa nền tảng
- ✅ **Face Recognition**: AI-powered với ArcFace, YOLOv5, ByteTrack

## 🏗️ Tech Stack

| Layer                | Technology                     |
| -------------------- | ------------------------------ |
| **Backend**          | Golang (Gin Framework)         |
| **Frontend**         | Vue.js 3 + Vite + Element Plus |
| **Mobile**           | Flutter (Coming soon)          |
| **Face Recognition** | Python FastAPI                 |
| **Database**         | PostgreSQL + Redis             |
| **AI/ML**            | PyTorch, ONNX Runtime          |

## 📋 Cấu Trúc Dự Án

```
neo_learn_system/
├── backend/                 # Golang REST API (Port 8080)
├── frontend/                # Vue.js Web App (Port 5173)
├── mobile/                  # Flutter Mobile App (Coming soon)
└── face-recognition-service/ # Python FastAPI (Port 8000)
```

## 🚀 Khởi Động Nhanh

### Yêu cầu:

- Go 1.21+
- Node.js 18+
- Python 3.9+

### Các bước:

**1. Backend (Terminal 1):**

```powershell
cd backend
go mod download
go run cmd/api/main.go
```

**2. Frontend (Terminal 2):**

```powershell
cd frontend
npm install
npm run dev
```

**3. Face Recognition Service (Terminal 3):**

```powershell
cd face-recognition-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app/main.py
```

**4. Truy cập:**

- Web App: http://localhost:5173
- Backend API: http://localhost:8080
- Face API: http://localhost:8000/docs

**5. Đăng nhập:**

- Email: `demo@example.com`
- Password: `password123`

## 📖 Documentation

- [Project Structure](PROJECT_STRUCTURE.md) - Chi tiết cấu trúc dự án
- [Setup Guide](SETUP_GUIDE.md) - Hướng dẫn cài đặt chi tiết
- [Quick Start](QUICK_START.md) - Hướng dẫn khởi động nhanh ⭐

## 🎯 API Endpoints

### Backend (Golang)

- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/students` - Danh sách học sinh
- `POST /api/v1/attendance/check-in` - Điểm danh
- `GET /api/v1/attendance/report` - Báo cáo thống kê

### Face Recognition (Python)

- `POST /api/v1/detect` - Phát hiện khuôn mặt
- `POST /api/v1/recognize` - Nhận diện khuôn mặt
- `POST /api/v1/enroll` - Đăng ký khuôn mặt mới
- `GET /api/v1/faces` - Danh sách khuôn mặt

## 🎨 Screenshots

### Dashboard

![Dashboard](assets/face-recognition.gif)

### Features

- 📊 Dashboard với thống kê real-time
- 👥 Quản lý học sinh
- 📸 Điểm danh bằng camera
- 📈 Báo cáo và phân tích
- 🔔 Thông báo real-time

## 🛠️ Development

### Thêm học sinh mới:

```powershell
cd face-recognition-service
python add_persons.py
```

### Test API:

```powershell
# Backend
Invoke-WebRequest -Uri http://localhost:8080/health

# Face Service
Invoke-WebRequest -Uri http://localhost:8000/health
```

## 📊 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Face Recognition│
│  (Vue.js)   │     │  (Golang)   │     │    (Python)      │
└─────────────┘     └─────────────┘     └──────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    │ (PostgreSQL)│
                    └─────────────┘
```

## 🔬 Face Recognition Technology

- **Detection**: RetinaFace, YOLOv5-Face, SCRFD
- **Recognition**: ArcFace (InsightFace)
- **Tracking**: ByteTrack
- **Alignment**: Face Alignment Network

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 📞 Contact

- GitHub: [@MinQ2503](https://github.com/MinQ2503)
- Repository: [neo_learn_system](https://github.com/MinQ2503/neo_learn_system)

## 🙏 Acknowledgments

- [ByteTrack](https://github.com/ifzhang/ByteTrack)
- [Yolov5-face](https://github.com/deepcam-cn/yolov5-face)
- [InsightFace - ArcFace](https://github.com/deepinsight/insightface)

---

**⭐ Nếu project hữu ích, hãy cho một star nhé! ⭐**
