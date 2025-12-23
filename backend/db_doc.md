# Database Design – Neo Learn System

## 1. Tổng quan

Tài liệu này mô tả **đầy đủ từng bảng, từng thuộc tính, mối quan hệ và transaction** của hệ thống Neo Learn System (E-learning + Online Exam Proctoring).

Thiết kế hướng tới:

- RBAC chuẩn (Role-Based Access Control)
- Học trực tuyến + thi online có AI giám sát
- Dễ mở rộng, audit, scale production

---

## 2. Giải thích chi tiết từng bảng & thuộc tính

---

## 2.1 `users`

Lưu thông tin xác thực và định danh người dùng.

| Thuộc tính        | Kiểu      | Bắt buộc | Ý nghĩa                  |
| ----------------- | --------- | -------- | ------------------------ |
| id                | bigint    | ✔        | Khoá chính               |
| name              | varchar   | ✔        | Tên hiển thị             |
| email             | varchar   | ✔        | Email đăng nhập (unique) |
| email_verified_at | timestamp | ✘        | Thời điểm xác thực email |
| password          | varchar   | ✔        | Mật khẩu đã hash         |
| remember_token    | varchar   | ✘        | Token ghi nhớ đăng nhập  |
| created_at        | timestamp | ✔        | Thời điểm tạo            |
| updated_at        | timestamp | ✔        | Thời điểm cập nhật       |

---

## 2.2 `roles`

Định nghĩa các vai trò hệ thống.

| Thuộc tính | Kiểu      | Ý nghĩa                                           |
| ---------- | --------- | ------------------------------------------------- |
| id         | bigint    | Khoá chính                                        |
| name       | varchar   | Tên vai trò (student, instructor, admin, proctor) |
| created_at | timestamp | Audit                                             |
| updated_at | timestamp | Audit                                             |

---

## 2.3 `permissions`

Danh sách quyền hành động chi tiết.

| Thuộc tính | Kiểu      | Ý nghĩa                                  |
| ---------- | --------- | ---------------------------------------- |
| id         | bigint    | Khoá chính                               |
| name       | varchar   | Tên quyền (course.create, quiz.grade, …) |
| created_at | timestamp | Audit                                    |
| updated_at | timestamp | Audit                                    |

---

## 2.4 `role_permissions`

Gán quyền cho vai trò (Many-to-Many).

| Thuộc tính    | Kiểu      | Ý nghĩa             |
| ------------- | --------- | ------------------- |
| id            | bigint    | Khoá chính          |
| role_id       | bigint    | FK → roles.id       |
| permission_id | bigint    | FK → permissions.id |
| created_at    | timestamp | Audit               |
| updated_at    | timestamp | Audit               |

---

## 2.5 `user_roles`

Gán vai trò cho người dùng.

| Thuộc tính | Kiểu      | Ý nghĩa       |
| ---------- | --------- | ------------- |
| id         | bigint    | Khoá chính    |
| user_id    | bigint    | FK → users.id |
| role_id    | bigint    | FK → roles.id |
| created_at | timestamp | Audit         |
| updated_at | timestamp | Audit         |

---

## 2.6 `profiles`

Thông tin mở rộng của người dùng (1–1).

| Thuộc tính | Kiểu      | Ý nghĩa            |
| ---------- | --------- | ------------------ |
| id         | bigint    | Khoá chính         |
| user_id    | bigint    | FK → users.id      |
| bio        | varchar   | Giới thiệu cá nhân |
| avatar     | varchar   | URL ảnh đại diện   |
| phone      | varchar   | Số điện thoại      |
| birthDay   | timestamp | Ngày sinh          |
| created_at | timestamp | Audit              |
| updated_at | timestamp | Audit              |

---

## 2.7 `courses`

Thông tin khóa học.

| Thuộc tính  | Kiểu      | Ý nghĩa             |
| ----------- | --------- | ------------------- |
| id          | bigint    | Khoá chính          |
| name        | varchar   | Tên khóa học        |
| description | varchar   | Mô tả               |
| user_id     | bigint    | Giảng viên tạo khóa |
| created_at  | timestamp | Audit               |
| updated_at  | timestamp | Audit               |

---

## 2.8 `course_enrollments`

Ghi danh học viên vào khóa học.

| Thuộc tính | Kiểu      | Ý nghĩa            |
| ---------- | --------- | ------------------ |
| id         | bigint    | Khoá chính         |
| course_id  | bigint    | FK → courses.id    |
| user_id    | bigint    | FK → users.id      |
| created_at | timestamp | Thời điểm ghi danh |
| updated_at | timestamp | Audit              |

---

## 2.9 `lessons`

Bài học trong khóa học.

| Thuộc tính  | Kiểu      | Ý nghĩa          |
| ----------- | --------- | ---------------- |
| id          | bigint    | Khoá chính       |
| name        | varchar   | Tên bài học      |
| description | varchar   | Mô tả            |
| file_url    | varchar   | File video / PDF |
| content     | text      | Nội dung bài học |
| course_id   | bigint    | FK → courses.id  |
| user_id     | bigint    | Tác giả          |
| created_at  | timestamp | Audit            |
| updated_at  | timestamp | Audit            |

---

## 2.10 `assignments`

Bài tập trong khóa học.

| Thuộc tính  | Kiểu      | Ý nghĩa         |
| ----------- | --------- | --------------- |
| id          | bigint    | Khoá chính      |
| course_id   | bigint    | FK → courses.id |
| user_id     | bigint    | Giảng viên tạo  |
| name        | varchar   | Tên bài tập     |
| description | varchar   | Mô tả           |
| start_time  | datetime  | Thời gian mở    |
| due_time    | datetime  | Hạn nộp         |
| created_at  | timestamp | Audit           |
| updated_at  | timestamp | Audit           |

---

## 2.11 `assignment_submissions`

Bài nộp của sinh viên.

| Thuộc tính    | Kiểu      | Ý nghĩa             |
| ------------- | --------- | ------------------- |
| id            | bigint    | Khoá chính          |
| assignment_id | bigint    | FK → assignments.id |
| user_id       | bigint    | Sinh viên nộp       |
| file_path     | varchar   | File bài làm        |
| score         | integer   | Điểm                |
| feedback      | varchar   | Nhận xét            |
| status        | tinyint   | Trạng thái          |
| graded_by     | bigint    | Người chấm          |
| created_at    | timestamp | Audit               |
| updated_at    | timestamp | Audit               |

---

## 2.12 `quizzes`

Bài kiểm tra / Quiz.

| Thuộc tính              | Kiểu      | Ý nghĩa             |
| ----------------------- | --------- | ------------------- |
| id                      | bigint    | Khoá chính          |
| course_id               | bigint    | FK → courses.id     |
| user_id                 | bigint    | Người tạo           |
| name                    | varchar   | Tên quiz            |
| description             | varchar   | Mô tả               |
| start_time              | datetime  | Bắt đầu             |
| end_time                | datetime  | Kết thúc            |
| minute                  | integer   | Thời lượng          |
| enable_face_recognition | tinyint   | Nhận diện khuôn mặt |
| enable_anti_cheat       | tinyint   | Chống gian lận      |
| max_violations          | integer   | Giới hạn vi phạm    |
| allow_headphone         | tinyint   | Cho phép tai nghe   |
| max_attempts            | integer   | Số lần làm          |
| shuffle_questions       | tinyint   | Trộn câu hỏi        |
| allow_review            | tinyint   | Xem kết quả         |
| created_at              | timestamp | Audit               |
| updated_at              | timestamp | Audit               |

---

## 2.13 `quiz_questions`

Câu hỏi trong quiz.

| Thuộc tính | Kiểu      | Ý nghĩa          |
| ---------- | --------- | ---------------- |
| id         | bigint    | Khoá chính       |
| quiz_id    | bigint    | FK → quizzes.id  |
| question   | text      | Nội dung câu hỏi |
| created_at | timestamp | Audit            |
| updated_at | timestamp | Audit            |

---

## 2.14 `quiz_question_answers`

Đáp án cho câu hỏi.

| Thuộc tính       | Kiểu      | Ý nghĩa                |
| ---------------- | --------- | ---------------------- |
| id               | bigint    | Khoá chính             |
| quiz_question_id | bigint    | FK → quiz_questions.id |
| answer           | varchar   | Nội dung đáp án        |
| is_correct       | tinyint   | Đúng / Sai             |
| point            | integer   | Điểm                   |
| created_at       | timestamp | Audit                  |
| updated_at       | timestamp | Audit                  |

---

## 2.15 `user_quiz_attempts`

Mỗi lần sinh viên làm quiz.

| Thuộc tính | Kiểu      | Ý nghĩa           |
| ---------- | --------- | ----------------- |
| id         | bigint    | Khoá chính        |
| quiz_id    | bigint    | FK → quizzes.id   |
| user_id    | bigint    | Sinh viên         |
| score      | integer   | Tổng điểm         |
| created_at | timestamp | Thời điểm bắt đầu |
| updated_at | timestamp | Audit             |

---

## 2.16 `user_quiz_attempt_details`

Chi tiết từng câu trong attempt.

| Thuộc tính           | Kiểu      | Ý nghĩa                    |
| -------------------- | --------- | -------------------------- |
| id                   | bigint    | Khoá chính                 |
| quiz_question_id     | bigint    | FK → quiz_questions.id     |
| user_quiz_attempt_id | bigint    | FK → user_quiz_attempts.id |
| selected_option_id   | bigint    | Đáp án chọn                |
| score                | integer   | Điểm câu                   |
| created_at           | timestamp | Audit                      |
| updated_at           | timestamp | Audit                      |

---

## 2.17 `quiz_attempt_violations`

Log vi phạm gian lận do AI phát hiện.

| Thuộc tính           | Kiểu      | Ý nghĩa                    |
| -------------------- | --------- | -------------------------- |
| id                   | bigint    | Khoá chính                 |
| user_quiz_attempt_id | bigint    | FK → user_quiz_attempts.id |
| type                 | varchar   | Loại vi phạm               |
| level                | tinyint   | Mức độ                     |
| detected_at          | timestamp | Thời điểm                  |
| evidence_url         | varchar   | Bằng chứng                 |

---

## 3. Các mối quan hệ

### 3.1 Quan hệ User & Authentication

- **users ↔ profiles** (One-to-One)

  - Một user có một profile
  - FK: `profiles.user_id` → `users.id` (CASCADE DELETE)

- **users ↔ roles** (Many-to-Many qua `user_roles`)

  - Một user có thể có nhiều vai trò
  - Một vai trò có thể gán cho nhiều user
  - FK: `user_roles.user_id` → `users.id` (CASCADE DELETE)
  - FK: `user_roles.role_id` → `roles.id` (CASCADE DELETE)

- **roles ↔ permissions** (Many-to-Many qua `role_permissions`)
  - Một vai trò có thể có nhiều quyền
  - Một quyền có thể thuộc nhiều vai trò
  - FK: `role_permissions.role_id` → `roles.id` (CASCADE DELETE)
  - FK: `role_permissions.permission_id` → `permissions.id` (CASCADE DELETE)

### 3.2 Quan hệ Courses & Learning Content

- **users ↔ courses** (One-to-Many)

  - Một giảng viên (user) có thể tạo nhiều khóa học
  - FK: `courses.user_id` → `users.id` (SET NULL on DELETE)

- **courses ↔ users** (Many-to-Many qua `course_enrollments`)

  - Một khóa học có nhiều học viên đăng ký
  - Một học viên có thể đăng ký nhiều khóa học
  - FK: `course_enrollments.course_id` → `courses.id` (CASCADE DELETE)
  - FK: `course_enrollments.user_id` → `users.id` (CASCADE DELETE)

- **courses ↔ lessons** (One-to-Many)
  - Một khóa học có nhiều bài học
  - FK: `lessons.course_id` → `courses.id` (CASCADE DELETE)
  - FK: `lessons.user_id` → `users.id` (SET NULL on DELETE)

### 3.3 Quan hệ Assignments

- **courses ↔ assignments** (One-to-Many)

  - Một khóa học có nhiều bài tập
  - FK: `assignments.course_id` → `courses.id` (CASCADE DELETE)
  - FK: `assignments.user_id` → `users.id` (SET NULL on DELETE)

- **assignments ↔ assignment_submissions** (One-to-Many)
  - Một assignment có nhiều bài nộp từ các học viên khác nhau
  - FK: `assignment_submissions.assignment_id` → `assignments.id` (CASCADE DELETE)
  - FK: `assignment_submissions.user_id` → `users.id` (CASCADE DELETE)
  - FK: `assignment_submissions.graded_by` → `users.id` (SET NULL on DELETE)

### 3.4 Quan hệ Quizzes & Exam System

- **courses ↔ quizzes** (One-to-Many)

  - Một khóa học có nhiều quiz
  - FK: `quizzes.course_id` → `courses.id` (CASCADE DELETE)
  - FK: `quizzes.user_id` → `users.id` (SET NULL on DELETE)

- **quizzes ↔ quiz_questions** (One-to-Many)

  - Một quiz có nhiều câu hỏi
  - FK: `quiz_questions.quiz_id` → `quizzes.id` (CASCADE DELETE)

- **quiz_questions ↔ quiz_question_answers** (One-to-Many)

  - Một câu hỏi có nhiều đáp án
  - FK: `quiz_question_answers.quiz_question_id` → `quiz_questions.id` (CASCADE DELETE)

- **quizzes ↔ user_quiz_attempts** (One-to-Many)

  - Một quiz có thể được làm nhiều lần bởi nhiều user
  - FK: `user_quiz_attempts.quiz_id` → `quizzes.id` (CASCADE DELETE)
  - FK: `user_quiz_attempts.user_id` → `users.id` (CASCADE DELETE)

- **user_quiz_attempts ↔ user_quiz_attempt_details** (One-to-Many)
  - Một lần làm bài có nhiều câu trả lời chi tiết
  - FK: `user_quiz_attempt_details.user_quiz_attempt_id` → `user_quiz_attempts.id` (CASCADE DELETE)
  - FK: `user_quiz_attempt_details.quiz_question_id` → `quiz_questions.id` (CASCADE DELETE)
  - FK: `user_quiz_attempt_details.selected_option_id` → `quiz_question_answers.id` (SET NULL on DELETE)

### 3.5 Quan hệ AI Proctoring

- **user_quiz_attempts ↔ quiz_attempt_violations** (One-to-Many)
  - Một lần làm bài có thể có nhiều vi phạm được phát hiện bởi AI
  - FK: `quiz_attempt_violations.user_quiz_attempt_id` → `user_quiz_attempts.id` (CASCADE DELETE)

---

## 4. Các Transaction tiêu biểu

### 4.1 Đăng ký user mới (Registration)

```sql
BEGIN TRANSACTION;
  -- Bước 1: Tạo user
  INSERT INTO users (name, email, password) VALUES (?, ?, ?);
  SET @user_id = LAST_INSERT_ID();

  -- Bước 2: Tạo profile
  INSERT INTO profiles (user_id, bio, phone, avatar, birthDay)
  VALUES (@user_id, ?, ?, ?, ?);

  -- Bước 3: Gán role mặc định (student)
  INSERT INTO user_roles (user_id, role_id)
  VALUES (@user_id, (SELECT id FROM roles WHERE name = 'student'));
COMMIT;
```

**Rollback nếu:**

- Email đã tồn tại (UNIQUE constraint)
- Role không tồn tại

### 4.2 Ghi danh khóa học (Course Enrollment)

```sql
BEGIN TRANSACTION;
  -- Kiểm tra user đã enroll chưa
  SELECT COUNT(*) FROM course_enrollments
  WHERE course_id = ? AND user_id = ?;

  -- Nếu chưa, thêm enrollment
  INSERT INTO course_enrollments (course_id, user_id)
  VALUES (?, ?);
COMMIT;
```

**Rollback nếu:**

- Khóa học không tồn tại
- User đã đăng ký (UNIQUE constraint)

### 4.3 Tạo Quiz với câu hỏi và đáp án

```sql
BEGIN TRANSACTION;
  -- Bước 1: Tạo quiz
  INSERT INTO quizzes (course_id, user_id, name, description, start_time, end_time, minute,
                       enable_face_recognition, enable_anti_cheat, max_violations)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  SET @quiz_id = LAST_INSERT_ID();

  -- Bước 2: Thêm câu hỏi
  INSERT INTO quiz_questions (quiz_id, question) VALUES (@quiz_id, ?);
  SET @question_id = LAST_INSERT_ID();

  -- Bước 3: Thêm các đáp án cho câu hỏi
  INSERT INTO quiz_question_answers (quiz_question_id, answer, is_correct, point)
  VALUES (@question_id, ?, 0, 0),
         (@question_id, ?, 1, 5),  -- Đáp án đúng
         (@question_id, ?, 0, 0),
         (@question_id, ?, 0, 0);

  -- Lặp lại bước 2-3 cho các câu hỏi khác...
COMMIT;
```

**Rollback nếu:**

- Course không tồn tại
- User không có quyền tạo quiz
- Thời gian không hợp lệ

### 4.4 Làm Quiz (Quiz Attempt với tracking vi phạm)

```sql
BEGIN TRANSACTION;
  -- Bước 1: Kiểm tra điều kiện
  SELECT COUNT(*) FROM user_quiz_attempts
  WHERE quiz_id = ? AND user_id = ?;
  -- Nếu > max_attempts → ROLLBACK

  -- Bước 2: Tạo attempt
  INSERT INTO user_quiz_attempts (quiz_id, user_id, score)
  VALUES (?, ?, 0);
  SET @attempt_id = LAST_INSERT_ID();

  -- Bước 3: Lưu câu trả lời từng câu
  INSERT INTO user_quiz_attempt_details
    (user_quiz_attempt_id, quiz_question_id, selected_option_id, score)
  VALUES (@attempt_id, ?, ?, ?);
  -- Lặp lại cho mỗi câu...

  -- Bước 4: Tính tổng điểm
  UPDATE user_quiz_attempts
  SET score = (SELECT SUM(score) FROM user_quiz_attempt_details
               WHERE user_quiz_attempt_id = @attempt_id)
  WHERE id = @attempt_id;

  -- Bước 5: Log vi phạm nếu AI phát hiện
  -- (Được gọi từ service riêng khi có sự kiện)
  INSERT INTO quiz_attempt_violations
    (user_quiz_attempt_id, type, level, detected_at, evidence_url)
  VALUES (@attempt_id, 'LOOK_AWAY', 2, NOW(), ?);
COMMIT;
```

**Rollback nếu:**

- Vượt quá số lần làm cho phép
- Quiz chưa bắt đầu hoặc đã kết thúc
- Câu hỏi hoặc đáp án không tồn tại

### 4.5 Nộp Assignment (Assignment Submission)

```sql
BEGIN TRANSACTION;
  -- Kiểm tra đã nộp chưa
  SELECT id FROM assignment_submissions
  WHERE assignment_id = ? AND user_id = ?;

  -- Nếu chưa nộp, tạo submission mới
  INSERT INTO assignment_submissions
    (assignment_id, user_id, file_path, status)
  VALUES (?, ?, ?, 0);  -- status 0 = pending

  -- Nếu đã nộp, cập nhật
  UPDATE assignment_submissions
  SET file_path = ?, updated_at = NOW()
  WHERE assignment_id = ? AND user_id = ?;
COMMIT;
```

**Rollback nếu:**

- Assignment không tồn tại
- Quá hạn nộp (due_time)
- File không hợp lệ

### 4.6 Chấm điểm Assignment

```sql
BEGIN TRANSACTION;
  -- Cập nhật điểm và feedback
  UPDATE assignment_submissions
  SET score = ?,
      feedback = ?,
      status = 1,  -- 1 = graded
      graded_by = ?,
      updated_at = NOW()
  WHERE id = ?;

  -- Log activity (nếu có bảng audit)
  -- INSERT INTO activity_logs...
COMMIT;
```

**Rollback nếu:**

- Submission không tồn tại
- User không có quyền chấm (không phải instructor hoặc admin)

### 4.7 Gán quyền cho Role (Role Permission Assignment)

```sql
BEGIN TRANSACTION;
  -- Kiểm tra role và permission tồn tại
  SELECT id FROM roles WHERE id = ?;
  SELECT id FROM permissions WHERE id = ?;

  -- Gán quyền
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES (?, ?);
COMMIT;
```

**Rollback nếu:**

- Role hoặc Permission không tồn tại
- Đã gán trước đó (UNIQUE constraint)

---

## 5. Kết luận

Thiết kế database đạt chuẩn **production-ready**, hỗ trợ học tập, thi online và AI proctoring ở quy mô lớn.
