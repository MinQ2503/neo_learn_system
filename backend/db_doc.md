# Database Design – Neo Learn System

## 1. Tổng quan

Tài liệu này mô tả **đầy đủ từng bảng, từng thuộc tính, mối quan hệ và transaction** của hệ thống Neo Learn System (E-learning + Online Exam Proctoring).

Thiết kế hướng tới:

* RBAC chuẩn (Role-Based Access Control)
* Học trực tuyến + thi online có AI giám sát
* Dễ mở rộng, audit, scale production

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

* Users ↔ Roles (Many-to-Many)
* Roles ↔ Permissions (Many-to-Many)
* Courses ↔ Users (Instructor / Student)
* Quiz / Assignment ↔ Attempts / Submissions
* Quiz ↔ AI Proctoring Violations

---

## 4. Các Transaction tiêu biểu

### 4.1 Tạo user

BEGIN → users → profiles → user_roles → COMMIT

### 4.2 Enroll khóa học

BEGIN → course_enrollments → COMMIT

### 4.3 Làm quiz

BEGIN → user_quiz_attempts → details → violations → COMMIT

### 4.4 Chấm điểm

BEGIN → update score → COMMIT

---

## 5. Kết luận

Thiết kế database đạt chuẩn **production-ready**, hỗ trợ học tập, thi online và AI proctoring ở quy mô lớn.
