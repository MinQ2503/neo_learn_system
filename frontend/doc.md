# Neo Learn System - Frontend Documentation

## 📋 Tổng quan

**Neo Learn System** là một hệ thống học tập trực tuyến với các chức năng quản lý học sinh, giáo viên, khóa học, bài thi và theo dõi gian lận. Frontend được xây dựng bằng **React 19.2.3** với **TypeScript** và **Vite** làm build tool.

---

## 🚀 Cách chạy dự án

### Yêu cầu hệ thống

- **Node.js** (khuyến nghị phiên bản >= 18.x)
- **npm** hoặc **yarn**

### Các bước chạy

1. **Cài đặt dependencies:**

   ```bash
   npm install
   ```

2. **Cấu hình môi trường:**

   - Mở file `.env.local`
   - Thiết lập `GEMINI_API_KEY` nếu sử dụng tính năng AI (tùy chọn):
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Chạy ở chế độ development:**

   ```bash
   npm run dev
   ```

   - Ứng dụng sẽ chạy tại: `http://localhost:5173`
   - Server chạy trên `host: 0.0.0.0` (cho phép truy cập từ các thiết bị trong mạng)

4. **Build production:**

   ```bash
   npm run build
   ```

5. **Preview bản build:**
   ```bash
   npm run preview
   ```

### 🎯 Entry Point

**Dự án bắt đầu chạy từ:**

1. **[index.html](index.html)** - File HTML chính, định nghĩa root element và load Tailwind CSS từ CDN
2. **[index.tsx](index.tsx)** - Entry point của React application, render component `<App />` vào root element
3. **[App.tsx](App.tsx)** - Component chính, xử lý routing và phân quyền theo role (Admin/Teacher/Student)

**Flow khởi chạy:**

```
index.html
  ↓ (load script)
index.tsx
  ↓ (ReactDOM.createRoot)
App.tsx
  ↓ (HashRouter + Routes)
Pages Components (Login, Dashboard, etc.)
```

---

## 📁 Cấu trúc thư mục

```
react_ui_main/
├── components/          # Các component tái sử dụng
├── pages/              # Các trang chính của ứng dụng
│   ├── admin/         # Trang dành cho Admin
│   ├── teacher/       # Trang dành cho Teacher
│   └── student/       # Trang dành cho Student
├── services/          # API services và mock data
│   └── api/          # API client modules
├── .env.local        # Biến môi trường
├── .gitignore        # Git ignore rules
├── App.tsx           # Component chính, routing
├── index.html        # HTML template chính
├── index.tsx         # Entry point của React app
├── package.json      # Dependencies và scripts
├── tsconfig.json     # TypeScript configuration
├── types.ts          # TypeScript type definitions
├── vite.config.ts    # Vite configuration
└── README.md         # Hướng dẫn cơ bản
```

---

## 📂 Giải thích chi tiết từng folder

### 1. **components/** - Component tái sử dụng

Chứa các UI component được sử dụng lại nhiều lần trong toàn bộ ứng dụng:

- **CameraCheck.tsx**: Component kiểm tra camera cho chức năng giám sát thi
- **ClayButton.tsx**: Button với hiệu ứng Clay/Neumorphism design
- **ClayCard.tsx**: Card component với clay styling
- **ClayModal.tsx**: Modal dialog với clay styling
- **Layout.tsx**: Layout chung cho các trang (header, sidebar, content area)

### 2. **pages/** - Các trang chính

Chứa các component đại diện cho từng trang/màn hình:

#### Root level pages:

- **Login.tsx**: Trang đăng nhập
- **Register.tsx**: Trang đăng ký tài khoản
- **ProfileEdit.tsx**: Trang chỉnh sửa thông tin cá nhân
- **ChangePassword.tsx**: Trang đổi mật khẩu
- **ExamRoom.tsx**: Phòng thi trực tuyến với giám sát
- **AdminDashboard.tsx**: Dashboard cho Admin
- **TeacherDashboard.tsx**: Dashboard cho Teacher
- **StudentDashboard.tsx**: Dashboard cho Student

#### pages/admin/ - Quản lý dành cho Admin:

- **TeacherManager.tsx**: Quản lý danh sách giáo viên
- **StudentManager.tsx**: Quản lý danh sách học sinh
- **CourseManager.tsx**: Quản lý khóa học
- **CourseDetail.tsx**: Chi tiết khóa học
- **LessonManager.tsx**: Quản lý bài học
- **AssignmentManager.tsx**: Quản lý bài tập
- **ExamManager.tsx**: Quản lý bài thi
- **QuestionBank.tsx**: Ngân hàng câu hỏi
- **AdminReports.tsx**: Báo cáo tổng quan
- **StudentViolationHistory.tsx**: Lịch sử vi phạm của học sinh
- **ClassManager.tsx**: Quản lý lớp học

#### pages/teacher/ - Dành cho Teacher:

- **ClassManager.tsx**: Quản lý lớp học của giáo viên
- **ClassDetail.tsx**: Chi tiết lớp học
- **ExamManager.tsx**: Quản lý bài thi
- **ExamReportDetail.tsx**: Báo cáo chi tiết bài thi
- **QuestionBank.tsx**: Ngân hàng câu hỏi
- **StudentManager.tsx**: Quản lý học sinh trong lớp
- **TeacherReports.tsx**: Báo cáo của giáo viên

#### pages/student/ - Dành cho Student:

- **StudentClasses.tsx**: Danh sách lớp học của học sinh
- **StudentClassDetail.tsx**: Chi tiết lớp học
- **LessonDetail.tsx**: Xem chi tiết bài học
- **AssignmentDetail.tsx**: Xem và làm bài tập
- **StudentExamResult.tsx**: Kết quả bài thi

### 3. **services/** - API và Data Services

#### services/api/ - API Client Modules:

- **base.ts**: Utility functions (delay, localStorage helpers)
- **assignmentService.ts**: API cho bài tập
- **classService.ts**: API cho lớp học
- **examService.ts**: API cho bài thi
- **lessonService.ts**: API cho bài học
- **questionService.ts**: API cho câu hỏi
- **reportService.ts**: API cho báo cáo
- **studentService.ts**: API cho học sinh
- **userService.ts**: API cho người dùng

#### Root level services:

- **mockData.ts**: Dữ liệu mock cho development
- **mockService.ts**: Service xử lý authentication và mock data

---

## ⚙️ Giải thích các file config

### 1. **package.json** - Quản lý dependencies và scripts

**Dependencies chính:**

- `react` (19.2.3): Thư viện UI
- `react-router-dom` (7.10.1): Routing cho SPA
- `lucide-react`: Icon library
- `recharts`: Thư viện biểu đồ

**Dev Dependencies:**

- `@vitejs/plugin-react`: Plugin React cho Vite
- `typescript` (~5.8.2): TypeScript compiler
- `vite` (6.2.0): Build tool & dev server
- `@types/node`: Type definitions cho Node.js

**Scripts:**

- `npm run dev`: Chạy development server
- `npm run build`: Build production
- `npm run preview`: Preview bản build

### 2. **vite.config.ts** - Cấu hình Vite

```typescript
server: {
  port: 5173,           // Cổng dev server
  host: '0.0.0.0',     // Cho phép truy cập từ mạng
}
```

**Chức năng:**

- Load environment variables từ `.env.local`
- Định nghĩa `GEMINI_API_KEY` cho client-side
- Cấu hình alias `@/` trỏ đến thư mục root
- Plugin React với Fast Refresh

### 3. **tsconfig.json** - Cấu hình TypeScript

**Cấu hình quan trọng:**

- `target: "ES2022"`: Compile target
- `jsx: "react-jsx"`: JSX transform (React 17+)
- `moduleResolution: "bundler"`: Module resolution cho Vite
- `paths: { "@/*": ["./*"] }`: Path alias
- `noEmit: true`: Không emit JS files (Vite xử lý)
- `experimentalDecorators: true`: Hỗ trợ decorators

### 4. **types.ts** - Type Definitions

Định nghĩa các TypeScript types/interfaces chính:

**Enums:**

- `Role`: ADMIN, TEACHER, STUDENT
- `ViolationType`: Các loại vi phạm (Face Mismatch, Multi Face, Mobile Detected, etc.)
- `Severity`: LOW, MEDIUM, HIGH

**Interfaces:**

- `User`: Thông tin người dùng
- `Violation`: Thông tin vi phạm
- `StudentStatus`: Trạng thái học sinh trong phòng thi
- `Exam`, `Question`, `Course`, `Lesson`, `Assignment`: Các entities chính

### 5. **.env.local** - Environment Variables

```
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

Lưu trữ API key cho Gemini AI (sử dụng cho các tính năng AI nếu có).

### 6. **index.html** - HTML Template

**Đặc điểm:**

- Load **Tailwind CSS** từ CDN
- Cấu hình custom theme (primary colors, clay effects)
- Định nghĩa `<div id="root">` cho React mount point
- Load [index.tsx](index.tsx) qua `<script type="module">`

### 7. **.gitignore**

Loại trừ các file/folder không cần commit:

- `node_modules/`
- `dist/`
- Build outputs và cache files

---

## 🔐 Phân quyền và Routing

### Authentication Flow

1. User truy cập `/` → Hiển thị trang Login
2. Sau khi login thành công → Lưu user info vào `localStorage`
3. Redirect theo role:
   - **Admin** → `/admin`
   - **Teacher** → `/teacher`
   - **Student** → `/student`

### Protected Routes

Tất cả routes (trừ Login/Register) đều được bảo vệ:

```typescript
<Route
  path="/student"
  element={
    userRole === Role.STUDENT ? <StudentDashboard /> : <Navigate to="/" />
  }
/>
```

### Route Structure

```
/                              → Login
/register                      → Register
/profile-edit                  → Profile Edit (All roles)
/change-password               → Change Password (All roles)

# Student Routes
/student                       → Student Dashboard
/student/courses               → Student Classes
/student/courses/:classId      → Class Detail
/student/lesson/:lessonId      → Lesson Detail
/student/assignment/:id        → Assignment Detail
/student/exam-result/:examId   → Exam Result
/exam/:examId                  → Exam Room

# Teacher Routes
/teacher                       → Teacher Dashboard
/teacher/students              → Student Manager
/teacher/courses               → Course Manager
/teacher/courses/:courseId     → Course Detail
/teacher/lessons               → Lesson Manager
/teacher/assignments           → Assignment Manager
/teacher/exams                 → Exam Manager
/teacher/questions             → Question Bank
/teacher/reports               → Reports
/teacher/reports/student/:id   → Student Violation History

# Admin Routes
/admin                         → Admin Dashboard
/admin/teachers                → Teacher Manager
/admin/students                → Student Manager
/admin/courses                 → Course Manager
/admin/courses/:courseId       → Course Detail
/admin/lessons                 → Lesson Manager
/admin/assignments             → Assignment Manager
/admin/exams                   → Exam Manager
/admin/questions               → Question Bank
/admin/reports                 → Reports
/admin/reports/student/:id     → Student Violation History
```

---

## 🎨 UI/UX Design

### Design System

**Theme:** Clay/Neumorphism với màu chủ đạo:

- **Primary**: Sky Blue (#0ea5e9)
- **Accent**: Orange (#f97316)
- **Background**: Light Gray (#f3f4f6)

**Shadow Effects:**

- `shadow-clay`: 3D clay effect
- `shadow-clay-inset`: Inset clay effect
- `shadow-clay-sm`: Small clay effect

### Styling Approach

- **Tailwind CSS**: Utility-first CSS framework (loaded via CDN)
- **Custom config**: Trong [index.html](index.html#L8-L35)
- **Clay components**: ClayButton, ClayCard, ClayModal

---

## 📊 Data Management

### Local Storage

Ứng dụng sử dụng `localStorage` để lưu trữ:

- **User session**: `neo_current_user`
- **Mock data**: Various keys (neo_users_list, neo_exams, etc.)

### Mock Data vs Real API

Hiện tại ứng dụng đang sử dụng **mock data** ([mockService.ts](services/mockService.ts)) cho development.

**Mock services bao gồm:**

- User authentication
- CRUD operations cho các entities
- Violation tracking
- Exam monitoring

### API Integration

Các service trong [services/api/](services/api/) đã được chuẩn bị để tích hợp với backend thực:

- Base utilities trong [base.ts](services/api/base.ts)
- Các service modules (examService, userService, etc.)
- Sử dụng `delay()` để simulate API latency

---

## 🔍 Tính năng chính

### 1. **Quản lý người dùng**

- Đăng nhập/Đăng ký
- Phân quyền: Admin, Teacher, Student
- Profile management
- Đổi mật khẩu

### 2. **Quản lý khóa học**

- Tạo/Sửa/Xóa khóa học
- Quản lý bài học (Lessons)
- Quản lý bài tập (Assignments)

### 3. **Hệ thống thi trực tuyến**

- Phòng thi với giám sát
- Ngân hàng câu hỏi
- Chấm điểm tự động
- Xem kết quả thi

### 4. **Anti-Cheating System**

- Theo dõi camera
- Phát hiện vi phạm:
  - Face mismatch (nhận diện sai người)
  - Multiple faces (nhiều người)
  - Mobile device detected
  - Gaze away (nhìn ra ngoài)
  - Headphones detected
- Lưu lịch sử vi phạm
- Báo cáo chi tiết

### 5. **Dashboard & Reports**

- Dashboard theo role
- Biểu đồ thống kê (Recharts)
- Báo cáo vi phạm
- Báo cáo kết quả học tập

---

## 🛠️ Tech Stack Summary

| Công nghệ    | Phiên bản | Mục đích                |
| ------------ | --------- | ----------------------- |
| React        | 19.2.3    | UI Library              |
| TypeScript   | 5.8.2     | Type Safety             |
| Vite         | 6.2.0     | Build Tool & Dev Server |
| React Router | 7.10.1    | Client-side Routing     |
| Tailwind CSS | CDN       | Styling                 |
| Lucide React | 0.561.0   | Icons                   |
| Recharts     | 3.6.0     | Charts & Visualization  |

---

## 📝 Lưu ý khi phát triển

### 1. **TypeScript**

- Luôn định nghĩa types trong [types.ts](types.ts)
- Sử dụng interface cho objects phức tạp
- Tránh dùng `any`, ưu tiên `unknown` hoặc specific types

### 2. **Component Structure**

- Functional components với hooks
- Props interface cho mỗi component
- Export default cho main component

### 3. **Routing**

- Sử dụng `HashRouter` (không phải `BrowserRouter`)
- Protected routes check `userRole`
- Navigate to `/` nếu unauthorized

### 4. **State Management**

- Local state với `useState`
- Shared state qua props hoặc context (nếu cần)
- Persistent state qua `localStorage`

### 5. **API Calls**

- Sử dụng async/await
- Thêm error handling
- Simulate delay trong development

---

## 🚦 Development Workflow

1. **Thêm tính năng mới:**

   - Tạo type definitions trong [types.ts](types.ts)
   - Tạo component trong `components/` hoặc `pages/`
   - Thêm route trong [App.tsx](App.tsx)
   - Tạo API service trong `services/api/`
   - Update mock data nếu cần

2. **Testing:**

   - Chạy `npm run dev`
   - Test trên localhost:5173
   - Kiểm tra responsive design
   - Test các role khác nhau

3. **Build & Deploy:**
   - Chạy `npm run build`
   - Check `dist/` folder
   - Deploy static files

---

## 📞 Tài khoản test

**Admin:**

- Username: `admin`
- Password: `Demo@1234`

**Teacher/Student:**

- Có thể đăng ký mới hoặc sử dụng mock data có sẵn

---

## 🔗 Liên kết hữu ích

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **React Router**: https://reactrouter.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **TypeScript**: https://www.typescriptlang.org/

---

## 📌 TODO / Cải tiến

- [ ] Kết nối với backend thực (Go API)
- [ ] Add unit tests (Jest/Vitest)
- [ ] Optimize bundle size
- [ ] Add loading states và error boundaries
- [ ] Implement proper authentication (JWT)
- [ ] Add internationalization (i18n)
- [ ] Improve accessibility (a11y)

---

**Last Updated:** 2024-12-22
**Version:** 0.0.0
