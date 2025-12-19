from ultralytics import YOLO
import cv2

# Load model chỉ 1 lần
model = YOLO("yolo11n.pt")

# Ngưỡng độ tin cậy tối thiểu
CONFIDENCE_THRESHOLD = 0.6

# Các class gian lận quan tâm
cheat_classes = {
    67: "cell phone",
    # 65: "remote",
    # 0: "person",
}

def detect_cheat_items(image_path):
    """
    Hàm phát hiện các đối tượng gian lận trong ảnh.

    Args:
        image_path (str): Đường dẫn đến ảnh hoặc ảnh đã đọc từ cv2.

    Returns:
        List[Dict] | None: Danh sách dict chứa 'label' và 'confidence' hoặc None nếu không phát hiện.
    """
    # # Đọc ảnh
    # image = cv2.imread(image_path)

    image = image_path

    if image is None:
        print("❌ Không đọc được ảnh.")
        return None

    # Dự đoán
    results = model(image_path)

    # Lưu kết quả hợp lệ
    detected_items = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls)
            conf = float(box.conf)
            if class_id in cheat_classes and conf >= CONFIDENCE_THRESHOLD:
                detected_items.append({
                    "label": cheat_classes[class_id],
                    "confidence": round(conf, 3)
                })

    # Trả về None nếu không phát hiện gì
    return detected_items if detected_items else None

if __name__ == "__main__":
    image_path = r"/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/Silent_Face_Anti_Spoofing/anh_dienthoai.jpg"
    image = cv2.imread(image_path)
    
    cheat_items = detect_cheat_items(image)
    print(cheat_items)
