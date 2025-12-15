# Tài liệu Dự án React UI Main

Tài liệu này mô tả cấu trúc, luồng hoạt động và cách khởi chạy dự án Frontend React (react_ui_main).

## 1. Cây thư mục

Dưới đây là giải thích nhiệm vụ của các thư mục và tệp tin chính trong dự án:

```
react_ui_main/
├── components/          # Chứa các thành phần UI tái sử dụng (Reusable Components)
│   ├── CameraCheck.tsx  # Component kiểm tra camera (dùng cho thi trực tuyến)
│   ├── ClayButton.tsx   # Component Button tùy chỉnh theo style Claymorphism
│   ├── ClayCard.tsx     # Component Card tùy chỉnh
│   └── Layout.tsx       # Layout chung cho các trang
├── pages/               # Chứa các trang chính (Views) của ứng dụng
│   ├── AdminDashboard.tsx   # Trang bảng điều khiển cho Admin
│   ├── ExamRoom.tsx         # Trang làm bài thi của sinh viên
│   ├── Login.tsx            # Trang đăng nhập
│   ├── StudentDashboard.tsx # Trang bảng điều khiển cho Sinh viên
│   └── TeacherDashboard.tsx # Trang bảng điều khiển cho Giáo viên
├── services/            # Chứa các logic xử lý dữ liệu, gọi API
│   └── mockService.ts   # Dịch vụ giả lập dữ liệu (Mock data) và xử lý auth đơn giản
├── App.tsx              # Component gốc, chứa cấu hình Routing và logic phân quyền (Auth)
├── index.html           # File HTML chính, điểm vào của ứng dụng
├── index.tsx            # Điểm vào của React, render App vào DOM
├── types.ts             # Định nghĩa các kiểu dữ liệu TypeScript (Interfaces, Types, Enums)
├── vite.config.ts       # Cấu hình công cụ build Vite
└── package.json         # Khai báo dependencies và các scripts chạy dự án
```

## 2. Luồng chạy của Project

Luồng khởi chạy và hoạt động của ứng dụng diễn ra như sau:

1.  **Khởi động (`index.html`):** Khi trình duyệt truy cập vào ứng dụng, file `index.html` được tải đầu tiên.
2.  **Entry Point (`index.tsx`):** File này được nhúng trong `index.html`. Nó khởi tạo React Root và render component `<App />` vào phần tử có id là `root`.
3.  **Routing & Auth (`App.tsx`):**
    - `App.tsx` là nơi quản lý điều hướng (Routing) chính.
    - Khi ứng dụng load, `useEffect` sẽ kiểm tra trạng thái đăng nhập (Role) từ `localStorage` thông qua `getRoleFromStorage`.
    - **Chưa đăng nhập:** Chuyển hướng về trang `Login` (`/`).
    - **Đã đăng nhập:** Dựa vào `Role` (STUDENT, TEACHER, ADMIN) để chuyển hướng đến Dashboard tương ứng (`/student`, `/teacher`, `/admin`).
4.  **Tương tác người dùng:**
    - Người dùng tương tác với các trang trong thư mục `pages/`.
    - Các trang này sử dụng các component từ `components/` để hiển thị giao diện.
    - Dữ liệu được lấy hoặc xử lý thông qua `services/mockService.ts`.

## 3. Cách chạy và khởi động

Dự án sử dụng **Vite** làm công cụ build và phát triển.

### Yêu cầu

- Node.js (khuyến nghị phiên bản LTS mới nhất)
- npm (hoặc yarn/pnpm)

### Các bước cài đặt

1.  **Mở terminal** tại thư mục `frontend/react_ui_main`.
2.  **Cài đặt các thư viện phụ thuộc (Dependencies):**
    ```bash
    npm install
    ```

### Lệnh chạy

- **Chạy môi trường phát triển (Development):**
  Lệnh này sẽ khởi động server local (thường là http://localhost:3000).

  ```bash
  npm run dev
  ```

- **Build cho môi trường sản xuất (Production):**
  Lệnh này sẽ biên dịch code ra thư mục `dist`.

  ```bash
  npm run build
  ```

- **Xem trước bản build (Preview):**
  Chạy thử bản đã build.
  ```bash
  npm run preview
  ```
