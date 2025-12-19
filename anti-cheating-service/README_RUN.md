# Cách chạy Anti-Cheating Service

## Cách 1: Dùng script (Khuyến nghị - Windows)

```bash
# Từ thư mục anti-cheating-service
.\run_server.bat
```

## Cách 2: Dùng uvicorn trực tiếp

```bash
# Activate venv (nếu có)
.\.venv\Scripts\activate

# Di chuyển vào thư mục API
cd face-recognition\api

# Chạy server
uvicorn fastapi_cheat:app --host 127.0.0.1 --port 8000 --reload
```

## Cách 3: Dùng Python script

```bash
# Activate venv (nếu có)
.\.venv\Scripts\activate

# Chạy script
python run_server.py
```

## Kiểm tra server đã chạy

Mở browser và truy cập:
- **API Docs**: http://localhost:8000/docs
- **Home**: http://localhost:8000/

## Troubleshooting

### Port 8000 đã được sử dụng

```bash
# Tìm process đang dùng port 8000
netstat -ano | findstr :8000

# Kill process (thay <PID> bằng số PID từ lệnh trên)
taskkill /PID <PID> /F
```

Hoặc đổi port:
```bash
uvicorn fastapi_cheat:app --host 127.0.0.1 --port 8001 --reload
```

### Lỗi import module

```bash
# Đảm bảo đang ở đúng thư mục
cd face-recognition\api

# Kiểm tra Python path
python -c "import sys; print(sys.path)"
```

### Lỗi thiếu dependencies

```bash
# Cài đặt lại dependencies
pip install -r requirements.txt

# Hoặc cài đặt từng package nếu cần
pip install httpx fastapi uvicorn python-multipart aiofiles
```

### Lỗi ModuleNotFoundError

Nếu gặp lỗi `ModuleNotFoundError: No module named 'httpx'` hoặc module khác:

```bash
# Activate venv
.\.venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt

# Hoặc cài đặt cụ thể module bị thiếu
pip install httpx
```

## Lưu ý

- Server sẽ chạy trên `127.0.0.1:8000` (localhost)
- Nếu cần truy cập từ máy khác, đổi `--host 127.0.0.1` thành `--host 0.0.0.0`
- `--reload` để tự động reload khi code thay đổi (chỉ dùng cho development)

