# Hệ thống thi trực tuyến với giám sát chống gian lận

## Tổng quan

Hệ thống cho phép sinh viên thi trực tuyến với tính năng:

- Kiểm tra ảnh profile trước khi vào thi
- Giám sát qua webcam mỗi 5 giây
- Phát hiện gian lận bằng AI
- Lưu ảnh vi phạm theo cấu trúc folder riêng

## Cấu trúc Database

### Bảng `quizzes`

```sql
- enable_face_recognition: Bật nhận diện khuôn mặt
- enable_anti_cheat: Bật chống gian lận
- max_violations: Số lần vi phạm tối đa
- allow_headphone: Cho phép tai nghe
```

### Bảng `user_quiz_attempts`

Lưu thông tin mỗi lần làm bài của sinh viên

### Bảng `quiz_attempt_violations`

Lưu các vi phạm được phát hiện trong quá trình làm bài

## API Endpoints

### 1. Kiểm tra ảnh profile

```
GET /api/v1/quiz/check-profile-image
Headers: Authorization: Bearer <token>

Response:
{
  "has_profile_image": true
}
```

### 2. Bắt đầu làm bài thi

```
POST /api/v1/quiz/attempts/start
Headers: Authorization: Bearer <token>
Body: {
  "quiz_id": 1
}

Response:
{
  "message": "Quiz attempt started successfully",
  "attempt": {
    "id": 1,
    "quiz_id": 1,
    "user_id": 3,
    "created_at": "2025-12-21T10:00:00Z"
  }
}
```

### 3. Gửi ảnh giám sát

```
POST /api/v1/quiz/attempts/submit-frame
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- attempt_id: 1
- frame: [file ảnh]

Response:
{
  "candidate_id": "3",
  "quiz_attempt_id": "1",
  "cheating_detected": false,
  "multiple_persons": false,
  "no_face_detected": false,
  "headphone_detected": false,
  "cellphone_detected": false,
  "is_looking_away": false,
  "total_violation_point": 0,
  "saved_image_path": "",
  "processing_time": 0.5
}
```

### 4. Lấy số lượng vi phạm

```
GET /api/v1/quiz/attempts/violations?attempt_id=1
Headers: Authorization: Bearer <token>

Response:
{
  "attempt_id": 1,
  "violation_count": 0
}
```

## Anti-Cheating Service

### Endpoint mới: `/detect_quiz_exam`

API này được gọi từ backend khi sinh viên làm bài:

```python
POST /detect_quiz_exam
Form Data:
- candidate_id: ID của sinh viên
- quiz_attempt_id: ID của lần thi
- file: Ảnh từ webcam
- cheat_weights_str: JSON config weights

Response:
{
  "candidate_id": "3",
  "quiz_attempt_id": "1",
  "cheating_detected": false,
  "multiple_persons": false,
  "no_face_detected": false,
  "not_matching_candidate": false,
  "headphone_detected": false,
  "cellphone_detected": false,
  "is_spoofing": false,
  "is_looking_away": false,
  "total_violation_point": 0,
  "saved_image_path": "/path/to/image.jpg",
  "saved_image_url": "/cheating_image_users/1/3/frame_123.jpg"
}
```

### Cấu trúc lưu ảnh gian lận

```
backend/cmd/uploads/cheating_image_users/
  ├── {quiz_attempt_id}/
  │   ├── {user_id}/
  │   │   ├── frame_20251221-100530.jpg
  │   │   ├── frame_20251221-100535.jpg
  │   │   └── ...
```

## Frontend Component

### QuizExam Component

Component React để làm bài thi với giám sát:

```tsx
import QuizExam from "./components/QuizExam";

function App() {
  return <QuizExam quizId={1} userId={3} authToken="your-jwt-token" />;
}
```

### Tính năng:

1. Kiểm tra ảnh profile trước khi vào thi
2. Bật webcam khi bắt đầu thi
3. Tự động chụp và gửi ảnh mỗi 5 giây
4. Hiển thị số lượng vi phạm real-time
5. Dừng giám sát khi kết thúc bài thi

## Quy trình làm bài

### 1. Trước khi thi

```
Student → Click "Bắt đầu làm bài"
       → System kiểm tra profile image
       → Nếu chưa có: "Bạn cần upload ảnh profile"
       → Nếu có: Tạo quiz attempt
```

### 2. Trong khi thi

```
System → Bật webcam
       → Mỗi 5 giây:
         * Capture ảnh từ webcam
         * Gửi lên backend
         * Backend gọi anti-cheating service
         * Nếu phát hiện gian lận:
           - Lưu ảnh vào folder
           - Tạo violation record
           - Cập nhật violation count
```

### 3. Kết thúc thi

```
Student → Click "Kết thúc bài thi"
       → Tắt webcam
       → Dừng giám sát
       → Submit bài thi
```

## Loại vi phạm được phát hiện

1. **MULTIPLE_PERSONS** (Level 3): Nhiều người trong khung hình
2. **NO_FACE_DETECTED** (Level 2): Không phát hiện khuôn mặt
3. **NOT_MATCHING_CANDIDATE** (Level 3): Khuôn mặt không khớp với hồ sơ
4. **HEADPHONE_DETECTED** (Level 2): Phát hiện tai nghe (nếu không được phép)
5. **CELLPHONE_DETECTED** (Level 3): Phát hiện điện thoại
6. **SPOOFING** (Level 3): Phát hiện giả mạo (dùng ảnh/video)
7. **LOOKING_AWAY** (Level 1): Nhìn ra ngoài màn hình

## Cấu hình

### Backend (Go)

```go
// configs/config.go
AntiCheating: struct {
    ServiceURL string
}{
    ServiceURL: "http://localhost:8000", // FastAPI URL
}
```

### Frontend (React)

```tsx
const API_BASE_URL = "http://localhost:8080/api/v1";
const CAPTURE_INTERVAL = 5000; // milliseconds
```

## Testing

### 1. Khởi động services

```bash
# Backend Go
cd backend/cmd
go run main.go

# Anti-cheating service
cd anti-cheating-service/face-recognition/api
uvicorn fastapi_cheat:app --reload --port 8000

# Frontend
cd frontend/react_ui_main
npm run dev
```

### 2. Test flow

```bash
# 1. Đăng ký/Đăng nhập để lấy token
POST /api/v1/auth/login

# 2. Upload ảnh profile
POST /api/v1/auth/update-avatar/:user_id

# 3. Kiểm tra ảnh đã upload
GET /api/v1/quiz/check-profile-image

# 4. Bắt đầu làm bài
POST /api/v1/quiz/attempts/start

# 5. System tự động gửi ảnh mỗi 5 giây
POST /api/v1/quiz/attempts/submit-frame
```

## Lưu ý

1. **Profile Image**: Sinh viên phải upload ảnh profile trước khi làm bài
2. **Webcam Permission**: Browser cần được cấp quyền truy cập camera
3. **Internet Connection**: Cần kết nối ổn định để gửi ảnh mỗi 5 giây
4. **Max Violations**: Nếu vượt quá số lần vi phạm, bài thi sẽ bị tự động dừng
5. **Storage**: Ảnh vi phạm được lưu tại `backend/cmd/uploads/cheating_image_users/`

## Troubleshooting

### Lỗi "user must upload profile image"

- Upload ảnh profile qua API `/api/v1/auth/update-avatar/:user_id`

### Lỗi "Không thể truy cập webcam"

- Kiểm tra quyền camera trong browser settings
- Đảm bảo không có app nào khác đang dùng camera

### Lỗi "Failed to detect cheating"

- Kiểm tra anti-cheating service đã chạy
- Xem log trong `anti-cheating-service/face-recognition/logs/`

## TODO

- [ ] Cấu hình thời gian capture ảnh (hiện tại hardcode 5s)
- [ ] Thêm preview ảnh đã chụp trong UI
- [ ] Tự động submit bài khi vượt max_violations
- [ ] Export report vi phạm theo quiz
- [ ] Thêm dashboard cho giáo viên xem vi phạm
