"""
MODULE FACE RECOGNITION - SỬ DỤNG INSIGHTFACE

Chức năng chính:
- Phát hiện và nhận diện khuôn mặt sử dụng InsightFace (model buffalo_l)
- Trích xuất face embeddings (vector đặc trưng 512 chiều)
- Xây dựng và quản lý database khuôn mặt
- So sánh khuôn mặt bằng cosine similarity
- Hỗ trợ thêm/xóa người khỏi database

Cài đặt InsightFace cho Windows Python 3.12:
https://github.com/Gourieff/Assets/blob/main/Insightface/insightface-0.7.3-cp312-cp312-win_amd64.whl
"""

import insightface
import numpy as np
import cv2
import os
import pickle
from numpy.linalg import norm

# ============================================================================
# KHỞI TẠO MODEL INSIGHTFACE
# ============================================================================

# Load model InsightFace (bao gồm face detector + embedding model)
# - buffalo_l: Model lớn, độ chính xác cao
# - Providers: CPUExecutionProvider (CPU) hoặc CUDAExecutionProvider (GPU)
model = insightface.app.FaceAnalysis(
    name='buffalo_l',
    providers=['CPUExecutionProvider']  # Đổi sang 'CUDAExecutionProvider' nếu có GPU
)

# Prepare model:
# - ctx_id=-1: Sử dụng CPU
# - ctx_id=0: Sử dụng GPU đầu tiên
model.prepare(ctx_id=-1)

# ============================================================================
# HÀM TRÍCH XUẤT EMBEDDING TỪ ẢNH
# ============================================================================

def get_embedding(image_path):
    """
    Trích xuất face embedding từ ảnh (chỉ chấp nhận 1 khuôn mặt).
    
    Args:
        image_path (str): Đường dẫn đến file ảnh
        
    Returns:
        numpy.ndarray: Vector embedding 512 chiều nếu có đúng 1 khuôn mặt
        None: Nếu không có khuôn mặt hoặc có nhiều hơn 1 khuôn mặt
        
    Lưu ý:
        - Hàm này yêu cầu ảnh có ĐÚNG 1 khuôn mặt
        - Dùng để xây dựng database hoặc verify user
    """
    img = cv2.imread(image_path)
    faces = model.get(img)  # Phát hiện tất cả khuôn mặt trong ảnh
    
    if len(faces) != 1:  # Chỉ chấp nhận đúng 1 khuôn mặt
        return None
    
    return faces[0].embedding  # Trả về embedding của khuôn mặt (vector 512 chiều)

def get_embedding_frame(img):
    """
    Trích xuất embeddings từ frame (có thể có nhiều khuôn mặt).
    
    Args:
        img (numpy.ndarray): Frame ảnh từ camera hoặc video (BGR format)
        
    Returns:
        tuple: (embeddings, num_faces)
            - embeddings (list): Danh sách các embedding vectors
            - num_faces (int): Số lượng khuôn mặt phát hiện được
            
    Ví dụ:
        >>> frame = cv2.imread('group_photo.jpg')
        >>> embeddings, count = get_embedding_frame(frame)
        >>> print(f"Phát hiện {count} khuôn mặt")
    """
    faces = model.get(img)  # Phát hiện tất cả khuôn mặt trong frame
    num_faces = len(faces)  # Đếm số lượng khuôn mặt

    if num_faces == 0:  # Không có khuôn mặt nào
        return None, num_faces

    # Trích xuất embedding của tất cả khuôn mặt
    embeddings = [face.embedding for face in faces]

    return embeddings, num_faces

def get_num_faces(img):
    """
    Đếm số lượng khuôn mặt trong ảnh.
    
    Args:
        img (numpy.ndarray): Frame ảnh (BGR format)
        
    Returns:
        int: Số lượng khuôn mặt phát hiện được
        
    Ứng dụng:
        - Phát hiện gian lận (nhiều người trong frame)
        - Kiểm tra có người trong ảnh hay không
    """
    faces = model.get(img)  # Phát hiện khuôn mặt
    num_faces = len(faces)  # Đếm số lượng
    return num_faces

# ============================================================================
# HÀM XÂY DỰNG DATABASE KHUÔN MẶT
# ============================================================================

def build_database(base_path):
    """
    Xây dựng database khuôn mặt từ cấu trúc thư mục.
    
    Cấu trúc thư mục yêu cầu:
    base_path/
        ├── person1/
        │   ├── img1.jpg
        │   ├── img2.jpg
        │   └── img3.jpg
        ├── person2/
        │   └── img1.jpg
        └── person3/
            ├── img1.jpg
            └── img2.jpg
    
    Args:
        base_path (str): Đường dẫn đến thư mục gốc chứa các thư mục con (mỗi thư mục = 1 người)
        
    Returns:
        dict: Database với structure:
            {
                'person1': embedding_vector_512d,
                'person2': embedding_vector_512d,
                ...
            }
            
    Quy trình:
        1. Duyệt qua từng thư mục con (= 1 người)
        2. Với mỗi người, trích xuất embedding từ tất cả ảnh
        3. Tính trung bình các embeddings → embedding đại diện
        4. Lưu vào dictionary
        
    Ví dụ:
        >>> database = build_database('face-recognition/api/train')
        >>> print(f"Database có {len(database)} người")
    """
    database = {}
    
    # Duyệt qua từng thư mục (mỗi thư mục = 1 người)
    for person_name in os.listdir(base_path):
        person_dir = os.path.join(base_path, person_name)
        
        if not os.path.isdir(person_dir):  # Bỏ qua nếu không phải thư mục
            continue
            
        embeddings = []
        
        # Trích xuất embedding từ tất cả ảnh của người này
        for img_name in os.listdir(person_dir):
            img_path = os.path.join(person_dir, img_name)
            embedding = get_embedding(img_path)
            
            if embedding is not None:  # Chỉ lấy ảnh có 1 khuôn mặt
                embeddings.append(embedding)
        
        if embeddings:
            # Tính trung bình các embeddings để tạo embedding đại diện
            # Giúp tăng độ chính xác khi có nhiều ảnh
            database[person_name] = np.mean(embeddings, axis=0)
            
    return database

# ============================================================================
# HÀM THÊM NGƯỜI VÀO DATABASE
# ============================================================================

def add_person_to_database(pickle_path, person_name, image_dir):
    """
    Thêm người mới vào database đã có (phiên bản cơ bản - không kiểm tra lỗi).
    
    Args:
        pickle_path (str): Đường dẫn đến file database.pkl
        person_name (str): Tên/ID của người cần thêm
        image_dir (str): Thư mục chứa ảnh của người đó
        
    Quy trình:
        1. Load database hiện tại từ pickle
        2. Trích xuất embeddings từ tất cả ảnh trong image_dir
        3. Tính trung bình embeddings
        4. Lưu vào database với key = person_name
        5. Ghi lại database vào file pickle
        
    Lưu ý:
        - Hàm này không kiểm tra lỗi chi tiết
        - Nên dùng add_person_to_database_test() để có error handling tốt hơn
    """
    # Load database hiện tại
    with open(pickle_path, 'rb') as f:
        database = pickle.load(f)

    embeddings = []
    
    # Trích xuất embedding từ tất cả ảnh
    for img_name in os.listdir(image_dir):
        img_path = os.path.join(image_dir, img_name)
        embedding = get_embedding(img_path)
        
        if embedding is not None:
            embeddings.append(embedding)

    if embeddings:
        # Tính trung bình và lưu vào database
        database[person_name] = np.mean(embeddings, axis=0)
        
        # Ghi lại database
        with open(pickle_path, 'wb') as f:
            pickle.dump(database, f)
            
        print(f"✅ Đã thêm {person_name} vào database.")
    else:
        print("❌ Không tìm thấy khuôn mặt nào để thêm.")


def get_embedding_test(image_path):
    """
    Trích xuất embedding với kiểm tra lỗi chi tiết.
    
    Args:
        image_path (str): Đường dẫn đến file ảnh
        
    Returns:
        tuple: (embedding, message)
            - embedding (numpy.ndarray | None): Vector embedding hoặc None nếu lỗi
            - message (str): Thông báo lỗi hoặc thành công
            
    Các trường hợp:
        1. Không có khuôn mặt → (None, "Không có khuôn mặt")
        2. Nhiều khuôn mặt → (None, "Nhiều hơn một khuôn mặt")
        3. Đúng 1 khuôn mặt → (embedding, "Một khuôn mặt hợp lệ")
        
    Ứng dụng:
        - Validate ảnh trước khi thêm vào database
        - Cung cấp thông tin lỗi chi tiết cho user
    """
    img = cv2.imread(image_path)
    faces = model.get(img)

    if len(faces) == 0:
        return None, "Không có khuôn mặt"
    elif len(faces) > 1:
        return None, "Nhiều hơn một khuôn mặt"
    else:
        return faces[0].embedding, "Một khuôn mặt hợp lệ"

def add_person_to_database_test(pickle_path, person_name, image_dir):
    """
    Thêm người vào database với error handling đầy đủ (KHUYÊN DÙNG).
    
    Args:
        pickle_path (str): Đường dẫn đến file database.pkl
        person_name (str): Tên/ID của người cần thêm
        image_dir (str): Thư mục chứa ảnh của người đó
        
    Returns:
        tuple: (success, error_images)
            - success (bool): True nếu thêm thành công, False nếu thất bại
            - error_images (list): Danh sách các ảnh bị lỗi
                [
                    {"image": "photo1.jpg", "error": "Không có khuôn mặt"},
                    {"image": "photo2.jpg", "error": "Nhiều hơn một khuôn mặt"},
                    ...
                ]
                
    Quy trình:
        1. Load database hiện tại
        2. Duyệt qua từng ảnh trong image_dir
        3. Với mỗi ảnh:
           - Thử trích xuất embedding
           - Nếu thành công → thêm vào danh sách
           - Nếu lỗi → ghi lại thông tin lỗi
        4. Nếu có ít nhất 1 embedding hợp lệ:
           - Tính trung bình embeddings
           - Lưu vào database
           - Trả về (True, danh_sách_lỗi)
        5. Nếu không có embedding nào hợp lệ:
           - Trả về (False, danh_sách_lỗi)
           
    Ví dụ:
        >>> success, errors = add_person_to_database_test(
        ...     'face_database.pkl',
        ...     '12345',
        ...     'train/12345'
        ... )
        >>> if success:
        ...     print(f"✅ Thêm thành công! Có {len(errors)} ảnh bị lỗi.")
        ... else:
        ...     print(f"❌ Thất bại! Tất cả ảnh đều lỗi.")
    """
    # Load database hiện tại
    with open(pickle_path, 'rb') as f:
        database = pickle.load(f)

    embeddings = []      # Danh sách embeddings hợp lệ
    error_images = []    # Danh sách ảnh bị lỗi

    # Duyệt qua từng ảnh và trích xuất embedding
    for img_name in os.listdir(image_dir):
        img_path = os.path.join(image_dir, img_name)
        embedding, message = get_embedding_test(img_path)

        if embedding is not None:
            embeddings.append(embedding)  # Thêm embedding hợp lệ
        else:
            # Ghi lại thông tin ảnh bị lỗi
            error_images.append({"image": img_name, "error": message})

    # Kiểm tra có ít nhất 1 embedding hợp lệ không
    if embeddings:
        # Tính trung bình và lưu vào database
        database[person_name] = np.mean(embeddings, axis=0)
        
        # Ghi lại database
        with open(pickle_path, 'wb') as f:
            pickle.dump(database, f)
            
        return True, error_images  # Thành công, có thể có một số ảnh lỗi
    else:
        return False, error_images  # Thất bại, tất cả ảnh đều lỗi

def add_all_people_to_database(pickle_path, root_folder):
    """
    Thêm tất cả người từ thư mục root vào database (batch processing).
    
    Args:
        pickle_path (str): Đường dẫn đến file database.pkl
        root_folder (str): Thư mục gốc chứa các thư mục con (mỗi thư mục = 1 người)
        
    Quy trình:
        1. Load database hiện có (hoặc tạo mới nếu chưa có)
        2. Duyệt qua tất cả thư mục con trong root_folder
        3. Với mỗi thư mục:
           - Trích xuất embeddings từ tất cả ảnh
           - Tính trung bình embeddings
           - Thêm vào database
        4. Lưu lại database
        
    Ứng dụng:
        - Xây dựng database ban đầu từ nhiều người
        - Cập nhật database hàng loạt
        - Migration dữ liệu
        
    Ví dụ:
        >>> add_all_people_to_database(
        ...     'face_database.pkl',
        ...     'face-recognition/api/train'
        ... )
        ✔️ Đã thêm: 12345
        ✔️ Đã thêm: 67890
        ⚠️ Không tìm thấy khuôn mặt trong: 11111
        ✅ Hoàn tất cập nhật database.
    """
    # Load database hiện có hoặc tạo mới
    if os.path.exists(pickle_path):
        with open(pickle_path, 'rb') as f:
            database = pickle.load(f)
    else:
        database = {}

    # Duyệt từng folder (mỗi folder là một người)
    for person_name in os.listdir(root_folder):
        person_dir = os.path.join(root_folder, person_name)
        
        if not os.path.isdir(person_dir):
            continue  # Bỏ qua nếu không phải thư mục

        embeddings = []
        
        # Trích xuất embedding từ tất cả ảnh của người này
        for img_name in os.listdir(person_dir):
            img_path = os.path.join(person_dir, img_name)
            embedding = get_embedding(img_path)
            
            if embedding is not None:
                embeddings.append(embedding)

        if embeddings:
            # Thành công - thêm vào database
            database[person_name] = np.mean(embeddings, axis=0)
            print(f"✔️ Đã thêm: {person_name}")
        else:
            # Không có ảnh hợp lệ nào
            print(f"⚠️ Không tìm thấy khuôn mặt trong: {person_name}")

    # Lưu lại database
    with open(pickle_path, 'wb') as f:
        pickle.dump(database, f)
        
    print("✅ Hoàn tất cập nhật database.")

# ============================================================================
# HÀM SO SÁNH VÀ NHẬN DIỆN KHUÔN MẶT
# ============================================================================

def find_match_cosine(query_embedding, database, threshold=0.3):
    """
    Tìm người khớp nhất trong database bằng cosine similarity.
    
    CÔNG THỨC COSINE SIMILARITY:
    similarity = (A · B) / (||A|| × ||B||)
    
    Với vector đã normalize: similarity = A · B (dot product)
    
    Args:
        query_embedding (numpy.ndarray): Embedding của khuôn mặt cần nhận diện
        database (dict): Database chứa embeddings của tất cả người
        threshold (float): Ngưỡng cosine similarity (0.3-0.5)
            - Thấp hơn → dễ nhận diện nhưng có thể sai
            - Cao hơn → khó nhận diện nhưng chính xác hơn
            
    Returns:
        tuple: (best_score, best_name)
            - best_score (float): Điểm similarity cao nhất (0-1)
            - best_name (str): Tên người khớp nhất hoặc "Unknown"
            
    Quy trình:
        1. Normalize query embedding (chia cho norm)
        2. Với mỗi người trong database:
           - Normalize database embedding
           - Tính cosine similarity (dot product)
           - So sánh với threshold và best_score hiện tại
        3. Trả về người có score cao nhất (nếu > threshold)
        
    Ví dụ:
        >>> query_emb = get_embedding('test.jpg')
        >>> score, name = find_match_cosine(query_emb, database, threshold=0.4)
        >>> print(f"Nhận diện: {name} với độ tin cậy {score:.2f}")
        Nhận diện: 12345 với độ tin cậy 0.87
        
    Lưu ý:
        - Threshold khuyên dùng: 0.3-0.5 tùy dataset
        - Score càng gần 1 càng giống
        - Score < threshold → "Unknown"
    """
    best_score = -1  # Điểm cao nhất tìm được
    best_name = "Unknown"  # Tên mặc định nếu không tìm thấy
    
    # Normalize query embedding về unit vector
    query_embedding = query_embedding / norm(query_embedding)
    
    # Duyệt qua tất cả người trong database
    for name, db_embedding in database.items():
        # Normalize database embedding
        db_embedding = db_embedding / norm(db_embedding)
        
        # Tính cosine similarity (với vector đã normalize = dot product)
        score = np.dot(query_embedding, db_embedding)
        
        # Cập nhật nếu score cao hơn và vượt ngưỡng
        if score > best_score and score > threshold:
            best_score = score
            best_name = name
            
    return best_score, best_name

def get_recognition_names(frame, database, threshold=0.3):
    """
    Nhận diện tất cả khuôn mặt trong frame và vẽ kết quả lên ảnh.
    
    Args:
        frame (numpy.ndarray): Frame ảnh từ camera/video (BGR format)
        database (dict): Database chứa embeddings của tất cả người
        threshold (float): Ngưỡng cosine similarity (0.3-0.5)
        
    Returns:
        tuple: (recognized_names, num_faces)
            - recognized_names (list): [(name1, score1), (name2, score2), ...]
            - num_faces (int): Số lượng khuôn mặt phát hiện được
            
    Tính năng:
        - Phát hiện tất cả khuôn mặt trong frame
        - Nhận diện từng khuôn mặt
        - Vẽ bounding box (đã comment - có thể bật lại)
        - Vẽ tên và score lên ảnh
        
    Quy trình:
        1. Trích xuất embeddings của tất cả khuôn mặt
        2. Lấy tọa độ bounding box của từng khuôn mặt
        3. Với mỗi embedding:
           - So sánh với database
           - Tìm người khớp nhất
           - Vẽ label (tên + score) lên frame
        4. Trả về danh sách (tên, điểm) và số lượng khuôn mặt
        
    Ví dụ sử dụng với webcam:
        >>> cap = cv2.VideoCapture(0)
        >>> while True:
        ...     ret, frame = cap.read()
        ...     names, count = get_recognition_names(frame, database, 0.3)
        ...     if names:
        ...         for name, score in names:
        ...             print(f"👤 {name} - Score: {score:.2f}")
        ...     cv2.imshow('Recognition', frame)
        ...     if cv2.waitKey(1) & 0xFF == ord('q'):
        ...         break
        >>> cap.release()
        
    Lưu ý:
        - Frame được modify trực tiếp (vẽ text lên ảnh)
        - Nếu muốn vẽ bounding box, uncomment dòng cv2.rectangle()
    """
    # Trích xuất embeddings của tất cả khuôn mặt
    embeddings, num_faces = get_embedding_frame(frame)

    if embeddings is None:
        return None, num_faces  # Không có khuôn mặt nào

    recognized_names = []  # Danh sách kết quả nhận diện
    face_locations = []    # Danh sách tọa độ bounding box

    # Lấy thông tin vị trí và embeddings của tất cả khuôn mặt
    faces = model.get(frame)
    for face in faces:
        # Trích xuất tọa độ bounding box [x1, y1, x2, y2]
        bbox = face.bbox.astype(int)
        x1, y1, x2, y2 = bbox
        face_locations.append((x1, y1, x2, y2))

    # Nhận diện từng khuôn mặt
    for i, embedding in enumerate(embeddings):
        # So sánh với database
        best_score, best_name = find_match_cosine(embedding, database, threshold)
        recognized_names.append((best_name, best_score))

        # Lấy tọa độ của khuôn mặt này
        x1, y1, x2, y2 = face_locations[i]

        # VẼ BOUNDING BOX (đã comment - uncomment để bật)
        # cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        # Vẽ tên và score lên ảnh
        label = f"{best_name} ({best_score:.2f})"
        cv2.putText(
            frame,                          # Ảnh cần vẽ
            label,                          # Text
            (x1, y1 - 10),                 # Vị trí (phía trên bounding box)
            cv2.FONT_HERSHEY_SIMPLEX,      # Font chữ
            0.9,                            # Font size
            (255, 255, 255),               # Màu trắng (BGR)
            2                               # Độ dày
        )

    return recognized_names, num_faces

if __name__ == "__main__":

    # # Ví dụ sử dụng
    base_path = "G:\\Datas\\Python_Workspace\\practical-fastapi\\face-recognition\\api\\database\\train"  # Mỗi thư mục là 1 người
    database = build_database(base_path)

    # Lưu database ra file
    with open('face_database.pkl', 'wb') as f:
        pickle.dump(database, f)

    print("Succesfull")
    #################################
    # # Tải lại database từ file
    # with open(r'/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/models/face_database_kaggle.pkl', 'rb') as f:
    #     database = pickle.load(f)

    # # test_img = "/content/Neymar_09.jpg"
    # test_img = r"/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/FaceDataset/val/son/6106919934559898110.jpg"

    # query_embedding = get_embedding(test_img)
    # if query_embedding is not None:
    #     best_score, best_name = find_match_cosine(query_embedding, database)
    #     print("Kết quả nhận dạng:", best_name)
    #     print("Kết quả score:", best_score)

    # else:
    #     print("Không phát hiện khuôn mặt.")
    ####################
    # ## ADD NEW PERSON
    # ## add_person_to_database('face_database_kaggle.pkl', 'name_new_person', '/path/to/new_person') # trong new_person chứa ảnh
    # add_person_to_database(r'D:\PyCharm\pythonProject\Face_Rec\face_database_kaggle.pkl', 'to_van_tu', r'D:\PyCharm\pythonProject\Face_Rec\FaceDataset\train\tovantu')

    ## ADD NEW ALL PERSON TO DATABASE
    ## add_all_people_to_database('face_database_kaggle.pkl', 'name_new_person', '/path/to/new_person') # trong new_person chứa ảnh
    # add_all_people_to_database(r'D:\PyCharm\pythonProject\Face_Rec\face_database_kaggle.pkl', r'D:\PyCharm\pythonProject\Face_Rec\FaceDataset\train')


    # database_path = "/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/models/face_database.pkl"
    # key_to_view = "adele_1234"

    # with open(database_path, "rb") as f:
    #     face_database = pickle.load(f)

    # if key_to_view in face_database:
    #     embeddings = face_database[key_to_view]
    #     print(f"Embedding(s) của '{key_to_view}':")
    #     print(embeddings)
    # else:
    #     print(f"Không tìm thấy key '{key_to_view}' trong database.")

    # database_path = "/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/models/face_database_kaggle.pkl"

    # try:
    #     with open(database_path, "rb") as f:
    #         face_database = pickle.load(f)
    # except Exception as e:
    #     print(f"❌ Lỗi khi đọc file database: {e}")
    #     exit(1)

    # print("Danh sách các key trong database:")
    # for key in face_database.keys():
    #     print(key)

    # Load database
    # with open('face_database.pkl', 'rb') as f:
    #     database = pickle.load(f)

    # # Ảnh cần nhận diện
    # test_img = r"G:\\Datas\\Python_Workspace\\practical-fastapi\\quang.jpg"

    # # Lấy embedding
    # query_embedding = get_embedding(test_img)

    # if query_embedding is not None:
    #     # Tìm người khớp nhất
    #     best_score, best_name = find_match_cosine(query_embedding, database, threshold=0.3)
        
    #     print(f"👤 Người nhận diện: {best_name}")
    #     print(f"📊 Độ tin cậy: {best_score:.2f}")
        
    #     if best_name == "Unknown":
    #         print("⚠️ Không tìm thấy người khớp trong database")
    # else:
    #     print("❌ Không phát hiện khuôn mặt trong ảnh")

    # Cách dùng get_recognition_names() để nhận diện trên ảnh hoặc video
    # Load database
with open('face_database.pkl', 'rb') as f:
    database = pickle.load(f)

# Mở webcam
# cap = cv2.VideoCapture(0)

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         break
    
#     # Nhận diện tất cả khuôn mặt trong frame
#     recognized_names, num_faces = get_recognition_names(frame, database, threshold=0.3)
    
#     if recognized_names:
#         for name, score in recognized_names:
#             print(f"👤 {name} - Score: {score:.2f}")
    
#     # Hiển thị
#     cv2.imshow('Face Recognition', frame)
    
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# cv2.destroyAllWindows()
