import os
import io
import random
import string
import re
import csv
import uuid
import time
import shutil
import aiofiles
import logging
from typing import Annotated
# from typing_extensions import Annotated
import json
from shutil import copyfile
from fastapi import FastAPI, UploadFile, File, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles

from concurrent.futures import ThreadPoolExecutor
import asyncio

from insight_face import *

from datetime import datetime, timezone, timedelta
import unicodedata

# from image_cheat_detection import FaceDetectors  # Model phát hiện gian lận bằng khuôn mặt
from image_facecheat import *

# Lấy đường dẫn thư mục hiện tại của file này
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR) # face-recognition

# Thư mục chứa ảnh database của ảnh
BASE_DIR_DATA_IMAGE = os.path.join(CURRENT_DIR, "database", "train")

# Thư mục chứa ảnh từ backend (profile_image_users)
BACKEND_UPLOAD_DIR = os.path.join(PARENT_DIR, "..", "..", "backend", "cmd", "uploads", "profile_image_users")

# Thư mục chứa ảnh cheating (sẽ tạo theo cấu trúc quiz_attempt_id/user_id/)
BACKEND_CHEATING_IMAGE_DIR = os.path.join(PARENT_DIR, "..", "..", "backend", "cmd", "uploads", "cheating_image_users")
os.makedirs(BACKEND_CHEATING_IMAGE_DIR, exist_ok=True)

# Thư mục chứa ảnh cheating (legacy)
CHEATING_IMAGE_DIR = os.path.join(PARENT_DIR, "logs", "cheating_images")
os.makedirs(CHEATING_IMAGE_DIR, exist_ok=True)

# Thư mục chứa log
LOG_DIR = os.path.join(PARENT_DIR, "logs", "logs")
CSV_DIR = os.path.join(PARENT_DIR, "logs", "cheat_csv")

os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(CSV_DIR, exist_ok=True)

LOG_CHEAT = os.path.join(LOG_DIR, "cheat.log")
LOG_NO_CHEAT = os.path.join(LOG_DIR, "no_cheat.log")
LOG_ERROR = os.path.join(LOG_DIR, "error.log")
LOG_REALTIME = os.path.join(LOG_DIR, "realtime.log")
LOG_NEWPERSON = os.path.join(LOG_DIR, "new_person.log")
LOG_DOWNLOADCSV = os.path.join(LOG_DIR, "download_csv.log")
LOG_DELETEPERSON = os.path.join(LOG_DIR, "delete_person.log")

# Thư mục lưu tạm ảnh upload
UPLOAD_DIR = os.path.join(CURRENT_DIR, "temp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Khởi tạo app và model
app = FastAPI(title="Face Detection API", description="API phát hiện gian lận qua khuôn mặt", version="1.0")

app.mount("/get_cheating_image", StaticFiles(directory=CHEATING_IMAGE_DIR), name="get_cheating_image")

# Face database
# FACE_DATABASE_PATH = "/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/models/face_database_kaggle.pkl"
FACE_DATABASE_PATH = os.path.join(CURRENT_DIR, "face_database.pkl")

facedetector = CheatingDetector(
        gaze_weights_path=os.path.join(CURRENT_DIR, "models", "L2CSNet_gaze360.pkl"),
        head_pose_model_path=os.path.join(CURRENT_DIR, "models", "head_pose_model.pkl"),
        # face_database_path=r"/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/models/face_database_kaggle.pkl",
        face_database_path=FACE_DATABASE_PATH,

        # model_spoofing=r"G:\Datas\Python_Workspace\practical-fastapi\face-recognition\api\resources\anti_spoof_models"
        )

# Middleware CORS nếu cần mở rộng hệ thống sau này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def log_to_file(filepath, content):
    with open(filepath, "a") as f:
        f.write(content + "\n")

def get_current_vietnam_time_log_format():
    tz_vietnam = timezone(timedelta(hours=7))
    now_vietnam = datetime.now(tz_vietnam)
    timestamp = now_vietnam.strftime("%Y-%m-%d %H:%M:%S")
    return timestamp


def normalize_vietnamese_name(name: str) -> str:
    """
    Chuẩn hóa tên tiếng Việt: loại bỏ dấu, chuyển thành chữ thường, thay khoảng trắng bằng underscore.
    Ví dụ: "Nguyễn Minh Quang" -> "nguyen_minh_quang"
    """
    # Loại bỏ dấu tiếng Việt
    name = unicodedata.normalize('NFD', name)
    name = ''.join(char for char in name if unicodedata.category(char) != 'Mn')
    # Chuyển thành chữ thường
    name = name.lower()
    # Thay khoảng trắng bằng underscore và loại bỏ ký tự đặc biệt
    name = re.sub(r'[^a-z0-9_]+', '_', name)
    # Loại bỏ underscore thừa ở đầu/cuối
    name = name.strip('_')
    return name


def save_cheating_logs(
    log_dir: str,
    candidate_id: str,
    exam_class: str,
    exam_shift: str,
    file_name: str,
    detect_result: dict = None,
    point: bool = False,
    is_error: bool = False,
    error_message: str = None,
):
    """
    Ghi log kết quả phát hiện gian lận hoặc lỗi hệ thống.

    Args:
        log_dir (str): Thư mục gốc chứa các file log.
        candidate_id (str): Mã thí sinh.
        candidate_name (str): Tên thí sinh.
        exam_class (str): Lớp thi.
        exam_shift (str): Ca thi.
        file_name (str): Tên file ảnh gốc.
        detect_result (dict, optional): Kết quả detect từ model.
        point (bool, optional): Ghi vào thư mục hậu tố "_point" nếu True.
        is_error (bool, optional): Nếu True thì ghi log lỗi.
        error_message (str, optional): Nội dung lỗi chi tiết nếu có.
    """

    tz_vietnam = timezone(timedelta(hours=7))
    now_vietnam = datetime.now(tz_vietnam)

    timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')
    timestamp_file = now_vietnam.strftime("%Y%m%d")

    folder_suffix = "_point" if point else ""
    exam_log_dir = os.path.join(log_dir, f"{exam_class}-{exam_shift}-{timestamp_file}{folder_suffix}")
    os.makedirs(exam_log_dir, exist_ok=True)

    log_file_cathi = os.path.join(exam_log_dir, f"{exam_class}-{exam_shift}-{timestamp_file}.log")
    log_file_student = os.path.join(exam_log_dir, f"{candidate_id}-{exam_class}-{exam_shift}-{timestamp_file}.log")

    # ✅ Chuẩn bị nội dung log
    if is_error:
        log_entry = f"[{timestamp}] ❌ ERROR | Candidate ID: {candidate_id} | Class: {exam_class} | Shift: {exam_shift} | File: {file_name} | Error: {error_message}\n"
    else:
        log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Class: {exam_class} | Shift: {exam_shift} | File: {file_name} | Result: {detect_result}\n"

    # Ghi log vào file
    with open(log_file_cathi, "a", encoding="utf-8") as f:
        f.write(log_entry)
    with open(log_file_student, "a", encoding="utf-8") as f:
        f.write(log_entry)


def get_exam_image_path(
    base_dir: str,
    exam_class: str,
    exam_shift: str,
    filename: str,
    point: bool = False
) -> str:
    """
    Tạo thư mục lưu ảnh theo lớp và ca thi, có thể thêm hậu tố '_point' nếu cần.

    Args:
        base_dir (str): Thư mục gốc chứa ảnh gian lận.
        exam_class (str): Lớp thi (VD: AI1).
        exam_shift (str): Ca thi (VD: 1, 2, 3).
        filename (str): Tên file ảnh (VD: jackma_20240622_0830.jpg).
        point (bool): Nếu True thì thêm hậu tố '_point' vào thư mục ca thi.

    Returns:
        str: Đường dẫn đầy đủ tới file ảnh, tạo thư mục nếu chưa có.
    """

    tz_vietnam = timezone(timedelta(hours=7))
    now_vietnam = datetime.now(tz_vietnam)

    timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')
    timestamp_file = now_vietnam.strftime("%Y%m%d")

    folder_suffix = "_point" if point else ""
    exam_folder = f"{exam_class}-{exam_shift}-{timestamp_file}{folder_suffix}"
    exam_image_dir = os.path.join(base_dir, exam_folder)
    os.makedirs(exam_image_dir, exist_ok=True)

    return os.path.join(exam_image_dir, filename)




# Giao diện HTML đơn giản cho test
@app.get("/", response_class=HTMLResponse)
async def main():
    return FileResponse(os.path.join(CURRENT_DIR, "templates", "index.html"))
##################################################################################

@app.post("/hello")
async def post_hello(name: str = Form(...)):
    return {"message": f"hello {name}"}

##################################################################################


##################################################################################


# API phát hiện gian lận/khuôn mặt từ ảnh
@app.post("/detect", summary="Phát hiện gian lận qua ảnh", description="Nhận ảnh và phát hiện khuôn mặt nghi ngờ")
async def detect_face(request: Request, file: UploadFile = File(...)):
    # Kiểm tra định dạng ảnh
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG hoặc PNG.")

    # Lấy tên file gốc và chuẩn hóa
    filename_base, file_ext = os.path.splitext(file.filename)

    # Định nghĩa múi giờ UTC+7
    tz_vietnam = timezone(timedelta(hours=7))

    # Lấy thời gian hiện tại theo múi giờ UTC+7
    now_vietnam = datetime.now(tz_vietnam)

    # Định dạng thời gian để sử dụng trong tên tệp
    timestamp_str = now_vietnam.strftime("%Y-%m-%d %H:%M:%S")
    timestamp_file = now_vietnam.strftime("%Y%m%d-%H%M%S")

    saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, saved_filename)

    try:
        # Ghi file async
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        # Gọi model
        start_time = time.time()
        result = facedetector.run(image_path=temp_path)
        end_time = time.time()

        execution_time = end_time - start_time
        result["execution_time"] = f"{execution_time:.2f} seconds"

        # Chuẩn bị thông tin log
        # cheating_status = result.get("cheating", "").lower()
        # cheating_status = result.get("cheating", "")


        # timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        timestamp = now_vietnam.strftime("%Y-%m-%d %H:%M:%S")

        log_entry = f"[{timestamp}] File: {file.filename} | Result: {result} | Time: {execution_time:.2f}s\n"

        # Xử lý lưu ảnh và ghi log theo kết quả
        saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)

        # if cheating_status == "cheating":
        if result.get("cheating", False):
        
            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)
            
            # ✅ Lưu lại ảnh gian lận
            copyfile(temp_path, saved_image_path)

            # ✅ Ghi log CSV
            timestamp_csv = now_vietnam.strftime("%Y%m%d")
            csv_path = os.path.join(CSV_DIR, f"cheat_{timestamp_csv}.csv")
            csv_exists = os.path.isfile(csv_path)

            with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
                writer = csv.writer(csvfile)
                if not csv_exists:
                    writer.writerow(["timestamp", "filename", "result", "execution_time"])  # Header
                writer.writerow([timestamp, saved_filename, result.get("cheating", ""), f"{execution_time:.2f}s"])
            

        # elif cheating_status == "no cheating":
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)
            
            # # ✅ Lưu lại ảnh gian lận
            # copyfile(temp_path, saved_image_path)

            # # ✅ Ghi log CSV
            # timestamp_csv = now_vietnam.strftime("%Y%m%d")
            # csv_path = os.path.join(CSV_DIR, f"cheat_{timestamp_csv}.csv")
            # csv_exists = os.path.isfile(csv_path)

            # with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
            #     writer = csv.writer(csvfile)
            #     if not csv_exists:
            #         writer.writerow(["timestamp", "filename", "result", "execution_time"])  # Header
            #     writer.writerow([timestamp, saved_filename, result.get("cheating", ""), f"{execution_time:.2f}s"])
            

        # Ghi log realtime
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(log_entry)

        return JSONResponse(content=result)

    except Exception as e:
        # timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        error_message = f"[{timestamp_str }] Lỗi xử lý file {file.filename}: {str(e)}\n"
        logger.error(error_message)
        with open(LOG_ERROR, "a", encoding="utf-8") as f:
            f.write(error_message)
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(error_message)
        raise HTTPException(status_code=500, detail="Lỗi trong quá trình xử lý ảnh")

    finally:
        # Xoá file tạm
        if os.path.exists(temp_path):
            os.remove(temp_path)

##################################################################################

##################################################################################


# API phát hiện gian lận/khuôn mặt từ ảnh
@app.post("/detect_point", summary="Phát hiện gian lận qua ảnh", description="Nhận ảnh và phát hiện khuôn mặt nghi ngờ")
async def detect_face_point(request: Request,
                            cheat_weights_str: Annotated[str, Form(...)],
                            file: UploadFile = File(...)
                            ):
    # Kiểm tra định dạng ảnh
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG hoặc PNG.")

    # Lấy tên file gốc và chuẩn hóa
    filename_base, file_ext = os.path.splitext(file.filename)

    # Định nghĩa múi giờ UTC+7
    tz_vietnam = timezone(timedelta(hours=7))

    # Lấy thời gian hiện tại theo múi giờ UTC+7
    now_vietnam = datetime.now(tz_vietnam)

    # Định dạng thời gian để sử dụng trong tên tệp
    timestamp_str = now_vietnam.strftime("%Y-%m-%d %H:%M:%S")
    timestamp_file = now_vietnam.strftime("%Y%m%d-%H%M%S")

    saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, saved_filename)

    try:
        # Ghi file async
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        # Gọi model
        start_time = time.time()
        cheat_weights = json.loads(cheat_weights_str)
        # result = main_point(frame_path=temp_path, model_name=model_name, weight_path=weight_path, cheat_weights=cheat_weights)
        result = facedetector.run(image_path=temp_path, cheat_weights=cheat_weights)
        end_time = time.time()

        execution_time = end_time - start_time
        result["execution_time"] = f"{execution_time:.2f} seconds"

        # Chuẩn bị thông tin log
        # cheating_status = result.get("cheating", "").lower()
        # cheating_status = result.get("cheating", "")

        # timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        timestamp = now_vietnam.strftime("%Y-%m-%d %H:%M:%S")

        log_entry = f"[{timestamp}] File: {file.filename} | Result: {result} | Time: {execution_time:.2f}s\n"

        # Xử lý lưu ảnh và ghi log theo kết quả
        saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)

        # if cheating_status == "cheating":
        if result.get("cheating", False):
            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            # ✅ Lưu lại ảnh gian lận
            copyfile(temp_path, saved_image_path)

            # ✅ Ghi log CSV
            timestamp_csv = now_vietnam.strftime("%Y%m%d")
            csv_path = os.path.join(CSV_DIR, f"cheat_{timestamp_csv}.csv")
            csv_exists = os.path.isfile(csv_path)

            # with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
            #     writer = csv.writer(csvfile)
            #     if not csv_exists:
            #         writer.writerow(["timestamp", "filename", "result", "execution_time"])  # Header
            #     writer.writerow([timestamp, saved_filename, result.get("cheating", ""), f"{execution_time:.2f}s"])
            with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
                writer = csv.writer(csvfile)
                if not csv_exists:
                    writer.writerow([
                        "timestamp", 
                        "filename", 
                        "result", 
                        "execution_time",
                        "no_face", 
                        "multiple_faces", 
                        "gaze_off_screen", 
                        "total_cheat_score"
                    ])  # Header

                cheat_status = result.get("cheat_status", {})
                writer.writerow([
                    timestamp, 
                    saved_filename, 
                    result.get("cheating", ""), 
                    f"{execution_time:.2f}s",
                    cheat_status.get("no_face", ""), 
                    cheat_status.get("multiple_faces", ""), 
                    cheat_status.get("gaze_off_screen", ""), 
                    result.get("total_cheat_score", "")
                ])

        # elif cheating_status == "no cheating":
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            # # ✅ Lưu lại ảnh gian lận
            # copyfile(temp_path, saved_image_path)

            # # ✅ Ghi log CSV
            # timestamp_csv = now_vietnam.strftime("%Y%m%d")
            # csv_path = os.path.join(CSV_DIR, f"cheat_{timestamp_csv}.csv")
            # csv_exists = os.path.isfile(csv_path)

            # with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
            #     writer = csv.writer(csvfile)
            #     if not csv_exists:
            #         writer.writerow(["timestamp", "filename", "result", "execution_time"])  # Header
            #     writer.writerow([timestamp, saved_filename, result.get("cheating", ""), f"{execution_time:.2f}s"])

        # Ghi log realtime
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(log_entry)

        return JSONResponse(content=result)

    except Exception as e:
        # timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        error_message = f"[{timestamp_str}] Lỗi xử lý file {file.filename}: {str(e)}\n"
        logger.error(error_message)
        with open(LOG_ERROR, "a", encoding="utf-8") as f:
            f.write(error_message)
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(error_message)
        raise HTTPException(status_code=500, detail="Lỗi trong quá trình xử lý ảnh")

    finally:
        # Xoá file tạm
        if os.path.exists(temp_path):
            os.remove(temp_path)


##################################################################################


##################################################################################

# Post thêm candidate_id và candidate_name
@app.post("/detect_pro", summary="Phát hiện gian lận qua ảnh", description="Nhận ảnh, ID và tên người dự thi để phát hiện khuôn mặt nghi ngờ")
async def detect_face_pro(
    request: Request,
    candidate_id: str = Form(..., description="ID của thí sinh"),
    candidate_name: str = Form(..., description="Tên của thí sinh"),
    file: UploadFile = File(..., description="Ảnh của thí sinh")
):
    # Kiểm tra định dạng ảnh
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG hoặc PNG.")

    base_url = str(request.base_url)

    # Tạo tên file tạm duy nhất
    # file_ext = os.path.splitext(file.filename)[1]
    filename_base, file_ext = os.path.splitext(file.filename)
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)


    try:
        # Ghi file async
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        logger.info(f"File written to {temp_path}")

        # Debug: Xác nhận nhận đúng candidate_id và candidate_name
        logger.info(f"Received: candidate_id={candidate_id}, candidate_name={candidate_name}, file={file.filename}")

        # Gọi model detect
        start_time = time.time()
        try:
            # detect_result = facedetector.face_detector(temp_path)
            detect_result = facedetector.run(image_path=temp_path)
        except Exception as detect_error:
            logger.error(f"Lỗi trong facedetector.face_detector: {str(detect_error)}")
            raise HTTPException(status_code=500, detail=f"Lỗi trong facedetector: {str(detect_error)}")
        end_time = time.time()

        # Debug: Kiểm tra kết quả từ facedetector
        logger.info(f"Detect Result: {detect_result}")

        # Kiểm tra detect_result
        if not isinstance(detect_result, dict):
            logger.error(f"Detect result is not a dictionary: {detect_result}")
            raise HTTPException(status_code=500, detail="Kết quả từ facedetector không hợp lệ")

        # Kiểm tra kết quả gian lận
        # cheating_status = detect_result.get("cheating", "").lower()
        # cheating_status = detect_result.get("cheating", "")

        # Định nghĩa múi giờ UTC+7
        tz_vietnam = timezone(timedelta(hours=7))

        # Lấy thời gian hiện tại theo múi giờ UTC+7
        now_vietnam = datetime.now(tz_vietnam)

        # Định dạng thời gian để sử dụng trong tên tệp
        timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')

        timestamp_file = now_vietnam.strftime('%Y%m%d-%H%M%S')
        saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"
        saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)

        execution_time = end_time - start_time
        detect_result["execution_time"] = f"{execution_time:.2f} seconds"

        log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Name: {candidate_name} | File: {file.filename} | Result: {detect_result} | Time: {end_time - start_time:.2f}s\n"

        reasons = []
        # 1️⃣ Điện thoại
        # if detect_result.get("cheat_mobilephone") == "cell phone":
        #     reasons.append("Phát hiện điện thoại")
        cheat_phone_list = detect_result.get("cheat_mobilephone")
        if cheat_phone_list and any(item.get("label") == "cell phone" for item in cheat_phone_list):
            reasons.append("Phát hiện điện thoại")

        # 2️⃣ Tai nghe
        # if detect_result.get("cheat_headphone") is not None:
        #     reasons.append("Phát hiện tai nghe")
        cheat_headphone_list = detect_result.get("cheat_headphone")

        if cheat_headphone_list and any(
            item.get("label") in ["Earphone", "Headphone", "Neckband", "Airpods"]
            for item in cheat_headphone_list
        ):
            reasons.append("Phát hiện tai nghe")

        # 3️⃣ Ánh mắt lệch (gaze)
        if detect_result.get("gaze") and detect_result["gaze"].lower() != "center":
            reasons.append("Mắt nhìn ra hướng khác")

        # 4️⃣ Không có người
        if detect_result.get("person", 1) == 0:
            reasons.append("Không có người trong ca thi")

        # 5️⃣ Nhiều người trong ảnh
        # if detect_result.get("person", 1) > 1:
        #     reasons.append("Có nhiều người trong ảnh")
        person_count = detect_result.get("person", 1)

        # 6️⃣ Không đúng người dự thi
        faces = detect_result.get("faces", [])
        if faces and isinstance(faces, list):
            face_name = faces[0].get("name")
            if face_name and face_name != candidate_id:
                reasons.append("Không đúng người dự thi")
                detect_result["cheating"] = True  # ✅ Đánh dấu là có gian lận

        if person_count > 1:
            reasons.append(f"Có {person_count} người trong ảnh")

        # Nếu không phát hiện gì
        if not reasons:
            reasons.append("Không phát hiện gian lận")

        # Gộp lại thành 1 câu trả về
        reason_cheating = ", ".join(reasons)
        detect_result["cheating_reason"] = reason_cheating
        relative_path = None

        # Ghi log theo loại kết quả
        # if "cheating" == cheating_status:
        cheating_image_path = None
        if detect_result.get("cheating", False):

            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            relative_path = os.path.relpath(saved_image_path, start="/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/Silent_Face_Anti_Spoofing/cheating_images")
            # cheating_image_path = f"{str(request.base_url)}proxy/8080/get_cheating_image/{relative_path}"

            detect_result["cheating_image_path"] = relative_path

            # ✅ Lưu lại ảnh gian lận
            copyfile(temp_path, saved_image_path)

            # ✅ Ghi log CSV
            timestamp_csv = now_vietnam.strftime("%Y%m%d")
            csv_path = os.path.join(CSV_DIR, f"cheat_{timestamp_csv}.csv")
            csv_exists = os.path.isfile(csv_path)

            with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
                writer = csv.writer(csvfile)
                if not csv_exists:
                    writer.writerow(["timestamp", "filename", "result", "execution_time"])  # Header
                writer.writerow([timestamp, saved_filename, detect_result.get("cheating", ""), f"{execution_time:.2f}s"])


        # elif "no cheating" == cheating_status:
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            ## ✅ Lưu lại ảnh gian lận
            # copyfile(temp_path, saved_image_path)

        detect_result["cheating_image_path"] = relative_path

        # Luôn ghi vào log realtime
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(log_entry)

        # Tạo kết quả trả về
        response = {
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "detect_result": detect_result,
            # "cheating_image_path": relative_path,
            "execution_time": f"{end_time - start_time:.2f} seconds"
        }

        logger.info(f"Response: {response}")

        # # Ghi log thông tin xử lý và trả về kết quả
        # log_message = f"ID: {candidate_id} | Name: {candidate_name} | File: {file.filename} | Result: {response}\n"
        # with open(LOG_FILE, "a", encoding="utf-8") as log_file:
        #     log_file.write(log_message)

        return JSONResponse(content=response)

    # except Exception as e:
    #     logger.error(f"Lỗi xử lý file {file.filename}: {str(e)}")
    #     raise HTTPException(status_code=500, detail=f"Lỗi trong quá trình xử lý ảnh: {str(e)}")

    except Exception as e:
        # Ghi log lỗi
        # timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        error_message = f"[{timestamp}] Lỗi xử lý file {file.filename}: {str(e)}\n"
        logger.error(error_message)

        with open(LOG_ERROR, "a", encoding="utf-8") as f:
            f.write(error_message)

        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(error_message)

        raise HTTPException(status_code=500, detail="Lỗi trong quá trình xử lý ảnh")

    finally:
        # Xoá file tạm
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Lỗi khi xóa file tạm {temp_path}: {str(e)}")

##################################################################################


##################################################################################

# Post thêm candidate_id và candidate_name
@app.post("/detect_pro_point", summary="Phát hiện gian lận qua ảnh", description="Nhận ảnh, ID và tên người dự thi để phát hiện khuôn mặt nghi ngờ")
async def detect_face_pro_point(
    request: Request,
    cheat_weights_str: Annotated[str, Form(...)],
    candidate_id: str = Form(..., description="ID của thí sinh"),
    candidate_name: str = Form(..., description="Tên của thí sinh"),
    file: UploadFile = File(..., description="Ảnh của thí sinh")
):
    # Kiểm tra định dạng ảnh
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG hoặc PNG.")

    # Tạo tên file tạm duy nhất
    # file_ext = os.path.splitext(file.filename)[1]
    filename_base, file_ext = os.path.splitext(file.filename)
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)


    try:
        # Ghi file async
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        logger.info(f"File written to {temp_path}")

        # Debug: Xác nhận nhận đúng candidate_id và candidate_name
        logger.info(f"Received: candidate_id={candidate_id}, candidate_name={candidate_name}, file={file.filename}")

        # Gọi model detect
        start_time = time.time()
        try:
            # detect_result = facedetector.run(image_path=temp_path)

            cheat_weights = json.loads(cheat_weights_str)
            detect_result = facedetector.run(image_path=temp_path, cheat_weights=cheat_weights)

        except Exception as detect_error:
            logger.error(f"Lỗi trong facedetector.face_detector: {str(detect_error)}")
            raise HTTPException(status_code=500, detail=f"Lỗi trong facedetector: {str(detect_error)}")
        end_time = time.time()

        execution_time = end_time - start_time
        detect_result["execution_time"] = f"{execution_time:.2f} seconds"

        # Debug: Kiểm tra kết quả từ facedetector
        logger.info(f"Detect Result: {detect_result}")

        # Kiểm tra detect_result
        if not isinstance(detect_result, dict):
            logger.error(f"Detect result is not a dictionary: {detect_result}")
            raise HTTPException(status_code=500, detail="Kết quả từ facedetector không hợp lệ")

        # Kiểm tra kết quả gian lận
        # cheating_status = detect_result.get("cheating", "").lower()
        # cheating_status = detect_result.get("cheating", "")

        # Định nghĩa múi giờ UTC+7
        tz_vietnam = timezone(timedelta(hours=7))

        # Lấy thời gian hiện tại theo múi giờ UTC+7
        now_vietnam = datetime.now(tz_vietnam)

        # Định dạng thời gian để sử dụng trong tên tệp
        timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')

        timestamp_file = now_vietnam.strftime('%Y%m%d-%H%M%S')
        saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"
        saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)

        log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Name: {candidate_name} | File: {file.filename} | Result: {detect_result} | Time: {end_time - start_time:.2f}s\n"

        # Ghi log theo loại kết quả
        # if "cheating" == cheating_status:
        if detect_result.get("cheating", False):
            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            # ✅ Lưu lại ảnh gian lận
            copyfile(temp_path, saved_image_path)

            # ✅ Ghi log CSV
            timestamp_csv = now_vietnam.strftime("%Y%m%d")
            csv_path = os.path.join(CSV_DIR, f"cheat_{timestamp_csv}.csv")
            csv_exists = os.path.isfile(csv_path)

            # with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
            #     writer = csv.writer(csvfile)
            #     if not csv_exists:
            #         writer.writerow(["timestamp", "filename", "result", "execution_time"])  # Header
            #     writer.writerow([timestamp, saved_filename, detect_result.get("cheating", ""), f"{execution_time:.2f}s"])
            
            with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
                writer = csv.writer(csvfile)
                if not csv_exists:
                    writer.writerow([
                        "timestamp", 
                        "filename", 
                        "result", 
                        "execution_time",
                        "no_face", 
                        "multiple_faces", 
                        "gaze_off_screen", 
                        "total_cheat_score"
                    ])  # Header

                cheat_status = detect_result.get("cheat_status", {})
                writer.writerow([
                    timestamp, 
                    saved_filename, 
                    detect_result.get("cheating", ""), 
                    f"{execution_time:.2f}s",
                    cheat_status.get("no_face", ""), 
                    cheat_status.get("multiple_faces", ""), 
                    cheat_status.get("gaze_off_screen", ""), 
                    detect_result.get("total_cheat_score", "")
                ])


        # elif "no cheating" == cheating_status:
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            ## ✅ Lưu lại ảnh gian lận
            # copyfile(temp_path, saved_image_path)

        # Luôn ghi vào log realtime
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(log_entry)

        # Tạo kết quả trả về
        response = {
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "detect_result": detect_result,
            "execution_time": f"{end_time - start_time:.2f} seconds"
        }

        logger.info(f"Response: {response}")

        # # Ghi log thông tin xử lý và trả về kết quả
        # log_message = f"ID: {candidate_id} | Name: {candidate_name} | File: {file.filename} | Result: {response}\n"
        # with open(LOG_FILE, "a", encoding="utf-8") as log_file:
        #     log_file.write(log_message)

        return JSONResponse(content=response)

    # except Exception as e:
    #     logger.error(f"Lỗi xử lý file {file.filename}: {str(e)}")
    #     raise HTTPException(status_code=500, detail=f"Lỗi trong quá trình xử lý ảnh: {str(e)}")

    except Exception as e:
        # Ghi log lỗi
        # timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        error_message = f"[{timestamp}] Lỗi xử lý file {file.filename}: {str(e)}\n"
        logger.error(error_message)

        with open(LOG_ERROR, "a", encoding="utf-8") as f:
            f.write(error_message)

        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(error_message)

        raise HTTPException(status_code=500, detail="Lỗi trong quá trình xử lý ảnh")

    finally:
        # Xoá file tạm
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Lỗi khi xóa file tạm {temp_path}: {str(e)}")

##################################################################################



##################################################################################
### post cho ca thi, lớp, tên học sinh, id
@app.post("/detect_cathi_lop", summary="Phát hiện gian lận qua ảnh", description="Nhận ảnh, ID và tên người dự thi để phát hiện khuôn mặt nghi ngờ")
async def detect_face_cathi_lop(
    request: Request,
    candidate_id: str = Form(..., description="ID của thí sinh"),
    candidate_name: str = Form(..., description="Tên của thí sinh"),
    exam_class: str = Form(..., description="Lớp thi của thí sinh"),  # Thêm lớp thi
    exam_shift: str = Form(..., description="Ca thi của thí sinh"),   # Thêm ca thi
    file: UploadFile = File(..., description="Ảnh của thí sinh")
):
    # Kiểm tra định dạng ảnh
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG.")

    # Tạo tên file tạm duy nhất
    filename_base, file_ext = os.path.splitext(file.filename)
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        # Ghi file async
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        logger.info(f"File written to {temp_path}")

        # Debug: Xác nhận nhận đúng candidate_id và candidate_name
        logger.info(f"Received: candidate_id={candidate_id}, candidate_name={candidate_name}, exam_class={exam_class}, exam_shift={exam_shift}, file={file.filename}")

        # Gọi model detect
        start_time = time.time()
        
        try:
            # detect_result = facedetector.face_detector(temp_path)
            detect_result = facedetector.run(image_path=temp_path)
        except Exception as detect_error:
            logger.error(f"Lỗi trong facedetector.face_detector: {str(detect_error)}")
            raise HTTPException(status_code=500, detail=f"Lỗi trong facedetector: {str(detect_error)}")
        end_time = time.time()

        execution_time = end_time - start_time


        # Debug: Kiểm tra kết quả từ facedetector
        logger.info(f"Detect Result: {detect_result}")

        # Kiểm tra detect_result
        if not isinstance(detect_result, dict):
            logger.error(f"Detect result is not a dictionary: {detect_result}")
            raise HTTPException(status_code=500, detail="Kết quả từ facedetector không hợp lệ")

        # Kiểm tra kết quả gian lận
        # cheating_status = detect_result.get("cheating", "").lower()
        # cheating_status = detect_result.get("cheating", "")


        # Định nghĩa múi giờ UTC+7
        tz_vietnam = timezone(timedelta(hours=7))

        # Lấy thời gian hiện tại theo múi giờ UTC+7
        now_vietnam = datetime.now(tz_vietnam)

        # Định dạng thời gian để sử dụng trong tên tệp
        timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')

        timestamp_file = now_vietnam.strftime('%Y%m%d-%H%M%S')
        saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"
        saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)

        log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Name: {candidate_name} | Class: {exam_class} | Shift: {exam_shift} | File: {file.filename} | Result: {detect_result} | Time: {end_time - start_time:.2f}s\n"

        # Ghi log theo loại kết quả
        # if "cheating" == cheating_status:
        if detect_result.get("cheating", False):
            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            # ✅ Lưu lại ảnh gian lận
            # copyfile(temp_path, saved_image_path)

            saved_image_path = get_exam_image_path(
                base_dir=CHEATING_IMAGE_DIR,
                exam_class=exam_class,
                exam_shift=exam_shift,
                filename=saved_filename
            )
            copyfile(temp_path, saved_image_path)

            # ✅ Ghi log CSV
            timestamp_csv = now_vietnam.strftime("%Y%m%d")
            csv_path = os.path.join(CSV_DIR, f"cheat_{exam_class}_{exam_shift}_{timestamp_csv}.csv")
            csv_exists = os.path.isfile(csv_path)

            with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
                writer = csv.writer(csvfile)
                if not csv_exists:
                    writer.writerow(["timestamp", "exam_class", "exam_shift", "candidate_name", "candidate_id", "gaze", "result", "filename"])  # Header
                writer.writerow([timestamp, exam_class, exam_shift, candidate_name, candidate_id, detect_result.get("gaze", ""),detect_result.get("cheating", ""), saved_filename])
            
            save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result
            )

        # elif "no cheating" == cheating_status:
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result
            )

        # Luôn ghi vào log realtime
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(log_entry)

        # Tạo kết quả trả về
        response = {
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "exam_class": exam_class,  # Trả về lớp thi
            "exam_shift": exam_shift,  # Trả về ca thi
            "detect_result": detect_result,
            # "execution_time": f"{end_time - start_time:.2f} seconds",
            "execution_time_sec": round(end_time - start_time, 2),
            "timestamp": timestamp
        }

        logger.info(f"Response: {response}")

        return JSONResponse(content=response)
    except Exception as e:
        # Ghi log lỗi
        # timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        error_message = f"[{timestamp}] Lỗi xử lý file {file.filename}: {str(e)}\n"
        logger.error(error_message)

        with open(LOG_ERROR, "a", encoding="utf-8") as f:
            f.write(error_message)

        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(error_message)

        raise HTTPException(status_code=500, detail="Lỗi trong quá trình xử lý ảnh")

        save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
                is_error=True,
                error_message=error_message
            )

    finally:
        # Xoá file tạm
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Lỗi khi xóa file tạm {temp_path}: {str(e)}")

##################################################################################



##################################################################################
### post cho ca thi, lớp, tên học sinh, id
@app.post("/detect_cathi_lop_point", summary="Phát hiện gian lận qua ảnh", description="Nhận ảnh, ID và tên người dự thi để phát hiện khuôn mặt nghi ngờ")
async def detect_face_cathi_lop_point(
    request: Request,
    cheat_weights_str: Annotated[str, Form(...)],
    candidate_id: str = Form(..., description="ID của thí sinh"),
    # candidate_name: str = Form(..., description="Tên của thí sinh"),
    # candidate_name: Optional[str] = Form(None, description="Tên của thí sinh (không bắt buộc)"),
    exam_class: str = Form(..., description="Lớp thi của thí sinh"),  # Thêm lớp thi
    exam_shift: str = Form(..., description="Ca thi của thí sinh"),   # Thêm ca thi
    file: UploadFile = File(..., description="Ảnh của thí sinh")
):
    # Kiểm tra định dạng ảnh
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG.")

    base_url = str(request.base_url)

    # Tạo tên file tạm duy nhất
    filename_base, file_ext = os.path.splitext(file.filename)
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        # Ghi file async
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        logger.info(f"File written to {temp_path}")

        # # Debug: Xác nhận nhận đúng candidate_id và candidate_name
        # logger.info(f"Received: candidate_id={candidate_id}, candidate_name={candidate_name}, exam_class={exam_class}, exam_shift={exam_shift}, file={file.filename}")
        logger.info(f"Received: candidate_id={candidate_id}, exam_class={exam_class}, exam_shift={exam_shift}, file={file.filename}")

        # Gọi model detect
        start_time = time.time()
        
        try:
            # detect_result = facedetector.run(image_path=temp_path)

            cheat_weights = json.loads(cheat_weights_str)
            detect_result = facedetector.run(image_path=temp_path, cheat_weights=cheat_weights)

        except Exception as detect_error:
            logger.error(f"Lỗi trong facedetector.face_detector: {str(detect_error)}")
            raise HTTPException(status_code=500, detail=f"Lỗi trong facedetector: {str(detect_error)}")
        end_time = time.time()

        execution_time = end_time - start_time


        # Debug: Kiểm tra kết quả từ facedetector
        logger.info(f"Detect Result: {detect_result}")

        # Kiểm tra detect_result
        if not isinstance(detect_result, dict):
            logger.error(f"Detect result is not a dictionary: {detect_result}")
            raise HTTPException(status_code=500, detail="Kết quả từ facedetector không hợp lệ")

        # Kiểm tra kết quả gian lận
        # cheating_status = detect_result.get("cheating", "").lower()
        # cheating_status = detect_result.get("cheating", "")


        # Định nghĩa múi giờ UTC+7
        tz_vietnam = timezone(timedelta(hours=7))

        # Lấy thời gian hiện tại theo múi giờ UTC+7
        now_vietnam = datetime.now(tz_vietnam)

        # Định dạng thời gian để sử dụng trong tên tệp
        timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')

        timestamp_file = now_vietnam.strftime('%Y%m%d-%H%M%S')
        # saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"

        # Tạo chuỗi ngẫu nhiên dài 6 ký tự (có thể thay đổi độ dài tùy ý)
        random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=6))

        # Giả sử bạn đã có candidate_name, candidate_id, timestamp_file, file_ext
        # saved_filename = f"{candidate_name}_{candidate_id}_{timestamp_file}_{random_string}{file_ext}"
        saved_filename = f"{candidate_id}_{timestamp_file}_{random_string}{file_ext}"

        # saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)

        # log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Name: {candidate_name} | Class: {exam_class} | Shift: {exam_shift} | File: {file.filename} | Result: {detect_result} | Time: {end_time - start_time:.2f}s\n"
        log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Class: {exam_class} | Shift: {exam_shift} | File: {file.filename} | Result: {detect_result} | Time: {end_time - start_time:.2f}s\n"

        reasons = []

        # 1️⃣ Điện thoại
        # if detect_result.get("cheat_mobilephone") == "cell phone":
        #     reasons.append("Phát hiện điện thoại")
        cheat_phone_list = detect_result.get("cheat_mobilephone")
        if cheat_phone_list and any(item.get("label") == "cell phone" for item in cheat_phone_list):
            reasons.append("Phát hiện điện thoại")

        # 2️⃣ Tai nghe
        # if detect_result.get("cheat_headphone") is not None:
        #     reasons.append("Phát hiện tai nghe")
        cheat_headphone_list = detect_result.get("cheat_headphone")

        if cheat_headphone_list and any(
            item.get("label") in ["Earphone", "Headphone", "Neckband", "Airpods"]
            for item in cheat_headphone_list
        ):
            reasons.append("Phát hiện tai nghe")

        # 3️⃣ Ánh mắt lệch (gaze)
        if detect_result.get("gaze") and detect_result["gaze"].lower() != "center":
            reasons.append("Mắt nhìn ra hướng khác")

        # 4️⃣ Không có người
        if detect_result.get("person", 1) == 0:
            reasons.append("Không có người trong ca thi")

        # 5️⃣ Nhiều người trong ảnh
        # if detect_result.get("person", 1) > 1:
        #     reasons.append("Có nhiều người trong ảnh")
        person_count = detect_result.get("person", 1)

        # 6️⃣ Không đúng người dự thi
        faces = detect_result.get("faces", [])
        if faces and isinstance(faces, list):
            face_name = faces[0].get("name")
            if face_name and face_name != candidate_id:
                reasons.append("Không đúng người dự thi")
                detect_result["cheating"] = True  # ✅ Đánh dấu là có gian lận


        if person_count > 1:
            reasons.append(f"Có {person_count} người trong ca thi")

        # Nếu không phát hiện gì
        if not reasons:
            reasons.append("Không phát hiện gian lận")

        # Gộp lại thành 1 câu trả về
        reason_cheating = ", ".join(reasons)
        detect_result["cheating_reason"] = reason_cheating

        cheating_image_path = None
        relative_path = None

        # Ghi log theo loại kết quả
        # if "cheating" == cheating_status:
        if detect_result.get("cheating", False):

            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            # ✅ Lưu lại ảnh gian lận
            saved_image_path = get_exam_image_path(
                base_dir=CHEATING_IMAGE_DIR,
                exam_class=exam_class,
                exam_shift=exam_shift,
                filename=saved_filename,
                point=True
            )

            relative_path = os.path.relpath(saved_image_path, start="/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/Silent_Face_Anti_Spoofing/cheating_images")
            # cheating_image_path = f"{str(request.base_url)}proxy/8080/get_cheating_image/{relative_path}"
            detect_result["cheating_image_path"] = relative_path


            copyfile(temp_path, saved_image_path)

            save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                # candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
                point=True,
            )

            # ✅ Ghi log CSV
            timestamp_csv = now_vietnam.strftime("%Y%m%d")
            csv_path = os.path.join(CSV_DIR, f"cheat_{exam_class}_{exam_shift}_{timestamp_csv}_point.csv")
            csv_exists = os.path.isfile(csv_path)

            # with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
            #     writer = csv.writer(csvfile)
            #     if not csv_exists:
            #         writer.writerow(["timestamp", "exam_class", "exam_shift", "candidate_name", "candidate_id", "gaze", "result", "filename"])  # Header
            #     writer.writerow([timestamp, exam_class, exam_shift, candidate_name, candidate_id, detect_result.get("gaze", ""),detect_result.get("cheating", ""), saved_filename])
            # log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Name: {candidate_name} | Class: {exam_class} | Shift: {exam_shift} | File: {file.filename} | Result: {detect_result} | Time: {end_time - start_time:.2f}s\n"
            log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Class: {exam_class} | Shift: {exam_shift} | File: {file.filename} | Result: {detect_result} | Time: {end_time - start_time:.2f}s\n"

            with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
                writer = csv.writer(csvfile)

                if not csv_exists:
                    writer.writerow([
                        "timestamp", "exam_class", "exam_shift", "candidate_id", "gaze", "cheating", "filename",
                        "no_face", "multiple_faces", "gaze_off_screen", "total_cheat_score"
                    ])  # Header

                # If detect_result is the inner "detect_result" object, use it directly
                inner_result = detect_result  # No need for detect_result.get("detect_result", {})
                cheat_status = inner_result.get("cheat_status", {})

                writer.writerow([
                    timestamp, exam_class, exam_shift, candidate_id,
                    inner_result.get("gaze", ""),
                    inner_result.get("cheating", ""),
                    saved_filename,
                    cheat_status.get("no_face", 0),
                    cheat_status.get("multiple_faces", 0),
                    cheat_status.get("gaze_off_screen", 0),
                    inner_result.get("total_cheat_score", 0)
                ])



        # elif "no cheating" == cheating_status:
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)
            
            save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                # candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
                point=True,
            )

        detect_result["cheating_image_path"] = relative_path
        

        # Luôn ghi vào log realtime
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(log_entry)

        # Tạo kết quả trả về
        response = {
            "candidate_id": candidate_id,
            # "candidate_name": candidate_name,
            "exam_class": exam_class,  # Trả về lớp thi
            "exam_shift": exam_shift,  # Trả về ca thi
            "detect_result": detect_result,
            # "execution_time": f"{end_time - start_time:.2f} seconds",
            # "cheating_image_path": os.path.basename(saved_image_path),
            # "cheating_image_path": os.path.basename(saved_image_path),
            # "cheating_image_path":  str(relative_path),
            "execution_time_sec": round(end_time - start_time, 2),
            "timestamp": timestamp
        }

        logger.info(f"Response: {response}")

        return JSONResponse(content=response)
    except Exception as e:
        # Ghi log lỗi
        # timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        error_message = f"[{timestamp}] Lỗi xử lý file {file.filename}: {str(e)}\n"
        logger.error(error_message)

        with open(LOG_ERROR, "a", encoding="utf-8") as f:
            f.write(error_message)

        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(error_message)
        
        save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                # candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
                point=True,
                is_error=True,
                error_message=error_message
            )

        raise HTTPException(status_code=500, detail="Lỗi trong quá trình xử lý ảnh")

    finally:
        # Xoá file tạm
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Lỗi khi xóa file tạm {temp_path}: {str(e)}")

##################################################################################



##################################################################################

@app.post("/detect_and_log_txt_cathi_lop", summary="Phát hiện và lưu kết quả vào TXT", description="Nhận ảnh và thông tin thí sinh, phát hiện gian lận và lưu vào file TXT")
async def detect_and_log_txt_cathi_lop(
    request: Request,
    candidate_id: str = Form(...),
    candidate_name: str = Form(...),
    exam_class: str = Form(...),
    exam_shift: str = Form(...),
    file: UploadFile = File(...)
):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG.")

    filename_base, file_ext = os.path.splitext(file.filename)
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        logger.info(f"Đã lưu tạm file ảnh tại {temp_path}")

        # Detect
        start_time = time.time()
        try:
            detect_result = facedetector.run(image_path=temp_path)
        except Exception as detect_error:
            raise HTTPException(status_code=500, detail=f"Lỗi từ model: {str(detect_error)}")
        end_time = time.time()

        # cheating_status = detect_result.get("cheating", "").lower()
        # cheating_status = detect_result.get("cheating", "")

        tz_vietnam = timezone(timedelta(hours=7))
        now_vietnam = datetime.now(tz_vietnam)
        timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')
        timestamp_file = now_vietnam.strftime('%Y%m%d-%H%M%S')
        saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"
        # saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)

        log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Name: {candidate_name} | Class: {exam_class} | Shift: {exam_shift} | File: {file.filename} | Result: {detect_result} | Time: {end_time - start_time:.2f}s\n"


        # Nếu phát hiện gian lận
        # if cheating_status == "cheating":
        if detect_result.get("cheating", False):
            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            saved_image_path = get_exam_image_path(
                base_dir=CHEATING_IMAGE_DIR,
                exam_class=exam_class,
                exam_shift=exam_shift,
                filename=saved_filename
            )

            copyfile(temp_path, saved_image_path)

            # Lưu vào file TXT
            YMD = now_vietnam.strftime("%Y%m%d")
            txt_path = os.path.join(CSV_DIR, f"cheat_{exam_class}_{exam_shift}_{YMD}.txt")
            log_text = (
                f"[{timestamp}]\n"
                f"Candidate ID: {candidate_id}\n"
                f"Candidate Name: {candidate_name}\n"
                f"Class: {exam_class}\n"
                f"Shift: {exam_shift}\n"
                f"Gaze: {detect_result.get('gaze', '')}\n"
                # f"Cheating: {cheating_status}\n"
                f"Cheating: {detect_result.get('cheating', False)}\n"
                f"File Saved: {saved_filename}\n"
                f"Execution Time: {end_time - start_time:.2f}s\n"
                f"{'-'*40}\n"
            )
            async with aiofiles.open(txt_path, mode="a", encoding="utf-8") as txt_file:
                await txt_file.write(log_text)
        
            save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
            )
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)
            
            save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
            )

        return JSONResponse({
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "exam_class": exam_class,
            "exam_shift": exam_shift,
            "detect_result": detect_result,
            "execution_time_sec": round(end_time - start_time, 2),
            "timestamp": timestamp
        })

    except Exception as e:
        error_message = f"Lỗi xử lý file {file.filename}: {str(e)}"
        save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
                is_error=True,
                error_message=error_message
            )

        logger.error(f"Lỗi xử lý file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")

    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Lỗi khi xóa file tạm: {str(e)}")

##################################################################################



##################################################################################

@app.post("/detect_and_log_txt_cathi_lop_point", summary="Phát hiện và lưu kết quả vào TXT", description="Nhận ảnh và thông tin thí sinh, phát hiện gian lận và lưu vào file TXT")
async def detect_and_log_txt_cathi_lop_point(
    request: Request,
    cheat_weights_str: Annotated[str, Form(...)],
    candidate_id: str = Form(...),
    candidate_name: str = Form(...),
    exam_class: str = Form(...),
    exam_shift: str = Form(...),
    file: UploadFile = File(...)
):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG.")

    filename_base, file_ext = os.path.splitext(file.filename)
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        logger.info(f"Đã lưu tạm file ảnh tại {temp_path}")

        # Detect
        start_time = time.time()
        try:
            # detect_result = facedetector.run(image_path=temp_path)
            
            cheat_weights = json.loads(cheat_weights_str)
            detect_result = facedetector.run(image_path=temp_path, cheat_weights=cheat_weights)
        except Exception as detect_error:
            raise HTTPException(status_code=500, detail=f"Lỗi từ model: {str(detect_error)}")
        end_time = time.time()

        # cheating_status = detect_result.get("cheating", "").lower()
        # cheating_status = detect_result.get("cheating", "")

        tz_vietnam = timezone(timedelta(hours=7))
        now_vietnam = datetime.now(tz_vietnam)
        timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')
        timestamp_file = now_vietnam.strftime('%Y%m%d-%H%M%S')
        saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"
        saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)

        log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | Name: {candidate_name} | Class: {exam_class} | Shift: {exam_shift} | File: {file.filename} | Result: {detect_result} | Time: {end_time - start_time:.2f}s\n"

        # Nếu phát hiện gian lận
        # if cheating_status == "cheating":
        if detect_result.get("cheating", False):
            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)
            
            saved_image_path = get_exam_image_path(
                base_dir=CHEATING_IMAGE_DIR,
                exam_class=exam_class,
                exam_shift=exam_shift,
                filename=saved_filename,
                point=True
            )

            copyfile(temp_path, saved_image_path)

            # Lưu vào file TXT
            YMD = now_vietnam.strftime("%Y%m%d")
            txt_path = os.path.join(CSV_DIR, f"cheat_{exam_class}_{exam_shift}_{YMD}_point.txt")
            inner_result = detect_result  # No need for detect_result.get("detect_result", {})
            cheat_status = inner_result.get("cheat_status", {})
            log_text = (
                f"[{timestamp}]\n"
                f"Candidate ID: {candidate_id}\n"
                f"Candidate Name: {candidate_name}\n"
                f"Class: {exam_class}\n"
                f"Shift: {exam_shift}\n"
                f"Gaze: {inner_result.get('gaze', '')}\n"
                f"Cheating: {inner_result.get('cheating', False)}\n"
                f"File Saved: {saved_filename}\n"
                f"No Face Count: {cheat_status.get('no_face', 0)}\n"
                f"Multiple Faces Count: {cheat_status.get('multiple_faces', 0)}\n"
                f"Gaze Off Screen Count: {cheat_status.get('gaze_off_screen', 0)}\n"
                f"Total Cheat Score: {inner_result.get('total_cheat_score', 0)}\n"
                f"Execution Time: {end_time - start_time:.2f}s\n"
                f"{'-'*40}\n"
            )
            
            async with aiofiles.open(txt_path, mode="a", encoding="utf-8") as txt_file:
                await txt_file.write(log_text)
            
            save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
                point=True,
            )

        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)
            
            save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
                point=True,
            )

        return JSONResponse({
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "exam_class": exam_class,
            "exam_shift": exam_shift,
            "detect_result": detect_result,
            "execution_time_sec": round(end_time - start_time, 2),
            "timestamp": timestamp
        })

    except Exception as e:
        error_message = f"Lỗi xử lý file {file.filename}: {str(e)}"
        logger.error(f"Lỗi xử lý file: {str(e)}")

        save_cheating_logs(
                log_dir=LOG_DIR,
                candidate_id=candidate_id,
                candidate_name=candidate_name,
                exam_class=exam_class,   # <-- thêm tên đối số
                exam_shift=exam_shift,
                file_name=saved_filename,  # hoặc saved_filename nếu bạn muốn ghi ảnh đã lưu
                detect_result=detect_result,
                point=True,
                is_error=True,
                error_message=error_message
            )
            
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")

    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Lỗi khi xóa file tạm: {str(e)}")

##################################################################################




##################################################################################
## ADD NEW PERSON
# Đường dẫn gốc tới thư mục lưu dataset
# BASE_DIR_DATA_IMAGE = "/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/FaceDataset/train"


# @app.post("/add_new_person")
# async def add_candidate_image(
#     candidate_id: str = Form(...),
#     candidate_name: str = Form(...),
#     file: UploadFile = File(...),
# ):
#     # Kiểm tra giá trị null hoặc rỗng
#     if not candidate_id or not candidate_name or not file:
#         missing_fields = []
#         if not candidate_id:
#             missing_fields.append("candidate_id")
#         if not candidate_name:
#             missing_fields.append("candidate_name")
#         if not file:
#             missing_fields.append("file")

#         error_message = f"Thiếu dữ liệu bắt buộc: {', '.join(missing_fields)}"
#         log_to_file(LOG_ERROR, f"[{get_current_vietnam_time_log_format()}] MISSING_FIELD_ERROR: {error_message}")
#         return JSONResponse(
#             status_code=400,
#             content={"message": error_message}
#         )

#     # Kiểm tra định dạng file
#     allowed_types = ["image/jpeg", "image/png", "image/jpg"]
#     if file.content_type not in allowed_types:
#         msg = "Chỉ hỗ trợ các định dạng ảnh: PNG, JPG, JPEG."
#         log_to_file(LOG_ERROR, f"[{get_current_vietnam_time_log_format()}] Invalid file type for {candidate_name} ({candidate_id}) - {file.content_type}")
#         return JSONResponse(
#             status_code=400,
#             content={"message": msg}
#         )

#     # Tạo tên thư mục: tên + id (ví dụ: NguyenVanA_12345)
#     folder_name = f"{candidate_name}_{candidate_id}"
#     folder_path = os.path.join(BASE_DIR_DATA_IMAGE, folder_name)
#     os.makedirs(folder_path, exist_ok=True)

#     # Lấy thời gian Việt Nam
#     tz_vietnam = timezone(timedelta(hours=7))
#     now_vietnam = datetime.now(tz_vietnam)
#     timestamp = now_vietnam.strftime('%Y%m%d-%H%M%S')

#     # Xử lý tên file
#     _, file_ext = os.path.splitext(file.filename)
#     file_ext = file_ext.lower()
#     if file_ext not in [".png", ".jpg", ".jpeg"]:
#         file_ext = ".jpg"

#     file_name = f"{candidate_name}_{candidate_id}_{timestamp}{file_ext}"
#     image_path = os.path.join(folder_path, file_name)

#     # Ghi file ảnh
#     file.file.seek(0)
#     with open(image_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     # Gọi hàm thêm người vào database
#     # database = "/home/ifstag/AI_Project/LMS-Cheat/Face_cheating_detection/models/face_database_kaggle.pkl"
#     database = FACE_DATABASE_PATH
#     file_name_database = f"{candidate_name}_{candidate_id}"

#     try:
#         add_person_to_database(database, file_name_database, folder_path)

#         log_to_file(LOG_NEWPERSON, f"[{get_current_vietnam_time_log_format()}] ADD NEW PERSON: {file_name_database}")
#         return JSONResponse(
#             status_code=200,
#             content={
#                 "message": "Tải ảnh và thêm vào database thành công",
#                 "image_path": image_path,
#                 "database_username": file_name_database
#             }
#         )
#     except Exception as e:
#         log_to_file(LOG_ERROR, f"[{get_current_vietnam_time_log_format()}] ADD_ERROR: {file_name_database} - {str(e)}")
#         return JSONResponse(
#             status_code=500,
#             content={
#                 "message": "Ảnh được tải lên nhưng không thể thêm vào database",
#                 "error": str(e)
#             }
#         )

@app.post("/add_new_person")
async def add_candidate_image(
    candidate_id: int = Form(...),
    candidate_name: str = Form(...),
    file: UploadFile = File(...),
):
    # Chuẩn hóa tên user
    normalized_name = normalize_vietnamese_name(candidate_name)
    
    # Lưu ảnh vào thư mục profile_image_users của backend
    folder_name = f"{candidate_id}_{normalized_name}"
    backend_folder_path = os.path.join(BACKEND_UPLOAD_DIR, folder_name)
    os.makedirs(backend_folder_path, exist_ok=True)

    tz_vietnam = timezone(timedelta(hours=7))
    now_vietnam = datetime.now(tz_vietnam)
    timestamp = now_vietnam.strftime('%Y%m%d-%H%M%S')
    _, file_ext = os.path.splitext(file.filename)
    file_ext = file_ext.lower()
    if file_ext not in [".png", ".jpg", ".jpeg"]:
        file_ext = ".jpg"
    file_name = f"{candidate_id}_{normalized_name}_{timestamp}{file_ext}"
    image_path = os.path.join(backend_folder_path, file_name)

    # Lưu file vào thư mục backend
    file.file.seek(0)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Thêm vào face database
    database = FACE_DATABASE_PATH
    file_name_database = f"{candidate_id}"

    try:
        success, error_images = add_person_to_database_test(database, file_name_database, backend_folder_path)

        if success:
            log_to_file(LOG_NEWPERSON, f"[{get_current_vietnam_time_log_format()}] ADD NEW PERSON: {file_name_database} - Success with {len(error_images)} errors")
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Tải ảnh và thêm vào database thành công.",
                    "image_path": image_path,
                    "database_username": file_name_database,
                    "total_images": len(os.listdir(backend_folder_path)),
                    "error_images": error_images if error_images else []
                }
            )
        else:
            error_msg = "Không thể thêm ảnh vào database - tất cả ảnh đều bị lỗi."
            log_to_file(LOG_ERROR, f"[{get_current_vietnam_time_log_format()}] ADD_FAIL: {file_name_database} - {error_msg} - Errors: {error_images}")
            # Xóa thư mục nếu thất bại hoàn toàn
            shutil.rmtree(backend_folder_path, ignore_errors=True)
            return JSONResponse(
                status_code=400,
                content={
                    "message": error_msg,
                    "errors": error_images
                }
            )
    except Exception as e:
        log_to_file(LOG_ERROR, f"[{get_current_vietnam_time_log_format()}] ADD_ERROR: {file_name_database} - {str(e)}")
        # Xóa thư mục nếu có lỗi
        shutil.rmtree(backend_folder_path, ignore_errors=True)
        return JSONResponse(
            status_code=500,
            content={
                "message": "Ảnh được tải lên nhưng không thể thêm vào database.",
                "error": str(e)
            }
        )


##################################################################################

# Endpoint để đồng bộ tất cả ảnh từ profile_image_users vào face database
@app.post("/sync_all_users_from_backend", summary="Đồng bộ tất cả người dùng từ backend vào face database")
async def sync_all_users_from_backend():
    """
    Đồng bộ tất cả ảnh từ thư mục profile_image_users của backend vào face database.
    Duyệt qua từng thư mục con (mỗi thư mục = 1 user với ID là tên thư mục)
    """
    try:
        if not os.path.exists(BACKEND_UPLOAD_DIR):
            return JSONResponse(
                status_code=404,
                content={
                    "message": f"Không tìm thấy thư mục backend: {BACKEND_UPLOAD_DIR}",
                    "success": False
                }
            )
        
        results = []
        total_success = 0
        total_failed = 0
        
        # Duyệt qua từng thư mục con (mỗi thư mục = 1 user)
        for user_folder in os.listdir(BACKEND_UPLOAD_DIR):
            user_folder_path = os.path.join(BACKEND_UPLOAD_DIR, user_folder)
            
            # Bỏ qua nếu không phải thư mục
            if not os.path.isdir(user_folder_path):
                continue
            
            # Lấy candidate_id từ tên thư mục (format: id_name hoặc chỉ id)
            candidate_id = user_folder.split('_')[0] if '_' in user_folder else user_folder
            
            try:
                # Thêm vào database
                success, error_images = add_person_to_database_test(
                    FACE_DATABASE_PATH, 
                    candidate_id, 
                    user_folder_path
                )
                
                if success:
                    total_success += 1
                    log_to_file(
                        LOG_NEWPERSON, 
                        f"[{get_current_vietnam_time_log_format()}] SYNC SUCCESS: {candidate_id} - {len(error_images)} errors"
                    )
                    results.append({
                        "candidate_id": candidate_id,
                        "status": "success",
                        "error_images": error_images
                    })
                else:
                    total_failed += 1
                    log_to_file(
                        LOG_ERROR, 
                        f"[{get_current_vietnam_time_log_format()}] SYNC FAILED: {candidate_id} - All images failed"
                    )
                    results.append({
                        "candidate_id": candidate_id,
                        "status": "failed",
                        "error_images": error_images
                    })
            except Exception as e:
                total_failed += 1
                log_to_file(
                    LOG_ERROR, 
                    f"[{get_current_vietnam_time_log_format()}] SYNC ERROR: {candidate_id} - {str(e)}"
                )
                results.append({
                    "candidate_id": candidate_id,
                    "status": "error",
                    "error": str(e)
                })
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Đồng bộ hoàn tất: {total_success} thành công, {total_failed} thất bại",
                "total_success": total_success,
                "total_failed": total_failed,
                "results": results
            }
        )
    
    except Exception as e:
        log_to_file(LOG_ERROR, f"[{get_current_vietnam_time_log_format()}] SYNC_ALL_ERROR: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "Lỗi khi đồng bộ người dùng",
                "error": str(e)
            }
        )

##################################################################################



##################################################################################
@app.post("/delete_person")
async def delete_person(
    candidate_id: int = Form(...)
):
    # Tìm thư mục có prefix là candidate_id trong BACKEND_UPLOAD_DIR
    folder_path = None
    folder_name = None
    
    if os.path.exists(BACKEND_UPLOAD_DIR):
        for folder in os.listdir(BACKEND_UPLOAD_DIR):
            if folder.startswith(f"{candidate_id}_"):
                folder_name = folder
                folder_path = os.path.join(BACKEND_UPLOAD_DIR, folder)
                break
    
    if not folder_path:
        log_to_file(LOG_DELETEPERSON, f"[{get_current_vietnam_time_log_format()}] DELETE_FOLDER_NOT_FOUND: Không tìm thấy thư mục cho candidate_id {candidate_id}")
        return JSONResponse(status_code=404, content={"message": f"Không tìm thấy thư mục cho candidate_id {candidate_id}"})

    log_to_file(LOG_DELETEPERSON, f"[{get_current_vietnam_time_log_format()}] DELETE_PERSON_REQUEST: Yêu cầu xóa người {folder_name}")

    # Xóa thư mục ảnh
    try:
        shutil.rmtree(folder_path)
        log_to_file(LOG_DELETEPERSON, f"[{get_current_vietnam_time_log_format()}] DELETE_FOLDER_SUCCESS: Đã xóa thư mục ảnh {folder_path}")
    except Exception as e:
        log_to_file(LOG_DELETEPERSON, f"[{get_current_vietnam_time_log_format()}] DELETE_FOLDER_ERROR: Lỗi khi xóa thư mục {folder_path} - {str(e)}")
        return JSONResponse(status_code=500, content={"message": f"Lỗi khi xóa thư mục ảnh: {str(e)}"})

    # Xóa key trong database pickle
    try:
        with open(FACE_DATABASE_PATH, "rb") as f:
            face_database = pickle.load(f)

        # Key trong database là candidate_id (dạng string)
        key_to_delete = str(candidate_id)
        if key_to_delete in face_database:
            del face_database[key_to_delete]
            with open(FACE_DATABASE_PATH, "wb") as f:
                pickle.dump(face_database, f)
            log_to_file(LOG_DELETEPERSON, f"[{get_current_vietnam_time_log_format()}] DELETE_DB_KEY_SUCCESS: Đã xóa key {key_to_delete} khỏi database")
        else:
            log_to_file(LOG_DELETEPERSON, f"[{get_current_vietnam_time_log_format()}] DELETE_DB_KEY_NOT_FOUND: Key {key_to_delete} không tồn tại trong database")
            return JSONResponse(status_code=404, content={"message": "Key trong database không tồn tại"})
    except Exception as e:
        log_to_file(LOG_DELETEPERSON, f"[{get_current_vietnam_time_log_format()}] DELETE_DB_ERROR: Lỗi khi xử lý database - {str(e)}")
        return JSONResponse(status_code=500, content={"message": f"Lỗi khi xử lý database: {str(e)}"})

    log_to_file(LOG_DELETEPERSON, f"[{get_current_vietnam_time_log_format()}] DELETE_PERSON_SUCCESS: Xóa thành công người {folder_name} (ID: {candidate_id}) khỏi thư mục và database.")
    return JSONResponse(status_code=200, content={"message": f"Xóa thành công người {folder_name} khỏi thư mục và database."})


##################################################################################




##################################################################################
## download csv ca thi và lớp

@app.post("/download_csv_cathi_lop", summary="Tải file log CSV theo lớp, ca và ngày")
async def download_csv(
    exam_class: str = Form(..., description="Lớp thi của thí sinh"),
    exam_shift: str = Form(..., description="Ca thi của thí sinh"),
    YMd: str = Form(..., description="Ngày định dạng YYYYMMDD (VD: 20250514)")
):
    filename = f"cheat_{exam_class}_{exam_shift}_{YMd}.csv"
    file_path = os.path.join(CSV_DIR, filename)

    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Không tìm thấy file: {filename}")

        # Ghi log tải thành công
        csv_log = f"[{get_current_vietnam_time_log_format()}] FILE DOWNLOAD: {filename}"
        log_to_file(LOG_DOWNLOADCSV, csv_log)

        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='text/csv',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        # Ghi log lỗi
        error_log = f"[{get_current_vietnam_time_log_format()}] DOWNLOAD CSV ERROR: {filename} - {str(e)}"
        log_to_file(LOG_ERROR, error_log)

        # Trả về lỗi HTTP
        raise HTTPException(status_code=500, detail=f"Lỗi khi tải file: {str(e)}")

##################################################################################


##################################################################################
## download csv ca thi và lớp

@app.post("/download_csv_cathi_lop_point", summary="Tải file log CSV theo lớp, ca và ngày")
async def download_csv_point(
    exam_class: str = Form(..., description="Lớp thi của thí sinh"),
    exam_shift: str = Form(..., description="Ca thi của thí sinh"),
    YMd: str = Form(..., description="Ngày định dạng YYYYMMDD (VD: 20250514)")
):
    filename = f"cheat_{exam_class}_{exam_shift}_{YMd}_point.csv"
    file_path = os.path.join(CSV_DIR, filename)

    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Không tìm thấy file: {filename}")

        # Ghi log tải thành công
        csv_log = f"[{get_current_vietnam_time_log_format()}] FILE DOWNLOAD: {filename}"
        log_to_file(LOG_DOWNLOADCSV, csv_log)

        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='text/csv',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        # Ghi log lỗi
        error_log = f"[{get_current_vietnam_time_log_format()}] DOWNLOAD CSV ERROR: {filename} - {str(e)}"
        log_to_file(LOG_ERROR, error_log)

        # Trả về lỗi HTTP
        raise HTTPException(status_code=500, detail=f"Lỗi khi tải file: {str(e)}")

##################################################################################


##################################################################################
## download csv của sinh viên mình muốn 

@app.post("/download_candidate_csv_cathi_lop", summary="Tải file CSV chứa candidate_id và candidate_name từ file gốc")
async def download_candidate_csv(
    exam_class: str = Form(..., description="Lớp thi của thí sinh"),
    exam_shift: str = Form(..., description="Ca thi của thí sinh"),
    YMd: str = Form(..., description="Ngày thi định dạng YYYYMMDD"),
    candidate_id: str = Form(None, description="Mã thí sinh cần tải (không bắt buộc)"),
    candidate_name: str = Form(None, description="Tên thí sinh cần tải (không bắt buộc)")
):
    filename = f"cheat_{exam_class}_{exam_shift}_{YMd}.csv"
    file_path = os.path.join(CSV_DIR, filename)

    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Không tìm thấy file: {filename}")

        output = io.StringIO()
        writer = None
        matched_rows = 0  # Đếm số dòng phù hợp

        with open(file_path, mode="r", encoding="utf-8") as f_in:
            reader = csv.DictReader(f_in)
            writer = csv.DictWriter(output, fieldnames=reader.fieldnames)
            writer.writeheader()

            for row in reader:
                match = False
                if candidate_id and candidate_name:
                    match = row["candidate_id"] == candidate_id and row["candidate_name"] == candidate_name
                elif candidate_id:
                    match = row["candidate_id"] == candidate_id
                elif candidate_name:
                    match = row["candidate_name"] == candidate_name
                else:
                    match = True  # Tải toàn bộ nếu không có filter

                if match:
                    writer.writerow(row)
                    matched_rows += 1

        if matched_rows == 0:
            # Không có kết quả phù hợp
            message = "Không tìm thấy thí sinh phù hợp với thông tin được cung cấp."
            error_log = f"[{get_current_vietnam_time_log_format()}] NO_MATCH_CSV: {candidate_id} - {candidate_name} trong {filename}"
            log_to_file(LOG_ERROR, error_log)
            return JSONResponse(
                status_code=404,
                content={"message": message}
            )

        output.seek(0)

        # Đặt tên file trả về
        if candidate_id or candidate_name:
            new_filename = f"candidate_{candidate_name}_{exam_class}_{exam_shift}_{YMd}.csv"
            csv_log = f"[{get_current_vietnam_time_log_format()}] FILE DOWNLOAD: {new_filename}"
            log_to_file(LOG_DOWNLOADCSV, csv_log)
        else:
            new_filename = f"all_data_{exam_class}_{exam_shift}_{YMd}.csv"

        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={new_filename}"}
        )

    except Exception as e:
        error_log = f"[{get_current_vietnam_time_log_format()}] DOWNLOAD_CANDIDATE_CSV ERROR: {filename} - {str(e)}"
        log_to_file(LOG_ERROR, error_log)
        raise HTTPException(status_code=500, detail=f"Lỗi khi tải file: {str(e)}")


##################################################################################
## download csv của sinh viên mình muốn 

@app.post("/download_candidate_csv_cathi_lop_point", summary="Tải file CSV chứa candidate_id và candidate_name từ file gốc")
async def download_candidate_csv(
    exam_class: str = Form(..., description="Lớp thi của thí sinh"),
    exam_shift: str = Form(..., description="Ca thi của thí sinh"),
    YMd: str = Form(..., description="Ngày thi định dạng YYYYMMDD"),
    candidate_id: int = Form(None, description="Mã thí sinh cần tải (không bắt buộc)")
):
    filename = f"cheat_{exam_class}_{exam_shift}_{YMd}_point.csv"
    file_path = os.path.join(CSV_DIR, filename)

    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Không tìm thấy file: {filename}")

        output = io.StringIO()
        writer = None
        matched_rows = 0

        with open(file_path, mode="r", encoding="utf-8") as f_in:
            reader = csv.DictReader(f_in)
            writer = csv.DictWriter(output, fieldnames=reader.fieldnames)
            writer.writeheader()

            for row in reader:
                match = False
                if candidate_id is not None:
                    match = str(row["candidate_id"]) == str(candidate_id)
                else:
                    match = True  # Tải toàn bộ nếu không có candidate_id

                if match:
                    writer.writerow(row)
                    matched_rows += 1

        if matched_rows == 0:
            message = "Không tìm thấy thí sinh phù hợp với thông tin được cung cấp."
            error_log = f"[{get_current_vietnam_time_log_format()}] NO_MATCH_CSV: {candidate_id or 'all'} - trong {filename}"
            log_to_file(LOG_ERROR, error_log)
            return JSONResponse(
                status_code=404,
                content={"message": message}
            )

        output.seek(0)

        if candidate_id is not None:
            new_filename = f"candidate_{candidate_id}_{exam_class}_{exam_shift}_{YMd}.csv"
            csv_log = f"[{get_current_vietnam_time_log_format()}] FILE DOWNLOAD: {new_filename}"
            log_to_file(LOG_DOWNLOADCSV, csv_log)
        else:
            new_filename = f"all_data_{exam_class}_{exam_shift}_{YMd}.csv"
            csv_log = f"[{get_current_vietnam_time_log_format()}] FILE DOWNLOAD: {new_filename}"
            log_to_file(LOG_DOWNLOADCSV, csv_log)

        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={new_filename}"}
        )

    except Exception as e:
        error_log = f"[{get_current_vietnam_time_log_format()}] DOWNLOAD_CANDIDATE_CSV ERROR: {filename} - {str(e)}"
        log_to_file(LOG_ERROR, error_log)
        raise HTTPException(status_code=500, detail=f"Lỗi khi tải file: {str(e)}")

##################################################################################

@app.post("/verify_user", summary="Phát hiện gian lận qua ảnh", description="Nhận ảnh, ID và tên người dự thi để phát hiện khuôn mặt nghi ngờ")
async def detect_face_pro(
    request: Request,
    candidate_id: int = Form(..., description="ID của thí sinh"),
    # candidate_name: str = Form(..., description="Tên của thí sinh"),
    file: UploadFile = File(..., description="Ảnh của thí sinh")
):
    # # Validate candidate_id (e.g., alphanumeric, non-empty)
    # if not re.match(r"^[0-9]+$", candidate_id) or not candidate_id:
    #     logger.error(f"Invalid candidate_id: {candidate_id}")
    #     return JSONResponse(content={"is_valid": False})

    # If both validations pass, proceed with existing logic
    is_valid = True

    # Kiểm tra định dạng ảnh
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        logger.error(f"Unsupported file type: {file.content_type}")
        return JSONResponse(content={"is_valid": False})

    # Tạo tên file tạm duy nhất
    filename_base, file_ext = os.path.splitext(file.filename)
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        # Ghi file async
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        logger.info(f"File written to {temp_path}")

        # Debug: Xác nhận nhận đúng candidate_id và candidate_name
        # logger.info(f"Received: candidate_id={candidate_id}, candidate_name={candidate_name}, file={file.filename}")
        logger.info(f"Received: candidate_id={candidate_id}, file={file.filename}")

        # Gọi model detect
        start_time = time.time()
        try:
            detect_result = facedetector.run(image_path=temp_path)
        except Exception as detect_error:
            logger.error(f"Lỗi trong facedetector.run: {str(detect_error)}")
            return JSONResponse(content={"is_valid": is_valid, "error": f"Lỗi trong facedetector: {str(detect_error)}"})

        end_time = time.time()

        # Debug: Kiểm tra kết quả từ facedetector
        logger.info(f"Detect Result: {detect_result}")

        # Kiểm tra detect_result
        if not isinstance(detect_result, dict):
            logger.error(f"Detect result is not a dictionary: {detect_result}")
            return JSONResponse(content={"is_valid": is_valid, "error": "Kết quả từ facedetector không hợp lệ"})

        ## Validate that candidate_name + "_" + candidate_id matches the name in detect_result.faces
        # expected_name = f"{candidate_name}_{candidate_id}"
        expected_name = f"{candidate_id}"

        faces = detect_result.get("faces", [])
        # if not faces or not isinstance(faces, list) or not any(face.get("name") == expected_name for face in faces) or len(faces) != 1:
        #     logger.error(f"Name validation failed: expected {expected_name}, got {faces}")
        #     is_valid = False
        print(f"len faces: {len(faces)}")
        if not (
            len(faces) == 1 and faces[0].get("name") == expected_name
        ):
            logger.error(f"Name validation failed: expected exactly 1 face with name '{expected_name}', got {faces}")
            is_valid = False

        # Định nghĩa múi giờ UTC+7
        tz_vietnam = timezone(timedelta(hours=7))

        # Lấy thời gian hiện tại theo múi giờ UTC+7
        now_vietnam = datetime.now(tz_vietnam)

        # Định dạng thời gian để sử dụng trong tên tệp
        timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')
        timestamp_file = now_vietnam.strftime('%Y%m%d-%H%M%S')
        saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"
        saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)

        execution_time = end_time - start_time
        detect_result["execution_time"] = f"{execution_time:.2f} seconds"

        log_entry = f"[{timestamp}] Candidate ID: {candidate_id} | File: {file.filename} | Result: {detect_result} | Time: {execution_time:.2f}s\n"

        # Ghi log theo loại kết quả
        if detect_result.get("cheating", False):
            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            # # Lưu lại ảnh gian lận
            # copyfile(temp_path, saved_image_path)

            # # Ghi log CSV
            # timestamp_csv = now_vietnam.strftime("%Y%m%d")
            # csv_path = os.path.join(CSV_DIR, f"cheat_{timestamp_csv}.csv")
            # csv_exists = os.path.isfile(csv_path)

            # with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
            #     writer = csv.writer(csvfile)
            #     if not csv_exists:
            #         writer.writerow(["timestamp", "filename", "result", "execution_time"])  # Header
            #     writer.writerow([timestamp, saved_filename, detect_result.get("cheating", ""), f"{execution_time:.2f}s"])
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

        # Luôn ghi vào log realtime
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(log_entry)

        # Tạo kết quả trả về
        response = {
            "is_valid": is_valid,
            "expected_name": expected_name, 
            "predict_name_from_image": faces
            # "candidate_id": candidate_id,
            # "candidate_name": candidate_name,
            # "detect_result": detect_result,
            # "execution_time": f"{execution_time:.2f} seconds"
        }

        logger.info(f"Response: {response}")
        return JSONResponse(content=response)

    except Exception as e:
        # Ghi log lỗi
        error_message = f"[{timestamp}] Lỗi xử lý file {file.filename}: {str(e)}\n"
        logger.error(error_message)

        with open(LOG_ERROR, "a", encoding="utf-8") as f:
            f.write(error_message)

        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(error_message)

        return JSONResponse(content={"is_valid": is_valid, "error": "Lỗi trong quá trình xử lý ảnh"})

    finally:
        # Xoá file tạm
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Lỗi khi xóa file tạm {temp_path}: {str(e)}")

##################################################################################

@app.post("/download_cheating_image", summary="Tải ảnh gian lận theo lớp, ca, ngày và tên ảnh")
async def download_cheating_image(
    exam_class: str = Form(..., description="Tên lớp thi"),
    exam_shift: str = Form(..., description="Ca thi"),
    YMd: str = Form(..., description="Ngày thi (YYYYMMDD)"),
    filename: str = Form(..., description="Tên file ảnh cần tải (.jpg)")
    # point: bool = Form(False, description="Dùng ảnh _point hay không")
):
    # # Tạo folder_suffix và folder ảnh đúng
    # folder_suffix = "_point" if point else ""
    # folder_name = f"{exam_class}-{exam_shift}-{YMd}{folder_suffix}"
    folder_name = f"{exam_class}-{exam_shift}-{YMd}_point"

    image_path = os.path.join(CHEATING_IMAGE_DIR, folder_name, filename)

    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Không tìm thấy ảnh: {filename}")

        # Log tải ảnh thành công
        log_message = f"[{get_current_vietnam_time_log_format()}] FILE IMAGE DOWNLOAD: {filename}"
        log_to_file(LOG_REALTIME, log_message)

        return FileResponse(
            path=image_path,
            filename=filename,
            media_type="image/jpeg",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        error_log = f"[{get_current_vietnam_time_log_format()}] DOWNLOAD IMAGE ERROR: {filename} - {str(e)}"
        log_to_file(LOG_ERROR, error_log)
        raise HTTPException(status_code=500, detail=f"Lỗi khi tải ảnh: {str(e)}")
##################################################################################

@app.get("/get_all_persons")
async def get_all_persons():
    if not os.path.exists(FACE_DATABASE_PATH):
        return JSONResponse(
            status_code=404,
            content={"message": "❌ Không tìm thấy file database."}
        )

    try:
        with open(FACE_DATABASE_PATH, 'rb') as f:
            database = pickle.load(f)

        if not isinstance(database, dict):
            return JSONResponse(
                status_code=500,
                content={"message": "❌ Dữ liệu không đúng định dạng.", "data_type": str(type(database))}
            )

        person_list = list(database.keys())
        person_list = person_list[:]  # Giới hạn chỉ trả về 100 người đầu tiên

        return JSONResponse(
            status_code=200,
            content={
                "message": f"✅ Tìm thấy {len(database)} người trong database.",
                "persons": person_list
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": "❌ Lỗi khi đọc database.", "error": str(e)}
        )

##################################################################################

@app.get("/get_cheating_image/{file_path:path}")
async def get_cheating_image(file_path: str):
    # Kết hợp path user truyền vào với thư mục gốc
    full_path = os.path.join(CHEATING_IMAGE_DIR, file_path)

    if not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="Không tìm thấy ảnh")

    # Xác định mime type
    ext = os.path.splitext(full_path)[1].lower()
    if ext in [".jpg", ".jpeg"]:
        media_type = "image/jpeg"
    elif ext == ".png":
        media_type = "image/png"
    else:
        media_type = "application/octet-stream"

    return FileResponse(full_path, media_type=media_type)

##################################################################################
##################################################################################

# Thêm vào phần khởi tạo app (sau app = FastAPI())
executor = ThreadPoolExecutor(max_workers=4)  # Điều chỉnh số worker tùy theo CPU của server

async def process_image_detection(file: UploadFile, temp_path: str):
    """Hàm xử lý ảnh độc lập có thể chạy trong thread riêng"""
    try:
        # Ghi file async
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        # Lấy thời gian hiện tại
        tz_vietnam = timezone(timedelta(hours=7))
        now_vietnam = datetime.now(tz_vietnam)
        timestamp_str = now_vietnam.strftime("%Y-%m-%d %H:%M:%S")
        timestamp_file = now_vietnam.strftime("%Y%m%d-%H%M%S")

        # Gọi model trong thread riêng
        loop = asyncio.get_event_loop()
        start_time = time.time()
        
        # Chạy model trong executor để không block event loop chính
        result = await loop.run_in_executor(
            executor,
            lambda: facedetector.run(image_path=temp_path)
        )
        
        end_time = time.time()
        execution_time = end_time - start_time
        result["execution_time"] = f"{execution_time:.2f} seconds"

        # Xử lý log và lưu ảnh
        saved_filename = f"{os.path.splitext(file.filename)[0]}_{timestamp_file}{os.path.splitext(file.filename)[1]}"
        log_entry = f"[{timestamp_str}] File: {file.filename} | Result: {result} | Time: {execution_time:.2f}s\n"

        if result.get("cheating", False):
            saved_image_path = os.path.join(CHEATING_IMAGE_DIR, saved_filename)
            copyfile(temp_path, saved_image_path)
            
            # Ghi log
            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)
            
            # Ghi CSV
            timestamp_csv = now_vietnam.strftime("%Y%m%d")
            csv_path = os.path.join(CSV_DIR, f"cheat_{timestamp_csv}.csv")
            csv_exists = os.path.isfile(csv_path)
            
            with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
                writer = csv.writer(csvfile)
                if not csv_exists:
                    writer.writerow(["timestamp", "filename", "result", "execution_time"])
                writer.writerow([timestamp_str, saved_filename, result.get("cheating", ""), f"{execution_time:.2f}s"])
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

        # Ghi log realtime
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(log_entry)

        return result

    except Exception as e:
        error_message = f"[{timestamp_str}] Lỗi xử lý file {file.filename}: {str(e)}\n"
        logger.error(error_message)
        with open(LOG_ERROR, "a", encoding="utf-8") as f:
            f.write(error_message)
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(error_message)
        raise HTTPException(status_code=500, detail="Lỗi trong quá trình xử lý ảnh")

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/detect_songsong", summary="Phát hiện gian lận qua ảnh", description="Nhận ảnh và phát hiện khuôn mặt nghi ngờ")
async def detect_face(request: Request, file: UploadFile = File(...)):
    # Kiểm tra định dạng ảnh
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG hoặc PNG.")

    # Tạo đường dẫn tạm
    temp_path = os.path.join(UPLOAD_DIR, f"temp_{uuid.uuid4()}{os.path.splitext(file.filename)[1]}")

    try:
        # Gọi hàm xử lý ảnh
        result = await process_image_detection(file, temp_path)
        return JSONResponse(content=result)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi server nội bộ")

##################################################################################


BASE_DIR_DATABASE = Path(CURRENT_DIR) / "database" / "train"

@app.get("/get_image_database/{subpath:path}")
def get_image(subpath: str):
    """
    API lấy ảnh theo đường dẫn tương đối
    Ví dụ: /get_image_database/1234/1234_20250922-142146.png
    """
    # Tạo đường dẫn tuyệt đối
    file_path = BASE_DIR_DATABASE / subpath

    # Kiểm tra tồn tại
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    # Trả file ảnh
    return FileResponse(file_path)


##################################################################################
# API mới cho quiz exam với quiz_attempt_id
@app.post("/detect_quiz_exam", summary="Phát hiện gian lận trong quiz exam", description="Nhận ảnh và quiz_attempt_id để phát hiện gian lận")
async def detect_quiz_exam(
    request: Request,
    cheat_weights_str: Annotated[str, Form(...)],
    candidate_id: str = Form(..., description="ID của thí sinh"),
    quiz_attempt_id: str = Form(..., description="ID của lần thi"),
    file: UploadFile = File(..., description="Ảnh của thí sinh")
):
    # Lấy extension từ filename
    filename_base, file_ext = os.path.splitext(file.filename)
    file_ext_lower = file_ext.lower()
    
    # Kiểm tra định dạng ảnh - kiểm tra CẢ content_type VÀ file extension
    allowed_content_types = ["image/jpeg", "image/png", "image/jpg", "application/octet-stream"]
    allowed_extensions = [".jpg", ".jpeg", ".png"]
    
    # Log để debug
    logger.info(f"File content_type: {file.content_type}, filename: {file.filename}, extension: {file_ext_lower}")
    
    # Chấp nhận nếu content_type hợp lệ HOẶC extension hợp lệ
    if file.content_type not in allowed_content_types and file_ext_lower not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG hoặc PNG.")

    # Tạo tên file tạm duy nhất
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        # Ghi file async
        async with aiofiles.open(temp_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        logger.info(f"File written to {temp_path}")
        logger.info(f"Received: candidate_id={candidate_id}, quiz_attempt_id={quiz_attempt_id}, file={file.filename}")

        # Gọi model detect
        start_time = time.time()
        try:
            cheat_weights = json.loads(cheat_weights_str)
            detect_result = facedetector.run(image_path=temp_path, cheat_weights=cheat_weights)
        except Exception as detect_error:
            logger.error(f"Lỗi trong facedetector: {str(detect_error)}")
            raise HTTPException(status_code=500, detail=f"Lỗi trong facedetector: {str(detect_error)}")
        end_time = time.time()

        execution_time = end_time - start_time
        detect_result["execution_time"] = f"{execution_time:.2f} seconds"

        logger.info(f"Detect Result: {detect_result}")

        if not isinstance(detect_result, dict):
            logger.error(f"Detect result is not a dictionary: {detect_result}")
            raise HTTPException(status_code=500, detail="Kết quả từ facedetector không hợp lệ")

        # Múi giờ UTC+7
        tz_vietnam = timezone(timedelta(hours=7))
        now_vietnam = datetime.now(tz_vietnam)
        timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')
        timestamp_file = now_vietnam.strftime('%Y%m%d-%H%M%S')

        # Cấu trúc folder: /cheating_image_users/{quiz_attempt_id}/{user_id}/
        user_cheating_dir = os.path.join(BACKEND_CHEATING_IMAGE_DIR, quiz_attempt_id, candidate_id)
        os.makedirs(user_cheating_dir, exist_ok=True)

        saved_filename = f"{filename_base}_{timestamp_file}{file_ext}"
        saved_image_path = os.path.join(user_cheating_dir, saved_filename)
        saved_image_url = f"/cheating_image_users/{quiz_attempt_id}/{candidate_id}/{saved_filename}"

        log_entry = f"[{timestamp}] Quiz Attempt: {quiz_attempt_id} | Candidate ID: {candidate_id} | File: {file.filename} | Result: {detect_result} | Time: {execution_time:.2f}s\n"

        # Nếu phát hiện gian lận, lưu ảnh
        if detect_result.get("cheating", False):
            with open(LOG_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

            # Lưu ảnh vào folder cheating
            copyfile(temp_path, saved_image_path)

            # Ghi log CSV
            timestamp_csv = now_vietnam.strftime("%Y%m%d")
            csv_path = os.path.join(CSV_DIR, f"quiz_cheat_{timestamp_csv}.csv")
            csv_exists = os.path.isfile(csv_path)

            with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
                writer = csv.writer(csvfile)
                if not csv_exists:
                    writer.writerow([
                        "timestamp", 
                        "quiz_attempt_id",
                        "candidate_id",
                        "filename", 
                        "result", 
                        "execution_time",
                        "no_face", 
                        "multiple_faces", 
                        "gaze_off_screen", 
                        "total_cheat_score"
                    ])

                cheat_status = detect_result.get("cheat_status", {})
                writer.writerow([
                    timestamp,
                    quiz_attempt_id,
                    candidate_id,
                    saved_filename, 
                    detect_result.get("cheating", ""), 
                    f"{execution_time:.2f}s",
                    cheat_status.get("no_face", ""), 
                    cheat_status.get("multiple_faces", ""), 
                    cheat_status.get("gaze_off_screen", ""), 
                    detect_result.get("total_cheat_score", "")
                ])
        else:
            with open(LOG_NO_CHEAT, "a", encoding="utf-8") as f:
                f.write(log_entry)

        # Luôn ghi vào log realtime
        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(log_entry)

        # Tạo list cheating reasons như /detect_pro
        reasons = []
        person_count = detect_result.get("person", 1)
        
        # 1️⃣ Điện thoại
        cheat_phone_list = detect_result.get("cheat_mobilephone")
        if cheat_phone_list and any(item.get("label") == "cell phone" for item in cheat_phone_list):
            reasons.append("Phát hiện điện thoại")
        
        # 2️⃣ Tai nghe
        cheat_headphone_list = detect_result.get("cheat_headphone")
        if cheat_headphone_list and any(
            item.get("label") in ["Earphone", "Headphone", "Neckband", "Airpods"]
            for item in cheat_headphone_list
        ):
            reasons.append("Phát hiện tai nghe")
        
        # 3️⃣ Ánh mắt lệch (gaze)
        if detect_result.get("gaze") and detect_result["gaze"].lower() != "center":
            reasons.append("Mắt nhìn ra hướng khác")
        
        # 4️⃣ Không có người
        if person_count == 0:
            reasons.append("Không có người trong ca thi")
            detect_result["cheating"] = True  # ✅ Đánh dấu gian lận
        
        # 5️⃣ Nhiều người trong ảnh
        if person_count > 1:
            reasons.append(f"Có {person_count} người trong ảnh")
            detect_result["cheating"] = True  # ✅ Đánh dấu gian lận
        
        # 6️⃣ Không đúng người dự thi
        faces = detect_result.get("faces", [])
        if faces and isinstance(faces, list) and len(faces) > 0:
            face_name = faces[0].get("name")
            
            # 🔍 Debug logging - so sánh giá trị và kiểu dữ liệu
            logger.info(f"🔍 Face Recognition Debug:")
            logger.info(f"  - face_name: '{face_name}' (type: {type(face_name)})")
            logger.info(f"  - candidate_id: '{candidate_id}' (type: {type(candidate_id)})")
            logger.info(f"  - Are they equal? {str(face_name) == str(candidate_id)}")
            
            # So sánh sau khi convert về string để tránh lỗi kiểu dữ liệu
            if face_name and str(face_name).strip() != str(candidate_id).strip():
                reasons.append("Không đúng người dự thi")
                detect_result["cheating"] = True  # ✅ Đánh dấu gian lận
                logger.warning(f"❌ Mismatch: Expected '{candidate_id}', got '{face_name}'")
        
        # Nếu không phát hiện gì
        if not reasons:
            reasons.append("Không phát hiện gian lận")
        
        # Gộp lại thành 1 câu
        cheating_reason = ", ".join(reasons)

        # Tạo response - đảm bảo tất cả boolean fields đều là bool, không phải number
        cheat_status = detect_result.get("cheat_status", {})
        response = {
            "candidate_id": candidate_id,
            "quiz_attempt_id": quiz_attempt_id,
            "message": "Detection completed",
            "cheating_detected": bool(detect_result.get("cheating", False)),
            "cheating_reason": cheating_reason,
            "multiple_persons": bool(cheat_status.get("multiple_faces", False)),
            "multiple_faces": int(detect_result.get("detected_faces", 0)),
            "no_face_detected": bool(cheat_status.get("no_face", False)),
            "not_matching_candidate": bool(cheat_status.get("unknown_person", False)),
            "unknown_person": bool(cheat_status.get("unknown_person", False)),
            "matched_person_name": str(detect_result.get("matched_person_name", "")),
            "similarity": float(detect_result.get("similarity", 0)),
            "confidence_score": float(detect_result.get("confidence", 0)),
            "headphone_detected": bool(cheat_status.get("headphone_detected", False)),
            "headphone_name": str(detect_result.get("headphone_name", "")),
            "headphone_confidence": float(detect_result.get("headphone_confidence", 0)),
            "cellphone_detected": bool(cheat_status.get("cellphone_detected", False)),
            "cellphone_name": str(detect_result.get("cellphone_name", "")),
            "cellphone_confidence": float(detect_result.get("cellphone_confidence", 0)),
            "is_spoofing": bool(cheat_status.get("is_spoofing", False)),
            "spoofing_score": float(detect_result.get("spoofing_score", 0)),
            "is_looking_away": bool(cheat_status.get("gaze_off_screen", False)),
            "pitch_angle": float(detect_result.get("pitch_angle", 0)),
            "yaw_angle": float(detect_result.get("yaw_angle", 0)),
            "gaze_angle": float(detect_result.get("gaze_angle", 0)),
            "total_violation_point": float(detect_result.get("total_cheat_score", 0)),
            "detection_timestamp": timestamp,
            "saved_image_path": saved_image_path if detect_result.get("cheating", False) else "",
            "saved_image_url": saved_image_url if detect_result.get("cheating", False) else "",
            "processing_time": float(execution_time)
        }

        logger.info(f"Response: {response}")
        return JSONResponse(content=response)

    except Exception as e:
        # Múi giờ UTC+7
        tz_vietnam = timezone(timedelta(hours=7))
        now_vietnam = datetime.now(tz_vietnam)
        timestamp = now_vietnam.strftime('%Y-%m-%d %H:%M:%S')
        
        error_message = f"[{timestamp}] Lỗi xử lý file {file.filename}: {str(e)}\n"
        logger.error(error_message)

        with open(LOG_ERROR, "a", encoding="utf-8") as f:
            f.write(error_message)

        with open(LOG_REALTIME, "a", encoding="utf-8") as f:
            f.write(error_message)

        raise HTTPException(status_code=500, detail="Lỗi trong quá trình xử lý ảnh")

    finally:
        # Xoá file tạm
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Lỗi khi xóa file tạm {temp_path}: {str(e)}")

##################################################################################