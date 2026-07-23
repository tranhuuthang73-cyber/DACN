from pydantic import BaseModel
from typing import Optional, List

class UserRegister(BaseModel):
    so_dien_thoai: str
    mat_khau: str
    ho_ten: str
    role: str = "KHACH_HANG" # KHACH_HANG, STAFF, DOCTOR, ADMIN

class UserLogin(BaseModel):
    so_dien_thoai: str
    mat_khau: str

class DoctorCreate(BaseModel):
    ho_ten: str
    chuc_vu: str = "DOCTOR"
    chuyen_khoa: str
    nam_kinh_nghiem: int = 1
    so_dien_thoai: Optional[str] = None

class ServiceCreate(BaseModel):
    ten_dich_vu: str
    gia_kham: float
    loai_dich_vu: str = "THUONG"
    mo_ta: Optional[str] = None

class SlotCreate(BaseModel):
    gio_bat_dau: str
    gio_ket_thuc: str
    so_luong_toi_da: int = 2

class BookingCreate(BaseModel):
    ho_ten: str
    so_dien_thoai: Optional[str] = None
    ngay_sinh: Optional[str] = None
    dia_chi: Optional[str] = None
    so_cccd: Optional[str] = None
    so_bhyt: Optional[str] = None
    trieu_chung: Optional[str] = None
    tien_su_benh: Optional[str] = None
    bac_si_id: Optional[str] = None
    dich_vu_id: Optional[str] = None
    khung_gio_id: str
    ngay_kham: str
    loai_form: str = "THUONG"
    anh_ton_thuong_url: Optional[str] = None
    vi_tri_ton_thuong: Optional[str] = "Mặt/Trán"
    ai_top1_class: Optional[str] = None
    ai_top1_confidence: Optional[float] = None
    ai_top3_json: Optional[str] = None
    ai_heatmap_url: Optional[str] = None

class ExaminationCreate(BaseModel):
    form_dat_lich_id: str
    bac_si_id: str
    chan_doan_cuoi_cung: str
    ma_icd: Optional[str] = "L70.0"
    don_thuoc_json: Optional[str] = None
    ghi_chu: Optional[str] = None
    ngay_tai_kham: Optional[str] = None

class TuVanCreate(BaseModel):
    ho_ten: str
    so_dien_thoai: str
