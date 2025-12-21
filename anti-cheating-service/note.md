## Command Line
- Kiểm tra các version python có trong máy
py -0

- Tạo .venv với version python cụ thể:
py -3.10 -m venv .venv

- Activate venv trong VScode: 
.\.venv\Scripts\activate

- Deactive venv trong Vscode:
deactivate

- Xóa venv trong Vscode: 
Remove-Item -Recurse -Force .venv

- Kiểm tra python version trong .venv
Get-Command python

- Chạy service 
uvicorn fastapi_cheat:app --host 127.0.0.1 --port 8001 --reload

## Project
- Tải các thư viện cần thiết
pip install -r requirements.txt




