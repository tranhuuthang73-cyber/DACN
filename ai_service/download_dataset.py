"""
Script tự động tải Dataset y tế ISIC / HAM10000 về thư mục D:\\DACN\\dataset\\
Cách sử dụng:
1. Cài đặt thư viện: pip install kagglehub
2. Chạy lệnh: python download_dataset.py
"""

import os
import sys

def download_dataset():
    dataset_dir = r"D:\DACN\dataset"
    os.makedirs(dataset_dir, exist_ok=True)
    print(f"🔄 Bắt đầu kết nối và tải Dataset về: {dataset_dir} ...")

    try:
        import kagglehub
        # Tải tập dữ liệu HAM10000 từ Kaggle
        path = kagglehub.dataset_download("kmader/skin-cancer-mnist-ham10000")
        print(f"✅ Tải thành công! Dữ liệu nằm tại: {path}")
        print("💡 Bạn có thể giải nén/copy tệp ảnh vào thư mục D:\\DACN\\dataset\\raw_images")
    except ImportError:
        print("⚠️ Chưa cài thư viện kagglehub. Hãy chạy lệnh: pip install kagglehub")
    except Exception as e:
        print(f"⚠️ Có lỗi xảy ra: {e}")
        print("💡 Bạn cũng có thể tải trực tiếp từ web: https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000")

if __name__ == "__main__":
    download_dataset()
