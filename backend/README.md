# Backend - Neo Learn System

## 📁 Cấu trúc thư mục

```
backend/
├── cmd/
│   └── api/
│       └── main.go              # Entry point
├── internal/
│   ├── config/
│   │   └── config.go            # Configuration management
│   ├── database/
│   │   └── database.go          # Database connection & schema
│   ├── models/
│   │   └── user.go              # Data models
│   ├── repository/
│   │   └── user_repository.go   # Database operations
│   ├── services/
│   │   └── auth_service.go      # Business logic
│   ├── handlers/
│   │   └── auth_handler.go      # HTTP handlers
│   ├── middleware/
│   │   └── auth.go              # JWT middleware
│   └── utils/
│       ├── jwt.go               # JWT utilities
│       └── password.go          # Password hashing
├── .env.example
├── go.mod
└── README.md
```

## 🚀 Khởi động

### 1. Cài đặt dependencies

```bash
go mod download
go mod tidy
```

### 2. Setup database

```bash
# Tạo database PostgreSQL
createdb neo_learn_db

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE neo_learn_db;
```

### 3. Cấu hình môi trường

```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn
```

### 4. Chạy server

```bash
go run cmd/api/main.go
```

Server sẽ chạy tại: **http://localhost:8080**

## 📚 API Endpoints

### Authentication

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "nguyenvana@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "roles": ["student"]
    }
  }
}
```

#### Get Profile (Protected)

```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

#### Change Password (Protected)

```http
POST /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "password123",
  "new_password": "newpassword123"
}
```

#### Logout (Protected)

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Tables

- **users**: User accounts
- **roles**: User roles (admin, teacher, student)
- **permissions**: System permissions
- **profiles**: User profiles
- **user_roles**: User-Role relationships
- **role_permissions**: Role-Permission relationships

### Default Roles

- `admin`: Full system access
- `teacher`: Manage classes and students
- `student`: Limited access

### Default Permissions

- `manage_users`: User management
- `manage_students`: Student management
- `manage_attendance`: Attendance management
- `view_reports`: View reports

## 🔐 Security

### JWT Authentication

- Token expiration: 24 hours
- Algorithm: HS256
- Secret: Configurable via JWT_SECRET

### Password Hashing

- Algorithm: bcrypt
- Cost: Default (10)

### Middleware

- `AuthMiddleware()`: Validates JWT token
- `RoleMiddleware(roles...)`: Checks user roles

## 🧪 Testing

### Test Register

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Endpoint

```bash
curl -X GET http://localhost:8080/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📦 Dependencies

```go
github.com/gin-gonic/gin              // Web framework
github.com/gin-contrib/cors           // CORS middleware
github.com/lib/pq                     // PostgreSQL driver
github.com/golang-jwt/jwt/v5          // JWT implementation
github.com/joho/godotenv              // .env file loader
golang.org/x/crypto                   // Bcrypt password hashing
```

## 🔧 Configuration

### Environment Variables

| Variable    | Description              | Default      |
| ----------- | ------------------------ | ------------ |
| PORT        | Server port              | 8080         |
| GIN_MODE    | Gin mode (debug/release) | debug        |
| DB_HOST     | Database host            | localhost    |
| DB_PORT     | Database port            | 5432         |
| DB_USER     | Database user            | postgres     |
| DB_PASSWORD | Database password        | postgres     |
| DB_NAME     | Database name            | neo_learn_db |
| DB_SSLMODE  | SSL mode                 | disable      |
| JWT_SECRET  | JWT secret key           | (required)   |

## 🐛 Troubleshooting

### Database connection error

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check database exists
psql -U postgres -l
```

### Port already in use

```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process
taskkill /PID <PID> /F
```

## 📝 Next Steps

1. ✅ Authentication system
2. ⏳ Student management
3. ⏳ Attendance system
4. ⏳ Face recognition integration
5. ⏳ Reports and analytics

## 🎯 Architecture

```
Client Request
     ↓
 Gin Router
     ↓
 Middleware (Auth, CORS)
     ↓
  Handler
     ↓
  Service (Business Logic)
     ↓
 Repository (Database)
     ↓
  Database
```

## 📞 Support

For issues or questions, check:

- Server logs in terminal
- Database connection
- JWT token format
- Request body format
