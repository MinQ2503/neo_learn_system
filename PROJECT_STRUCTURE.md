# Neo Learn System - Project Structure

## Overview
Hệ thống học tập thông minh với nhận diện khuôn mặt

## Tech Stack
- **Backend API**: Golang (Gin Framework)
- **Frontend Web**: Vue.js 3 + Vite
- **Mobile App**: Flutter
- **Face Recognition Service**: Python FastAPI
- **Database**: PostgreSQL + Redis
- **Message Queue**: RabbitMQ/Kafka (optional)

## Project Structure

```
neo_learn_system/
│
├── backend/                          # Golang Backend Service
│   ├── cmd/
│   │   └── api/
│   │       └── main.go              # Entry point
│   ├── internal/
│   │   ├── config/                  # Configuration
│   │   ├── middleware/              # Middlewares (auth, cors, logging)
│   │   ├── models/                  # Database models
│   │   ├── handlers/                # HTTP handlers
│   │   ├── services/                # Business logic
│   │   ├── repository/              # Database operations
│   │   └── utils/                   # Utility functions
│   ├── pkg/                         # Shared packages
│   ├── migrations/                  # Database migrations
│   ├── docs/                        # API documentation
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
│
├── frontend/                         # Vue.js Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Images, styles
│   │   ├── components/              # Reusable components
│   │   ├── views/                   # Page components
│   │   ├── router/                  # Vue Router
│   │   ├── store/                   # Pinia/Vuex state management
│   │   ├── api/                     # API calls
│   │   ├── utils/                   # Utilities
│   │   ├── composables/             # Vue 3 composables
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── mobile/                           # Flutter Mobile App
│   ├── android/
│   ├── ios/
│   ├── lib/
│   │   ├── core/                    # Core utilities
│   │   ├── data/                    # Data layer
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   └── services/
│   │   ├── presentation/            # UI layer
│   │   │   ├── screens/
│   │   │   ├── widgets/
│   │   │   └── controllers/
│   │   ├── routes/                  # Navigation
│   │   └── main.dart
│   ├── pubspec.yaml
│   └── README.md
│
├── face-recognition-service/         # Python FastAPI Service
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/       # API endpoints
│   │   │   │   │   ├── face_detection.py
│   │   │   │   │   ├── face_recognition.py
│   │   │   │   │   └── face_tracking.py
│   │   │   │   └── api.py
│   │   │   └── deps.py              # Dependencies
│   │   ├── core/
│   │   │   ├── config.py            # Settings
│   │   │   └── security.py          # Security utilities
│   │   ├── models/
│   │   │   ├── request.py           # Request models
│   │   │   └── response.py          # Response models
│   │   ├── services/
│   │   │   ├── face_detection/
│   │   │   │   ├── retinaface/
│   │   │   │   ├── yolov5_face/
│   │   │   │   └── scrfd/
│   │   │   ├── face_recognition/
│   │   │   │   └── arcface/
│   │   │   ├── face_tracking/
│   │   │   │   └── bytetrack/
│   │   │   └── face_alignment/
│   │   ├── utils/
│   │   └── main.py                  # FastAPI app
│   ├── datasets/                     # Face datasets
│   │   ├── backup/
│   │   ├── data/
│   │   └── face_features/
│   ├── weights/                      # Model weights
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── database/                         # Database scripts
│   ├── migrations/
│   └── seeds/
│
├── docker/                           # Docker configurations
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── docker-compose.prod.yml
│
├── docs/                             # Documentation
│   ├── api/                         # API documentation
│   ├── architecture/                # System architecture
│   └── guides/                      # User guides
│
├── scripts/                          # Utility scripts
│   ├── setup.sh
│   ├── deploy.sh
│   └── backup.sh
│
├── .gitignore
├── README.md
└── LICENSE.md
```

## Detailed Module Description

### Backend (Golang)
- **RESTful API** cho quản lý học sinh, giáo viên, lớp học
- **WebSocket** cho real-time notifications
- **JWT Authentication** & Authorization
- **Integration** với Face Recognition Service

### Frontend (Vue.js)
- **Admin Dashboard** quản lý hệ thống
- **Student Portal** cho học sinh
- **Teacher Portal** cho giáo viên
- **Attendance System** với camera integration
- **Real-time updates** với WebSocket

### Mobile (Flutter)
- **Cross-platform** iOS & Android
- **Camera integration** cho điểm danh
- **Offline support** với local database
- **Push notifications**
- **Biometric authentication**

### Face Recognition Service (Python FastAPI)
- **Face Detection** với Retinaface, YOLOv5-Face, SCRFD
- **Face Recognition** với ArcFace
- **Face Tracking** với ByteTrack
- **Face Alignment** preprocessing
- **RESTful API** endpoints
- **Async processing** với background tasks

## Communication Flow

```
Mobile/Frontend → Backend API (Golang) → Face Recognition Service (Python FastAPI)
                      ↓
                  Database (PostgreSQL)
                      ↓
                  Cache (Redis)
```

## API Endpoints Structure

### Backend (Golang) - Port 8080
- `/api/v1/auth/*` - Authentication
- `/api/v1/users/*` - User management
- `/api/v1/students/*` - Student management
- `/api/v1/teachers/*` - Teacher management
- `/api/v1/classes/*` - Class management
- `/api/v1/attendance/*` - Attendance management
- `/api/v1/face/*` - Proxy to Face Recognition Service

### Face Recognition Service (Python) - Port 8000
- `/api/v1/detect` - Face detection
- `/api/v1/recognize` - Face recognition
- `/api/v1/track` - Face tracking
- `/api/v1/enroll` - Enroll new face
- `/api/v1/health` - Health check

## Environment Setup

### Development
```bash
# Backend
cd backend && go run cmd/api/main.go

# Frontend
cd frontend && npm run dev

# Mobile
cd mobile && flutter run

# Face Recognition Service
cd face-recognition-service && uvicorn app.main:app --reload
```

### Production
```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```
