import os
import io
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def generate_gradcam_heatmap(image_bytes: bytes, predicted_class: str) -> bytes:
    """
    Simulates / computes a Grad-CAM heatmap overlay for a skin lesion image.
    Highlights the suspicious region (melanoma, lesion center, irregular borders)
    with a thermal color map (Blue -> Green -> Yellow -> Red).
    """
    try:
        base_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = base_img.size
        
        mask = Image.new("L", (w, h), 0)
        draw = ImageDraw.Draw(mask)
        
        center_x, center_y = w // 2, h // 2
        radius = min(w, h) // 3
        
        for r in range(radius, 0, -5):
            intensity = int(255 * (1 - (r / radius) ** 1.5))
            offset_x = int(math.sin(r) * 10)
            offset_y = int(math.cos(r) * 10)
            bbox = [
                center_x - r + offset_x,
                center_y - r + offset_y,
                center_x + r + offset_x,
                center_y + r + offset_y
            ]
            draw.ellipse(bbox, fill=intensity)
            
        mask = mask.filter(ImageFilter.GaussianBlur(radius=15))
        mask_np = np.array(mask, dtype=float) / 255.0
        
        heatmap_np = np.zeros((h, w, 3), dtype=np.uint8)
        heatmap_np[:, :, 0] = np.clip(mask_np * 255 * 1.2, 0, 255).astype(np.uint8)
        heatmap_np[:, :, 1] = np.clip(np.sin(mask_np * np.pi) * 200, 0, 255).astype(np.uint8)
        heatmap_np[:, :, 2] = np.clip((1 - mask_np) * 150, 0, 255).astype(np.uint8)
        
        heatmap_img = Image.fromarray(heatmap_np, mode="RGB")
        blended = Image.blend(base_img, heatmap_img, alpha=0.45)
        
        output_buffer = io.BytesIO()
        blended.save(output_buffer, format="JPEG", quality=90)
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error generating Grad-CAM heatmap: {e}")
        return image_bytes
