import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class NguoiDung(Base):
    __tablename__ = "nguoi_dung"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    so_dien_thoai = Column(String(15), unique=True, nullable=False, index=True)
    mat_khau_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="KHACH_HANG")
    trang_thai = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    khach_hang = relationship("KhachHang", back_populates="nguoi_dung", uselist=False)
    nhan_vien = relationship("NhanVien", back_populates="nguoi_dung", uselist=False)

class KhachHang(Base):
    __tablename__ = "khach_hang"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("nguoi_dung.id"), nullable=True)
    ho_ten = Column(String(100), nullable=False)
    ngay_sinh = Column(String(20), nullable=True)
    dia_chi = Column(Text, nullable=True)
    so_cccd = Column(String(20), nullable=True)
    so_bhyt = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    nguoi_dung = relationship("NguoiDung", back_populates="khach_hang")
    forms = relationship("FormDatLich", back_populates="khach_hang")

class NhanVien(Base):
    __tablename__ = "nhan_vien"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("nguoi_dung.id"), nullable=True)
    ho_ten = Column(String(100), nullable=False)
    chuc_vu = Column(String(20), nullable=False)
    chuyen_khoa = Column(String(100), nullable=True)
    nam_kinh_nghiem = Column(Integer, default=0)

    nguoi_dung = relationship("NguoiDung", back_populates="nhan_vien")
    lich_lam_viec = relationship("LichLamViecBacSi", back_populates="bac_si")
    forms = relationship("FormDatLich", back_populates="bac_si")

class DichVu(Base):
    __tablename__ = "dich_vu"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ten_dich_vu = Column(String(150), nullable=False)
    gia_kham = Column(Float, nullable=False)
    loai_dich_vu = Column(String(20), nullable=False, default="THUONG")
    mo_ta = Column(Text, nullable=True)
    trang_thai = Column(Boolean, default=True)

class LichLamViecBacSi(Base):
    __tablename__ = "lich_lam_viec_bac_si"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bac_si_id = Column(String(36), ForeignKey("nhan_vien.id"), nullable=False)
    ngay_lam_viec = Column(String(20), nullable=False)
    trang_thai = Column(String(20), default="ACTIVE")

    bac_si = relationship("NhanVien", back_populates="lich_lam_viec")

class KhungGio(Base):
    __tablename__ = "khung_gio"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    gio_bat_dau = Column(String(10), nullable=False)
    gio_ket_thuc = Column(String(10), nullable=False)
    so_luong_toi_da = Column(Integer, default=2)

class FormDatLich(Base):
    __tablename__ = "form_dat_lich"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    khach_hang_id = Column(String(36), ForeignKey("khach_hang.id"), nullable=False)
    bac_si_id = Column(String(36), ForeignKey("nhan_vien.id"), nullable=True)
    dich_vu_id = Column(String(36), ForeignKey("dich_vu.id"), nullable=True)
    khung_gio_id = Column(String(36), ForeignKey("khung_gio.id"), nullable=False)
    ngay_kham = Column(String(20), nullable=False)
    trieu_chung = Column(Text, nullable=True)
    tien_su_benh = Column(Text, nullable=True)
    loai_form = Column(String(20), nullable=False, default="THUONG")
    anh_ton_thuong_url = Column(Text, nullable=True)
    so_tien_coc = Column(Float, default=0.0)
    da_dat_coc = Column(Boolean, default=False)
    vi_tri_ton_thuong = Column(String(50), nullable=True, default="Mặt/Trán")
    trang_thai = Column(String(30), default="CHO_XAC_NHAN")
    created_at = Column(DateTime, default=datetime.utcnow)

    khach_hang = relationship("KhachHang", back_populates="forms")
    bac_si = relationship("NhanVien", back_populates="forms")
    ai_log = relationship("AIDiagnosticLog", back_populates="form_dat_lich", uselist=False)
    phieu_kham = relationship("PhieuKhamBenh", back_populates="form_dat_lich", uselist=False)

class PhieuKhamBenh(Base):
    __tablename__ = "phieu_kham_benh"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    form_dat_lich_id = Column(String(36), ForeignKey("form_dat_lich.id"), nullable=False, unique=True)
    bac_si_id = Column(String(36), ForeignKey("nhan_vien.id"), nullable=False)
    chan_doan_cuoi_cung = Column(Text, nullable=False)
    ma_icd = Column(String(30), nullable=True, default="L70.0")
    don_thuoc_json = Column(Text, nullable=True)
    ghi_chu = Column(Text, nullable=True)
    ngay_tai_kham = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    form_dat_lich = relationship("FormDatLich", back_populates="phieu_kham")

class AIDiagnosticLog(Base):
    __tablename__ = "ai_diagnostic_log"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    form_dat_lich_id = Column(String(36), ForeignKey("form_dat_lich.id"), nullable=True)
    image_url = Column(Text, nullable=False)
    top1_class = Column(String(50), nullable=False)
    top1_confidence = Column(Float, nullable=False)
    top3_json = Column(Text, nullable=False)
    heatmap_url = Column(Text, nullable=True)
    model_version = Column(String(30), default="ViT-Small-384-v1")
    latency_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    form_dat_lich = relationship("FormDatLich", back_populates="ai_log")

class FormTuVan(Base):
    __tablename__ = "form_tu_van"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ho_ten = Column(String(100), nullable=False)
    so_dien_thoai = Column(String(15), nullable=False)
    trang_thai_xu_ly = Column(String(20), default="CHO_GIOI")
    created_at = Column(DateTime, default=datetime.utcnow)
