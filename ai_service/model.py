import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models

class DermAIVisionTransformer(nn.Module):
    """
    Kiến trúc Vision Transformer (ViT-Small / ViT-Base) fine-tuned cho 8 lớp bệnh da liễu.
    Tự động resize tensor đầu vào về (224, 224) để phù hợp với patch size của ViT backbone.
    """
    def __init__(self, num_classes: int = 8, pretrained: bool = True):
        super(DermAIVisionTransformer, self).__init__()
        try:
            self.backbone = models.vit_b_16(weights=models.ViT_B_16_Weights.DEFAULT if pretrained else None)
            in_features = self.backbone.heads.head.in_features
            self.backbone.heads.head = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(in_features, 256),
                nn.ReLU(),
                nn.Dropout(p=0.2),
                nn.Linear(256, num_classes)
            )
        except Exception:
            self.backbone = models.resnet50(pretrained=pretrained)
            in_features = self.backbone.fc.in_features
            self.backbone.fc = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(in_features, 256),
                nn.ReLU(),
                nn.Linear(256, num_classes)
            )

    def forward(self, x):
        if x.shape[-2:] != (224, 224):
            x = F.interpolate(x, size=(224, 224), mode='bilinear', align_corners=False)
        return self.backbone(x)

class DermAIEfficientNet(nn.Module):
    """
    Kiến trúc EfficientNet-B4 (CNN) với Compound Scaling.
    Tối ưu nhận diện các đặc trưng cục bộ (Local Features) như viền mép nốt ruồi.
    """
    def __init__(self, num_classes: int = 8, pretrained: bool = True):
        super(DermAIEfficientNet, self).__init__()
        try:
            self.backbone = models.efficientnet_b4(weights=models.EfficientNet_B4_Weights.DEFAULT if pretrained else None)
            in_features = self.backbone.classifier[1].in_features
            self.backbone.classifier[1] = nn.Sequential(
                nn.Dropout(p=0.4),
                nn.Linear(in_features, 256),
                nn.SiLU(),
                nn.Linear(256, num_classes)
            )
        except Exception:
            self.backbone = models.resnet34(pretrained=pretrained)
            in_features = self.backbone.fc.in_features
            self.backbone.fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.backbone(x)

def get_model(architecture: str = "vit", num_classes: int = 8, pretrained: bool = True):
    if architecture.lower() in ["vit", "vision_transformer"]:
        return DermAIVisionTransformer(num_classes=num_classes, pretrained=pretrained)
    elif architecture.lower() in ["efficientnet", "effnet"]:
        return DermAIEfficientNet(num_classes=num_classes, pretrained=pretrained)
    else:
        raise ValueError(f"Kiến trúc không hợp lệ: {architecture}. Hãy chọn 'vit' hoặc 'efficientnet'.")
