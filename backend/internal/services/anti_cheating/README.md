# Anti-Cheating Service Integration

Service này tích hợp với Python FastAPI anti-cheating service để quản lý face recognition database.

## Cấu trúc

```
internal/services/anti_cheating/
├── interface.go  # Định nghĩa interface và response models
└── client.go     # HTTP client implementation
```

## Cấu hình

Thêm vào file `.env`:

```env
ANTI_CHEATING_SERVICE_URL=http://localhost:8001
```

## Chức năng

### 1. AddPersonToDatabase

Thêm người dùng vào face recognition database khi upload avatar.

**Flow:**

1. User upload avatar qua `/api/v1/auth/update-avatar/:user_id`
2. Backend lưu file vào `uploads/profile_image_users/{user_id}_{normalized_name}/`
3. Xóa tất cả ảnh cũ trong thư mục (ghi đè)
4. Gọi API `/add_new_person` của anti-cheating service
5. Python service sẽ:
   - Trích xuất face embedding từ ảnh
   - Lưu vào face database (face_database.pkl)
   - Trả về kết quả và danh sách ảnh lỗi (nếu có)

### 2. SyncAllUsersFromBackend

Đồng bộ tất cả người dùng từ `profile_image_users` vào face database.

**Endpoint:** `/sync_all_users_from_backend`

### 3. DeletePerson

Xóa người dùng khỏi face database.

### 4. VerifyUser

Xác thực khuôn mặt trong ảnh có khớp với user ID không.

## Cách sử dụng

### Upload Avatar (tự động thêm vào face database)

```bash
POST /api/v1/auth/update-avatar/:user_id
Content-Type: multipart/form-data

Form data:
- avatar: <image file>
```

**Response thành công:**

```json
{
  "success": true,
  "message": "Avatar uploaded and added to face database successfully",
  "data": {
    "avatar": "uploads/profile_image_users/10_nguyen_minh_quang/10_nguyen_minh_quang.jpg",
    "face_db_response": {
      "message": "Tải ảnh và thêm vào database thành công.",
      "image_path": "...",
      "database_username": "10",
      "total_images": 1,
      "error_images": []
    }
  }
}
```

## Xử lý lỗi

- Nếu anti-cheating service không khả dụng, avatar vẫn được lưu nhưng không thêm vào face database
- Nếu có lỗi khi xử lý ảnh, response sẽ chứa `error_images` với chi tiết lỗi

## Lưu ý

1. **Format tên thư mục:** `{user_id}_{normalized_name}`

   - Ví dụ: `10_nguyen_minh_quang`
   - Tên được chuẩn hóa: loại bỏ dấu, chữ thường, thay space bằng underscore

2. **Ghi đè ảnh:** Mỗi lần upload mới sẽ xóa tất cả ảnh cũ trong thư mục

3. **Database update:** Đường dẫn avatar được cập nhật trong bảng `profiles` (MySQL)

4. **Face database:** Sử dụng user_id làm key trong face_database.pkl

## Anti-Cheating Service Endpoints

Backend sử dụng các endpoints sau từ Python service:

- `POST /add_new_person` - Thêm người vào face database
- `POST /sync_all_users_from_backend` - Đồng bộ tất cả users
- `POST /delete_person` - Xóa người khỏi database
- `POST /verify_user` - Xác thực khuôn mặt
