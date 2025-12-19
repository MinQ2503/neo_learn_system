#!/usr/bin/env python3
"""
Script để chạy FastAPI server với cấu hình đúng
"""
import uvicorn
import sys
import os

# Thêm thư mục api vào path
current_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.join(current_dir, "face-recognition", "api")
sys.path.insert(0, api_dir)

if __name__ == "__main__":
    # Chạy server trên localhost:8000
    print("Starting FastAPI server on http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("Press Ctrl+C to stop")
    print("-" * 50)
    
    try:
        uvicorn.run(
            "fastapi_cheat:app",
            host="127.0.0.1",  # localhost
            port=8000,
            reload=True,  # Auto-reload khi code thay đổi
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

