CREATE DATABASE neo_learn_system_db_main;
USE neo_learn_system_db_main;

CREATE TABLE `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `email_verified_at` TIMESTAMP NULL,
  `password` VARCHAR(255) NOT NULL,
  `remember_token` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `roles` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(255) UNIQUE NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `permissions` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(255) UNIQUE NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
 `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `role_permissions` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `profiles` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNIQUE NOT NULL,
  `bio` varchar(255),
  `avatar` varchar(255),
  `phone` varchar(255),
  `birthDay` timestamp,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `user_roles` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `courses` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255),
  `user_id` bigint,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `course_enrollments` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `lessons` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255),
  `file_url` varchar(255),
  `content` text,
  `course_id` bigint NOT NULL,
  `user_id` bigint,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `assignments` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `user_id` bigint,
  `name` varchar(255) NOT NULL,
  `description` varchar(255),
  `start_time` datetime,
  `due_time` datetime,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `assignment_submissions` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `file_path` varchar(255),
  `score` integer,
  `feedback` varchar(255),
  `status` tinyint NOT NULL DEFAULT 0,
  `graded_by` bigint,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `quizzes` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `user_id` bigint,
  `name` varchar(255) NOT NULL,
  `description` varchar(255),
  `start_time` datetime,
  `end_time` datetime,
  `minute` integer,
  `enable_face_recognition` tinyint NOT NULL DEFAULT 0,
  `enable_anti_cheat` tinyint NOT NULL DEFAULT 0,
  `max_violations` integer NOT NULL DEFAULT 3,
  `allow_headphone` tinyint NOT NULL DEFAULT 0,
  `max_attempts` integer NOT NULL DEFAULT 1,
  `shuffle_questions` tinyint NOT NULL DEFAULT 1,
  `allow_review` tinyint NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `quiz_attempt_violations` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_quiz_attempt_id` bigint NOT NULL,
  `type` varchar(255) NOT NULL,
  `level` tinyint NOT NULL DEFAULT 1,
  `detected_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `evidence_url` varchar(255)
);

CREATE TABLE `quiz_questions` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint,
  `question` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `quiz_question_answers` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `quiz_question_id` bigint NOT NULL,
  `answer` varchar(255) NOT NULL,
  `is_correct` tinyint NOT NULL DEFAULT 0,
  `point` integer NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `user_quiz_attempts` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `score` integer,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `user_quiz_attempt_details` (
  `id` bigint UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `quiz_question_id` bigint NOT NULL,
  `user_quiz_attempt_id` bigint NOT NULL,
  `selected_option_id` bigint,
  `score` integer,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP);

CREATE UNIQUE INDEX `role_permissions_unique` ON `role_permissions` (`role_id`, `permission_id`);

CREATE UNIQUE INDEX `user_roles_unique` ON `user_roles` (`user_id`, `role_id`);

CREATE UNIQUE INDEX `course_enrollments_index_0` ON `course_enrollments` (`course_id`, `user_id`);

CREATE INDEX `idx_course_enrollments_user_id` ON `course_enrollments` (`user_id`);

CREATE INDEX `idx_assignments_course_id` ON `assignments` (`course_id`);

CREATE INDEX `idx_assignments_user_id` ON `assignments` (`user_id`);

CREATE UNIQUE INDEX `assignment_submissions_index_0` ON `assignment_submissions` (`assignment_id`, `user_id`);

CREATE INDEX `idx_assignment_submissions_user_id` ON `assignment_submissions` (`user_id`);

CREATE INDEX `idx_assignment_submissions_graded_by` ON `assignment_submissions` (`graded_by`);

CREATE INDEX `idx_quizzes_course_id` ON `quizzes` (`course_id`);

CREATE INDEX `idx_quizzes_user_id` ON `quizzes` (`user_id`);

CREATE INDEX `idx_quiz_questions_quiz_id` ON `quiz_questions` (`quiz_id`);

CREATE INDEX `idx_quiz_question_answers_qid` ON `quiz_question_answers` (`quiz_question_id`);

CREATE INDEX `user_quiz_attempts_index_0` ON `user_quiz_attempts` (`quiz_id`, `user_id`);

CREATE INDEX `idx_user_quiz_attempts_user_id` ON `user_quiz_attempts` (`user_id`);

CREATE INDEX `idx_uqatd_attempt_id` ON `user_quiz_attempt_details` (`user_quiz_attempt_id`);

CREATE INDEX `idx_uqatd_selected_option_id` ON `user_quiz_attempt_details` (`selected_option_id`);

ALTER TABLE `users` COMMENT = 'Lưu thông tin tài khoản người dùng trong hệ thống (student, instructor, admin).';

ALTER TABLE `roles` COMMENT = 'Quy định các loại vai trò: student, instructor, admin, proctor,…';

ALTER TABLE `permissions` COMMENT = 'Lưu danh sách quyền cụ thể: "course.create", "quiz.grade", "user.manage",…';

ALTER TABLE `role_permissions` COMMENT = 'Gán quyền → vai trò. Ví dụ: instructor có quyền tạo khóa học.';

ALTER TABLE `profiles` COMMENT = 'Profile cá nhân; nhiều trường cho phép NULL';

ALTER TABLE `user_roles` COMMENT = 'Gán vai trò → người dùng.';

ALTER TABLE `courses` COMMENT = 'Khóa học (một giảng viên có thể tạo nhiều khóa)';

ALTER TABLE `course_enrollments` COMMENT = 'Ghi danh học viên vào khóa học';

ALTER TABLE `lessons` COMMENT = 'Bài học thuộc một khóa học.';

ALTER TABLE `assignments` COMMENT = 'Bài tập trong một khóa học (do instructor tạo).';

ALTER TABLE `assignment_submissions` COMMENT = 'Bài nộp của sinh viên cho assignment.';

ALTER TABLE `quizzes` COMMENT = 'Bài kiểm tra / Quiz';

ALTER TABLE `quiz_attempt_violations` COMMENT = 'Ghi log từng lần hệ thống AI phát hiện dấu hiệu gian lận trong lúc làm quiz.';

ALTER TABLE `quiz_questions` COMMENT = 'Câu hỏi';

ALTER TABLE `quiz_question_answers` COMMENT = 'Lựa chọn';

ALTER TABLE `user_quiz_attempts` COMMENT = 'Lưu thông tin mỗi lần làm quiz của sinh viên.';

ALTER TABLE `user_quiz_attempt_details` COMMENT = 'Chi tiết từng câu trong một lần làm bài.';

ALTER TABLE `profiles` ADD CONSTRAINT `fk_profiles_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `user_roles` ADD CONSTRAINT `fk_user_roles_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `user_roles` ADD CONSTRAINT `fk_user_roles_role_id_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `role_permissions` ADD CONSTRAINT `fk_role_permissions_role_id_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `role_permissions` ADD CONSTRAINT `fk_role_permissions_permission_id_permissions` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `courses` ADD CONSTRAINT `fk_courses_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `course_enrollments` ADD CONSTRAINT `fk_course_enrollments_course_id_courses` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `course_enrollments` ADD CONSTRAINT `fk_course_enrollments_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `lessons` ADD CONSTRAINT `fk_lessons_course_id_courses` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `lessons` ADD CONSTRAINT `fk_lessons_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `assignments` ADD CONSTRAINT `fk_assignments_course_id_courses` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `assignments` ADD CONSTRAINT `fk_assignments_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `assignment_submissions` ADD CONSTRAINT `fk_assignment_submissions_assignment_id_assignments` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `assignment_submissions` ADD CONSTRAINT `fk_assignment_submissions_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `assignment_submissions` ADD CONSTRAINT `fk_assignment_submissions_graded_by_users` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `quizzes` ADD CONSTRAINT `fk_quizzes_course_id_courses` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `quizzes` ADD CONSTRAINT `fk_quizzes_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `quiz_questions` ADD CONSTRAINT `fk_quiz_questions_quiz_id_quizzes` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `quiz_question_answers` ADD CONSTRAINT `fk_quiz_question_answers_quiz_question_id_quiz_questions` FOREIGN KEY (`quiz_question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `user_quiz_attempts` ADD CONSTRAINT `fk_user_quiz_attempts_quiz_id_quizzes` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `user_quiz_attempts` ADD CONSTRAINT `fk_user_quiz_attempts_user_id_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `user_quiz_attempt_details` ADD CONSTRAINT `fk_user_quiz_attempt_details_user_quiz_attempt_id_user_quiz_attempts` FOREIGN KEY (`user_quiz_attempt_id`) REFERENCES `user_quiz_attempts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `user_quiz_attempt_details` ADD CONSTRAINT `fk_user_quiz_attempt_details_quiz_question_id_quiz_questions` FOREIGN KEY (`quiz_question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `user_quiz_attempt_details` ADD CONSTRAINT `fk_uqad_attempt` FOREIGN KEY (`selected_option_id`) REFERENCES `quiz_question_answers` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `quiz_attempt_violations` ADD CONSTRAINT `fk_quiz_attempt_violations_attempt_id` FOREIGN KEY (`user_quiz_attempt_id`) REFERENCES `user_quiz_attempts` (`id`);

# Kiem tra tai khoan
SELECT user, host FROM mysql.user;
GRANT ALL PRIVILEGES ON neo_learn_system_db_main.* TO 'neo_user'@'localhost';
FLUSH PRIVILEGES;

# DATA
-- Tắt kiểm tra khóa ngoại tạm thời để tránh lỗi thứ tự insert
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tạo dữ liệu Users (Mật khẩu mẫu là hash của 'password123')
INSERT INTO `users` (`id`, `name`, `email`, `password`, `email_verified_at`, `created_at`, `updated_at`) VALUES
(1, 'Admin System', 'admin@neolearn.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW(), NOW()),
(2, 'Nguyễn Văn Giảng (Instructor)', 'giangvien@neolearn.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW(), NOW()),
(3, 'Trần Thị Học (Student)', 'hocvien@neolearn.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW(), NOW()),
(4, 'Lê Văn B (Student)', 'hocvienb@neolearn.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW(), NOW());

-- 2. Tạo dữ liệu Roles
INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'admin'),
(2, 'instructor'),
(3, 'student');

-- 3. Tạo dữ liệu Permissions
INSERT INTO `permissions` (`id`, `name`) VALUES
(1, 'course.create'),
(2, 'course.update'),
(3, 'course.delete'),
(4, 'course.view'),
(5, 'quiz.attempt'),
(6, 'user.manage');

-- 4. Gán Permissions cho Roles (Role Permissions)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 6), -- Admin quản lý user
(1, 1), -- Admin tạo khóa học
(2, 1), -- Instructor tạo khóa học
(2, 2), -- Instructor sửa khóa học
(3, 4), -- Student xem khóa học
(3, 5); -- Student làm bài quiz

-- 5. Gán Roles cho Users (User Roles)
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1), -- Admin System là Admin
(2, 2), -- Nguyễn Văn Giảng là Instructor
(3, 3), -- Trần Thị Học là Student
(4, 3); -- Lê Văn B là Student

-- 6. Tạo Profiles
INSERT INTO `profiles` (`user_id`, `bio`, `phone`, `avatar`, `birthDay`) VALUES
(1, 'Quản trị viên hệ thống', '0901234567', 'admin_avatar.jpg', '1990-01-01'),
(2, 'Giảng viên chuyên ngành CNTT', '0912345678', 'teacher_avatar.jpg', '1985-05-15'),
(3, 'Sinh viên năm 3', '0987654321', 'student_a.jpg', '2003-10-20'),
(4, 'Đam mê lập trình', '0987654322', 'student_b.jpg', '2004-02-02');

-- 7. Tạo Courses (Do user_id 2 - Giảng viên tạo)
INSERT INTO `courses` (`id`, `name`, `description`, `user_id`) VALUES
(1, 'Lập trình Web Fullstack với Laravel', 'Khóa học từ cơ bản đến nâng cao về Laravel và VueJS', 2),
(2, 'Cấu trúc dữ liệu và giải thuật', 'Nền tảng tư duy lập trình', 2);

-- 8. Tạo Course Enrollments (Học viên đăng ký khóa học)
INSERT INTO `course_enrollments` (`course_id`, `user_id`) VALUES
(1, 3), -- Học viên A học Laravel
(1, 4), -- Học viên B học Laravel
(2, 3); -- Học viên A học Giải thuật

-- 9. Tạo Lessons (Bài học)
INSERT INTO `lessons` (`id`, `name`, `description`, `file_url`, `content`, `course_id`, `user_id`) VALUES
(1, 'Giới thiệu về PHP', 'Bài mở đầu', 'video_intro.mp4', 'Nội dung bài học về cài đặt môi trường...', 1, 2),
(2, 'Route và Controller', 'Kiến thức cốt lõi', 'video_route.mp4', 'Cách định nghĩa route trong web.php...', 1, 2),
(3, 'Stack và Queue', 'Cấu trúc dữ liệu ngăn xếp', 'video_stack.mp4', 'Nguyên lý LIFO và FIFO...', 2, 2);

-- 10. Tạo Assignments (Bài tập tự luận)
INSERT INTO `assignments` (`id`, `course_id`, `user_id`, `name`, `description`, `start_time`, `due_time`) VALUES
(1, 1, 2, 'Xây dựng trang đăng nhập', 'Sử dụng Blade template để tạo form', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));

-- 11. Tạo Submissions (Nộp bài tập)
INSERT INTO `assignment_submissions` (`id`, `assignment_id`, `user_id`, `file_path`, `score`, `feedback`, `status`, `graded_by`) VALUES
(1, 1, 3, 'uploads/student_a/login_form.zip', 85, 'Giao diện tốt, code sạch', 1, 2); -- Đã chấm

-- 12. Tạo Quizzes (Bài kiểm tra trắc nghiệm)
INSERT INTO `quizzes` (`id`, `course_id`, `user_id`, `name`, `description`, `start_time`, `end_time`, `minute`, `enable_face_recognition`, `enable_anti_cheat`, `max_attempts`) VALUES
(1, 1, 2, 'Kiểm tra trắc nghiệm PHP cơ bản', 'Bài kiểm tra 15 phút', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 15, 1, 1, 2);

-- 13. Tạo Quiz Questions (Câu hỏi)
INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question`) VALUES
(1, 1, 'PHP là viết tắt của gì?'),
(2, 1, 'Biến trong PHP bắt đầu bằng ký tự nào?');

-- 14. Tạo Quiz Question Answers (Đáp án)
INSERT INTO `quiz_question_answers` (`id`, `quiz_question_id`, `answer`, `is_correct`, `point`) VALUES
-- Câu 1
(1, 1, 'Personal Home Page', 0, 0),
(2, 1, 'Hypertext Preprocessor', 1, 5), -- Đúng
(3, 1, 'Private Home Page', 0, 0),
-- Câu 2
(4, 2, '$', 1, 5), -- Đúng
(5, 2, '@', 0, 0),
(6, 2, '#', 0, 0);

-- 15. Tạo User Quiz Attempts (Lần làm bài của sinh viên)
INSERT INTO `user_quiz_attempts` (`id`, `quiz_id`, `user_id`, `score`, `created_at`) VALUES
(1, 1, 3, 10, NOW()); -- Học viên A làm bài được 10 điểm

-- 16. Tạo User Quiz Attempt Details (Chi tiết chọn đáp án)
INSERT INTO `user_quiz_attempt_details` (`id`, `user_quiz_attempt_id`, `quiz_question_id`, `selected_option_id`, `score`) VALUES
(1, 1, 1, 2, 5), -- Chọn đúng câu 1
(2, 1, 2, 4, 5); -- Chọn đúng câu 2

-- 17. Tạo Quiz Attempt Violations (Ghi nhận gian lận)
-- Giả sử trong lần làm bài (attempt id 1), hệ thống phát hiện sinh viên nhìn ra ngoài
INSERT INTO `quiz_attempt_violations` (`user_quiz_attempt_id`, `type`, `level`, `evidence_url`) VALUES
(1, 'LOOK_AWAY', 2, 'evidence/violation_1.jpg'),
(1, 'TAB_SWITCH', 1, NULL);

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;