Khởi động Backend

- Chuyển đến thư mục backend:
  `cd backend`
- Cài đặt dependencies:
  `go mod download`
- Chạy server:
  `cd cmd`
  `go run .`

Khởi động Database

- Cài đặt và chạy MySQL
- Tạo database `neo_learn_system_main`
- Chạy các script trong thư mục `backend/neo_learn_system_main.sql` để tạo bảng và dữ liệu mẫu

Khởi động Frontend

- Chuyển đến thư mục frontend:
  `cd frontend`
- Cài đặt dependencies:
  `npm install`
- Chạy ứng dụng:
  `npm run dev`
