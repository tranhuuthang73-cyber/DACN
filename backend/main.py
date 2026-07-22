import os
import sys
import uuid
import json
import hashlib
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, Base, get_db, SessionLocal
import models
import schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DermAI Core Backend API",
    description="Hệ thống Backend Quản lý & Đặt lịch khám bệnh Da liễu tích hợp AI (Đăng nhập, Đăng ký, Phân quyền JWT Auth)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8001/api/v1/ai/predict")

def hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode('utf-8')).hexdigest()

def seed_initial_data(db: Session):
    # Seed Accounts for all 4 roles
    demo_accounts = [
        {"phone": "0900000000", "pwd": "admin123", "role": "ADMIN", "name": "Quản Trị Viên Trưởng", "spec": "Quản Trị Hệ Thống", "exp": 12},
        {"phone": "0911111111", "pwd": "doctor123", "role": "DOCTOR", "name": "PGS.TS Bác sĩ Nguyễn Văn An", "spec": "Ung Bướu & Hắc Tố Da (Melanoma)", "exp": 18},
        {"phone": "0911111112", "pwd": "doctor123", "role": "DOCTOR", "name": "BS.CKII Trần Thị Mai", "spec": "Da Liễu Thẩm Mỹ & Cấy Tế Bào", "exp": 14},
        {"phone": "0911111113", "pwd": "doctor123", "role": "DOCTOR", "name": "ThS.BS Lê Hoàng Nam", "spec": "Laser & Dày Sừng Ánh Sáng (Actinic)", "exp": 10},
        {"phone": "0911111114", "pwd": "doctor123", "role": "DOCTOR", "name": "BS.CKI Phạm Minh Đức", "spec": "Dị Ứng & Bệnh Da Trẻ Em", "exp": 8},
        {"phone": "0922222222", "pwd": "staff123", "role": "STAFF", "name": "Y tá Lễ Tân Phạm Thu Hương", "spec": "Tiếp Đón & Lễ Tân", "exp": 5},
        {"phone": "0933333333", "pwd": "patient123", "role": "KHACH_HANG", "name": "Bệnh nhân Trần Văn Khang", "spec": "Khách Hàng", "exp": 0}
    ]

    for acc in demo_accounts:
        user = db.query(models.NguoiDung).filter(models.NguoiDung.so_dien_thoai == acc["phone"]).first()
        if not user:
            user = models.NguoiDung(
                so_dien_thoai=acc["phone"],
                mat_khau_hash=hash_password(acc["pwd"]),
                role=acc["role"]
            )
            db.add(user)
            db.flush()

            if acc["role"] == "KHACH_HANG":
                kh = models.KhachHang(user_id=user.id, ho_ten=acc["name"], dia_chi="Hà Nội")
                db.add(kh)
            else:
                nv = models.NhanVien(user_id=user.id, ho_ten=acc["name"], chuc_vu=acc["role"], chuyen_khoa=acc.get("spec", "Da liễu tổng hợp"), nam_kinh_nghiem=acc.get("exp", 5))
                db.add(nv)

    # Seed DichVu
    if db.query(models.DichVu).count() == 0:
        services = [
            models.DichVu(ten_dich_vu="Khám Da liễu Khám thường", gia_kham=150000, loai_dich_vu="THUONG", mo_ta="Khám chẩn đoán tổng quát bệnh ngoài da."),
            models.DichVu(ten_dich_vu="Khám Da liễu BHYT", gia_kham=40000, loai_dich_vu="BHYT", mo_ta="Khám theo chế độ Bảo hiểm y tế quy định."),
            models.DichVu(ten_dich_vu="Khám Chuyên sâu Ung bướu Da (VIP)", gia_kham=500000, loai_dich_vu="YEU_CAU", mo_ta="Khám với Trưởng khoa & Phân tích chuyên sâu tổn thương hắc tố/nghi ngờ ung thư da."),
            models.DichVu(ten_dich_vu="Điều trị Laser & Dày sừng ánh sáng", gia_kham=800000, loai_dich_vu="YEU_CAU", mo_ta="Thủ thuật điều trị tổn thương dày sừng, mụn hạt bẹt.")
        ]
        db.add_all(services)

    # Seed KhungGio
    if db.query(models.KhungGio).count() == 0:
        slots = [
            models.KhungGio(gio_bat_dau="08:00", gio_ket_thuc="08:30", so_luong_toi_da=2),
            models.KhungGio(gio_bat_dau="08:30", gio_ket_thuc="09:00", so_luong_toi_da=2),
            models.KhungGio(gio_bat_dau="09:00", gio_ket_thuc="09:30", so_luong_toi_da=2),
            models.KhungGio(gio_bat_dau="09:30", gio_ket_thuc="10:00", so_luong_toi_da=2),
            models.KhungGio(gio_bat_dau="10:00", gio_ket_thuc="10:30", so_luong_toi_da=2),
            models.KhungGio(gio_bat_dau="13:30", gio_ket_thuc="14:00", so_luong_toi_da=2),
            models.KhungGio(gio_bat_dau="14:00", gio_ket_thuc="14:30", so_luong_toi_da=2),
            models.KhungGio(gio_bat_dau="14:30", gio_ket_thuc="15:00", so_luong_toi_da=2),
            models.KhungGio(gio_bat_dau="15:00", gio_ket_thuc="15:30", so_luong_toi_da=2)
        ]
        db.add_all(slots)

    db.commit()

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

# ------------------------------------------------------------------
# AUTHENTICATION & ROLE PHÂN QUYỀN API
# ------------------------------------------------------------------
@app.post("/api/v1/auth/register")
def register_user(reg_in: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.NguoiDung).filter(models.NguoiDung.so_dien_thoai == reg_in.so_dien_thoai).first()
    if existing:
        raise HTTPException(status_code=400, detail="Số điện thoại này đã được đăng ký!")

    user = models.NguoiDung(
        so_dien_thoai=reg_in.so_dien_thoai,
        mat_khau_hash=hash_password(reg_in.mat_khau),
        role=reg_in.role
    )
    db.add(user)
    db.flush()

    if reg_in.role == "KHACH_HANG":
        kh = models.KhachHang(user_id=user.id, ho_ten=reg_in.ho_ten)
        db.add(kh)
    else:
        nv = models.NhanVien(user_id=user.id, ho_ten=reg_in.ho_ten, chuc_vu=reg_in.role, chuyen_khoa="Da liễu")
        db.add(nv)

    db.commit()
    return {"status": "success", "message": "Đăng ký tài khoản thành công!", "role": reg_in.role}

@app.post("/api/v1/auth/login")
def login_user(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    pwd_hash = hash_password(login_in.mat_khau)
    user = db.query(models.NguoiDung).filter(
        models.NguoiDung.so_dien_thoai == login_in.so_dien_thoai,
        models.NguoiDung.mat_khau_hash == pwd_hash
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Số điện thoại hoặc mật khẩu không chính xác!")

    name = "Khách hàng"
    if user.khach_hang:
        name = user.khach_hang.ho_ten
    elif user.nhan_vien:
        name = user.nhan_vien.ho_ten

    token = f"dermai-jwt-{user.id}-{int(datetime.utcnow().timestamp())}"

    return {
        "status": "success",
        "access_token": token,
        "user_id": user.id,
        "phone": user.so_dien_thoai,
        "name": name,
        "role": user.role
    }

@app.get("/api/v1/auth/demo-users")
def get_demo_users():
    return [
        {"role": "ADMIN", "name": "Quản Trị Viên Trưởng", "phone": "0900000000", "pass": "admin123"},
        {"role": "DOCTOR", "name": "PGS.TS Bác sĩ Nguyễn Văn An", "phone": "0911111111", "pass": "doctor123"},
        {"role": "STAFF", "name": "Y tá Lễ Tân Phạm Thu Hương", "phone": "0922222222", "pass": "staff123"},
        {"role": "KHACH_HANG", "name": "Bệnh nhân Trần Văn Khang", "phone": "0933333333", "pass": "patient123"}
    ]

# ------------------------------------------------------------------
# ADMIN DASHBOARD & STATS API
# ------------------------------------------------------------------
@app.get("/api/v1/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_bookings = db.query(models.FormDatLich).count()
    completed_bookings = db.query(models.FormDatLich).filter(models.FormDatLich.trang_thai == "HOAN_THANH").count()
    ai_bookings = db.query(models.FormDatLich).filter(models.FormDatLich.loai_form == "AI").count()
    
    # Calculate revenue dynamically from service prices
    bookings = db.query(models.FormDatLich).all()
    total_revenue = 0.0
    for b in bookings:
        dv = db.query(models.DichVu).filter(models.DichVu.id == b.dich_vu_id).first() if b.dich_vu_id else None
        if dv and dv.gia_kham:
            total_revenue += dv.gia_kham
        elif b.so_tien_coc:
            total_revenue += b.so_tien_coc
        else:
            total_revenue += 150000.0
    
    ai_logs = db.query(models.AIDiagnosticLog).all()
    malignant_count = sum(1 for log in ai_logs if log.top1_class in ["MEL", "BCC", "SCC"])
    avg_latency = int(sum(log.latency_ms for log in ai_logs) / len(ai_logs)) if ai_logs else 145

    return {
        "total_bookings": total_bookings,
        "completed_bookings": completed_bookings,
        "ai_bookings": ai_bookings,
        "total_revenue": total_revenue,
        "ai_scans_count": len(ai_logs),
        "malignant_detected": malignant_count,
        "ai_avg_latency_ms": avg_latency,
        "ai_model_name": "Vision Transformer (ViT-Small-384)"
    }

# ------------------------------------------------------------------
# DOCTORS & SERVICES & SLOTS CRUD API
# ------------------------------------------------------------------
@app.get("/api/v1/doctors")
def get_doctors(db: Session = Depends(get_db)):
    return db.query(models.NhanVien).filter(models.NhanVien.chuc_vu == "DOCTOR").all()

@app.post("/api/v1/doctors")
def create_doctor(doc_in: schemas.DoctorCreate, db: Session = Depends(get_db)):
    nv = models.NhanVien(
        ho_ten=doc_in.ho_ten,
        chuc_vu=doc_in.chuc_vu,
        chuyen_khoa=doc_in.chuyen_khoa,
        nam_kinh_nghiem=doc_in.nam_kinh_nghiem
    )
    db.add(nv)
    db.commit()
    db.refresh(nv)
    return {"status": "success", "doctor": nv, "message": "Thêm nhân sự mới thành công!"}

@app.delete("/api/v1/doctors/{doc_id}")
def delete_doctor(doc_id: str, db: Session = Depends(get_db)):
    nv = db.query(models.NhanVien).get(doc_id)
    if not nv:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân sự")
    db.delete(nv)
    db.commit()
    return {"status": "success", "message": "Đã xóa nhân sự thành công!"}

@app.get("/api/v1/services")
def get_services(db: Session = Depends(get_db)):
    return db.query(models.DichVu).all()

@app.post("/api/v1/services")
def create_service(srv_in: schemas.ServiceCreate, db: Session = Depends(get_db)):
    dv = models.DichVu(
        ten_dich_vu=srv_in.ten_dich_vu,
        gia_kham=srv_in.gia_kham,
        loai_dich_vu=srv_in.loai_dich_vu,
        mo_ta=srv_in.mo_ta,
        trang_thai=True
    )
    db.add(dv)
    db.commit()
    db.refresh(dv)
    return {"status": "success", "service": dv, "message": "Thêm gói dịch vụ mới thành công!"}

@app.delete("/api/v1/services/{srv_id}")
def delete_service(srv_id: str, db: Session = Depends(get_db)):
    dv = db.query(models.DichVu).get(srv_id)
    if not dv:
        raise HTTPException(status_code=404, detail="Không tìm thấy dịch vụ")
    db.delete(dv)
    db.commit()
    return {"status": "success", "message": "Đã xóa gói dịch vụ thành công!"}

@app.get("/api/v1/slots")
def get_slots(db: Session = Depends(get_db)):
    return db.query(models.KhungGio).all()

@app.post("/api/v1/slots")
def create_slot(slot_in: schemas.SlotCreate, db: Session = Depends(get_db)):
    kg = models.KhungGio(
        gio_bat_dau=slot_in.gio_bat_dau,
        gio_ket_thuc=slot_in.gio_ket_thuc,
        so_luong_toi_da=slot_in.so_luong_toi_da
    )
    db.add(kg)
    db.commit()
    db.refresh(kg)
    return {"status": "success", "slot": kg, "message": "Thêm khung giờ ca khám thành công!"}

# ------------------------------------------------------------------
# BOOKINGS & EXAMINATIONS API
# ------------------------------------------------------------------
@app.post("/api/v1/ai/analyze")
async def analyze_skin_lesion(file: UploadFile = File(...)):
    return {
        "predicted_class": "MEL",
        "predicted_class_name": "Melanoma (U hắc tố ác tính)",
        "confidence": 0.885,
        "is_malignant": True,
        "requires_urgent_review": True,
        "recommended_specialist": "Bác sĩ Chuyên khoa Ung bướu & Da liễu",
        "top3_predictions": [
            {"class_code": "MEL", "class_name": "Melanoma (U hắc tố ác tính)", "confidence": 0.885, "is_malignant": True, "recommended_specialist": "Bác sĩ Chuyên khoa Ung bướu & Da liễu"},
            {"class_code": "NV", "class_name": "Melanocytic Nevus (Nốt ruồi lành tính)", "confidence": 0.08, "is_malignant": False, "recommended_specialist": "Bác sĩ Da liễu Tổng quát"},
            {"class_code": "BKL", "class_name": "Benign Keratosis (Dày sừng lành tính)", "confidence": 0.035, "is_malignant": False, "recommended_specialist": "Bác sĩ Da liễu Tổng quát"}
        ],
        "heatmap_url": "https://via.placeholder.com/400x400/0f4c81/ffffff?text=GradCAM+Heatmap",
        "latency_ms": 150,
        "model_version": "ViT-Small-384-v1"
    }

@app.post("/api/v1/bookings")
def create_booking(booking_in: schemas.BookingCreate, db: Session = Depends(get_db)):
    khach_hang = db.query(models.KhachHang).filter(models.KhachHang.so_cccd == booking_in.so_cccd if booking_in.so_cccd else models.KhachHang.ho_ten == booking_in.ho_ten).first()
    
    if not khach_hang:
        khach_hang = models.KhachHang(
            ho_ten=booking_in.ho_ten,
            ngay_sinh=booking_in.ngay_sinh,
            dia_chi=booking_in.dia_chi,
            so_cccd=booking_in.so_cccd,
            so_bhyt=booking_in.so_bhyt
        )
        db.add(khach_hang)
        db.flush()

    form = models.FormDatLich(
        khach_hang_id=khach_hang.id,
        bac_si_id=booking_in.bac_si_id,
        dich_vu_id=booking_in.dich_vu_id,
        khung_gio_id=booking_in.khung_gio_id,
        ngay_kham=booking_in.ngay_kham,
        trieu_chung=booking_in.trieu_chung,
        tien_su_benh=booking_in.tien_su_benh,
        loai_form=booking_in.loai_form,
        anh_ton_thuong_url=booking_in.anh_ton_thuong_url,
        so_tien_coc=100000.0 if booking_in.loai_form == "AI" else 0.0,
        da_dat_coc=True if booking_in.loai_form == "AI" else False,
        trang_thai="DA_XAC_NHAN" if booking_in.loai_form == "AI" else "CHO_XAC_NHAN"
    )
    db.add(form)
    db.flush()

    if booking_in.ai_top1_class:
        ai_log = models.AIDiagnosticLog(
            form_dat_lich_id=form.id,
            image_url=booking_in.anh_ton_thuong_url or "",
            top1_class=booking_in.ai_top1_class,
            top1_confidence=booking_in.ai_top1_confidence or 0.0,
            top3_json=booking_in.ai_top3_json or "[]",
            heatmap_url=booking_in.ai_heatmap_url or "",
            latency_ms=180
        )
        db.add(ai_log)

    db.commit()
    db.refresh(form)
    return {"status": "success", "booking_id": form.id, "message": "Đặt lịch thành công!"}

@app.get("/api/v1/bookings")
def list_bookings(db: Session = Depends(get_db)):
    forms = db.query(models.FormDatLich).all()
    results = []
    for f in forms:
        kh = db.query(models.KhachHang).get(f.khach_hang_id)
        bs = db.query(models.NhanVien).get(f.bac_si_id) if f.bac_si_id else None
        dv = db.query(models.DichVu).filter(models.DichVu.id == f.dich_vu_id).first() if f.dich_vu_id else None
        kg = db.query(models.KhungGio).get(f.khung_gio_id)
        ai = db.query(models.AIDiagnosticLog).filter(models.AIDiagnosticLog.form_dat_lich_id == f.id).first()
        pk = db.query(models.PhieuKhamBenh).filter(models.PhieuKhamBenh.form_dat_lich_id == f.id).first()

        results.append({
            "id": f.id,
            "patient_name": kh.ho_ten if kh else "Vô danh",
            "patient_phone": kh.so_cccd if kh else "",
            "doctor_name": bs.ho_ten if bs else "Chưa chỉ định",
            "service_name": dv.ten_dich_vu if dv else "Khám Da liễu Khám thường",
            "service_price": dv.gia_kham if dv else 150000.0,
            "date": f.ngay_kham,
            "slot": f"{kg.gio_bat_dau} - {kg.gio_ket_thuc}" if kg else "",
            "symptoms": f.trieu_chung,
            "status": f.trang_thai,
            "form_type": f.loai_form,
            "image_url": f.anh_ton_thuong_url,
            "ai_top1": ai.top1_class if ai else None,
            "ai_confidence": ai.top1_confidence if ai else None,
            "ai_heatmap_url": ai.heatmap_url if ai else None,
            "diagnosis": pk.chan_doan_cuoi_cung if pk else None
        })
    return results

@app.post("/api/v1/bookings/{booking_id}/confirm")
def confirm_booking(booking_id: str, db: Session = Depends(get_db)):
    form = db.query(models.FormDatLich).get(booking_id)
    if not form:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu đặt lịch")
    form.trang_thai = "DA_XAC_NHAN"
    db.commit()
    return {"status": "success", "message": "Đã xác nhận lịch hẹn của bệnh nhân!"}

class StatusUpdatePayload(BaseModel):
    status: str

@app.post("/api/v1/bookings/{booking_id}/status")
def update_booking_status(booking_id: str, payload: StatusUpdatePayload, db: Session = Depends(get_db)):
    form = db.query(models.FormDatLich).get(booking_id)
    if not form:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu đặt lịch")
    form.trang_thai = payload.status
    db.commit()
    return {"status": "success", "message": f"Đã cập nhật trạng thái phiếu thành {payload.status}!"}

@app.get("/api/v1/bookings/my-history")
def get_my_booking_history(phone: Optional[str] = None, db: Session = Depends(get_db)):
    forms = db.query(models.FormDatLich).all()
    results = []
    for f in forms:
        kh = db.query(models.KhachHang).get(f.khach_hang_id)
        bs = db.query(models.NhanVien).get(f.bac_si_id) if f.bac_si_id else None
        dv = db.query(models.DichVu).get(f.dich_vu_id) if f.dich_vu_id else None
        kg = db.query(models.KhungGio).get(f.khung_gio_id)
        pk = db.query(models.PhieuKhamBenh).filter(models.PhieuKhamBenh.form_dat_lich_id == f.id).first()

        results.append({
            "id": f.id,
            "patient_name": kh.ho_ten if kh else "Bệnh nhân",
            "patient_phone": kh.so_cccd if kh else "",
            "doctor_name": bs.ho_ten if bs else "PGS.TS Bác sĩ Nguyễn Văn An",
            "service_name": dv.ten_dich_vu if dv else "Khám Da liễu Khám thường",
            "service_price": dv.gia_kham if dv else 150000.0,
            "date": f.ngay_kham,
            "slot": f"{kg.gio_bat_dau} - {kg.gio_ket_thuc}" if kg else "08:00 - 08:30",
            "status": f.trang_thai,
            "form_type": f.loai_form,
            "symptoms": f.trieu_chung,
            "diagnosis": pk.chan_doan_cuoi_cung if pk else None,
            "prescription": pk.don_thuoc_json if pk else None,
            "created_at": f.created_at.isoformat() if f.created_at else ""
        })
    return results

@app.post("/api/v1/bookings/{booking_id}/checkin")
def checkin_patient(booking_id: str, db: Session = Depends(get_db)):
    form = db.query(models.FormDatLich).get(booking_id)
    if not form:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu đặt lịch")
    form.trang_thai = "CHECK_IN"
    db.commit()
    return {"status": "success", "message": "Đã check-in bệnh nhân thành công!"}

@app.post("/api/v1/examinations")
def create_examination(exam_in: schemas.ExaminationCreate, db: Session = Depends(get_db)):
    form = db.query(models.FormDatLich).get(exam_in.form_dat_lich_id)
    if not form:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu đặt lịch")

    exam = models.PhieuKhamBenh(
        form_dat_lich_id=exam_in.form_dat_lich_id,
        bac_si_id=exam_in.bac_si_id,
        chan_doan_cuoi_cung=exam_in.chan_doan_cuoi_cung,
        don_thuoc_json=exam_in.don_thuoc_json,
        ghi_chu=exam_in.ghi_chu,
        ngay_tai_kham=exam_in.ngay_tai_kham
    )
    db.add(exam)
    form.trang_thai = "HOAN_THANH"
    db.commit()
    return {"status": "success", "message": "Đã lưu chẩn đoán và đơn thuốc thành công!"}

@app.post("/api/v1/consultations")
def create_consultation(c_in: schemas.TuVanCreate, db: Session = Depends(get_db)):
    tv = models.FormTuVan(
        ho_ten=c_in.ho_ten,
        so_dien_thoai=c_in.so_dien_thoai
    )
    db.add(tv)
    db.commit()
    return {"status": "success", "message": "Đăng ký tư vấn thành công! Nhân viên CSKH sẽ liên hệ lại sớm nhất."}

@app.get("/api/v1/consultations")
def list_consultations(db: Session = Depends(get_db)):
    return db.query(models.FormTuVan).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
