# Neo Learn System - Yêu cầu Chức năng & Phi chức năng

## 📋 Tổng quan

Tài liệu này mô tả chi tiết các yêu cầu chức năng (Functional Requirements) và yêu cầu phi chức năng (Non-Functional Requirements) của hệ thống Neo Learn System - một nền tảng học tập trực tuyến với tính năng giám sát chống gian lận thi cử.

---

## 🎯 I. YÊU CẦU CHỨC NĂNG (Functional Requirements)

### 📌 A. CHỨC NĂNG CHUNG (Common Features)

#### FR-COMMON-01: Xác thực & Quản lý phiên

**Tên chức năng:** Đăng nhập hệ thống

**Mô tả chức năng:**

- Người dùng có thể đăng nhập bằng email và mật khẩu
- Hỗ trợ 3 loại tài khoản: Admin, Teacher, Student
- Tài khoản admin mặc định: username "admin", password "Demo@1234"
- Tự động redirect về dashboard tương ứng theo role sau khi đăng nhập thành công

**Acceptance Criteria:**

- ✅ Hiển thị form đăng nhập với 2 trường: tài khoản và mật khẩu
- ✅ Validate dữ liệu đầu vào (không được để trống)
- ✅ Hiển thị thông báo lỗi khi đăng nhập thất bại
- ✅ Chuyển hướng đến trang dashboard theo role sau khi thành công
- ✅ Lưu session vào localStorage để duy trì phiên đăng nhập

---

#### FR-COMMON-02: Đăng ký tài khoản

**Tên chức năng:** Đăng ký tài khoản mới

**Mô tả chức năng:**

- Người dùng mới có thể tạo tài khoản học sinh hoặc giáo viên
- Thu thập thông tin: tên, email, mật khẩu, xác nhận mật khẩu, role
- Validate email format và độ mạnh mật khẩu
- Tự động chuyển đến trang đăng nhập sau khi đăng ký thành công

**Acceptance Criteria:**

- ✅ Form đăng ký với các trường: name, email, password, confirm password, role
- ✅ Validate email format (abc@example.com)
- ✅ Validate password strength (ít nhất 8 ký tự)
- ✅ Kiểm tra password và confirm password khớp nhau
- ✅ Hiển thị thông báo thành công và redirect về login

---

#### FR-COMMON-03: Quản lý Profile cá nhân

**Tên chức năng:** Chỉnh sửa thông tin cá nhân

**Mô tả chức năng:**

- Người dùng có thể cập nhật thông tin cá nhân:
  - Họ và tên
  - Ảnh đại diện (avatar)
  - Số điện thoại
  - Ngày sinh
  - Giới thiệu bản thân (bio)
- Upload ảnh từ máy tính và preview trước khi lưu
- Avatar được sử dụng để xác thực khuôn mặt trong bài thi

**Acceptance Criteria:**

- ✅ Form hiển thị thông tin hiện tại của user
- ✅ Cho phép upload ảnh avatar từ local (jpg, png)
- ✅ Preview ảnh ngay sau khi chọn
- ✅ Lưu thông tin và hiển thị thông báo thành công
- ✅ Cập nhật lại dữ liệu trong localStorage

---

#### FR-COMMON-04: Đổi mật khẩu

**Tên chức năng:** Thay đổi mật khẩu

**Mô tả chức năng:**

- Người dùng có thể thay đổi mật khẩu đăng nhập
- Yêu cầu nhập mật khẩu cũ để xác thực
- Nhập mật khẩu mới và xác nhận mật khẩu mới
- Validate độ mạnh mật khẩu mới

**Acceptance Criteria:**

- ✅ Form gồm 3 trường: mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới
- ✅ Validate mật khẩu cũ đúng
- ✅ Validate mật khẩu mới đủ mạnh (tối thiểu 8 ký tự)
- ✅ Xác nhận mật khẩu mới khớp
- ✅ Cập nhật mật khẩu và hiển thị thông báo thành công

---

#### FR-COMMON-05: Đăng xuất

**Tên chức năng:** Logout khỏi hệ thống

**Mô tả chức năng:**

- Người dùng có thể đăng xuất khỏi hệ thống
- Xóa session trong localStorage
- Redirect về trang đăng nhập

**Acceptance Criteria:**

- ✅ Button "Đăng xuất" hiển thị trên header/sidebar
- ✅ Xóa dữ liệu session khi click
- ✅ Redirect về trang login
- ✅ Không thể truy cập các trang protected sau khi logout

---

### 📌 B. CHỨC NĂNG ADMIN (Admin Role Features)

#### FR-ADMIN-01: Dashboard tổng quan

**Tên chức năng:** Bảng điều khiển Admin

**Mô tả chức năng:**

- Hiển thị tổng quan hệ thống với các thống kê:
  - Tổng số kỳ thi
  - Tổng số khóa học
  - Tổng số học sinh
  - Tổng số giáo viên
- Biểu đồ thống kê vi phạm theo thời gian (tuần/tháng/năm)
- Danh sách top 3 kỳ thi có nhiều câu hỏi nhất
- Danh sách top 3 khóa học có nhiều học sinh nhất
- Danh sách 5 kỳ thi gần đây
- Danh sách 3 báo cáo vi phạm mới nhất

**Acceptance Criteria:**

- ✅ Hiển thị 4 card thống kê với số liệu real-time
- ✅ Biểu đồ cột thể hiện số lượng vi phạm theo thời gian
- ✅ Biểu đồ tròn phân loại vi phạm theo type
- ✅ Filter thời gian: tuần/tháng/năm
- ✅ Click vào kỳ thi/khóa học để xem chi tiết

---

#### FR-ADMIN-02: Quản lý Giáo viên

**Tên chức năng:** CRUD Giáo viên

**Mô tả chức năng:**

- Xem danh sách tất cả giáo viên trong hệ thống
- Thêm giáo viên mới với thông tin:
  - Họ tên
  - Email
  - Mã giáo viên
  - Số điện thoại
  - Ngày sinh
  - Ảnh đại diện
- Chỉnh sửa thông tin giáo viên
- Xóa giáo viên (với xác nhận)
- Tìm kiếm giáo viên theo tên, email, mã GV

**Acceptance Criteria:**

- ✅ Danh sách giáo viên dạng table/card view
- ✅ Thanh search để tìm kiếm
- ✅ Button "Thêm giáo viên mới" mở modal form
- ✅ Form có đầy đủ các trường thông tin
- ✅ Icon Edit và Delete trên mỗi giáo viên
- ✅ Xác nhận trước khi xóa
- ✅ Refresh danh sách sau khi thêm/sửa/xóa

---

#### FR-ADMIN-03: Quản lý Học sinh

**Tên chức năng:** CRUD Học sinh

**Mô tả chức năng:**

- Xem danh sách tất cả học sinh trong hệ thống
- Thêm học sinh mới với thông tin:
  - Họ tên
  - Email
  - Mã số học sinh
  - Số điện thoại
  - Ngày sinh
  - Ảnh đại diện
- Chỉnh sửa thông tin học sinh
- Gán học sinh vào các khóa học (multiple selection)
- Xóa học sinh (với xác nhận)
- Tìm kiếm học sinh theo tên, email, MSSV
- Upload ảnh đại diện để phục vụ xác thực khuôn mặt

**Acceptance Criteria:**

- ✅ Danh sách học sinh dạng table/card view
- ✅ Thanh search để tìm kiếm
- ✅ Button "Thêm học sinh mới" mở modal form
- ✅ Form có đầy đủ các trường thông tin
- ✅ Cho phép gán học sinh vào nhiều khóa học
- ✅ Upload và preview avatar
- ✅ Icon Edit và Delete trên mỗi học sinh
- ✅ Xác nhận trước khi xóa
- ✅ Refresh danh sách sau khi thêm/sửa/xóa

---

#### FR-ADMIN-04: Quản lý Khóa học

**Tên chức năng:** CRUD Khóa học

**Mô tả chức năng:**

- Xem danh sách tất cả khóa học
- Thêm khóa học mới với thông tin:
  - Tên khóa học
  - Môn học (Subject)
  - Lịch học (Schedule)
  - Giáo viên phụ trách
- Chỉnh sửa thông tin khóa học
- Xóa khóa học (với xác nhận)
- Tìm kiếm khóa học theo tên, môn học, giáo viên
- Click vào khóa học để xem chi tiết

**Acceptance Criteria:**

- ✅ Danh sách khóa học dạng card grid
- ✅ Mỗi card hiển thị: tên, môn học, giáo viên, số học sinh
- ✅ Thanh search để tìm kiếm
- ✅ Button "Tạo khóa học mới" mở modal form
- ✅ Icon Edit và Delete trên mỗi card
- ✅ Xác nhận trước khi xóa
- ✅ Click vào card để xem chi tiết khóa học

---

#### FR-ADMIN-05: Chi tiết Khóa học

**Tên chức năng:** Xem chi tiết & quản lý nội dung khóa học

**Mô tả chức năng:**

- Hiển thị thông tin chi tiết khóa học
- Quản lý 4 tab:
  - **Tab Bài giảng (Lessons)**: Danh sách bài giảng, thêm/sửa/xóa
  - **Tab Bài tập (Assignments)**: Danh sách bài tập, thêm/sửa/xóa
  - **Tab Kỳ thi (Exams)**: Danh sách kỳ thi đã gán
  - **Tab Học sinh (Students)**: Danh sách học sinh trong khóa học
- Thêm bài giảng với thông tin: tiêu đề, mô tả, loại (video/document), format
- Thêm bài tập với: tiêu đề, mô tả, deadline, file đính kèm
- Xem danh sách học sinh và progress của họ

**Acceptance Criteria:**

- ✅ Header hiển thị thông tin tổng quan khóa học
- ✅ Tab navigation để chuyển giữa 4 tab
- ✅ Mỗi tab có button "Thêm mới" tương ứng
- ✅ Lessons tab: CRUD bài giảng với form đầy đủ
- ✅ Assignments tab: CRUD bài tập với deadline picker
- ✅ Exams tab: Danh sách kỳ thi, click để xem chi tiết
- ✅ Students tab: Danh sách học sinh với avatar và thông tin

---

#### FR-ADMIN-06: Quản lý Bài giảng (Global)

**Tên chức năng:** CRUD Bài giảng tổng

**Mô tả chức năng:**

- Xem tất cả bài giảng trong hệ thống (không phân biệt khóa học)
- Thêm bài giảng mới
- Chỉnh sửa bài giảng
- Xóa bài giảng
- Tìm kiếm bài giảng theo tiêu đề, môn học
- Gán bài giảng vào các khóa học

**Acceptance Criteria:**

- ✅ Danh sách tất cả bài giảng dạng list/card
- ✅ Thanh search để tìm kiếm
- ✅ Button "Thêm bài giảng mới"
- ✅ Form với: tiêu đề, mô tả, nội dung, loại (video/document), format
- ✅ Icon Edit và Delete trên mỗi item
- ✅ Có thể gán bài giảng vào nhiều khóa học

---

#### FR-ADMIN-07: Quản lý Bài tập (Global)

**Tên chức năng:** CRUD Bài tập tổng

**Mô tả chức năng:**

- Xem tất cả bài tập trong hệ thống
- Thêm bài tập mới với: tiêu đề, mô tả, deadline, file đính kèm
- Chỉnh sửa bài tập
- Xóa bài tập
- Tìm kiếm bài tập
- Gán bài tập vào các khóa học

**Acceptance Criteria:**

- ✅ Danh sách tất cả bài tập dạng list
- ✅ Thanh search để tìm kiếm
- ✅ Button "Thêm bài tập mới"
- ✅ Form với: tiêu đề, mô tả, deadline (date picker), file upload
- ✅ Icon Edit và Delete trên mỗi item
- ✅ Hiển thị số lượng học sinh đã nộp/chưa nộp

---

#### FR-ADMIN-08: Quản lý Kỳ thi

**Tên chức năng:** CRUD Kỳ thi

**Mô tả chức năng:**

- Xem danh sách tất cả kỳ thi với trạng thái: upcoming, live, completed
- Thêm kỳ thi mới với các thông tin:
  - **Tab General**: Tiêu đề, môn học, thời lượng (phút), thời gian bắt đầu, số lần làm tối đa, shuffle câu hỏi, hiển thị kết quả
  - **Tab Questions**: Chọn câu hỏi từ ngân hàng câu hỏi (multi-select)
  - **Tab Proctoring**: Cấu hình giám sát:
    - Yêu cầu xác thực khuôn mặt
    - Giám sát liên tục
    - Phát hiện gian lận
    - Số vi phạm tối đa
    - Cho phép tai nghe
  - Gán kỳ thi vào các lớp học
- Chỉnh sửa kỳ thi
- Xóa kỳ thi
- Tìm kiếm kỳ thi theo tên, môn học
- Hiển thị trạng thái (upcoming/live/completed) với màu sắc khác nhau

**Acceptance Criteria:**

- ✅ Danh sách kỳ thi với badge trạng thái
- ✅ Thanh search để tìm kiếm
- ✅ Button "Tạo kỳ thi mới" mở modal với 3 tabs
- ✅ Tab General: form đầy đủ thông tin cơ bản
- ✅ Tab Questions: list câu hỏi với checkbox multi-select
- ✅ Tab Proctoring: toggle switches cho các tùy chọn giám sát
- ✅ Dropdown để gán vào các lớp học
- ✅ Icon Edit và Delete trên mỗi kỳ thi
- ✅ Xác nhận trước khi xóa

---

#### FR-ADMIN-09: Ngân hàng Câu hỏi

**Tên chức năng:** CRUD Câu hỏi

**Mô tả chức năng:**

- Xem tất cả câu hỏi trong hệ thống
- Thêm câu hỏi mới với thông tin:
  - Nội dung câu hỏi
  - Loại câu hỏi (Multiple Choice, True/False, Essay, etc.)
  - Độ khó (Easy, Medium, Hard)
  - Các lựa chọn (options)
  - Đáp án đúng
  - Tags (môn học, chủ đề)
  - Tên người tạo
- Chỉnh sửa câu hỏi
- Xóa câu hỏi
- Tìm kiếm câu hỏi theo nội dung
- Lọc câu hỏi theo tags, độ khó

**Acceptance Criteria:**

- ✅ Danh sách câu hỏi với preview
- ✅ Badge hiển thị loại câu hỏi và độ khó
- ✅ Thanh search để tìm kiếm
- ✅ Button "Thêm câu hỏi mới" mở modal form
- ✅ Form với: nội dung, loại, độ khó, options, đáp án, tags
- ✅ Icon Edit và Delete trên mỗi câu hỏi
- ✅ Xác nhận trước khi xóa

---

#### FR-ADMIN-10: Báo cáo & Tuân thủ

**Tên chức năng:** Xem báo cáo vi phạm và bài tập chưa nộp

**Mô tả chức năng:**

- 2 tabs chính:
  - **Tab "Quên nộp bài"**: Hiển thị danh sách học sinh chưa nộp bài tập theo từng khóa học
  - **Tab "Vi phạm thi"**: Hiển thị danh sách học sinh có vi phạm trong các kỳ thi
- Tìm kiếm theo khóa học hoặc tên học sinh
- Click vào học sinh để xem chi tiết lịch sử vi phạm
- Hiển thị số lượng học sinh chưa nộp/vi phạm trên mỗi khóa học/kỳ thi

**Acceptance Criteria:**

- ✅ Tab switcher: "Quên nộp bài" và "Vi phạm thi"
- ✅ Thanh search để tìm kiếm
- ✅ Tab "Quên nộp bài": Group theo khóa học, hiển thị danh sách học sinh và tên bài tập
- ✅ Tab "Vi phạm thi": Group theo kỳ thi, hiển thị học sinh và số lượng vi phạm
- ✅ Click vào học sinh để mở trang chi tiết lịch sử
- ✅ Badge số lượng trên mỗi card

---

#### FR-ADMIN-11: Lịch sử Vi phạm của Học sinh

**Tên chức năng:** Xem chi tiết vi phạm của 1 học sinh

**Mô tả chức năng:**

- Hiển thị thông tin học sinh: ảnh đại diện, tên, MSSV, risk score
- Timeline các vi phạm theo thời gian (từ mới nhất đến cũ nhất)
- Mỗi vi phạm hiển thị:
  - Thời gian
  - Loại vi phạm (Face Mismatch, Multi Face, Mobile Detected, Gaze Away, Headphones)
  - Mức độ nghiêm trọng (Low, Medium, High)
  - Ảnh chụp (nếu có)
  - Tên kỳ thi
- Thống kê tổng số vi phạm theo từng loại
- Xuất báo cáo PDF (future feature)

**Acceptance Criteria:**

- ✅ Header hiển thị thông tin học sinh
- ✅ Biểu đồ thống kê số lượng vi phạm theo loại
- ✅ Timeline danh sách vi phạm
- ✅ Mỗi item trong timeline có đầy đủ thông tin
- ✅ Badge màu sắc theo mức độ nghiêm trọng
- ✅ Ảnh vi phạm hiển thị trong lightbox khi click
- ✅ Button "Quay lại báo cáo"

---

### 📌 C. CHỨC NĂNG TEACHER (Teacher Role Features)

#### FR-TEACHER-01: Dashboard Giáo viên

**Tên chức năng:** Bảng điều khiển Giáo viên

**Mô tả chức năng:**

- Hiển thị thống kê:
  - Số khóa học của giáo viên
  - Số học sinh đang giảng dạy
  - Số kỳ thi đang giám sát (live)
- Danh sách khóa học của giáo viên
- Danh sách kỳ thi gần đây
- Widget giám sát phòng thi real-time (nếu có kỳ thi live)

**Acceptance Criteria:**

- ✅ 3 card thống kê với số liệu
- ✅ Danh sách khóa học dạng card
- ✅ Danh sách kỳ thi với trạng thái
- ✅ Click vào khóa học/kỳ thi để xem chi tiết

---

#### FR-TEACHER-02: Giám sát Phòng thi Real-time

**Tên chức năng:** Monitoring học sinh trong kỳ thi

**Mô tả chức năng:**

- Hiển thị grid các ô camera của học sinh đang thi
- Mỗi ô hiển thị:
  - Stream camera của học sinh (hoặc ảnh snapshot)
  - Tên học sinh và ID
  - Trạng thái: active, idle, flagged, offline
  - Risk score (%)
  - Badge cảnh báo nếu có vi phạm hiện tại
- Click vào ô để xem chi tiết học sinh trong side panel:
  - Ảnh đại diện
  - Thông tin cá nhân
  - Risk score
  - Timeline các vi phạm gần đây
- Filter theo trạng thái: All, Flagged, Active, Offline
- Tìm kiếm theo tên học sinh

**Acceptance Criteria:**

- ✅ Grid layout responsive (3-4 columns)
- ✅ Real-time update trạng thái học sinh
- ✅ Badge "LIVE" cho học sinh active
- ✅ Badge "FLAGGED" với animation pulse cho vi phạm
- ✅ Risk score hiển thị với màu sắc theo mức độ
- ✅ Side panel detail khi click vào học sinh
- ✅ Filter buttons để lọc theo trạng thái
- ✅ Search bar để tìm kiếm

---

#### FR-TEACHER-03: Quản lý Học sinh (Teacher view)

**Tên chức năng:** Xem và quản lý học sinh trong các lớp của giáo viên

**Mô tả chức năng:**

- Xem danh sách học sinh trong các lớp mà giáo viên phụ trách
- Chỉnh sửa thông tin học sinh (limited fields)
- Gán học sinh vào các lớp của giáo viên
- Tìm kiếm học sinh

**Acceptance Criteria:**

- ✅ Tương tự FR-ADMIN-03 nhưng chỉ hiển thị học sinh thuộc lớp của giáo viên
- ✅ Không có quyền xóa học sinh
- ✅ Có thể gán vào các lớp của giáo viên

---

#### FR-TEACHER-04 đến FR-TEACHER-11

**Mô tả:** Các chức năng còn lại của Teacher tương tự như Admin (FR-ADMIN-04 đến FR-ADMIN-11) nhưng chỉ áp dụng trong phạm vi các khóa học/kỳ thi mà giáo viên phụ trách.

Bao gồm:

- Quản lý Khóa học (của giáo viên)
- Chi tiết Khóa học
- Quản lý Bài giảng
- Quản lý Bài tập
- Quản lý Kỳ thi
- Ngân hàng Câu hỏi (của giáo viên)
- Báo cáo & Tuân thủ (trong các lớp của giáo viên)
- Lịch sử Vi phạm của Học sinh

---

### 📌 D. CHỨC NĂNG STUDENT (Student Role Features)

#### FR-STUDENT-01: Dashboard Học sinh

**Tên chức năng:** Cổng sinh viên

**Mô tả chức năng:**

- Hiển thị 2 sections:
  - **Kỳ thi đang diễn ra (Live)**: Các kỳ thi có trạng thái "live" mà học sinh được gán
  - **Sắp diễn ra (Upcoming)**: Các kỳ thi sắp tới
- Mỗi card kỳ thi hiển thị:
  - Tiêu đề
  - Thời lượng
  - Thời gian bắt đầu
  - Badge trạng thái
  - Button "Vào phòng thi" (nếu live)
- Thông báo nổi bật nếu có kỳ thi đang diễn ra

**Acceptance Criteria:**

- ✅ Section "Đang diễn ra" với badge đỏ "LIVE"
- ✅ Section "Sắp diễn ra" với các kỳ thi upcoming
- ✅ Hiển thị thời gian bắt đầu cho kỳ thi upcoming
- ✅ Button "Vào phòng thi" chỉ hiển thị với kỳ thi live
- ✅ Click button sẽ trigger xác thực khuôn mặt trước khi vào

---

#### FR-STUDENT-02: Xác thực Khuôn mặt trước khi vào thi

**Tên chức năng:** Face Verification

**Mô tả chức năng:**

- Khi học sinh click "Vào phòng thi", kiểm tra xem đã có avatar chính thức chưa
- Nếu chưa có avatar thực (đang dùng ảnh placeholder), yêu cầu cập nhật avatar trong profile trước
- Nếu đã có avatar, mở màn hình xác thực:
  - Bật camera
  - Hiển thị video stream
  - Hướng dẫn học sinh đặt khuôn mặt trong khung
  - Chụp ảnh và so sánh với avatar trong profile
  - Nếu khớp (>= 90% confidence), cho phép vào phòng thi
  - Nếu không khớp, yêu cầu thử lại

**Acceptance Criteria:**

- ✅ Kiểm tra avatar trước khi xác thực
- ✅ Hiển thị video camera với overlay guide
- ✅ Progress bar khi đang xác thực (2-3s)
- ✅ Thông báo thành công/thất bại
- ✅ Cho phép thử lại nếu thất bại
- ✅ Button "Hủy và quay lại Dashboard"
- ✅ Redirect vào phòng thi sau khi xác thực thành công

---

#### FR-STUDENT-03: Phòng thi trực tuyến

**Tên chức năng:** Exam Room với AI Proctoring

**Mô tả chức năng:**

- Giao diện thi bao gồm:
  - Header: Đồng hồ đếm ngược, tên kỳ thi, số câu hỏi
  - Left panel: Camera stream của học sinh (luôn hiển thị)
  - Main content: Danh sách câu hỏi và form trả lời
  - Footer: Button "Nộp bài"
- Camera luôn bật và gửi snapshot lên server mỗi 5 giây
- Server phân tích và phát hiện vi phạm:
  - Face Mismatch: Khuôn mặt không khớp
  - Multi Face: Nhiều khuôn mặt
  - Mobile Detected: Phát hiện điện thoại
  - Gaze Away: Nhìn ra ngoài màn hình
  - Headphones: Đeo tai nghe (nếu không cho phép)
- Hiển thị cảnh báo popup khi phát hiện vi phạm
- Tự động nộp bài khi hết thời gian hoặc vượt quá số vi phạm cho phép
- Hiển thị trạng thái kết nối (Wifi icon)

**Acceptance Criteria:**

- ✅ Layout 2 cột: camera (1/3) và nội dung (2/3)
- ✅ Đồng hồ đếm ngược real-time
- ✅ Camera stream hiển thị liên tục
- ✅ Gửi snapshot mỗi 5s đến backend
- ✅ Nhận response và hiển thị cảnh báo nếu có vi phạm
- ✅ Popup cảnh báo với nội dung chi tiết vi phạm
- ✅ Tự động ẩn cảnh báo sau 3s
- ✅ Button "Nộp bài" với confirm dialog
- ✅ Tự động nộp bài khi hết thời gian
- ✅ Dừng camera khi nộp bài và redirect về kết quả

---

#### FR-STUDENT-04: Xem Kết quả Bài thi

**Tên chức năng:** Exam Result

**Mô tả chức năng:**

- Hiển thị kết quả bài thi sau khi nộp:
  - Điểm số
  - Số câu đúng/tổng số câu
  - Thời gian làm bài
  - Số vi phạm (nếu có)
- Chi tiết từng câu hỏi với:
  - Câu hỏi
  - Đáp án của học sinh
  - Đáp án đúng
  - Giải thích (nếu có)
- Biểu đồ phân tích kết quả
- Danh sách vi phạm trong quá trình thi

**Acceptance Criteria:**

- ✅ Card hiển thị điểm số lớn và nổi bật
- ✅ Thống kê số câu đúng/sai
- ✅ Timeline các câu hỏi với đáp án
- ✅ Highlight đáp án đúng/sai với màu sắc
- ✅ Section "Vi phạm" với danh sách các lần bị cảnh báo
- ✅ Button "Quay lại Dashboard"
- ✅ Không cho phép làm lại nếu đã hết lượt

---

#### FR-STUDENT-05: Xem Danh sách Khóa học

**Tên chức năng:** Khóa học của tôi

**Mô tả chức năng:**

- Hiển thị danh sách các khóa học mà học sinh được gán
- Mỗi card khóa học hiển thị:
  - Tên khóa học
  - Môn học
  - Giáo viên
  - Lịch học
- Tìm kiếm khóa học theo tên hoặc giáo viên
- Click vào card để xem chi tiết khóa học

**Acceptance Criteria:**

- ✅ Grid layout các card khóa học
- ✅ Card với design đẹp (clay style)
- ✅ Icon môn học
- ✅ Thông tin giáo viên và lịch học
- ✅ Thanh search để tìm kiếm
- ✅ Empty state nếu chưa có khóa học nào
- ✅ Click vào card để navigate

---

#### FR-STUDENT-06: Chi tiết Khóa học (Student view)

**Tên chức năng:** Xem nội dung khóa học

**Mô tả chức năng:**

- Hiển thị thông tin tổng quan khóa học
- 3 tabs:
  - **Tab Bài giảng (Lessons)**: Danh sách bài giảng, click để xem chi tiết
  - **Tab Bài tập (Assignments)**: Danh sách bài tập với deadline, trạng thái nộp, click để xem/nộp bài
  - **Tab Kỳ thi (Exams)**: Danh sách kỳ thi, trạng thái (upcoming/live/completed), click để vào thi hoặc xem kết quả
- Mỗi item hiển thị trạng thái: Chưa xem, Đã xem, Đã nộp, Quá hạn, etc.

**Acceptance Criteria:**

- ✅ Header hiển thị thông tin khóa học
- ✅ Tab navigation
- ✅ Tab Lessons: List bài giảng với icon và trạng thái
- ✅ Tab Assignments: List bài tập với deadline countdown và badge trạng thái
- ✅ Tab Exams: List kỳ thi với button "Vào thi" hoặc "Xem kết quả"
- ✅ Click vào item để navigate đến trang chi tiết

---

#### FR-STUDENT-07: Xem Chi tiết Bài giảng

**Tên chức năng:** Lesson Detail

**Mô tả chức năng:**

- Hiển thị chi tiết bài giảng:
  - Tiêu đề
  - Mô tả
  - Nội dung (text/video embed)
  - Tài liệu đính kèm (PDF, PPT, etc.)
- Thông tin bên sidebar:
  - Giảng viên
  - Ngày cập nhật
  - Định dạng file
- Button "Tải tài liệu về máy"
- Đánh dấu "Đã xem" khi học sinh hoàn thành

**Acceptance Criteria:**

- ✅ Layout 2 cột: nội dung chính và sidebar thông tin
- ✅ Hiển thị nội dung bài giảng (text/video)
- ✅ Card tài liệu đính kèm với icon file type
- ✅ Button download
- ✅ Button "Quay lại khóa học"
- ✅ Tự động đánh dấu "Đã xem"

---

#### FR-STUDENT-08: Xem và Nộp Bài tập

**Tên chức năng:** Assignment Detail & Submission

**Mô tả chức năng:**

- Hiển thị chi tiết bài tập:
  - Tiêu đề
  - Mô tả
  - Deadline
  - File đính kèm (nếu có)
- Form nộp bài:
  - Upload file (PDF, DOC, ZIP, etc.)
  - Nội dung text (nếu yêu cầu)
- Hiển thị trạng thái nộp bài:
  - Pending: Chưa nộp
  - Submitted: Đã nộp (hiển thị thời gian nộp)
  - Graded: Đã chấm (hiển thị điểm và feedback)
  - Late: Nộp trễ
- Cho phép nộp lại nếu chưa hết hạn
- Hiển thị feedback từ giáo viên sau khi được chấm

**Acceptance Criteria:**

- ✅ Header hiển thị tiêu đề và deadline
- ✅ Badge trạng thái (Pending/Submitted/Graded/Late)
- ✅ Nội dung mô tả bài tập
- ✅ Section download file đề bài (nếu có)
- ✅ Form upload file để nộp bài
- ✅ Button "Nộp bài" với confirm dialog
- ✅ Hiển thị thông tin file đã nộp (nếu có)
- ✅ Hiển thị điểm và feedback từ giáo viên (nếu đã chấm)
- ✅ Disable nộp bài nếu đã quá deadline
- ✅ Button "Quay lại khóa học"

---

#### FR-STUDENT-09: Lịch sử Vi phạm của Tôi

**Tên chức năng:** My Violation History

**Mô tả chức năng:**

- Học sinh có thể xem lịch sử các vi phạm của mình trong các kỳ thi
- Hiển thị thông tin:
  - Tên kỳ thi
  - Thời gian vi phạm
  - Loại vi phạm
  - Mức độ nghiêm trọng
  - Ảnh chụp (nếu có)
- Thống kê tổng số vi phạm theo loại
- Học sinh có thể khiếu nại vi phạm (future feature)

**Acceptance Criteria:**

- ✅ Timeline các vi phạm
- ✅ Mỗi item hiển thị đầy đủ thông tin
- ✅ Biểu đồ thống kê
- ✅ Ảnh vi phạm trong lightbox
- ✅ Badge màu sắc theo mức độ
- ✅ Empty state nếu chưa có vi phạm

---

## 🔧 II. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

### NFR-01: Hiệu năng (Performance)

**Yêu cầu:**

- Thời gian load trang không quá 3 giây trên kết nối 4G
- API response time trung bình < 500ms
- Camera stream delay < 1 giây
- Snapshot gửi lên server mỗi 5 giây
- Smooth animation 60fps

**Chỉ số đo lường:**

- ✅ Lighthouse Performance Score >= 85
- ✅ Time to Interactive (TTI) < 3s
- ✅ First Contentful Paint (FCP) < 1.5s
- ✅ Cumulative Layout Shift (CLS) < 0.1

---

### NFR-02: Khả năng mở rộng (Scalability)

**Yêu cầu:**

- Hệ thống hỗ trợ tối thiểu 500 học sinh thi cùng lúc
- Hỗ trợ 50 phòng thi song song
- Database có thể lưu trữ tối thiểu 10,000 học sinh
- Lưu trữ ảnh vi phạm lên cloud storage

**Chỉ số đo lường:**

- ✅ Concurrent connections: 500+
- ✅ Database size capacity: 10GB+
- ✅ Image storage: 100GB+

---

### NFR-03: Bảo mật (Security)

**Yêu cầu:**

- Mật khẩu phải được hash (bcrypt/argon2)
- Session token hết hạn sau 24h
- HTTPS cho tất cả API calls
- Không lưu trữ thông tin nhạy cảm trên client
- Face recognition API sử dụng encryption cho ảnh
- Chống CSRF, XSS attacks
- Rate limiting cho API endpoints

**Chỉ số đo lường:**

- ✅ Không có lỗ hổng OWASP Top 10
- ✅ Tất cả API đều có authentication
- ✅ Mật khẩu không được lưu plain text
- ✅ Session secure & httpOnly cookies

---

### NFR-04: Khả dụng (Usability)

**Yêu cầu:**

- Giao diện thân thiện, dễ sử dụng
- Responsive trên các thiết bị: Desktop, Tablet, Mobile
- Hỗ trợ các trình duyệt: Chrome, Firefox, Edge, Safari
- Thông báo lỗi rõ ràng và hướng dẫn khắc phục
- Loading states cho mọi action
- Feedback ngay lập tức cho user actions

**Chỉ số đo lường:**

- ✅ User satisfaction score >= 4/5
- ✅ Tỷ lệ hoàn thành task >= 90%
- ✅ Time to complete task trong giới hạn mong đợi

---

### NFR-05: Khả năng bảo trì (Maintainability)

**Yêu cầu:**

- Code có cấu trúc rõ ràng, tuân thủ coding standards
- Component-based architecture (React)
- Tách biệt business logic và UI
- Type-safe với TypeScript
- Documentation đầy đủ
- Git workflow rõ ràng

**Chỉ số đo lường:**

- ✅ Code coverage >= 70%
- ✅ Không có code smell nghiêm trọng
- ✅ Technical debt ratio < 5%

---

### NFR-06: Khả năng tương thích (Compatibility)

**Yêu cầu:**

- Hỗ trợ các trình duyệt phổ biến (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Responsive từ màn hình 320px đến 4K
- Camera API hỗ trợ trên tất cả các trình duyệt hiện đại
- Tương thích với các hệ điều hành: Windows, macOS, Linux, Android, iOS

**Chỉ số đo lường:**

- ✅ Browser compatibility >= 95%
- ✅ Device coverage >= 98%
- ✅ Camera API success rate >= 95%

---

### NFR-07: Độ tin cậy (Reliability)

**Yêu cầu:**

- Uptime >= 99.5%
- Tự động backup database hàng ngày
- Error handling đầy đủ
- Retry mechanism cho failed API calls
- Graceful degradation khi một số tính năng không khả dụng

**Chỉ số đo lường:**

- ✅ Uptime >= 99.5% (43.8 phút downtime/tháng)
- ✅ Mean Time Between Failures (MTBF) >= 720h
- ✅ Mean Time To Repair (MTTR) <= 1h

---

### NFR-08: Khả năng phục hồi (Recoverability)

**Yêu cầu:**

- Tự động lưu bài thi mỗi 30 giây
- Khôi phục session nếu mất kết nối tạm thời
- Backup database định kỳ
- Disaster recovery plan

**Chỉ số đo lường:**

- ✅ Recovery Time Objective (RTO) <= 4h
- ✅ Recovery Point Objective (RPO) <= 1h
- ✅ Auto-save success rate >= 99%

---

### NFR-09: Khả năng truy cập (Accessibility)

**Yêu cầu:**

- Tuân thủ WCAG 2.1 Level AA
- Hỗ trợ screen readers
- Keyboard navigation đầy đủ
- Contrast ratio >= 4.5:1 cho text
- Focus indicators rõ ràng

**Chỉ số đo lường:**

- ✅ Lighthouse Accessibility Score >= 90
- ✅ WCAG compliance level AA
- ✅ Keyboard navigation coverage 100%

---

### NFR-10: Khả năng giám sát (Monitorability)

**Yêu cầu:**

- Logging đầy đủ cho các events quan trọng
- Monitoring real-time cho system health
- Analytics cho user behavior
- Alert system cho critical errors
- Dashboard cho admin monitoring

**Chỉ số đo lường:**

- ✅ Log coverage >= 90% critical paths
- ✅ Alert response time <= 5 phút
- ✅ System metrics tracking 24/7

---

### NFR-11: Khả năng quốc tế hóa (Internationalization)

**Yêu cầu (Future):**

- Hỗ trợ đa ngôn ngữ (Tiếng Việt, English)
- Định dạng ngày tháng theo locale
- Định dạng số và tiền tệ theo region

**Chỉ số đo lường:**

- ✅ Language coverage: Vietnamese, English
- ✅ Translation completeness >= 95%

---

### NFR-12: AI Proctoring Quality

**Yêu cầu:**

- Face detection accuracy >= 95%
- Face recognition accuracy >= 90%
- Object detection (mobile, headphones) accuracy >= 85%
- Gaze tracking accuracy >= 80%
- False positive rate < 5%
- False negative rate < 10%

**Chỉ số đo lường:**

- ✅ Precision >= 90%
- ✅ Recall >= 85%
- ✅ F1-Score >= 87%
- ✅ Processing time < 2s per frame

---

## 📊 III. TỔNG KẾT

### Tóm tắt Chức năng theo Role

| Role        | Số chức năng chính | Highlights                                                |
| ----------- | ------------------ | --------------------------------------------------------- |
| **Common**  | 5                  | Đăng nhập, Đăng ký, Profile, Đổi MK, Logout               |
| **Admin**   | 11                 | CRUD tất cả entities, Dashboard, Reports, Monitoring      |
| **Teacher** | 11                 | Quản lý lớp/thi/câu hỏi của mình, Giám sát phòng thi      |
| **Student** | 9                  | Xem khóa học, Học bài, Làm bài tập, Thi với AI proctoring |

**Tổng cộng:** 36 yêu cầu chức năng chính

### Tóm tắt Yêu cầu Phi chức năng

| Category        | Key Points                          |
| --------------- | ----------------------------------- |
| **Performance** | Load < 3s, API < 500ms, 60fps       |
| **Scalability** | 500 concurrent users, 50 rooms      |
| **Security**    | Hash password, HTTPS, Rate limiting |
| **Usability**   | Responsive, Multi-browser, Clear UX |
| **Reliability** | Uptime 99.5%, Auto backup           |
| **AI Quality**  | Face detection 95%, Recognition 90% |

**Tổng cộng:** 12 nhóm yêu cầu phi chức năng

---

## 🎓 IV. USE CASES QUAN TRỌNG

### Use Case 1: Học sinh tham gia kỳ thi với giám sát AI

**Actors:** Student, System, AI Proctor, Teacher

**Pre-conditions:**

- Student đã đăng nhập
- Student được gán vào kỳ thi
- Kỳ thi đang ở trạng thái "live"
- Student đã cập nhật avatar chính thức

**Main Flow:**

1. Student click "Vào phòng thi"
2. System yêu cầu xác thực khuôn mặt
3. Student cho phép truy cập camera
4. System chụp ảnh và so sánh với avatar
5. Nếu khớp, cho phép vào phòng thi
6. Student làm bài thi
7. Camera gửi snapshot mỗi 5s
8. AI Proctor phân tích và phát hiện vi phạm
9. System hiển thị cảnh báo nếu có vi phạm
10. Student nộp bài hoặc hết thời gian
11. System dừng camera và tính điểm
12. Hiển thị kết quả

**Post-conditions:**

- Bài thi được lưu
- Điểm được tính toán
- Vi phạm được ghi nhận
- Kết quả hiển thị cho học sinh

**Alternative Flows:**

- 4a: Khuôn mặt không khớp → Yêu cầu thử lại
- 8a: Vượt quá số vi phạm cho phép → Tự động nộp bài
- 10a: Mất kết nối → Tự động lưu và khôi phục

---

### Use Case 2: Giáo viên giám sát phòng thi real-time

**Actors:** Teacher, System, Students

**Pre-conditions:**

- Teacher đã đăng nhập
- Có kỳ thi đang diễn ra (live)
- Có học sinh đang thi

**Main Flow:**

1. Teacher truy cập Dashboard
2. System hiển thị widget phòng thi live
3. Teacher click vào widget
4. System hiển thị grid camera của tất cả học sinh
5. Teacher xem real-time trạng thái từng học sinh
6. System cập nhật trạng thái và risk score
7. Teacher click vào học sinh có vi phạm
8. System hiển thị chi tiết vi phạm
9. Teacher xem timeline và ảnh vi phạm
10. Teacher có thể ghi chú hoặc đánh dấu

**Post-conditions:**

- Teacher nắm bắt tình hình phòng thi
- Vi phạm được review

---

### Use Case 3: Admin xem báo cáo và tuân thủ

**Actors:** Admin, System

**Pre-conditions:**

- Admin đã đăng nhập
- Có dữ liệu bài tập và kỳ thi

**Main Flow:**

1. Admin truy cập trang "Báo cáo & Tuân thủ"
2. System hiển thị 2 tabs: "Quên nộp bài" và "Vi phạm thi"
3. Admin chọn tab "Quên nộp bài"
4. System hiển thị danh sách học sinh chưa nộp bài theo từng khóa học
5. Admin click vào học sinh
6. System hiển thị chi tiết lịch sử
7. Admin quay lại và chuyển sang tab "Vi phạm thi"
8. System hiển thị học sinh có vi phạm theo từng kỳ thi
9. Admin click vào học sinh
10. System hiển thị chi tiết vi phạm với ảnh và timeline

**Post-conditions:**

- Admin nắm bắt tình hình tuân thủ
- Có dữ liệu để xử lý vi phạm

---

## 📝 V. GHI CHÚ BỔ SUNG

### Công nghệ AI Proctoring

Hệ thống sử dụng các mô hình AI sau:

- **Face Detection**: RetinaFace/SCRFD/YOLOv5-Face
- **Face Recognition**: ArcFace
- **Object Detection**: YOLO11n (mobile, headphones)
- **Gaze Estimation**: Head Pose Estimation
- **Face Tracking**: Deep SORT

### Data Flow - Giám sát thi

```
Student Camera → Capture Frame (5s interval)
                ↓
        Convert to Base64
                ↓
        POST to Backend API
                ↓
        AI Proctor Service
                ↓
    Face Detection & Recognition
    Object Detection (Mobile, Headphones)
    Gaze Estimation
                ↓
        Analyze & Generate Report
                ↓
    Return Violation (if any) + Confidence
                ↓
        Store to Database
                ↓
    Response to Frontend
                ↓
    Display Warning (if needed)
```

### Storage Requirements

- **User Avatars**: ~500KB per user × 10,000 users = 5GB
- **Violation Images**: ~200KB per image × 100,000 images = 20GB
- **Video Recordings** (optional): ~100MB per exam × 1000 exams = 100GB
- **Database**: ~10GB for metadata, logs, results

**Total:** ~135GB minimum

---

**Document Version:** 1.0.0  
**Last Updated:** 2024-12-22  
**Author:** Business Analyst Team  
**Status:** Approved for Development
