# Import các thư viện cần thiết
from lib import *
from l2cs import Pipeline, render  # L2CS: Library để ước tính hướng nhìn (gaze estimation)

class GazeEstimator:
    """
    Class để ước tính hướng nhìn (Gaze Estimation) từ ảnh/video.
    
    Chức năng chính:
    - Phát hiện khuôn mặt và ước tính góc pitch/yaw của ánh mắt
    - Tính toán khoảng cách từ camera đến khuôn mặt
    - Xác định vùng (quadrant) mà người dùng đang nhìn
    - Vẽ các điểm gaze và vùng trên ảnh để trực quan hóa
    
    Ứng dụng:
    - Phát hiện gian lận trong thi trực tuyến (nhìn ra ngoài màn hình)
    - Eye tracking, attention monitoring
    - Human-computer interaction
    """
    def __init__(self, weights_path: str, arch: str = "ResNet50", device: str = "cpu"):
        """
        Khởi tạo GazeEstimator.
        
        Args:
            weights_path: Đường dẫn đến file weights của model L2CS (L2CSNet_gaze360.pkl)
            arch: Kiến trúc mạng neural (mặc định ResNet50)
            device: Thiết bị tính toán ("cpu" hoặc "cuda" cho GPU)
        """
        # Khởi tạo L2CS Pipeline để dự đoán góc pitch/yaw của ánh mắt
        self.gaze_pipeline_pro = Pipeline(
            weights=Path(weights_path),
            arch=arch,
            device=torch.device(device)
        )
        
        # Các thông số để tính khoảng cách (distance estimation)
        self.known_distance = 50.0  # Khoảng cách chuẩn (cm) khi calibrate
        self.known_width = 15.0     # Chiều rộng khuôn mặt thực tế trung bình (cm)
        
        self.corners = None  # Lưu tọa độ 4 góc màn hình
        
        # Màu sắc để vẽ 4 góc màn hình (BGR format)
        self.colors = {
            "top_left": (0, 255, 0),      # Xanh lá
            "top_right": (0, 0, 255),     # Đỏ
            "bottom_left": (255, 0, 0),   # Xanh dương
            "bottom_right": (0, 255, 255) # Vàng
        }

    def process_frame(self, frame: np.ndarray, yaw_pred: Optional[float] = None) -> Tuple[
        Optional[np.ndarray], Optional[str], Optional[float]]:
        """
        HÀM CHÍNH - Xử lý 1 frame để ước tính hướng nhìn.
        
        QUY TRÌNH THỰC HIỆN:
        1. Dùng L2CS Pipeline để phát hiện khuôn mặt và predict pitch/yaw của ánh mắt
        2. Vẽ gaze information lên frame
        3. Xác định quadrant (vùng) đang nhìn
        4. Tính khoảng cách từ camera đến khuôn mặt
        
        Args:
            frame: Ảnh đầu vào (numpy array BGR format)
            yaw_pred: Góc yaw từ head pose estimation (optional, để kết hợp 2 model)
            
        Returns:
            frame: Ảnh đã vẽ gaze points và text
            quadrant: Vùng đang nhìn (top/bottom/left/right/center/top_left/...)
            distance: Khoảng cách đến camera (cm)
        """
        try:
            # Bước 1: Chạy L2CS model để detect face và predict gaze angles
            results = self.gaze_pipeline_pro.step(frame)
        except ValueError as e:
            # Xử lý trường hợp không phát hiện được khuôn mặt
            if "need at least one array to stack" in str(e):
                print("Warning: No face detected, skipping gaze calculation.")
                return None, None, None
            else:
                raise

        if results is None:
            return None, None, None
        # frame = render(frame, results)  # Có thể dùng hàm render mặc định của L2CS

        # Bước 2: Vẽ gaze information và tính toán các thông số
        frame, quadrant, distance = self.render_gaze(frame, results, yaw_pred)
        return frame, quadrant, distance

    def render_gaze(self, frame: np.ndarray, results: Dict, yaw_pred: Optional[float] = None) -> Tuple[
        np.ndarray, Optional[str], Optional[float]]:
        """
        Vẽ thông tin gaze lên frame và tính toán các thông số.
        
        Args:
            frame: Ảnh đầu vào
            results: Kết quả từ L2CS Pipeline (chứa bboxes, pitch, yaw)
            yaw_pred: Góc yaw từ head pose estimation (optional)
            
        Returns:
            frame: Ảnh đã vẽ gaze points, text, rectangles
            quadrant: Vùng đang nhìn
            distance: Khoảng cách đến camera
        """
        frame_height, frame_width = frame.shape[:2]
        bbox = results.bboxes[0]  # Lấy bounding box của khuôn mặt đầu tiên
        pitch, yaw = results.pitch[0], results.yaw[0]  # Góc pitch/yaw của ánh mắt từ L2CS
        print(f"pitch: {pitch}, yaw: {yaw}")

        # Tính toán các thuộc tính của bounding box
        x_min, y_min, x_max, y_max = bbox
        bbox_width = x_max - x_min   # Chiều rộng box khuôn mặt (pixels)
        bbox_height = y_max - y_min  # Chiều cao box khuôn mặt (pixels)
        center_x = int(x_min + bbox_width / 2)   # Tâm x của khuôn mặt
        center_y = int(y_min + bbox_height / 2)  # Tâm y của khuôn mặt

        # Mở rộng bounding box gấp 2 lần để tạo vùng phát hiện gaze rộng hơn
        # Điều này giúp phát hiện khi người nhìn ra ngoài khuôn mặt
        new_bbox_width = bbox_width * 2
        new_bbox_height = bbox_height * 2
        new_x_min = int(center_x - new_bbox_width / 2)
        new_y_min = int(center_y - new_bbox_height / 2)
        new_x_max = int(center_x + new_bbox_width / 2)
        new_y_max = int(center_y + new_bbox_height / 2)

        # Tính khoảng cách từ camera đến khuôn mặt (dựa trên focal length)
        distance = self.calculate_face_distance(bbox_width, frame_width)
        if distance:
            cv2.putText(frame, f"{distance:.2f} cm", (25, 200),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
            print(f"Distance: {distance:.2f} cm")

        # Tính 2 điểm gaze:
        # GREEN POINT: Điểm gaze trên toàn màn hình (dùng để track nhìn vào góc màn hình)
        green_gaze_point = self.calculate_green_gaze_point(
            pitch, yaw, center_x, center_y, frame_width, frame_height, distance
        )
        # RED POINT: Điểm gaze trong vùng mở rộng của khuôn mặt (dùng để detect quadrant)
        red_gaze_point, quadrant = self.calculate_red_gaze_point(
            pitch, yaw, center_x, center_y, bbox_width,
            new_x_min, new_y_min, new_x_max, new_y_max, yaw_pred
        )

        # Vẽ 2 điểm gaze lên ảnh
        cv2.circle(frame, green_gaze_point, 20, (0, 255, 0), -1)  # Xanh lá - Green point
        cv2.circle(frame, red_gaze_point, 25, (0, 0, 255), -1)    # Đỏ - Red point

        if quadrant:
            cv2.putText(frame, f"Gaze: {quadrant}", (25, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

        # Draw quadrant rectangles
        self.draw_quadrant_rectangles(
            frame, new_x_min, new_y_min, new_x_max, new_y_max
        )

        # Draw screen corners
        self.draw_screen_corners(frame, frame_width, frame_height)

        # Draw face deviation using yaw_pred if provided, else use yaw
        yaw_to_use = yaw_pred if yaw_pred is not None else yaw
        yaw_degrees = round(np.abs(np.degrees(yaw_to_use)), 2)
        cv2.putText(frame, f"degrees: {yaw_degrees}", (25, 250),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

        return frame, quadrant, distance

    def calculate_face_distance(self, face_width_pixels: float, frame_width: int) -> Optional[float]:
        """
        Tính khoảng cách từ camera đến khuôn mặt dựa trên công thức focal length.
        
        CÔNG THỨC: Distance = (Known_Width × Focal_Length) / Face_Width_Pixels
        
        Args:
            face_width_pixels: Chiều rộng khuôn mặt trên ảnh (pixels)
            frame_width: Chiều rộng của frame ảnh (pixels)
            
        Returns:
            distance: Khoảng cách tính bằng cm, hoặc None nếu không hợp lệ
        """
        if face_width_pixels <= 0:
            return None

        # Xác định focal length dựa trên độ phân giải ảnh
        # Focal length khác nhau tùy thuộc vào camera và độ phân giải
        if frame_width <= 400:
            focal_length = 350
            print(f"Small size → focal ~ {focal_length}px")
        elif 400 < frame_width <= 1000:
            focal_length = 1200
            print(f"Medium size → focal ~ {focal_length}px")
        elif 1000 < frame_width <= 1280:
            focal_length = 1400
            print(f"HD size → focal ~ {focal_length}px")
        elif 1280 < frame_width <= 1920:
            focal_length = 1500
            print(f"HD size → focal ~ {focal_length}px")
        else:
            focal_length = 1700
            print(f"Large size → focal ~ {focal_length}px")

        print(f"face_width_pixels: {face_width_pixels}")
        print(f"Focal length: {focal_length:.2f} pixels")

        # Áp dụng công thức tính khoảng cách
        # known_width = 15cm (chiều rộng khuôn mặt thực tế trung bình)
        return (self.known_width * focal_length) / face_width_pixels

    def calculate_green_gaze_point(self, pitch: float, yaw: float, center_x: int,
                                   center_y: int, screen_width: int, screen_height: int,
                                   distance: Optional[float]) -> Tuple[int, int]:
        """
        Tính điểm gaze XANH LÁ - điểm nhìn trên toàn màn hình.
        
        Điểm này dùng để phát hiện khi người dùng nhìn vào 4 góc màn hình.
        Learning rate (lrate) được điều chỉnh dựa trên khoảng cách để tăng độ chính xác.
        
        Args:
            pitch, yaw: Góc pitch/yaw của ánh mắt (radian)
            center_x, center_y: Tâm khuôn mặt
            screen_width, screen_height: Kích thước màn hình
            distance: Khoảng cách đến camera (cm)
            
        Returns:
            (x, y): Tọa độ điểm gaze xanh lá trên màn hình
        """
        lrate = 1.0  # Learning rate mặc định
        
        # Điều chỉnh lrate dựa trên khoảng cách - càng xa thì cần scale lớn hơn
        if distance:
            if distance > 60:
                lrate = 1.7  # Rất xa → scale lớn
                print("Distance reasonable (>60cm)")
            elif 45 <= distance <= 60:
                lrate = 1.45  # Xa vừa phải
                print("Distance reasonable (45-60cm)")
            elif 40 <= distance < 45:
                lrate = 1.15  # Gần vừa
                print("Distance reasonable (40-45cm)")
            elif 35 <= distance < 40:
                lrate = 1.05  # Rất gần
                print("Distance reasonable (35-40cm)")
            else:
                print("Distance reasonable (<35cm)")

        # Tính offset dựa trên góc pitch/yaw và scale với lrate
        dx = -screen_width * np.sin(pitch) * np.cos(yaw) * lrate
        dy = -screen_height * np.sin(yaw) * lrate
        return (int(center_x + dx), int(center_y + dy))

    def calculate_red_gaze_point(self, pitch: float, yaw: float, center_x: int,
                                 center_y: int, bbox_width: float,
                                 new_x_min: int, new_y_min: int,
                                 new_x_max: int, new_y_max: int,
                                 yaw_pred: Optional[float] = None) -> Tuple[Tuple[int, int], Optional[str]]:
        """
        Tính điểm gaze ĐỎ - điểm nhìn trong vùng mở rộng của khuôn mặt.
        
        Điểm này dùng để xác định quadrant (vùng) mà người dùng đang nhìn:
        - Center: Nhìn thẳng
        - Top/Bottom/Left/Right: Nhìn lên/xuống/trái/phải
        - Top_Left/Top_Right/Bottom_Left/Bottom_Right: Nhìn chéo
        
        Args:
            pitch, yaw: Góc pitch/yaw của ánh mắt từ L2CS
            center_x, center_y: Tâm khuôn mặt
            bbox_width: Chiều rộng bounding box khuôn mặt
            new_x_min, new_y_min, new_x_max, new_y_max: Vùng mở rộng x2
            yaw_pred: Góc yaw từ head pose (nếu có) để kết hợp 2 model
            
        Returns:
            gaze_point: Tọa độ điểm gaze đỏ
            quadrant: Vùng đang nhìn (center/top/bottom/left/right/...)
        """
        # Ưu tiên dùng yaw từ head pose nếu có (chính xác hơn khi đầu quay nhiều)
        yaw_to_use = yaw_pred if yaw_pred is not None else yaw

        # CODE COMMENT: Xử lý khi camera đặt lệch (hiện tại không dùng)
        # Nếu góc yaw quá lớn (>0.7 rad ≈ 40°), dùng dynamic offset
        # if np.abs(yaw_to_use) > 0.7:
        #     dx, dy = self.compute_gaze_offset_dynamic(pitch, yaw, bbox_width)
        # else:
        #     lr_redpoint = 1
        #     dx = -bbox_width * np.sin(pitch) * np.cos(yaw) * lr_redpoint
        #     dy = -bbox_width * np.sin(yaw) * lr_redpoint

        # Công thức cho camera chính diện (đang sử dụng)
        lr_redpoint = 1  # Learning rate cho red point
        # Tính offset dựa trên góc và chiều rộng bbox
        dx = -bbox_width * np.sin(pitch) * np.cos(yaw) * lr_redpoint  # Offset theo x
        dy = -bbox_width * np.sin(yaw) * lr_redpoint                  # Offset theo y

        gaze_point = (int(center_x + dx), int(center_y + dy))
        quadrant = self.detect_quadrant(
            gaze_point, new_x_min, new_y_min, new_x_max, new_y_max
        )
        return gaze_point, quadrant

    def compute_gaze_offset_dynamic(self, pitch: float, yaw: float,
                                    bbox_width: float, base_lr: float = 0.5) -> Tuple[float, float]:
        """Compute dynamic gaze offset for red point."""
        angle_magnitude = np.abs(pitch) + np.abs(yaw)
        print(f"angle_magnitude: {angle_magnitude}")
        dynamic_lr = np.clip(base_lr + 0.82 * angle_magnitude, 0.15, 0.45)
        dx = -bbox_width * np.sin(pitch) * np.cos(yaw) * dynamic_lr
        dy = -bbox_width * np.sin(yaw) * dynamic_lr
        return dx, dy

    def detect_quadrant(self, gaze_point: Tuple[int, int],
                        new_x_min: int, new_y_min: int,
                        new_x_max: int, new_y_max: int) -> Optional[str]:
        """
        Xác định vùng (quadrant) mà điểm gaze rơi vào.
        
        Chia vùng thành lưới 3x3:
        ┌─────────┬─────────┬─────────┐
        │ top_left│   top   │top_right│
        ├─────────┼─────────┼─────────┤
        │  left   │ center  │  right  │
        ├─────────┼─────────┼─────────┤
        │bot_left │ bottom  │bot_right│
        └─────────┴─────────┴─────────┘
        
        Args:
            gaze_point: Tọa độ điểm gaze (x, y)
            new_x_min, new_y_min, new_x_max, new_y_max: Vùng kiểm tra
            
        Returns:
            Tên quadrant (center/top/bottom/left/right/...) hoặc None
        """
        image_width = new_x_max - new_x_min
        image_height = new_y_max - new_y_min

        quadrants = [
            ("top_left", (new_x_min, new_y_min, new_x_min + int(image_width / 3),
                          new_y_min + int(image_height / 3))),
            ("top", (new_x_min + int(image_width / 3), new_y_min,
                     new_x_min + int(image_width * 2 / 3), new_y_min + int(image_height * 0.45))),
            ("top_right", (new_x_min + int(image_width * 2 / 3), new_y_min,
                           new_x_max, new_y_min + int(image_height / 3))),
            ("left", (new_x_min, new_y_min + int(image_height / 3),
                      new_x_min + int(image_width / 3), new_y_min + int(image_height * 2 / 3))),
            ("center", (new_x_min + int(image_width / 3), new_y_min + int(image_height / 3),
                        new_x_min + int(image_width * 2 / 3), new_y_min + int(image_height * 0.65))), # normal 0.7
            ("right", (new_x_min + int(image_width * 2 / 3), new_y_min + int(image_height / 3),
                       new_x_max, new_y_min + int(image_height * 2 / 3))),
            ("bottom_left", (new_x_min, new_y_min + int(image_height * 2 / 3),
                             new_x_min + int(image_width / 3), new_y_max)),
            ("bottom", (new_x_min + int(image_width / 3), new_y_min + int(image_height * 0.65), #normal 0.7
                        new_x_min + int(image_width * 2 / 3), new_y_max)),
            ("bottom_right", (new_x_min + int(image_width * 2 / 3), new_y_min + int(image_height * 2 / 3),
                              new_x_max, new_y_max)),
        ]

        for quadrant, (x_min, y_min, x_max, y_max) in quadrants:
            print(f"Checking quadrant: {quadrant}, Bounds: {(x_min, y_min, x_max, y_max)}")
            if x_min <= gaze_point[0] <= x_max and y_min <= gaze_point[1] <= y_max:
                print(f"✅ Gaze detected in quadrant: {quadrant}")
                return quadrant
        return None

    def draw_quadrant_rectangles(self, frame: np.ndarray,
                                 new_x_min: int, new_y_min: int,
                                 new_x_max: int, new_y_max: int) -> None:
        """Draw quadrant rectangles on the frame."""
        image_width = new_x_max - new_x_min
        image_height = new_y_max - new_y_min

        # Top rectangle
        top_x_min = new_x_min + int(image_width / 3)
        top_y_min = new_y_min
        top_x_max = new_x_min + int(image_width * 2 / 3)
        top_y_max = new_y_min + int(image_height * 0.45)
        cv2.rectangle(frame, (top_x_min, top_y_min), (top_x_max, top_y_max), (255, 0, 0), 2)

        # Bottom rectangle
        bottom_x_min = new_x_min + int(image_width / 3)
        bottom_y_min = new_y_min + int(image_height * 0.65)
        bottom_x_max = new_x_min + int(image_width * 2 / 3)
        bottom_y_max = new_y_max
        cv2.rectangle(frame, (bottom_x_min, bottom_y_min), (bottom_x_max, bottom_y_max), (0, 0, 255), 2)

        # Center rectangle
        center_x_min = new_x_min + int(image_width / 3)
        center_y_min = new_y_min + int(image_height / 3)
        center_x_max = new_x_min + int(image_width * 2 / 3)
        center_y_max = new_y_min + int(image_height * 0.65)
        cv2.rectangle(frame, (center_x_min, center_y_min), (center_x_max, center_y_max), (0, 255, 0), 2)

    def draw_screen_corners(self, frame: np.ndarray,
                            screen_width: int, screen_height: int) -> None:
        """Draw corner rectangles on the screen."""
        corner_size = 0.25
        corner_width = int(screen_width * corner_size)
        corner_height = int(screen_height * corner_size)

        self.corners = {
            "top_left": (0, 0, corner_width, corner_height),
            "top_right": (screen_width - corner_width, 0, screen_width, corner_height),
            "bottom_left": (0, screen_height - corner_height, corner_width, screen_height),
            "bottom_right": (screen_width - corner_width, screen_height - corner_height,
                             screen_width, screen_height)
        }

        for corner_name, (x_min, y_min, x_max, y_max) in self.corners.items():
            cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), self.colors[corner_name], 2)
            cv2.putText(frame, corner_name, (x_min + 5, y_min + 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, self.colors[corner_name], 2)

if __name__ == "__main__":
    """
    DEMO: Chạy Gaze Estimation trên 1 ảnh tĩnh
    
    CÁCH SỬ DỤNG:
    1. Chuẩn bị model L2CSNet_gaze360.pkl
    2. Chuẩn bị ảnh test có khuôn mặt
    3. Chạy: python gaze_estimator.py
    4. Kết quả in ra: gaze_direction (vùng nhìn) và face_distance (khoảng cách)
    
    KẾT HỢP VỚI HEAD POSE:
    - Có thể truyền yaw_pred từ HeadPoseEstimator để tăng độ chính xác
    - Hữu ích khi đầu quay nhiều (yaw > 0.6 rad)
    """
    # Khởi tạo GazeEstimator với model weights
    estimator = GazeEstimator(weights_path=r"G:\\Datas\\Python_Workspace\\practical-fastapi\\face-recognition\\api\\models\\L2CSNet_gaze360.pkl")
    
    # Đọc ảnh test
    frame_path = r"G:\Datas\Python_Workspace\practical-fastapi\right.jpg"
    # frame_path = r"G:\Datas\Python_Workspace\practical-fastapi\5393e58d6d4ae114b85b.jpg"
    # frame_path = r"G:\Datas\Python_Workspace\practical-fastapi\test_gaze.jpg"
    frame = cv2.imread(frame_path)

    # Giá trị yaw từ head pose estimation (optional)
    yaw_pred = 0.5  # Nếu có HeadPoseEstimator, truyền yaw_pred vào đây
    
    # Xử lý frame
    processed_frame, gaze_direction, face_distance = estimator.process_frame(frame, yaw_pred)
    
    processed_frame = cv2.resize(processed_frame, (800, 600))
    # In kết quả
    print(f"gaze_direction: {gaze_direction}")    # Vùng đang nhìn
    print(f"face_distance: {face_distance}")      # Khoảng cách (cm)

    # Hiển thị ảnh kết quả (uncomment để xem)
    # if processed_frame is not None:
    #     cv2.imshow("Gaze Estimation", processed_frame)
    #     cv2.waitKey(0)
    #     cv2.destroyAllWindows()