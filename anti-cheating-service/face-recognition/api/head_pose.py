# Import các thư viện cần thiết từ file lib.py
from lib import *
import matplotlib.pyplot as plt


class HeadPoseEstimator:
    """
    Class để ước tính tư thế đầu (Head Pose Estimation) từ ảnh/video.
    
    Chức năng chính:
    - Phát hiện các điểm đặc trưng trên khuôn mặt (facial landmarks)
    - Tính toán góc pitch (gật đầu), yaw (quay đầu), roll (nghiêng đầu)
    - Xác định hướng nhìn (Top/Bottom/Left/Right/Center)
    - Vẽ trục 3D lên ảnh để trực quan hóa tư thế đầu
    """
    def __init__(self, model_head_pose):
        """
        Khởi tạo HeadPoseEstimator.
        
        Args:
            model_head_pose: Model ML đã train để dự đoán góc pitch, yaw, roll
                            (thường là model sklearn như RandomForest, SVM, etc.)
        """
        self.model_head_pose = model_head_pose
        
        # Khởi tạo MediaPipe Face Mesh để detect facial landmarks
        # min_detection_confidence: Ngưỡng tin cậy tối thiểu để phát hiện khuôn mặt (0.5 = 50%)
        # min_tracking_confidence: Ngưỡng tin cậy tối thiểu để theo dõi khuôn mặt qua các frame
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(
            min_detection_confidence=0.5, min_tracking_confidence=0.5
        )

        # Tạo danh sách tên cột cho DataFrame
        # Bao gồm tọa độ x, y của 7 điểm đặc trưng: mũi, trán, mắt trái/phải, miệng trái/phải, cằm
        self.cols = []
        for pos in ['nose_', 'forehead_', 'left_eye_', 'mouth_left_', 'chin_', 'right_eye_', 'mouth_right_']:
            for dim in ('x', 'y'):
                self.cols.append(pos + dim)  # Ví dụ: nose_x, nose_y, forehead_x, ...

    def extract_features(self, img, face_mesh):
        """
        Trích xuất tọa độ của 7 điểm đặc trưng trên khuôn mặt.
        
        Args:
            img: Ảnh đầu vào (BGR format từ OpenCV)
            face_mesh: Object MediaPipe Face Mesh
            
        Returns:
            face_features: List chứa tọa độ x, y của 7 điểm (14 giá trị)
            
        Các điểm đặc trưng (theo chỉ số MediaPipe Face Mesh):
        - NOSE (1): Đầu mũi
        - FOREHEAD (10): Trán
        - LEFT_EYE (33): Mắt trái
        - MOUTH_LEFT (61): Góc miệng trái
        - CHIN (199): Cằm
        - RIGHT_EYE (263): Mắt phải
        - MOUTH_RIGHT (291): Góc miệng phải
        """
        NOSE = 1
        FOREHEAD = 10
        LEFT_EYE = 33
        MOUTH_LEFT = 61
        CHIN = 199
        RIGHT_EYE = 263
        MOUTH_RIGHT = 291

        result = face_mesh.process(img)
        face_features = []

        # Nếu phát hiện được khuôn mặt
        if result.multi_face_landmarks is not None:
            for face_landmarks in result.multi_face_landmarks:
                for idx, lm in enumerate(face_landmarks.landmark):
                    # Chỉ lấy 7 điểm đặc trưng quan trọng
                    if idx in [FOREHEAD, NOSE, MOUTH_LEFT, MOUTH_RIGHT, CHIN, LEFT_EYE, RIGHT_EYE]:
                        face_features.append(lm.x)  # Tọa độ x (đã normalize 0-1)
                        face_features.append(lm.y)  # Tọa độ y (đã normalize 0-1)
        return face_features

    def normalize(self, poses_df):
        """
        Chuẩn hóa tọa độ các điểm đặc trưng để không phụ thuộc vào kích thước/vị trí khuôn mặt.
        
        Quy trình chuẩn hóa:
        1. Dịch chuyển: Trừ tọa độ mũi khỏi tất cả điểm (mũi = gốc tọa độ 0,0)
        2. Scale: Chia cho khoảng cách giữa mouth_right và left_eye để normalize scale
        
        Args:
            poses_df: DataFrame chứa tọa độ thô của các điểm đặc trưng
            
        Returns:
            normalized_df: DataFrame đã chuẩn hóa, giúp model dự đoán chính xác hơn
        """
        normalized_df = poses_df.copy()
        
        # Chuẩn hóa cho cả x và y
        for dim in ['x', 'y']:
            # Bước 1: Dịch chuyển - đặt mũi làm gốc tọa độ (0, 0)
            for feature in ['forehead_' + dim, 'nose_' + dim, 'mouth_left_' + dim, 'mouth_right_' + dim,
                            'left_eye_' + dim, 'chin_' + dim, 'right_eye_' + dim]:
                normalized_df[feature] = poses_df[feature] - poses_df['nose_' + dim]

            # Bước 2: Scale - chia cho khoảng cách mouth_right đến left_eye để normalize
            diff = normalized_df['mouth_right_' + dim] - normalized_df['left_eye_' + dim]
            for feature in ['forehead_' + dim, 'nose_' + dim, 'mouth_left_' + dim, 'mouth_right_' + dim,
                            'left_eye_' + dim, 'chin_' + dim, 'right_eye_' + dim]:
                normalized_df[feature] = normalized_df[feature] / diff
        return normalized_df

    def draw_axes(self, img, pitch, yaw, roll, tx, ty, size=50):
        """
        Vẽ trục tọa độ 3D (X-Y-Z) lên ảnh để trực quan hóa tư thế đầu.
        
        Args:
            img: Ảnh đầu vào
            pitch: Góc gật đầu (lên/xuống) - đơn vị radian
            yaw: Góc quay đầu (trái/phải) - đơn vị radian
            roll: Góc nghiêng đầu (nghiêng trái/phải) - đơn vị radian
            tx, ty: Tọa độ điểm gốc (vị trí mũi) để vẽ trục
            size: Độ dài của các trục (pixel)
            
        Returns:
            new_img: Ảnh có vẽ 3 trục màu:
                - Đỏ (X-axis): Hướng trái/phải
                - Xanh lá (Y-axis): Hướng lên/xuống
                - Xanh dương (Z-axis): Hướng ra/vào màn hình
        """
        yaw = -yaw  # Đảo chiều yaw để phù hợp với hệ tọa độ ảnh
        
        # Tạo ma trận xoay từ góc Euler (pitch, yaw, roll)
        rotation_matrix = cv2.Rodrigues(np.array([pitch, yaw, roll]))[0].astype(np.float64)
        
        # Định nghĩa 3 trục đơn vị + điểm gốc trong không gian 3D
        axes_points = np.array([
            [1, 0, 0, 0],  # Trục X (đỏ)
            [0, 1, 0, 0],  # Trục Y (xanh lá)
            [0, 0, 1, 0]   # Trục Z (xanh dương)
        ], dtype=np.float64)
        
        # Xoay các trục theo tư thế đầu
        axes_points = rotation_matrix @ axes_points
        
        # Chiếu từ 3D xuống 2D và scale theo kích thước mong muốn
        axes_points = (axes_points[:2, :] * size).astype(int)
        axes_points[0, :] += int(tx)  # Dịch chuyển đến vị trí mũi (x)
        axes_points[1, :] += int(ty)  # Dịch chuyển đến vị trí mũi (y)

        new_img = img.copy()
        # Vẽ 3 đường thẳng từ gốc đến mỗi trục
        cv2.line(new_img, tuple(axes_points[:, 3].ravel()), tuple(axes_points[:, 0].ravel()), (255, 0, 0), 3)    # X - Đỏ
        cv2.line(new_img, tuple(axes_points[:, 3].ravel()), tuple(axes_points[:, 1].ravel()), (0, 255, 0), 3)    # Y - Xanh lá
        cv2.line(new_img, tuple(axes_points[:, 3].ravel()), tuple(axes_points[:, 2].ravel()), (0, 0, 255), 3)    # Z - Xanh dương
        return new_img

    def estimate_head_pose(self, frame):
        """
        Hàm chính để ước tính tư thế đầu từ 1 frame ảnh.
        
        QUY TRÌNH THỰC HIỆN:
        1. Trích xuất 7 điểm đặc trưng trên khuôn mặt
        2. Chuẩn hóa tọa độ các điểm
        3. Dự đoán góc pitch, yaw, roll bằng ML model
        4. Vẽ trục 3D lên ảnh
        5. Xác định hướng nhìn dựa trên ngưỡng
        
        Args:
            frame: Ảnh đầu vào (BGR format từ OpenCV)
            
        Returns:
            frame: Ảnh đã vẽ trục 3D và text hướng nhìn
            (pitch_pred, yaw_pred, roll_pred): Tuple 3 góc Euler (radian)
            text: Hướng nhìn dạng text (Top/Bottom/Left/Right/Center/...)
        """
        img_h, img_w, img_c = frame.shape
        text = ''
        pitch_pred, yaw_pred, roll_pred = 15.0, 15.0, 15.0  # Giá trị mặc định nếu không detect được

        # Bước 1: Trích xuất facial landmarks
        face_features = self.extract_features(frame, self.face_mesh)
        
        if len(face_features):
            # Bước 2: Chuyển thành DataFrame
            face_features_df = pd.DataFrame([face_features], columns=self.cols)
            
            # Bước 3: Chuẩn hóa dữ liệu
            face_features_normalized = self.normalize(face_features_df)
            
            # Bước 4: Dự đoán góc pitch, yaw, roll bằng model ML
            pitch_pred, yaw_pred, roll_pred = self.model_head_pose.predict(face_features_normalized).ravel()

            print(f"pitch_pred: {pitch_pred}, yaw_pred: {yaw_pred}, roll_pred: {roll_pred}")

            # Lấy vị trí mũi để làm điểm gốc vẽ trục
            nose_x = face_features_df['nose_x'].values[0] * img_w
            nose_y = face_features_df['nose_y'].values[0] * img_h
            
            # Bước 5: Vẽ trục 3D lên ảnh
            frame = self.draw_axes(frame, pitch_pred, yaw_pred, roll_pred, nose_x, nose_y)

            # Bước 6: Xác định hướng nhìn dựa trên ngưỡng (threshold = 0.3)
            # pitch > 0: nhìn lên, pitch < 0: nhìn xuống
            # yaw > 0: quay trái, yaw < 0: quay phải
            if pitch_pred > 0.3:
                text = 'Top'
                if yaw_pred > 0.3:
                    text = 'Top Left'
                elif yaw_pred < -0.3:
                    text = 'Top Right'
            elif pitch_pred < -0.3:
                text = 'Bottom'
                if yaw_pred > 0.3:
                    text = 'Bottom Left'
                elif yaw_pred < -0.3:
                    text = 'Bottom Right'
            elif yaw_pred > 0.3:
                text = 'Left'
            elif yaw_pred < -0.3:
                text = 'Right'
            else:
                text = 'Center'

        head_pose_text = f"head_pose: {text}"
        print(head_pose_text)
        # Vẽ text hướng nhìn lên ảnh
        cv2.putText(frame, head_pose_text, (25, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

        return frame, (pitch_pred, yaw_pred, roll_pred), text


if __name__ == "__main__":
    """
    DEMO: Chạy Head Pose Estimation trên 1 ảnh tĩnh
    
    CÁCH SỬ DỤNG:
    1. Chuẩn bị ảnh test và model đã train
    2. Chạy: python head_pose.py
    3. Kết quả sẽ hiển thị ảnh với trục 3D và text hướng nhìn
    
    YÊU CẦU:
    - File model: head_pose_model.pkl (model sklearn đã train)
    - Ảnh test: Ảnh có chứa khuôn mặt rõ ràng
    """
    # Đường dẫn đến ảnh test
    frame_path = r"G:\\Datas\\Python_Workspace\\practical-fastapi\\08d7f5ff9439186741285.jpg"
    frame = cv2.imread(frame_path)

    if frame is None:
        raise FileNotFoundError(f"Không thể đọc ảnh từ đường dẫn: {frame_path}")

    # Load model đã train
    model_head_pose = pickle.load(open('G:\\Datas\\Python_Workspace\\practical-fastapi\\face-recognition\\api\\models\\head_pose_model.pkl', 'rb'))

    # Khởi tạo estimator
    estimator = HeadPoseEstimator(model_head_pose)
    
    # Thực hiện ước tính tư thế đầu
    output_frame, angles, direction = estimator.estimate_head_pose(frame)

    print(f"angles: {angles}")
    print(f"drirection: {direction}")

    # Chuyển BGR sang RGB để hiển thị bằng matplotlib
    output_rgb = cv2.cvtColor(output_frame, cv2.COLOR_BGR2RGB)

    # Vẽ ảnh kết quả
    plt.figure(figsize=(8, 6))
    plt.imshow(output_rgb)
    plt.title(f"Head Pose: {direction}\nPitch: {angles[0]:.2f}, Yaw: {angles[1]:.2f}, Roll: {angles[2]:.2f}")
    plt.axis('off')
    plt.show()


