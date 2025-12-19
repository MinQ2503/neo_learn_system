from lib import *
from head_pose import *
from insight_face import *
from gaze_estimator import *
from cheat_items_yolo import *
from cheat_headphone_yolo import *
# import torch

# from test import test

# from src.anti_spoof_predict import AntiSpoofPredict
# from Silent_Face_Anti_Spoofing.src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name

# from screeninfo import get_monitors

class CheatingDetector:
    def __init__(self, face_database_path:str, gaze_weights_path: str, 
    head_pose_model_path: str,
    #   model_spoofing: str, 
      cheat_weights: dict = None):
        """Initialize cheating detection components."""
        if cheat_weights is None:
            cheat_weights = {
                "no_face": 1,
                "multiple_faces": 2,
                "gaze_off_screen": 1
            }

        self.cheat_weights = cheat_weights
        self.gaze_estimator = GazeEstimator(weights_path=gaze_weights_path)
        self.head_pose_estimator = HeadPoseEstimator(
            pickle.load(open(head_pose_model_path, 'rb'))
        )
        # self.database_face = pickle.load(open(face_database_path, 'rb'))
        self.database_face = face_database_path
        # self.model_spoofing = model_spoofing

    def run(self, image_path, cheat_weights=None):
        """
        Chạy vòng lặp phát hiện gian lận trên một ảnh đầu vào.
        
        Quy trình xử lý:
        1. Đọc ảnh từ đường dẫn.
        2. Phát hiện vật thể cấm (điện thoại, tai nghe) bằng YOLO.
        3. Ước lượng tư thế đầu (Head Pose).
        4. Ước lượng hướng mắt (Gaze Estimation).
        5. Nhận diện khuôn mặt (Face Recognition) so với database.
        6. Tổng hợp các kết quả để kết luận có gian lận hay không.
        
        Args:
            image_path (str): Đường dẫn tới file ảnh cần phân tích.
            cheat_weights (dict, optional): Trọng số điểm phạt cho từng hành vi gian lận.
            
        Returns:
            dict: Dictionary chứa kết quả phân tích chi tiết (gaze, head_pose, faces, cheating_status, v.v.)
        """

        # Cập nhật trọng số gian lận nếu được cung cấp
        if cheat_weights is not None:
            self.cheat_weights = cheat_weights

        # Đọc ảnh bằng OpenCV
        frame = cv2.imread(image_path)
        # frame = cv2.flip(frame, 1) # Lật ảnh nếu cần (thường dùng cho camera trước)

        if frame is None:
            return {"error": f"Không thể đọc ảnh từ {image_path}"}

        frame_height, frame_width = frame.shape[:2]
        # frame_height, frame_width = frame.shape[:2] # Dư thừa

        print("Chiều rộng:", frame_width)
        print("Chiều cao:", frame_height)

        result_dict = {}

        ############ 1. PHÁT HIỆN VẬT THỂ CẤM (YOLO) ###############
        # Sử dụng model YOLO để tìm điện thoại và tai nghe trong khung hình

        # cheat_items = detect_cheat_items(frame)
        # result_dict["cheat_items"] = cheat_items

        # Phát hiện điện thoại
        cheat_items = detect_cheat_items(frame)
        result_dict["cheat_mobilephone"] = cheat_items

        # Phát hiện tai nghe
        cheat_headphone = detect_cheat_headphone(frame)
        result_dict["cheat_headphone"] = cheat_headphone

        ############ KẾT THÚC YOLO ###############

        # Process frame for face spoofing (Tạm ẩn - Phát hiện giả mạo khuôn mặt)
        ## frame = test(frame.copy(), model_dir=self.model_spoofing, device_id=0)
        # name_label, frame = test(frame, model_dir=self.model_spoofing, device_id=0)
        # result_dict["spoofing"] = name_label

        ############ 2. ƯỚC LƯỢNG TƯ THẾ ĐẦU (HEAD POSE) ###############
        # Xác định góc quay của đầu (lên/xuống, trái/phải, nghiêng)
        head_pose_frame, angles, head_direction = self.head_pose_estimator.estimate_head_pose(frame)
        result_dict["head_pose"] = head_direction

        pitch_pred, yaw_pred, roll_pred = angles

        ############ 3. ƯỚC LƯỢNG HƯỚNG MẮT (GAZE ESTIMATION) ###############
        # Xác định mắt đang nhìn vào đâu (màn hình hay chỗ khác)
        # Sử dụng thông tin góc quay đầu (yaw_pred) để hỗ trợ tính toán chính xác hơn
        processed_frame, gaze_direction, face_distance = self.gaze_estimator.process_frame(
            head_pose_frame, yaw_pred=yaw_pred  # Replace with external yaw if available
        )
        result_dict["gaze"] = gaze_direction
        
        # Lưu khoảng cách khuôn mặt (nếu tính được)
        # result_dict["distance"] = float(f"{face_distance:.2f}")
        if face_distance is not None:
            result_dict["distance"] = float(f"{face_distance:.2f}")
        else:
            result_dict["distance"] = None

        ############ 4. NHẬN DIỆN KHUÔN MẶT (FACE RECOGNITION) ###############
        # Load database khuôn mặt (đã được train/add trước đó) từ file pickle
        database_face = pickle.load(open(self.database_face, 'rb'))
        recognition_frame = frame.copy()

        # So khớp khuôn mặt trong ảnh với database
        # threshold=0.3: Ngưỡng chấp nhận (càng thấp càng khắt khe, 0.3 là mức trung bình)
        # recognized_names, num_faces = get_recognition_names(processed_frame, self.database_face, threshold=0.2)
        # recognized_names, num_faces = get_recognition_names(processed_frame, database_face, threshold=0.1)
        recognized_names, num_faces = get_recognition_names(recognition_frame, database_face, threshold=0.3)
        
        result_dict["person"] = num_faces
        # print(f"num_faces: {num_faces}, {type(num_faces)}")


        result_dict["faces"] = []
        # Xử lý kết quả nhận diện
        if recognized_names:
            for name, score in recognized_names:
                print(f"Khuôn mặt được nhận diện: {name} với điểm số: {score}")

                score = float(f"{float(score):.2f}")
                result_dict["faces"].append({
                    "name": name,
                    "score": score  # ensure score is JSON serializable
                })
        else:
            print("Không phát hiện khuôn mặt trong ảnh.")
            result_dict["faces"].append({
                "name": None,
                "score": None
            })

        ############ 5. TỔNG HỢP KẾT QUẢ GIAN LẬN ###############
        ### Kiểm tra các điều kiện gian lận dựa trên số lượng mặt, hướng mắt, hướng đầu
        ### cheating_status = self.detect_cheating(len(faces), gaze_direction, head_direction, face_distance)
        cheating_status, cheat_status, score_point = self.detect_cheating(
            # num_faces=len(num_faces),
            num_faces=num_faces,
            gaze_direction=gaze_direction,
            head_direction=head_direction,
            face_distance=face_distance,
            cheat_headphone=cheat_headphone
        )
        result_dict["cheating"] = cheating_status

        # Nếu có trọng số điểm phạt, trả về chi tiết điểm
        if cheat_weights is not None:
            result_dict["cheat_status"] = cheat_status
            result_dict["total_cheat_score"] = score_point

        return result_dict
    

    def detect_cheating(self, num_faces, gaze_direction: Optional[str],
                       head_direction: Optional[str], face_distance: Optional[float], cheat_headphone=None) -> Optional[str]:
        """
        Phát hiện hành vi gian lận dựa trên số lượng khuôn mặt, hướng mắt, hướng đầu và khoảng cách.
        
        Args:
            num_faces (int): Số lượng khuôn mặt phát hiện được.
            gaze_direction (str): Hướng nhìn của mắt (center, left, right, up, down).
            head_direction (str): Hướng quay của đầu.
            face_distance (float): Khoảng cách từ mặt đến camera.
            cheat_headphone (bool/list): Kết quả phát hiện tai nghe.
            
        Returns:
            tuple: (is_cheating (bool), cheat_status (dict), total_score (int))
        """
        score_point = 0
        cheat_status = {
            "no_face": 0,
            "multiple_faces": 0,
            "gaze_off_screen": 0,
            "cheat_headphone": 0
        }
        # text = "No cheating"
        
        # 1. Kiểm tra số lượng khuôn mặt: Nhiều hơn 1 người -> Gian lận (Người lạ hỗ trợ)
        if num_faces > 1:
            print("Cheating: Multiple faces detected")
            score_point += self.cheat_weights.get("multiple_faces", 0)
            cheat_status["multiple_faces"] = score_point
            # text = "Cheating"
            # return text
            return True, cheat_status, score_point

        # 2. Kiểm tra số lượng khuôn mặt: Không có người nào -> Gian lận (Vắng mặt)
        if num_faces == 0:
            print("Cheating: 0 faces detected")
            score_point += self.cheat_weights.get("no_face", 0)
            cheat_status["no_face"] = score_point
            # text = "Cheating"
            # return text
            return True, cheat_status, score_point
         
        # 3. Kiểm tra hướng mắt: Không nhìn vào màn hình (center) -> Gian lận (Nhìn tài liệu/người khác)
        if gaze_direction and gaze_direction not in ["center"]:
            print(f"Cheating: Suspicious gaze direction ({gaze_direction})")
            score_point += self.cheat_weights.get("gaze_off_screen", 0)
            cheat_status["gaze_off_screen"] = score_point
            # text = "Cheating"
            # return text
            return True, cheat_status, score_point

        # 4. Kiểm tra tai nghe: Có tai nghe -> Gian lận
        if cheat_headphone:
            print("Cheating: Headphone detected")
            score_point += self.cheat_weights.get("cheat_headphone", 1) # Mặc định 1 điểm nếu không có trong config
            cheat_status["cheat_headphone"] = score_point
            return True, cheat_status, score_point

        # # Suspicious head direction
        # if head_direction and head_direction != "center":
        #     print(f"Cheating: Suspicious head direction ({head_direction})")
        #     return f"Cheating: Head {head_direction}"

        # # Face too close or too far
        # if face_distance and (face_distance < 30 or face_distance > 100):
        #     print(f"Cheating: Invalid face distance ({face_distance:.2f} cm)")
        #     return f"Cheating: Distance {face_distance:.2f} cm"

        return False, cheat_status, score_point

if __name__ == "__main__":
    # Initialize with paths to models and database
    detector = CheatingDetector(
        gaze_weights_path=r"face-recognition\api\models\L2CSNet_gaze360.pkl",
        head_pose_model_path=r"face-recognition\api\models\head_pose_model.pkl",
        face_database_path=r"G:\Datas\Python_Workspace\practical-fastapi\face-recognition\api\face_database.pkl",
        # model_spoofing=r"/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/Silent_Face_Anti_Spoofing/resources/anti_spoof_models"
    )

    # frame_path = r"D:\PyCharm\pythonProject\Face_Rec\FaceDataset\train\to_van_tu\1.jpg"
    frame_path = r"G:\Datas\Python_Workspace\practical-fastapi\face-recognition\api\test_image.jpg"

    # json_test = detector.run(image_path=frame_path)
    # print(json_test)