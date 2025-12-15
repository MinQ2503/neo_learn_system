# Tài liệu Dự án Frontend (React UI Main)

## 1. Cây thư mục

Dưới đây là cấu trúc thư mục của dự án `react_ui_main` và giải thích chức năng của từng thành phần:

```
react_ui_main/
├── components/          # Chứa các thành phần UI tái sử dụng (Buttons, Cards, Modals, Layouts...)
├── pages/               # Chứa các trang giao diện chính của ứng dụng
│   ├── student/         # Các trang dành riêng cho vai trò Học sinh (Danh sách lớp, Làm bài thi...)
│   ├── teacher/         # Các trang dành riêng cho vai trò Giáo viên (Quản lý lớp, Ngân hàng câu hỏi...)
│   ├── AdminDashboard.tsx # Trang bảng điều khiển cho Admin
│   ├── ExamRoom.tsx     # Trang giao diện làm bài thi
│   ├── Login.tsx        # Trang đăng nhập
│   └── ...              # Các trang Dashboard chính
├── services/            # Chứa logic xử lý dữ liệu và gọi API
│   ├── api/             # Các service gọi API cụ thể (class, exam, student...)
│   ├── mockData.ts      # Dữ liệu giả lập (mock data) dùng để test giao diện
│   └── mockService.ts   # Service xử lý logic với dữ liệu giả lập
├── App.tsx              # Component gốc, chứa cấu hình Routing và logic phân quyền (Auth)
├── index.tsx            # Điểm khởi chạy của ứng dụng React (Entry point)
├── index.html           # File HTML chính
├── types.ts             # Định nghĩa các kiểu dữ liệu TypeScript (Interfaces, Types)
├── vite.config.ts       # Cấu hình công cụ build Vite
└── package.json         # Khai báo dependencies và các scripts chạy dự án
```

## 2. Luồng chạy của Project

Luồng khởi chạy và hoạt động của ứng dụng diễn ra như sau:

1.  **Khởi động (Entry Point):**

    - Trình duyệt tải file `index.html`.
    - `index.html` gọi script `index.tsx`.
    - `index.tsx` tìm thẻ `div` có id là `root` và render component `<App />` vào đó.

2.  **Khởi tạo & Routing (App.tsx):**

    - Component `App` được khởi tạo.
    - Nó kiểm tra trạng thái đăng nhập (User Role) từ storage (thông qua `getRoleFromStorage` trong `services/mockService`).
    - **Chưa đăng nhập:** Ứng dụng hiển thị trang `Login` (`/`).
    - **Đã đăng nhập:** Dựa vào vai trò (Student, Teacher, Admin), ứng dụng điều hướng (Navigate) người dùng đến Dashboard tương ứng (ví dụ: `/student`, `/teacher`).

3.  **Điều hướng (Navigation):**
    - Ứng dụng sử dụng `react-router-dom` (HashRouter) để quản lý việc chuyển trang mà không cần tải lại trang.
    - Các Route được định nghĩa trong `App.tsx` sẽ map URL với các Component trong thư mục `pages/`.

## 3. Cách chạy và khởi động

Dự án sử dụng **Vite** làm công cụ build và phát triển.

### Yêu cầu:

- Node.js đã được cài đặt trên máy.

### Các bước thực hiện:

1.  **Mở terminal** tại thư mục `frontend/react_ui_main`.

2.  **Cài đặt các thư viện (Dependencies):**
    Chạy lệnh sau để tải các gói cần thiết được khai báo trong `package.json`:

    ```bash
    npm install
    ```

3.  **Chạy dự án ở môi trường Development:**
    Lệnh này sẽ khởi động server local (thường là http://localhost:5173):

    ```bash
    npm run dev
    ```

4.  **Build dự án (Production):**
    Để đóng gói ứng dụng cho môi trường production:
    ```bash
    npm run build
    ```
