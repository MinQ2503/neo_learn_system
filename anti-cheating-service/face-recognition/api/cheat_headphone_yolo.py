
from ultralytics import YOLO
import cv2
import os

# Path to the trained YOLO model
model_path = r"G:\Datas\Python_Workspace\practical-fastapi\face-recognition\api\models\best.pt"

# Load the YOLO model only once
model = YOLO(model_path)

# Ngưỡng độ tin cậy tối thiểu
CONFIDENCE_THRESHOLD = 0.6

# Các class quan tâm
cheat_classes = {
    0: "Earphone",
    1: "Headphone",
    2: "Neckband",
    3: "Airpods"
}

def detect_cheat_headphone(image_path):
    """
    Hàm phát hiện các đối tượng trong ảnh.

    Args:
        image_path (str): Đường dẫn đến ảnh hoặc ảnh đã đọc từ cv2.

    Returns:
        List[Dict] | None: Danh sách dict chứa 'label' và 'confidence' hoặc None nếu không phát hiện.
    """
    # Read the input image
    # image = cv2.imread(image_path)
    image = image_path


    if image is None:
        print(f"❌ Không đọc được ảnh từ {image_path}")
        return None

    # Perform inference on the image
    results = model(image)

    # Lưu kết quả hợp lệ
    detected_items = []

    # Process results
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls)
            conf = float(box.conf)
            if class_id in cheat_classes and conf >= CONFIDENCE_THRESHOLD:
                detected_items.append({
                    "label": cheat_classes[class_id],
                    "confidence": round(conf, 3)
                })

                # Get coordinates for drawing bounding box
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                label = f"{cheat_classes[class_id]} {conf:.2f}"

                # Draw bounding box and label on the image
                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    #
    # # Output image path
    # output_dir = r"D:\PyCharm\pythonProject\yolocarmorto\headphones_v2"
    # os.makedirs(output_dir, exist_ok=True)
    # output_image_path = os.path.join(output_dir, "output_image.jpg")
    #
    # # Save the output image with detections
    # cv2.imwrite(output_image_path, image)
    # print(f"Output image saved to {output_image_path}")
    #
    # # Optionally display the image with detections
    # cv2.imshow("YOLO Image Detection", image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    # Trả về None nếu không phát hiện gì
    return detected_items if detected_items else None

# Example usage
if __name__ == "__main__":
    input_image_path = r"D:\PyCharm\pythonProject\yolocarmorto\headphones_v2\earphone.jpg"
    # input_image_path = r"D:\PyCharm\pythonProject\yolocarmorto\headphones_v2\headphone_1.jpg"

    detected = detect_cheat_headphone(input_image_path)
    print("Detected items:", detected)