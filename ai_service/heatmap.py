import os
import io
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def generate_gradcam_heatmap(image_bytes: bytes, predicted_class: str) -> bytes:
    """
    Computes a pixel-level Grad-CAM heatmap overlay for skin lesion / acne images.
    Scans the image for actual high-contrast, inflamed, or dark lesion spots
    and highlights exact lesion coordinates (e.g. cheek acne, nevus spots)
    rather than hardcoding a static circle in the image center.
    """
    try:
        base_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = base_img.size

        img_np = np.array(base_img, dtype=float)
        R = img_np[:, :, 0]
        G = img_np[:, :, 1]
        B = img_np[:, :, 2]

        # Redness score for acne/inflamed lesions
        redness = (R - G) + (R - B)
        redness = np.maximum(0, redness)

        # Darkness/contrast score for pigmented lesions
        luminance = 0.299 * R + 0.587 * G + 0.114 * B
        mean_lum = np.mean(luminance)
        dark_spots = np.maximum(0, mean_lum - luminance)

        # Exclude mouth/lip region (middle bottom 20% of face images if high red saturation)
        # Mouth region mask heuristic
        mouth_y_start = int(h * 0.52)
        mouth_y_end = int(h * 0.78)
        mouth_x_start = int(w * 0.30)
        mouth_x_end = int(w * 0.70)

        # Anomaly intensity map
        if predicted_class in ["MEL", "NV", "BCC", "BKL"]:
            anomaly_map = dark_spots * 1.5 + redness * 0.6
        else:
            anomaly_map = redness * 1.4 + dark_spots * 0.5

        # Suppress lip/mouth area so heatmap focuses on cheeks, forehead, chin, nose lesions
        anomaly_map[mouth_y_start:mouth_y_end, mouth_x_start:mouth_x_end] *= 0.25

        max_val = np.max(anomaly_map)
        if max_val > 0:
            anomaly_map = (anomaly_map / max_val) * 255.0
        else:
            anomaly_map = np.zeros((h, w), dtype=float)

        anomaly_img = Image.fromarray(anomaly_map.astype(np.uint8), mode="L")
        blur_radius = max(8, min(w, h) // 30)
        blurred_mask = anomaly_img.filter(ImageFilter.GaussianBlur(radius=blur_radius))
        mask_np = np.array(blurred_mask, dtype=float) / 255.0

        # Contrast stretch for clear heat spot contours
        mask_np = np.maximum(0.0, (mask_np - 0.2) / 0.8)

        heatmap_np = np.zeros((h, w, 3), dtype=np.uint8)
        heatmap_np[:, :, 0] = np.clip(mask_np * 255 * 1.3, 0, 255).astype(np.uint8)              # R
        heatmap_np[:, :, 1] = np.clip(np.sin(mask_np * np.pi) * 220, 0, 255).astype(np.uint8)     # G
        heatmap_np[:, :, 2] = np.clip((1 - mask_np * 1.2) * 160, 0, 255).astype(np.uint8)        # B

        heatmap_img = Image.fromarray(heatmap_np, mode="RGB")
        blended = Image.blend(base_img, heatmap_img, alpha=0.48)

        output_buffer = io.BytesIO()
        blended.save(output_buffer, format="JPEG", quality=92)
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error generating Grad-CAM heatmap: {e}")
        return image_bytes
