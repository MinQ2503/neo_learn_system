# Tài liệu Kiến trúc Hệ thống - Neo Learn System

## 1. Tổng quan hệ thống

Neo Learn System là một hệ thống E-learning với tích hợp AI giám sát thi online, được xây dựng theo kiến trúc **Microservices**, bao gồm 3 service chính:

- **Frontend Service**: React + TypeScript + Vite
- **Backend Service**: Golang (Gin Framework)
- **AI Anti-Cheating Service**: Python (FastAPI)

---

## 2. Cấu trúc tổng quan

### 2.1 Kiến trúc 3-Tier Microservices

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Port 5173)                                 │ │
│  │  • Student Dashboard / Teacher Dashboard / Admin Dashboard  │ │
│  │  • Exam Room (Real-time AI Monitoring)                     │ │
│  │  • Course Management UI                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/HTTPS + WebSocket
                       │ REST API Calls
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Backend API Server (Golang - Port 8080)                │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  Services:                                       │    │   │
│  │  │  • Auth Service (JWT + RBAC)                    │    │   │
│  │  │  • User Service                                 │    │   │
│  │  │  • Quiz Service ←──────────────┐               │    │   │
│  │  │  • Question Bank Service        │               │    │   │
│  │  │  • Anti-Cheating Client        │               │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                │                         │
│                       │ MySQL          │ HTTP Client             │
│                       │                │                         │
│  ┌────────────────────┼────────────────┼─────────────────────┐  │
│  │                    │                ▼                      │  │
│  │                    │    ┌────────────────────────────┐    │  │
│  │                    │    │  AI Anti-Cheating Service  │    │  │
│  │                    │    │  (FastAPI - Port 8000)     │    │  │
│  │                    │    │  ┌──────────────────────┐  │    │  │
│  │                    │    │  │ • Face Recognition   │  │    │  │
│  │                    │    │  │ • Gaze Estimation    │  │    │  │
│  │                    │    │  │ • Head Pose          │  │    │  │
│  │                    │    │  │ • YOLO Object Detect │  │    │  │
│  │                    │    │  │ • Violation Logging  │  │    │  │
│  │                    │    │  └──────────────────────┘  │    │  │
│  │                    │    └────────────────────────────┘    │  │
│  │                    │                                       │  │
└──┼────────────────────┼───────────────────────────────────────┘  │
   │                    │                                           │
   ▼                    ▼                                           │
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  MySQL Database (neo_learn_system_db_main)                │  │
│  │  • users, roles, permissions (RBAC)                       │  │
│  │  • courses, lessons, assignments                          │  │
│  │  • quizzes, quiz_questions, quiz_question_answers        │  │
│  │  • user_quiz_attempts, user_quiz_attempt_details         │  │
│  │  • quiz_attempt_violations (AI logs)                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  File Storage                                              │  │
│  │  • Profile Images (/uploads/profile_image_users/)        │  │
│  │  • Cheating Evidence (/uploads/cheating_image_users/)    │  │
│  │  • Assignment Files                                       │  │
│  │  • Face Database (face_database.pkl)                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Chi tiết các thành phần

#### 2.2.1 Frontend Service (React + TypeScript)

**Tech Stack:**

- React 18 + TypeScript
- Vite (Build tool)
- React Router v6 (Routing)
- Axios (HTTP Client)

**Cấu trúc:**

```
frontend/react_ui_main/
├── pages/                    # Các trang chính
│   ├── Login.tsx            # Đăng nhập
│   ├── Register.tsx         # Đăng ký
│   ├── ExamRoom.tsx         # Phòng thi (có camera monitoring)
│   ├── StudentDashboard.tsx # Dashboard học sinh
│   ├── TeacherDashboard.tsx # Dashboard giảng viên
│   ├── AdminDashboard.tsx   # Dashboard admin
│   ├── admin/               # Admin management pages
│   ├── teacher/             # Teacher management pages
│   └── student/             # Student learning pages
├── components/              # Reusable components
│   ├── Layout.tsx          # Layout wrapper
│   ├── CameraCheck.tsx     # Camera permission check
│   └── ClayCard.tsx        # UI components
├── services/               # API services
│   └── api/
│       ├── base.ts         # Base API client
│       ├── examService.ts  # Quiz/Exam APIs
│       ├── userService.ts  # User APIs
│       └── ...
└── types.ts                # TypeScript types
```

**Vai trò:**

- Giao diện người dùng cho 3 role: Student, Teacher, Admin
- Xử lý authentication & authorization (JWT)
- Quản lý course, lesson, assignment, quiz
- **Phòng thi với camera monitoring real-time**
- Upload file (avatar, assignments)

---

#### 2.2.2 Backend Service (Golang + Gin)

**Tech Stack:**

- Go 1.21+
- Gin Web Framework
- MySQL Driver (go-sql-driver/mysql)
- JWT Authentication
- CORS Middleware

**Cấu trúc:**

```
backend/
├── cmd/
│   ├── main.go              # Entry point
│   └── api/
│       └── api.go           # Router setup
├── configs/
│   └── config.go            # Environment config
├── internal/
│   ├── database/
│   │   └── data_base.go     # MySQL connection
│   ├── models/
│   │   ├── user.go          # User models
│   │   └── question.go      # Quiz models
│   ├── services/
│   │   ├── auth/            # Authentication service
│   │   │   ├── auth_handler.go
│   │   │   ├── auth_service.go
│   │   │   ├── auth_repository.go
│   │   │   └── auth_middleware.go
│   │   ├── user/            # User management
│   │   ├── quiz/            # Quiz service
│   │   │   ├── handler.go   # HTTP handlers
│   │   │   ├── service.go   # Business logic
│   │   │   └── repository.go # Data access
│   │   ├── question_bank/   # Question management
│   │   └── anti_cheating/   # Anti-cheating client
│   │       ├── client.go    # HTTP client to AI service
│   │       └── interface.go
│   └── utils/
│       ├── jwt.go           # JWT utilities
│       ├── password.go      # Password hashing
│       └── validate.go      # Input validation
└── uploads/                 # File storage
    ├── profile_image_users/ # User avatars
    └── cheating_image_users/ # Cheating evidence
```

**Vai trò:**

- RESTful API Gateway
- Business logic layer
- Authentication & Authorization (JWT + RBAC)
- Database operations (MySQL)
- File upload management
- **HTTP Client to AI Anti-Cheating Service**

**API Endpoints:**

```
/api/v1/auth
  POST /register          # Đăng ký user
  POST /login            # Đăng nhập (trả về JWT)
  GET  /profile/:user_id # Lấy profile
  POST /change-password/:user_id
  POST /update-avatar/:user_id
  POST /logout

/api/v1/users
  [Protected - Auth Middleware]
  GET  /                 # List users
  POST /                 # Create user
  PUT  /:id             # Update user
  DELETE /:id           # Delete user

/api/v1/quiz
  [Protected]
  POST /start-attempt    # Bắt đầu làm quiz
  POST /submit-frame     # Submit frame để AI check
  POST /submit-answer    # Submit câu trả lời
  POST /end-attempt      # Kết thúc quiz
  GET  /violations/:attempt_id # Lấy danh sách vi phạm

/api/v1/question-bank
  [Protected]
  GET  /                 # List questions
  POST /                 # Create question
  PUT  /:id             # Update question
  DELETE /:id           # Delete question
```

---

#### 2.2.3 AI Anti-Cheating Service (FastAPI + Python)

**Tech Stack:**

- Python 3.9+
- FastAPI
- InsightFace (Face Recognition)
- L2CS-Net (Gaze Estimation)
- YOLO v11 (Object Detection)
- OpenCV
- NumPy, PyTorch

**Cấu trúc:**

```
anti-cheating-service/face-recognition/
├── api/
│   ├── fastapi_cheat.py        # Main FastAPI app
│   ├── insight_face.py         # Face recognition logic
│   ├── image_facecheat.py      # Cheating detection (CheatingDetector)
│   ├── gaze_estimator.py       # Gaze estimation
│   ├── head_pose.py            # Head pose estimation
│   ├── cheat_headphone_yolo.py # YOLO headphone detection
│   ├── cheat_items_yolo.py     # YOLO item detection
│   ├── database/train/         # Face database (embeddings)
│   ├── models/
│   │   ├── best.pt             # YOLO weights
│   │   ├── L2CSNet_gaze360.pkl # Gaze model
│   │   └── head_pose_model.pkl # Head pose model
│   ├── routes/
│   │   ├── cheating_detection.py
│   │   └── verification.py
│   ├── services/
│   │   ├── cheating_service.py
│   │   ├── face_service.py
│   │   └── verification_service.py
│   └── utils/
│       ├── head_pose_estimation.py
│       └── image_processing.py
└── logs/
    ├── cheat_csv/              # CSV logs
    ├── cheating_images/        # Violation images
    └── logs/                   # Text logs
```

**Vai trò:**

- **Face Recognition**: Xác minh đúng người thi
- **Gaze Estimation**: Phát hiện nhìn xa camera
- **Head Pose Estimation**: Phát hiện quay đầu
- **Object Detection (YOLO)**: Phát hiện tai nghe, điện thoại, vật dụng gian lận
- **Violation Logging**: Lưu ảnh bằng chứng + CSV logs

**API Endpoints:**

```
POST /check-gian-lan          # Check toàn bộ (face + gaze + head pose + objects)
POST /add-person              # Thêm người vào face database
POST /xoa-person              # Xóa người khỏi database
POST /training                # Train face recognition model
POST /nhan-dien               # Nhận diện khuôn mặt
POST /gaze-estimation         # Kiểm tra ánh mắt
POST /head-pose-estimation    # Kiểm tra tư thế đầu
POST /headphone-detection     # Kiểm tra tai nghe
POST /cheat-items-detection   # Kiểm tra vật dụng gian lận
GET  /download-csv/{date}     # Download violation logs
```

---

## 3. Luồng xử lý chính

### 3.1 Luồng Authentication & Authorization

**Các bước thực hiện:**

1. **Client gửi thông tin đăng nhập**

   - User nhập email và password vào form
   - Frontend gửi POST request đến `/api/v1/auth/login`

2. **Backend xác thực thông tin**

   - Query database tìm user theo email
   - Sử dụng bcrypt để compare password hash

3. **Load roles & permissions**

   - Query bảng `user_roles` để lấy danh sách roles
   - Query bảng `role_permissions` để lấy quyền hạn

4. **Generate JWT token**

   - Tạo JWT token chứa user_id, roles, permissions
   - Token có thời gian sống 24 giờ
   - Mã hóa bằng secret key

5. **Trả về kết quả**

   - Response 200 OK với token, user info, roles
   - Client lưu token vào localStorage

6. **Xác thực các request tiếp theo**
   - Client gửi token trong header: `Authorization: Bearer <token>`
   - AuthMiddleware verify token và inject userID vào context
   - Handler functions sử dụng userID từ context

**Sequence Diagram:**

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │ Backend │                  │ Database│
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ POST /api/v1/auth/login    │                            │
     │ {email, password}          │                            │
     ├───────────────────────────>│                            │
     │                            │ SELECT * FROM users        │
     │                            │ WHERE email = ?            │
     │                            ├───────────────────────────>│
     │                            │                            │
     │                            │ <user_data>                │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ bcrypt.Compare(password)   │
     │                            │                            │
     │                            │ SELECT roles, permissions  │
     │                            │ FROM user_roles            │
     │                            ├───────────────────────────>│
     │                            │                            │
     │                            │ <roles_data>               │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ GenerateJWT(user, roles)   │
     │                            │                            │
     │ 200 OK                     │                            │
     │ {token, user, roles}       │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Store JWT in localStorage  │                            │
     │                            │                            │
     │ Subsequent requests:       │                            │
     │ Authorization: Bearer <JWT>│                            │
     ├───────────────────────────>│                            │
     │                            │ AuthMiddleware.Verify(JWT) │
     │                            │                            │
     │                            │ Extract userID, roles      │
     │                            │ Store in context           │
     │                            │                            │
```

**Chi tiết:**

1. User nhập email + password
2. Backend verify password (bcrypt)
3. Load roles & permissions từ DB
4. Generate JWT token (exp: 24h)
5. Client lưu JWT trong localStorage
6. Mọi request sau đều gửi kèm JWT trong header
7. AuthMiddleware verify JWT và inject userID vào context

**Script giải thích:**

> "Luồng Authentication bắt đầu khi người dùng truy cập trang đăng nhập và nhập thông tin email cùng mật khẩu. Thông tin này được gửi đến Backend API thông qua endpoint POST /api/v1/auth/login.
>
> Backend nhận được request, đầu tiên sẽ truy vấn database để tìm user có email tương ứng. Nếu tìm thấy, hệ thống sử dụng thư viện bcrypt để so sánh mật khẩu đã hash trong database với mật khẩu người dùng nhập vào. Đây là phương pháp bảo mật chuẩn, đảm bảo mật khẩu không bao giờ được lưu dưới dạng plain text.
>
> Sau khi xác thực thành công, Backend tiếp tục truy vấn bảng user_roles và role_permissions để load toàn bộ vai trò và quyền hạn của user. Đây là phần quan trọng của hệ thống RBAC (Role-Based Access Control), giúp xác định user có quyền thực hiện những hành động gì trong hệ thống.
>
> Tiếp theo, Backend generate một JWT token có thời gian sống 24 giờ, chứa các thông tin như user ID, roles, và permissions. Token này được mã hóa bằng secret key và được trả về cho Client cùng với thông tin user.
>
> Client nhận được token và lưu vào localStorage của trình duyệt. Từ thời điểm này, mọi request API tiếp theo đều phải kèm theo token này trong header Authorization với format 'Bearer <token>'.
>
> Khi Backend nhận được các request có kèm token, AuthMiddleware sẽ tự động verify token, extract thông tin user ID và roles, sau đó inject vào context của request. Điều này cho phép các handler function tiếp theo có thể dễ dàng biết được user đang thực hiện request là ai và có quyền gì."

---

### 3.2 Luồng Đăng ký User mới

**Các bước thực hiện:**

1. **Client submit form đăng ký**

   - User điền thông tin: name, email, password, bio, phone, birthDay
   - Frontend gửi POST request đến `/api/v1/auth/register`

2. **Backend validation**

   - Kiểm tra email chưa tồn tại trong hệ thống
   - Validate format email hợp lệ
   - Kiểm tra password đủ mạnh (min 8 ký tự)
   - Hash password bằng bcrypt (cost factor 10)

3. **Bắt đầu Database Transaction**

   - Execute `BEGIN TRANSACTION`
   - Đảm bảo tính ACID cho 3 operations sau

4. **Tạo user record**

   - `INSERT INTO users` với email, password_hash, name
   - Database trả về `user_id` (auto-increment)

5. **Tạo profile record**

   - `INSERT INTO profiles` với user_id, bio, phone, birthDay
   - Quan hệ One-to-One với bảng users

6. **Gán role mặc định**

   - `INSERT INTO user_roles` với user_id và role_id = 3 (student)
   - Mọi user mới đều là student, admin có thể thay đổi sau

7. **Commit Transaction**

   - Nếu tất cả thành công: `COMMIT`
   - Nếu có lỗi: `ROLLBACK` (đảm bảo không có data rác)

8. **Trả về kết quả**
   - Response 201 Created với user info
   - Client có thể redirect sang trang login

**Sequence Diagram:**

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │ Backend │                  │ Database│
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ POST /api/v1/auth/register │                            │
     │ {name, email, password,    │                            │
     │  bio, phone, birthDay}     │                            │
     ├───────────────────────────>│                            │
     │                            │ Validate input             │
     │                            │ Hash password (bcrypt)     │
     │                            │                            │
     │                            │ BEGIN TRANSACTION          │
     │                            ├───────────────────────────>│
     │                            │                            │
     │                            │ INSERT INTO users          │
     │                            ├───────────────────────────>│
     │                            │ <user_id>                  │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ INSERT INTO profiles       │
     │                            │ (user_id, bio, phone, ...) │
     │                            ├───────────────────────────>│
     │                            │ <profile_id>               │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ INSERT INTO user_roles     │
     │                            │ (user_id, role_id=3)       │
     │                            │ -- Default: student role   │
     │                            ├───────────────────────────>│
     │                            │ OK                         │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ COMMIT                     │
     │                            ├───────────────────────────>│
     │                            │ OK                         │
     │                            │<───────────────────────────┤
     │                            │                            │
     │ 201 Created                │                            │
     │ {message, user}            │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
```

**Script giải thích:**

> "Luồng đăng ký user mới được thiết kế với tính toàn vẹn dữ liệu cao thông qua cơ chế Transaction. Khi người dùng điền form đăng ký với các thông tin như tên, email, password, bio, số điện thoại và ngày sinh, toàn bộ dữ liệu này được gửi đến endpoint POST /api/v1/auth/register.
>
> Backend nhận được request, đầu tiên thực hiện validation để đảm bảo email chưa tồn tại trong hệ thống, format email hợp lệ, password đủ mạnh. Sau đó, password được hash bằng bcrypt với cost factor 10 trước khi lưu vào database.
>
> Điểm quan trọng là hệ thống sử dụng Database Transaction để đảm bảo tính ACID. Transaction bắt đầu với lệnh BEGIN, sau đó thực hiện 3 bước tuần tự:
>
> Bước 1: INSERT vào bảng users với thông tin email, password đã hash, và tên người dùng. Database trả về user_id vừa được tạo.
>
> Bước 2: Sử dụng user_id vừa nhận được để INSERT vào bảng profiles, lưu các thông tin mở rộng như bio, phone, avatar, birthDay. Đây là quan hệ One-to-One với bảng users.
>
> Bước 3: INSERT vào bảng user_roles để gán role mặc định cho user mới. Theo thiết kế, role_id = 3 là 'student', nghĩa là mọi user đăng ký mới mặc định là học sinh. Admin có thể thay đổi role sau này.
>
> Nếu cả 3 bước đều thành công, Transaction được COMMIT và thay đổi được lưu vĩnh viễn vào database. Backend trả về status 201 Created cùng thông tin user.
>
> Trong trường hợp bất kỳ bước nào bị lỗi (ví dụ: email đã tồn tại, constraint violation), toàn bộ Transaction được ROLLBACK, đảm bảo database không bị rơi vào trạng thái inconsistent. Điều này rất quan trọng để tránh trường hợp có user nhưng không có profile, hoặc có profile nhưng không có role."

---

### 3.3 Luồng Làm Quiz với AI Monitoring (Luồng phức tạp nhất)

**Các bước thực hiện:**

**PHASE 1: PRE-CHECK**

1. **Lấy thông tin quiz**

   - Client gửi GET `/api/v1/quiz/:id`
   - Backend check quyền truy cập và trả về thông tin quiz
   - Thông tin bao gồm: enable_face_recognition, enable_anti_cheat, max_violations

2. **Kiểm tra profile image**

   - Nếu `enable_face_recognition = 1`
   - Client gửi POST `/check-user-has-image`
   - Backend check file tồn tại tại `/uploads/profile_image_users/{user_id}/`

3. **Upload avatar nếu chưa có** (Optional)
   - Hiển thị UI yêu cầu upload
   - User chọn ảnh và gửi POST `/update-avatar`
   - Backend lưu file và gọi AI Service `/add-person`
   - AI detect face, extract embedding, lưu vào face_database.pkl

**PHASE 2: START ATTEMPT**

4. **Bắt đầu làm bài**

   - Client gửi POST `/quiz/start-attempt` với quiz_id
   - Backend validation:
     - Thời gian: `start_time < now < end_time`
     - Số lần làm: `count_attempts < max_attempts`
     - User đã enroll khóa học

5. **Tạo attempt record**

   - `BEGIN TRANSACTION`
   - `INSERT INTO user_quiz_attempts` với score = 0
   - Database trả về `attempt_id`
   - `COMMIT TRANSACTION`

6. **Trả về câu hỏi**
   - Backend query danh sách câu hỏi từ quiz
   - Shuffle questions nếu `shuffle_questions = 1`
   - Response 201 với attempt_id và questions array

**PHASE 3: REAL-TIME MONITORING**

7. **Khởi động camera monitoring**

   - Frontend request camera permission
   - Thiết lập `setInterval` 5 giây
   - Mỗi 5s capture một frame từ webcam

8. **Gửi frame để AI phân tích**

   - Client gửi POST `/quiz/submit-frame` với FormData:
     - attempt_id
     - frame (image/jpeg)
   - Backend verify attempt thuộc về user

9. **Backend forward đến AI Service**

   - POST `/check-gian-lan` với:
     - file: frame image
     - user_id
     - quiz_attempt_id

10. **AI Service xử lý frame**

    - **Face Recognition**: So sánh embedding với database
    - **Gaze Estimation**: L2CS-Net model ước tính hướng nhìn (threshold 30°)
    - **Head Pose**: Phát hiện góc quay đầu (threshold 45°)
    - **YOLO Detection**: Detect tai nghe, điện thoại, sách vở

11. **Lưu violations nếu phát hiện**

    - AI lưu evidence image: `/cheating_image_users/{attempt_id}/{user_id}/`
    - Ghi log CSV: `/logs/cheat_csv/cheat_{date}.csv`
    - Trả về JSON với violations array (type, level, confidence)

12. **Backend lưu violations vào DB**

    - Loop qua violations array
    - `INSERT INTO quiz_attempt_violations` với:
      - user_quiz_attempt_id
      - type, level, detected_at, evidence_url

13. **Client hiển thị cảnh báo**
    - Response 200 OK với violations và total_count
    - Show warning: "Cảnh báo: Phát hiện tai nghe! (Vi phạm: 1/3)"
    - Nếu `total_violations >= max_violations`: Force end quiz

**PHASE 4: SUBMIT ANSWERS**

14. **User chọn đáp án**

    - Mỗi lần click answer, gửi POST `/quiz/submit-answer`:
      - attempt_id
      - question_id
      - selected_option_id

15. **Backend tính điểm câu**
    - Query `quiz_question_answers` để lấy point của đáp án
    - `INSERT INTO user_quiz_attempt_details` với score
    - Response 200 OK

**PHASE 5: END ATTEMPT**

16. **Kết thúc làm bài**

    - Khi hết giờ hoặc click "Nộp bài"
    - Client gửi POST `/quiz/end-attempt` với attempt_id

17. **Backend tính tổng điểm**

    - `BEGIN TRANSACTION`
    - `UPDATE user_quiz_attempts SET score = (SELECT SUM(score) FROM user_quiz_attempt_details WHERE user_quiz_attempt_id = ?)`

18. **Lấy danh sách violations**

    - Query `quiz_attempt_violations` cho attempt này
    - Tổng hợp statistics

19. **Commit và trả về kết quả**

    - `COMMIT TRANSACTION`
    - Response 200 OK với:
      - score: tổng điểm
      - total_violations: số vi phạm
      - violation_details: chi tiết từng vi phạm
      - allow_review: có cho xem đáp án không

20. **Client hiển thị kết quả**
    - Navigate to result page
    - Show score, violations, evidence images
    - Show correct answers nếu allow_review = true

**Sequence Diagram:**

```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌─────────┐
│ Client  │  │ Backend │  │ Database│  │ AI Service   │  │ Storage │
└────┬────┘  └────┬────┘  └────┬────┘  └──────┬───────┘  └────┬────┘
     │            │            │                │               │
     │─────────────────── PHASE 1: PRE-CHECK ──────────────────│
     │            │            │                │               │
     │ GET /api/v1/quiz/:id   │                │               │
     ├───────────>│            │                │               │
     │            │ Check quiz │                │               │
     │            │ permissions│                │               │
     │            ├───────────>│                │               │
     │            │<quiz_data> │                │               │
     │            │<───────────┤                │               │
     │<quiz_info> │            │                │               │
     │<───────────┤            │                │               │
     │            │            │                │               │
     │ Check if enable_face_recognition = 1    │               │
     │            │            │                │               │
     │ POST /check-user-has-image              │               │
     ├───────────>│            │                │               │
     │            │ Check exists:               │               │
     │            │ /uploads/profile_image_users/{user_id}/    │
     │            │            │                │           ┌───┤
     │            │            │                │           │   │
     │<has_image> │            │                │           └──>│
     │<───────────┤            │                │               │
     │            │            │                │               │
     │ If !has_image:         │                │               │
     │   → Show upload avatar UI               │               │
     │   → POST /update-avatar │                │               │
     │            │ Save to /uploads/          │           ┌───┤
     │            │            │                │           │   │
     │            │            │                │           └──>│
     │            │ Add to AI face database:    │               │
     │            │ POST {ai_service}/add-person│               │
     │            ├────────────────────────────>│               │
     │            │            │  Train face    │               │
     │            │            │  embeddings    │               │
     │            │<OK         │                │               │
     │<OK         │<───────────────────────────┤               │
     │<───────────┤            │                │               │
     │            │            │                │               │
     │─────────────────── PHASE 2: START ATTEMPT ──────────────│
     │            │            │                │               │
     │ POST /quiz/start-attempt                │               │
     │ {quiz_id}  │            │                │               │
     ├───────────>│            │                │               │
     │            │ Check:     │                │               │
     │            │ • Quiz time (start < now < end)             │
     │            │ • Max attempts                              │
     │            │ • User enrolled                             │
     │            ├───────────>│                │               │
     │            │            │                │               │
     │            │ BEGIN TRANSACTION           │               │
     │            ├───────────>│                │               │
     │            │ INSERT INTO user_quiz_attempts              │
     │            │ (quiz_id, user_id, score=0) │               │
     │            ├───────────>│                │               │
     │            │<attempt_id>│                │               │
     │            │<───────────┤                │               │
     │            │ COMMIT     │                │               │
     │            ├───────────>│                │               │
     │            │            │                │               │
     │ 201 Created            │                │               │
     │ {attempt_id, questions}│                │               │
     │<───────────┤            │                │               │
     │            │            │                │               │
     │─────────────────── PHASE 3: REAL-TIME MONITORING ────────│
     │            │            │                │               │
     │ Start Camera           │                │               │
     │ setInterval(5s):       │                │               │
     │   Capture frame        │                │               │
     │            │            │                │               │
     │ POST /quiz/submit-frame│                │               │
     │ FormData:              │                │               │
     │   attempt_id           │                │               │
     │   frame (image/jpeg)   │                │               │
     ├───────────>│            │                │               │
     │            │ Verify attempt belongs to user              │
     │            ├───────────>│                │               │
     │            │<OK         │                │               │
     │            │<───────────┤                │               │
     │            │            │                │               │
     │            │ Forward to AI Service:      │               │
     │            │ POST /check-gian-lan        │               │
     │            │ FormData:                   │               │
     │            │   file (frame)              │               │
     │            │   user_id                   │               │
     │            │   quiz_attempt_id           │               │
     │            ├────────────────────────────>│               │
     │            │            │                │               │
     │            │            │     ┌─────── AI Processing ───┐
     │            │            │     │ 1. Face Recognition     │
     │            │            │     │    → Verify correct user│
     │            │            │     │ 2. Gaze Estimation      │
     │            │            │     │    → Check looking away│
     │            │            │     │ 3. Head Pose           │
     │            │            │     │    → Check head turn   │
     │            │            │     │ 4. YOLO Detection      │
     │            │            │     │    → Headphone, phone  │
     │            │            │     └────────────────────────┘
     │            │            │                │               │
     │            │            │   If violation detected:       │
     │            │            │   Save evidence:           ┌───┤
     │            │            │   /cheating_image_users/   │   │
     │            │            │   /{attempt_id}/{user_id}/ │   │
     │            │            │                │           └──>│
     │            │            │   Log to CSV:              ┌───┤
     │            │            │   /logs/cheat_csv/         │   │
     │            │            │   cheat_{date}.csv         └──>│
     │            │            │                │               │
     │            │<───────────────────────────┤               │
     │            │ {                          │               │
     │            │   "is_cheating": true,     │               │
     │            │   "violations": [          │               │
     │            │     {                      │               │
     │            │       "type": "LOOK_AWAY", │               │
     │            │       "level": 2,          │               │
     │            │       "confidence": 0.87   │               │
     │            │     },                     │               │
     │            │     {                      │               │
     │            │       "type": "HEADPHONE", │               │
     │            │       "level": 3,          │               │
     │            │       "confidence": 0.95   │               │
     │            │     }                      │               │
     │            │   ],                       │               │
     │            │   "evidence_url": "/uploads/...jpg"        │
     │            │ }                          │               │
     │            │                            │               │
     │            │ Save violations to DB:     │               │
     │            │ INSERT INTO quiz_attempt_violations         │
     │            │ (user_quiz_attempt_id, type, level,         │
     │            │  detected_at, evidence_url)                 │
     │            ├───────────>│                │               │
     │            │<OK         │                │               │
     │            │<───────────┤                │               │
     │            │                            │               │
     │ 200 OK     │                            │               │
     │ {violations, total_count}               │               │
     │<───────────┤                            │               │
     │            │                            │               │
     │ Display warning UI:                     │               │
     │ "Cảnh báo: Phát hiện tai nghe!"         │               │
     │            │                            │               │
     │ If total_violations >= max_violations:  │               │
     │   → Force end quiz                      │               │
     │   → Show "Bài thi bị hủy do vi phạm"    │               │
     │            │                            │               │
     │─────────────────── PHASE 4: SUBMIT ANSWERS ─────────────│
     │            │                            │               │
     │ User clicks answer                      │               │
     │ POST /quiz/submit-answer                │               │
     │ {                                       │               │
     │   attempt_id,                           │               │
     │   question_id,                          │               │
     │   selected_option_id                    │               │
     │ }          │                            │               │
     ├───────────>│                            │               │
     │            │ Calculate score:            │               │
     │            │ SELECT point FROM quiz_question_answers     │
     │            │ WHERE id = ? AND is_correct = 1             │
     │            ├───────────>│                │               │
     │            │<point>     │                │               │
     │            │<───────────┤                │               │
     │            │                            │               │
     │            │ INSERT INTO user_quiz_attempt_details       │
     │            │ (user_quiz_attempt_id, quiz_question_id,    │
     │            │  selected_option_id, score)                 │
     │            ├───────────>│                │               │
     │            │<OK         │                │               │
     │            │<───────────┤                │               │
     │            │                            │               │
     │<OK         │                            │               │
     │<───────────┤                            │               │
     │            │                            │               │
     │─────────────────── PHASE 5: END ATTEMPT ─────────────────│
     │            │                            │               │
     │ Time's up OR Click "Nộp bài"            │               │
     │ POST /quiz/end-attempt                  │               │
     │ {attempt_id}                            │               │
     ├───────────>│                            │               │
     │            │ BEGIN TRANSACTION           │               │
     │            ├───────────>│                │               │
     │            │                            │               │
     │            │ Calculate total score:      │               │
     │            │ UPDATE user_quiz_attempts   │               │
     │            │ SET score = (                               │
     │            │   SELECT SUM(score)         │               │
     │            │   FROM user_quiz_attempt_details            │
     │            │   WHERE user_quiz_attempt_id = ?            │
     │            │ )                           │               │
     │            │ WHERE id = ?                │               │
     │            ├───────────>│                │               │
     │            │<OK         │                │               │
     │            │<───────────┤                │               │
     │            │                            │               │
     │            │ Get violations:             │               │
     │            │ SELECT * FROM quiz_attempt_violations       │
     │            │ WHERE user_quiz_attempt_id = ?              │
     │            ├───────────>│                │               │
     │            │<violations>│                │               │
     │            │<───────────┤                │               │
     │            │                            │               │
     │            │ COMMIT                      │               │
     │            ├───────────>│                │               │
     │            │                            │               │
     │ 200 OK                                  │               │
     │ {                                       │               │
     │   score,                                │               │
     │   total_violations,                     │               │
     │   violation_details,                    │               │
     │   allow_review                          │               │
     │ }                                       │               │
     │<───────────┤                            │               │
     │            │                            │               │
     │ Navigate to result page                 │               │
     │            │                            │               │
```

**Các điểm quan trọng:**

1. **Pre-check**: Đảm bảo user có ảnh profile để AI nhận diện
2. **Transaction safety**: Dùng ACID để đảm bảo tính toàn vẹn dữ liệu
3. **Real-time monitoring**: Gửi frame mỗi 5 giây để AI phân tích
4. **Violation handling**: Lưu evidence + log + cảnh báo user
5. **Auto-terminate**: Tự động kết thúc nếu vượt quá `max_violations`
6. **Score calculation**: Tự động tính điểm khi kết thúc

**Script giải thích:**

> "Đây là luồng phức tạp và quan trọng nhất của hệ thống - luồng làm bài thi với giám sát AI real-time. Toàn bộ luồng được chia thành 5 phase rõ ràng.
>
> **PHASE 1: PRE-CHECK** - Giai đoạn chuẩn bị trước khi thi.
>
> Học sinh truy cập vào bài quiz, Frontend gửi request GET để lấy thông tin quiz từ Backend. Backend check quyền truy cập và trả về thông tin quiz, bao gồm cấu hình như enable_face_recognition, enable_anti_cheat, max_violations.
>
> Nếu quiz có bật nhận diện khuôn mặt, Frontend gọi API check-user-has-image để kiểm tra xem user đã upload ảnh profile chưa. Backend check thư mục /uploads/profile_image_users/{user_id}/ xem có file ảnh không.
>
> Nếu chưa có ảnh, hệ thống hiển thị UI yêu cầu user upload avatar. Khi user upload, ảnh được lưu vào backend storage và đồng thời gọi API của AI Service endpoint /add-person để thêm khuôn mặt vào face database. AI Service sẽ detect face, extract embeddings và cập nhật file face_database.pkl. Đây là bước quan trọng để AI có thể nhận diện đúng người thi sau này.
>
> **PHASE 2: START ATTEMPT** - Bắt đầu lần làm bài.
>
> Khi user click 'Bắt đầu làm bài', Frontend gửi request POST /quiz/start-attempt với quiz_id. Backend thực hiện validation nghiêm ngặt: kiểm tra thời gian quiz (start_time < now < end_time), số lần làm bài còn lại (so với max_attempts), user có được ghi danh vào khóa học không.
>
> Nếu pass validation, Backend bắt đầu Transaction và INSERT một record mới vào bảng user_quiz_attempts với score khởi tạo = 0. Database trả về attempt_id - đây là ID quan trọng sẽ được sử dụng xuyên suốt quá trình làm bài. Backend trả về attempt_id cùng danh sách câu hỏi (có thể shuffle nếu quiz config shuffle_questions = 1).
>
> **PHASE 3: REAL-TIME MONITORING** - Giám sát liên tục trong suốt quá trình thi.
>
> Đây là phase đặc biệt và là trái tim của hệ thống chống gian lận. Ngay khi user bắt đầu làm bài, Frontend khởi động camera và thiết lập một interval timer 5 giây. Cứ mỗi 5 giây, hệ thống tự động capture một frame từ webcam.
>
> Frame được đóng gói thành FormData cùng với attempt_id và gửi đến Backend qua endpoint POST /quiz/submit-frame. Backend verify attempt thuộc về user đang làm bài, sau đó forward frame đến AI Service qua endpoint /check-gian-lan.
>
> AI Service thực hiện 4 phân tích đồng thời:
>
> 1. Face Recognition: Verify có đúng người đã đăng ký không bằng cách so sánh face embedding với database. Nếu không nhận diện được hoặc nhận diện là người khác, đây là vi phạm nghiêm trọng.
> 2. Gaze Estimation: Sử dụng model L2CS-Net để ước tính hướng nhìn. Nếu mắt nhìn xa khỏi màn hình quá 30 độ, cảnh báo 'LOOK_AWAY'.
> 3. Head Pose Estimation: Phát hiện góc quay đầu. Nếu quay đầu sang trái/phải quá 45 độ, cảnh báo 'HEAD_TURN'.
> 4. YOLO Object Detection: Detect các vật dụng gian lận như tai nghe, điện thoại, sách vở trong frame. Model YOLO v11 được train để nhận diện các object này với độ chính xác cao.
>
> Khi phát hiện vi phạm, AI Service tự động lưu frame làm bằng chứng vào thư mục /cheating*image_users/{attempt_id}/{user_id}/ và ghi log vào file CSV /logs/cheat_csv/cheat*{date}.csv với timestamp chính xác.
>
> AI Service trả về JSON chứa danh sách violations với type, level (mức độ nghiêm trọng 1-3), và confidence score. Backend nhận được response, lưu từng violation vào bảng quiz_attempt_violations với thông tin chi tiết và đường dẫn evidence_url.
>
> Frontend nhận response và hiển thị cảnh báo realtime cho user. Ví dụ: 'Cảnh báo: Phát hiện tai nghe! (Vi phạm: 1/3)'. Nếu total_violations >= max_violations, hệ thống tự động force end quiz và hiển thị message 'Bài thi bị hủy do vi phạm quá nhiều lần'.
>
> **PHASE 4: SUBMIT ANSWERS** - User trả lời câu hỏi.
>
> Trong khi camera monitoring chạy background, user có thể click chọn đáp án cho từng câu hỏi. Mỗi lần click, Frontend gửi POST /quiz/submit-answer với attempt_id, question_id, và selected_option_id.
>
> Backend query bảng quiz_question_answers để lấy thông tin đáp án user chọn, check xem is_correct = 1 không, lấy point tương ứng. Sau đó INSERT vào bảng user_quiz_attempt_details để lưu lại câu trả lời và điểm số của câu đó.
>
> Thiết kế này cho phép user thay đổi đáp án nhiều lần (nếu quiz cho phép), và hệ thống luôn lưu lại lịch sử thay đổi.
>
> **PHASE 5: END ATTEMPT** - Kết thúc và tính điểm.
>
> Khi hết thời gian (countdown về 0) hoặc user click 'Nộp bài', Frontend gửi POST /quiz/end-attempt với attempt_id.
>
> Backend bắt đầu một Transaction mới để tính toán kết quả cuối cùng. Đầu tiên, thực hiện câu query UPDATE user_quiz_attempts với subquery SUM(score) từ bảng user_quiz_attempt_details để tính tổng điểm. Điều này đảm bảo điểm số được tính chính xác từ tất cả các câu đã trả lời.
>
> Tiếp theo, query toàn bộ violations từ bảng quiz_attempt_violations để tạo báo cáo chi tiết. Sau khi hoàn tất, COMMIT transaction.
>
> Backend trả về kết quả bao gồm: score (điểm số), total_violations (tổng số vi phạm), violation_details (chi tiết từng vi phạm với timestamp và evidence), allow_review (cho phép xem lại đáp án không).
>
> Frontend nhận kết quả và navigate user đến trang kết quả, hiển thị điểm số, danh sách vi phạm kèm ảnh bằng chứng, và đáp án đúng/sai nếu quiz cho phép review.
>
> Toàn bộ luồng này đảm bảo tính công bằng trong thi cử thông qua việc kết hợp giám sát AI realtime với lưu trữ bằng chứng chi tiết, đồng thời vẫn đảm bảo performance tốt nhờ việc processing AI bất đồng bộ."

---

### 3.4 Luồng Upload Avatar & Add to Face Database

**Các bước thực hiện:**

1. **Client upload ảnh avatar**

   - User chọn file ảnh từ máy tính
   - Frontend gửi POST `/auth/update-avatar/:user_id`
   - FormData chứa: avatar file

2. **Backend validation ảnh**

   - Kiểm tra định dạng file: chỉ jpg, png
   - Kiểm tra kích thước: max 5MB
   - Validate file thực sự là image (check magic bytes)

3. **Lưu file vào storage**

   - Generate filename unique: `{user_id}_{name}_{uuid}.jpg`
   - Tạo thư mục: `/uploads/profile_image_users/{user_id}_{name}/`
   - Save file vào thư mục

4. **Cập nhật database**

   - `UPDATE profiles SET avatar = ? WHERE user_id = ?`
   - Lưu đường dẫn relative của file

5. **Gọi AI Service để thêm face**

   - Backend tạo HTTP request POST `/add-person`
   - FormData:
     - id: user_id
     - name: user_name
     - image: File buffer

6. **AI Service detect face**

   - Sử dụng RetinaFace hoặc SCRFD detector
   - Detect bounding box của khuôn mặt
   - Nếu không detect được: trả về error "No face detected"

7. **Face alignment**

   - Chuẩn hóa khuôn mặt về góc nhìn chuẩn
   - Rotate và crop theo facial landmarks

8. **Extract face embedding**

   - Sử dụng ArcFace model (InsightFace)
   - Extract 512-dimensional embedding vector
   - Vector này là đại diện duy nhất của khuôn mặt

9. **Lưu vào face database**

   - Lưu ảnh vào: `/database/train/{user_id}/`
   - Update `face_database.pkl`:
     ```python
     database[user_id] = {
       'name': user_name,
       'embedding': embedding_vector,
       'images': [image_path]
     }
     ```

10. **Update recognition model**

    - Face recognition model load database mới
    - Sẵn sàng nhận diện user trong các lần quiz sau

11. **AI trả về confirmation**

    - Response 200 OK:
      - message: "Face added successfully"
      - face_saved: true

12. **Backend trả về cho Client**
    - Response 200 OK:
      - message: "Avatar uploaded successfully"
      - avatar_url: đường dẫn đầy đủ

**Sequence Diagram:**

```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌─────────┐
│ Client  │  │ Backend │  │ Database│  │ AI Service   │  │ Storage │
└────┬────┘  └────┬────┘  └────┬────┘  └──────┬───────┘  └────┬────┘
     │            │            │                │               │
     │ POST /auth/update-avatar/:user_id       │               │
     │ FormData: {avatar: File}                │               │
     ├───────────>│            │                │               │
     │            │ Validate image (jpg/png)    │               │
     │            │ Max size: 5MB               │               │
     │            │                            │               │
     │            │ Generate filename:          │               │
     │            │ {user_id}_{name}_{uuid}.jpg │               │
     │            │                            │               │
     │            │ Save to:                   │           ┌───┤
     │            │ /uploads/profile_image_users/          │   │
     │            │ {user_id}_{name}/           │           │   │
     │            │                            │           └──>│
     │            │                            │               │
     │            │ UPDATE profiles             │               │
     │            │ SET avatar = ?              │               │
     │            │ WHERE user_id = ?           │               │
     │            ├───────────>│                │               │
     │            │<OK         │                │               │
     │            │<───────────┤                │               │
     │            │                            │               │
     │            │ Call AI to add face:        │               │
     │            │ POST /add-person            │               │
     │            │ FormData:                   │               │
     │            │   id: user_id               │               │
     │            │   name: user_name           │               │
     │            │   image: File               │               │
     │            ├────────────────────────────>│               │
     │            │            │                │               │
     │            │            │   ┌──────── AI Processing ────┐
     │            │            │   │ 1. Detect face            │
     │            │            │   │ 2. Extract embeddings     │
     │            │            │   │ 3. Save to database/train/│
     │            │            │   │    {user_id}/             │
     │            │            │   │ 4. Update face_database.pkl│
     │            │            │   └───────────────────────────┘
     │            │            │                │               │
     │            │<OK: {message, face_saved}   │               │
     │            │<───────────────────────────┤               │
     │            │                            │               │
     │ 200 OK     │                            │               │
     │ {message, avatar_url}                   │               │
     │<───────────┤                            │               │
     │            │                            │               │
```

**Script giải thích:**

> "Luồng upload avatar và đồng bộ với AI face database là một luồng kỹ thuật cao, kết nối chặt chẽ giữa Backend và AI Service.
>
> Khi user muốn upload ảnh đại diện, họ chọn file ảnh từ máy tính và Frontend gửi FormData đến endpoint POST /auth/update-avatar/:user_id. Backend nhận được file ảnh, đầu tiên thực hiện validation kỹ lưỡng: kiểm tra định dạng file (chỉ cho phép jpg, png), kích thước tối đa 5MB, đảm bảo file thực sự là ảnh và không chứa malicious code.
>
> Sau khi pass validation, Backend generate tên file unique theo format '{user*id}*{user*name}*{uuid}.jpg' để tránh trùng lặp. File được lưu vào thư mục có cấu trúc /uploads/profile*image_users/{user_id}*{user_name}/. Cấu trúc này giúp dễ dàng quản lý và query file theo user.
>
> Backend cập nhật đường dẫn avatar vào bảng profiles với câu UPDATE profiles SET avatar = ? WHERE user_id = ?. Đến đây, về phía Backend đã hoàn tất.
>
> Bước tiếp theo là sync với AI Service để thêm khuôn mặt vào face recognition database. Backend tạo một HTTP request mới gửi đến AI Service endpoint POST /add-person với FormData chứa id (user_id), name (user_name), và image (file ảnh vừa upload).
>
> AI Service nhận được request và bắt đầu pipeline xử lý:
>
> Bước 1: Face Detection - Sử dụng RetinaFace hoặc SCRFD detector để tìm khuôn mặt trong ảnh. Nếu không detect được face, trả về error yêu cầu user chụp lại ảnh rõ hơn.
>
> Bước 2: Face Alignment - Chuẩn hóa khuôn mặt về một góc nhìn chuẩn để tăng độ chính xác nhận diện.
>
> Bước 3: Feature Extraction - Sử dụng model ArcFace (InsightFace) để extract 512-dimensional face embedding vector. Vector này chứa đặc trưng duy nhất của khuôn mặt người đó.
>
> Bước 4: Save to Database - Ảnh được lưu vào thư mục /database/train/{user_id}/ và embedding vector được thêm vào file face_database.pkl. File pkl này là một dictionary Python với structure: {user_id: {'name': name, 'embedding': np.array, 'images': [paths]}}
>
> Bước 5: Update Model - Face recognition model được cập nhật với data mới, sẵn sàng nhận diện user này trong các lần thi sau.
>
> AI Service trả về response thành công với message và face_saved = true. Backend nhận được confirmation và trả về cho Client với avatar_url đầy đủ.
>
> Từ thời điểm này, khi user làm quiz có bật face recognition, AI có thể verify chính xác đây có phải là người đã đăng ký hay không thông qua việc so sánh embedding vector với database."

---

### 3.5 Luồng Tạo Quiz với Questions

**Các bước thực hiện:**

1. **Giảng viên điền form tạo quiz**

   - Thông tin quiz: course_id, name, description
   - Thời gian: start_time, end_time, minute
   - Cấu hình giám sát:
     - enable_face_recognition
     - enable_anti_cheat
     - max_violations
     - allow_headphone
   - Cài đặt: max_attempts, shuffle_questions, allow_review

2. **Thêm câu hỏi và đáp án**

   - Mỗi question:
     - question_text: nội dung câu hỏi
     - answers array:
       - text: nội dung đáp án
       - is_correct: 1 (đúng) hoặc 0 (sai)
       - point: điểm được cộng

3. **Client gửi request**

   - POST `/api/v1/question-bank/quiz`
   - Request body chứa toàn bộ quiz + questions + answers

4. **AuthMiddleware verify quyền**

   - Verify JWT token
   - Check role: chỉ 'instructor' hoặc 'admin'
   - Nếu không có quyền: Response 403 Forbidden

5. **Backend bắt đầu Transaction**

   - `BEGIN TRANSACTION`
   - Đảm bảo atomic: tất cả thành công hoặc tất cả rollback

6. **Insert quiz record**

   - `INSERT INTO quizzes` với tất cả thông tin cấu hình
   - Database trả về `quiz_id` (auto-increment)

7. **Loop qua questions array**

   - Với mỗi question:

8. **Insert question record**

   - `INSERT INTO quiz_questions` với:
     - quiz_id (từ bước 6)
     - question_text
   - Database trả về `question_id`

9. **Loop qua answers array của question**

   - Với mỗi answer:

10. **Insert answer record**

    - `INSERT INTO quiz_question_answers` với:
      - quiz_question_id (từ bước 8)
      - answer text
      - is_correct flag
      - point value
    - Database trả về `answer_id`

11. **Kiểm tra tất cả operations**

    - Nếu có bất kỳ error nào:
      - `ROLLBACK TRANSACTION`
      - Database quay về trạng thái ban đầu
      - Trả về error cho Client

12. **Commit nếu thành công**

    - Tất cả INSERT thành công
    - `COMMIT TRANSACTION`
    - Quiz + questions + answers lưu vĩnh viễn

13. **Trả về kết quả**

    - Response 201 Created:
      - quiz_id
      - message: "Quiz created successfully"

14. **Client confirmation**
    - Hiển thị success message
    - Redirect đến trang quản lý quiz
    - Giảng viên có thể share quiz với học sinh

**Sequence Diagram:**

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │ Backend │                  │ Database│
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ POST /api/v1/question-bank/quiz                        │
     │ {                          │                            │
     │   course_id,               │                            │
     │   name, description,       │                            │
     │   start_time, end_time,    │                            │
     │   minute,                  │                            │
     │   enable_face_recognition, │                            │
     │   enable_anti_cheat,       │                            │
     │   max_violations,          │                            │
     │   questions: [             │                            │
     │     {                      │                            │
     │       question_text,       │                            │
     │       answers: [           │                            │
     │         {text, is_correct, point}                       │
     │       ]                    │                            │
     │     }                      │                            │
     │   ]                        │                            │
     │ }                          │                            │
     ├───────────────────────────>│                            │
     │                            │ AuthMiddleware             │
     │                            │ Check role (instructor/admin)          │
     │                            │                            │
     │                            │ BEGIN TRANSACTION          │
     │                            ├───────────────────────────>│
     │                            │                            │
**Script giải thích:**

> "Luồng tạo quiz với câu hỏi là một luồng quan trọng dành cho giảng viên và admin, được thiết kế với cơ chế Transaction đa cấp để đảm bảo dữ liệu consistent.
>
> Khi giảng viên muốn tạo một bài quiz mới, họ điền form với đầy đủ thông tin: course_id (khóa học nào), name và description của quiz, thời gian bắt đầu và kết thúc (start_time, end_time), thời lượng làm bài (minute), các cấu hình giám sát (enable_face_recognition, enable_anti_cheat, max_violations, allow_headphone), cài đặt quiz (max_attempts, shuffle_questions, allow_review).
>
> Đặc biệt, request body còn chứa một mảng questions, mỗi question có question_text và một mảng answers. Mỗi answer có text (nội dung đáp án), is_correct (1 nếu đúng, 0 nếu sai), và point (số điểm được cộng nếu chọn đáp án này). Thiết kế này cho phép câu hỏi có nhiều đáp án đúng với điểm số khác nhau.
>
> Frontend gửi toàn bộ payload này đến endpoint POST /api/v1/question-bank/quiz. Request đi qua AuthMiddleware để verify JWT token và check role. Chỉ user có role 'instructor' hoặc 'admin' mới có quyền tạo quiz. Nếu không có quyền, trả về 403 Forbidden ngay lập tức.
>
> Sau khi pass authorization, Backend bắt đầu một Database Transaction lớn. Đây là điểm quan trọng: việc tạo quiz, questions, và answers phải thành công hoàn toàn hoặc fail hoàn toàn, không được phép có trạng thái giữa chừng.
>
> Transaction bắt đầu với BEGIN. Bước đầu tiên, INSERT vào bảng quizzes với tất cả thông tin cấu hình. Database tự động generate quiz_id và trả về thông qua LAST_INSERT_ID() (MySQL) hoặc RETURNING clause (PostgreSQL).
>
> Với quiz_id vừa có, Backend bắt đầu vòng lặp qua mảng questions. Với mỗi question:
> - INSERT vào bảng quiz_questions với quiz_id và question_text
> - Nhận lại question_id
> - Lặp qua mảng answers của question đó
> - INSERT từng answer vào bảng quiz_question_answers với quiz_question_id, answer text, is_correct flag, và point value
> - Nhận lại answer_id
>
> Cấu trúc nested loop này tạo ra quan hệ: 1 quiz → N questions → M answers. Ví dụ quiz có 10 câu hỏi, mỗi câu 4 đáp án, transaction sẽ thực hiện: 1 INSERT quiz + 10 INSERT questions + 40 INSERT answers = tổng 51 operations.
>
> Nếu bất kỳ operation nào trong 51 operations này bị lỗi (ví dụ: constraint violation, foreign key error, network timeout), toàn bộ Transaction được ROLLBACK. Database quay về trạng thái trước khi BEGIN, không có quiz, question, hay answer nào được tạo. Error được propagate về Client với message cụ thể.
>
> Nếu tất cả operations thành công, Transaction được COMMIT. Lúc này quiz cùng toàn bộ questions và answers được lưu vĩnh viễn vào database. Backend trả về 201 Created với quiz_id và success message.
>
> Giảng viên nhận được confirmation và có thể share quiz với học sinh. Học sinh có thể enroll và làm bài quiz này. Cơ chế Transaction đảm bảo không bao giờ có quiz không có câu hỏi, hoặc câu hỏi không có đáp án - những trường hợp có thể gây crash ứng dụng khi học sinh làm bài."

     │                            │ INSERT INTO quizzes        │
     │                            ├───────────────────────────>│
     │                            │ <quiz_id>                  │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ For each question:         │
     │                            │   INSERT INTO quiz_questions│
     │                            ├───────────────────────────>│
     │                            │   <question_id>            │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │   For each answer:         │
     │                            │     INSERT INTO quiz_question_answers   │
     │                            ├───────────────────────────>│
     │                            │     <answer_id>            │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ COMMIT                     │
     │                            ├───────────────────────────>│
     │                            │ OK                         │
     │                            │<───────────────────────────┤
     │                            │                            │
     │ 201 Created                │                            │
     │ {quiz_id, message}         │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
```

---

### 3.6 Luồng Report & Statistics

**Các bước thực hiện:**

1. **Admin/Teacher truy cập report**

   - Vào trang quản lý báo cáo
   - Chọn học sinh cần xem lịch sử vi phạm

2. **Client gửi request**

   - GET `/admin/reports/student/:student_id/violations`
   - student_id trong URL path parameter

3. **AuthMiddleware verify quyền**

   - Verify JWT token
   - Check role: 'admin' hoặc 'teacher'
   - Với teacher: check thêm điều kiện phụ trách student đó
   - Nếu không có quyền: Response 403 Forbidden

4. **Backend query database**

   - Complex query với 4-table JOIN:
     ```sql
     SELECT v.*, q.name as quiz_name, u.name as student_name
     FROM quiz_attempt_violations v
     JOIN user_quiz_attempts a ON v.user_quiz_attempt_id = a.id
     JOIN quizzes q ON a.quiz_id = q.id
     JOIN users u ON a.user_id = u.id
     WHERE u.id = ?
     ORDER BY v.detected_at DESC
     ```

5. **Database trả về resultset**

   - Danh sách tất cả violations của student
   - Mỗi row chứa: violation info + quiz info + student info

6. **Backend process data**

   - Tạo structured response với nhiều level:

7. **Level 1: Student Information**

   - id, name, email, avatar
   - Basic profile của học sinh

8. **Level 2: Violations Array**

   - Chi tiết từng vi phạm:
     - type: LOOK_AWAY, HEAD_TURN, HEADPHONE, PHONE, etc.
     - level: 1 (warning), 2 (moderate), 3 (severe)
     - detected_at: timestamp chính xác
     - evidence_url: đường dẫn ảnh bằng chứng
     - quiz_name, quiz_id

9. **Level 3: Statistics**

   - total_violations: tổng số vi phạm
   - severity_stats: breakdown theo level
   - violation_type_distribution: phân bố theo type
   - quiz_violation_count: số quiz có vi phạm
   - average_violations_per_quiz
   - most_recent_violation

10. **Backend trả về response**

    - Response 200 OK với toàn bộ data đã process

11. **Frontend render dashboard**
    - **Section 1**: Student Profile Card
      - Avatar, name, email, tổng vi phạm
12. **Section 2**: Statistics Overview

    - Charts/graphs:
      - Pie chart: phân bố theo type
      - Bar chart: phân bố theo level
      - Timeline: vi phạm theo thời gian

13. **Section 3**: Detailed Violation Timeline

    - Table/list view từng vi phạm
    - Filter theo: quiz, type, level
    - Click row để xem evidence full-size

14. **Section 4**: Evidence Gallery

    - Grid view tất cả ảnh bằng chứng
    - Zoom in để xem chi tiết
    - Watermark với timestamp và type

15. **Section 5**: Action Buttons

    - Admin có thể thực hiện:
      - "Cảnh cáo học sinh"
      - "Hủy điểm bài thi"
      - "Khóa tài khoản tạm thời"
      - "Export PDF báo cáo"

16. **Lưu trữ lâu dài**
    - Data được lưu trong database
    - Có thể dùng làm bằng chứng trong tranh chấp
    - Audit trail đầy đủ

**Sequence Diagram:**

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │ Backend │                  │ Database│
│(Admin/  │                  │         │                  │         │
│Teacher) │                  │         │                  │         │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ GET /admin/reports/student/:student_id/violations      │
     ├───────────────────────────>│                            │
     │                            │ AuthMiddleware (admin/teacher)       │
     │                            │                            │
     │                            │ SELECT                     │
     │                            │   v.*, q.name as quiz_name,│
     │                            │   u.name as student_name   │
     │                            │ FROM quiz_attempt_violations v         │
     │                            │ JOIN user_quiz_attempts a  │
     │                            │   ON v.user_quiz_attempt_id = a.id     │
**Script giải thích:**

> "Luồng Report & Statistics là công cụ quan trọng giúp admin và giảng viên giám sát hành vi thi cử của học sinh, phát hiện các pattern gian lận và đưa ra quyết định xử lý phù hợp.
>
> Khi admin hoặc giảng viên muốn xem lịch sử vi phạm của một học sinh cụ thể, họ truy cập vào trang report và chọn student. Frontend gửi request GET /admin/reports/student/:student_id/violations, với student_id trong URL path.
>
> Request đi qua AuthMiddleware để verify identity và check role. Chỉ user có role 'admin' hoặc 'teacher' mới được phép xem report. Đối với teacher, hệ thống còn có thể check thêm điều kiện: teacher chỉ được xem report của học sinh trong các khóa học mình phụ trách. Điều này đảm bảo privacy và phân quyền hợp lý.
>
> Backend nhận được request và thực hiện một complex query với nhiều JOIN để lấy dữ liệu đầy đủ. Query join 4 bảng:
> - quiz_attempt_violations v (bảng chính chứa violations)
> - user_quiz_attempts a (để biết violation thuộc attempt nào)
> - quizzes q (để lấy tên quiz)
> - users u (để lấy thông tin học sinh)
>
> SELECT statement lấy tất cả thông tin violation (id, type, level, detected_at, evidence_url) cùng với context (quiz_name, student_name). WHERE clause filter theo student_id để chỉ lấy violations của student đó. ORDER BY detected_at DESC để hiển thị vi phạm mới nhất trên cùng.
>
> Database execute query và trả về resultset. Backend process data này thành một structured response object với nhiều level thông tin:
>
> Level 1: Student Information - Thông tin cơ bản của học sinh (id, name, email, avatar)
>
> Level 2: Violations Array - Mảng chi tiết từng vi phạm, mỗi item chứa:
> - type: Loại vi phạm (LOOK_AWAY, HEAD_TURN, MULTIPLE_FACES, NO_FACE, HEADPHONE, PHONE, etc.)
> - level: Mức độ nghiêm trọng (1: warning, 2: moderate, 3: severe)
> - detected_at: Timestamp chính xác
> - evidence_url: Đường dẫn đến ảnh bằng chứng
> - quiz_name: Tên bài quiz xảy ra vi phạm
> - quiz_id: ID để có thể link đến chi tiết quiz
>
> Level 3: Statistics - Các số liệu thống kê tổng hợp:
> - total_violations: Tổng số vi phạm
> - severity_stats: Breakdown theo level {level_1: count, level_2: count, level_3: count}
> - violation_type_distribution: Phân bố theo type {LOOK_AWAY: count, HEADPHONE: count, ...}
> - quiz_violation_count: Số lượng quiz có vi phạm
> - average_violations_per_quiz: Trung bình vi phạm mỗi quiz
> - most_recent_violation: Vi phạm gần nhất
>
> Response được trả về với status 200 OK. Frontend nhận được data và render một dashboard phong phú:
>
> Section 1: Student Profile Card - Hiển thị avatar, tên, email, tổng số vi phạm
>
> Section 2: Statistics Overview - Các chart/graph hiển thị phân bố vi phạm theo loại, theo mức độ, theo thời gian (timeline)
>
> Section 3: Detailed Violation Timeline - Table hoặc list view hiển thị từng vi phạm theo thời gian, có thể filter theo quiz, type, level. Mỗi row có thể click để xem full-size evidence image.
>
> Section 4: Evidence Gallery - Grid view của tất cả ảnh bằng chứng, có thể zoom in để xem chi tiết. Ảnh có watermark với timestamp và violation type.
>
> Section 5: Action Buttons - Admin có thể thực hiện các action như: 'Cảnh cáo học sinh', 'Hủy điểm bài thi', 'Khóa tài khoản tạm thời', 'Export PDF báo cáo'.
>
> Luồng này giúp admin/teacher có overview đầy đủ về hành vi của từng học sinh, từ đó đưa ra quyết định giáo dục hoặc kỷ luật phù hợp. Data được lưu trữ lâu dài, có thể dùng làm bằng chứng trong các trường hợp tranh chấp."

     │                            │ JOIN quizzes q ON a.quiz_id = q.id     │
     │                            │ JOIN users u ON a.user_id = u.id       │
     │                            │ WHERE u.id = ?             │
     │                            │ ORDER BY v.detected_at DESC│
     │                            ├───────────────────────────>│
     │                            │                            │
     │                            │ <violation_list>           │
     │                            │<───────────────────────────┤
     │                            │                            │
     │ 200 OK                     │                            │
     │ {                          │                            │
     │   student: {...},          │                            │
     │   violations: [            │                            │
     │     {                      │                            │
     │       type, level,         │                            │
     │       detected_at,         │                            │
     │       evidence_url,        │                            │
     │       quiz_name            │                            │
     │     }                      │                            │
     │   ],                       │                            │
     │   total_violations,        │                            │
     │   severity_stats           │                            │
     │ }                          │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Display violation history with images                   │
     │                            │                            │
```

---

## 4. Các Pattern & Best Practices

### 4.1 Security

**Backend:**

- JWT với expiration time (24h)
- Password hashing (bcrypt, cost 10)
- CORS whitelist (localhost:3000, localhost:5173)
- Auth middleware cho protected routes
- RBAC (Role-Based Access Control)
- Input validation & sanitization

**Frontend:**

- JWT stored in localStorage
- Auto-logout on token expiration
- Protected routes with role check
- XSS prevention (React default)

---

### 4.2 Database Transactions

**Critical operations dùng ACID:**

```go
tx, _ := db.Begin()

// Multiple operations
_, err1 := tx.Exec("INSERT INTO users...")
_, err2 := tx.Exec("INSERT INTO profiles...")
_, err3 := tx.Exec("INSERT INTO user_roles...")

if err1 != nil || err2 != nil || err3 != nil {
    tx.Rollback()
    return err
}

tx.Commit()
```

---

### 4.3 Error Handling

**Backend:**

- Centralized error response
- Logging (stdout + file)
- Meaningful error messages

**Frontend:**

- Try-catch for async operations
- Toast/Alert notifications
- Fallback UI

---

### 4.4 File Upload Strategy

**Backend storage structure:**

```
/uploads/
  /profile_image_users/
    /{user_id}_{user_name}/
      avatar_1.jpg
      avatar_2.jpg
  /cheating_image_users/
    /{quiz_attempt_id}/
      /{user_id}/
        violation_1.jpg
        violation_2.jpg
```

**AI Service storage:**

```
/database/train/
  /{user_id}/
    face_1.jpg
    face_2.jpg
/logs/
  /cheating_images/
  /cheat_csv/
    cheat_20251223.csv
```

---

## 5. Scalability & Future Improvements

### 5.1 Current Limitations

- Single server deployment
- Synchronous AI processing
- File storage on local disk
- No load balancing

### 5.2 Recommended Improvements

**Short-term:**

- Add Redis caching (JWT blacklist, session)
- Implement rate limiting
- Add database connection pooling
- Optimize AI model inference speed

**Long-term:**

- Microservices orchestration (Kubernetes)
- Message queue for AI processing (RabbitMQ/Kafka)
- Object storage (AWS S3/MinIO)
- CDN for static assets
- Database replication (Master-Slave)
- WebSocket for real-time notifications
- Horizontal scaling (multiple Backend instances)

---

## 6. Deployment Architecture (Production)

```
                         Internet
                            │
                            ▼
                    ┌────────────────┐
                    │  Load Balancer │ (Nginx/HAProxy)
                    │   (SSL/TLS)    │
                    └────────┬───────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                 │
            ▼                ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Frontend     │  │ Frontend     │  │ Frontend     │
    │ Static       │  │ Static       │  │ Static       │
    │ (Nginx)      │  │ (Nginx)      │  │ (Nginx)      │
    └──────────────┘  └──────────────┘  └──────────────┘
            │                │                 │
            └────────────────┼─────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  API Gateway   │
                    │  (Kong/Traefik)│
                    └────────┬───────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                 │
            ▼                ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Backend API  │  │ Backend API  │  │ Backend API  │
    │ Instance 1   │  │ Instance 2   │  │ Instance 3   │
    │ (Go)         │  │ (Go)         │  │ (Go)         │
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                  │
           └─────────────────┼──────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                 │
            ▼                ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Redis      │  │   MySQL      │  │ AI Service   │
    │   Cache      │  │  Master/Slave│  │ Queue Worker │
    └──────────────┘  └──────────────┘  └──────┬───────┘
                                                │
                                                ▼
                                        ┌──────────────┐
                                        │ Object Store │
                                        │   (S3/MinIO) │
                                        └──────────────┘
```

---

## 7. Monitoring & Logging

**Backend:**

- Structured logging (JSON format)
- Log levels (INFO, WARN, ERROR)
- Log rotation
- Metrics (request count, latency, error rate)

**AI Service:**

- CSV logs for violations
- Image evidence storage
- Performance metrics (inference time)

**Recommended tools:**

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Prometheus + Grafana
- Sentry (error tracking)

---

## 8. Kết luận

Hệ thống Neo Learn được thiết kế theo kiến trúc Microservices với 3 service độc lập:

- **Frontend**: Giao diện người dùng responsive, hỗ trợ 3 role
- **Backend**: API Gateway với business logic và RBAC
- **AI Service**: Xử lý AI cho face recognition và cheat detection

**Điểm mạnh:**

- Separation of concerns rõ ràng
- Scalable và maintainable
- Security tốt (JWT + RBAC)
- AI monitoring real-time hiệu quả

**Tech Stack modern:**

- Golang (Performance + Concurrency)
- React + TypeScript (Type-safe + Modern UI)
- FastAPI (Async + Fast AI inference)
- MySQL (ACID + Reliable)
