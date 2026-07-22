import os
import pandas as pd
import numpy as np
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T

CLASS_MAPPING = {
    'MEL': 0, 'NV': 1, 'BCC': 2, 'AK': 3,
    'BKL': 4, 'DF': 5, 'VASC': 6, 'SCC': 7
}

CLASS_NAMES = ['MEL', 'NV', 'BCC', 'AK', 'BKL', 'DF', 'VASC', 'SCC']

class SkinLesionDataset(Dataset):
    """
    PyTorch Dataset cho Tập dữ liệu Y tế Da liễu (ISIC 2019 / HAM10000).
    Tải ảnh 224x224 / 384x384, áp dụng Data Augmentation và nạp nhãn phân loại.
    """
    def __init__(self, df: pd.DataFrame, img_dir: str, is_train: bool = True, img_size: int = 224):
        self.df = df.reset_index(drop=True)
        self.img_dir = img_dir
        self.is_train = is_train
        self.img_size = img_size

        if self.is_train:
            self.transform = T.Compose([
                T.Resize((self.img_size, self.img_size)),
                T.RandomHorizontalFlip(p=0.5),
                T.RandomVerticalFlip(p=0.5),
                T.RandomRotation(degrees=30),
                T.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
                T.ToTensor(),
                T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
                T.RandomErasing(p=0.2, scale=(0.02, 0.2))
            ])
        else:
            self.transform = T.Compose([
                T.Resize((self.img_size, self.img_size)),
                T.ToTensor(),
                T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_name = str(row['image_id'])
        if not img_name.endswith('.jpg'):
            img_name += '.jpg'
            
        img_path = os.path.join(self.img_dir, img_name)
        
        if os.path.exists(img_path):
            image = Image.open(img_path).convert('RGB')
        else:
            image = Image.fromarray(np.random.randint(0, 255, (self.img_size, self.img_size, 3), dtype=np.uint8))
            
        image_tensor = self.transform(image)
        
        label_code = row.get('dx', row.get('label', 'NV'))
        label_idx = CLASS_MAPPING.get(str(label_code).upper(), 1)
        
        return image_tensor, torch.tensor(label_idx, dtype=torch.long)

def compute_class_weights(df: pd.DataFrame) -> torch.Tensor:
    counts = np.zeros(len(CLASS_NAMES))
    for dx in df['dx']:
        code = str(dx).upper()
        if code in CLASS_MAPPING:
            counts[CLASS_MAPPING[code]] += 1
            
    counts = np.maximum(counts, 1)
    total = sum(counts)
    weights = total / (len(CLASS_NAMES) * counts)
    return torch.tensor(weights, dtype=torch.float32)
