# 🌾 SMART FARM 4.0 - HỆ SINH THÁI NÔNG NGHIỆP CÔNG NGHỆ CAO TỰ ĐỘNG HÓA

> **Nền tảng Quản Lý Nông Trại Thông Minh Toàn Diện:** Tích hợp Mô Hình Số 3D Digital Twin Ghibli 60 FPS, Viễn Thám Quang Phổ NDVI Vệ Tinh, AI SGD Học Máy Thích Ứng, Trợ Lý Nông Nghiệp Giọng Nói Tiếng Việt & Hồ Sơ Pháp Lý Chuẩn VietGAP.

---

## 🌟 TÍNH NĂNG ĐỘT PHÁ "ĐỈNH CHÓP"

### 1. 🌿 Mô Hình Số 3D Digital Twin Vườn Cây Ghibli (Three.js WebGL)
- **Chuẩn 60+ FPS Turbo Engine:** Tối ưu hóa GPU draw calls, hiển thị mượt mà trên mọi thiết bị máy tính và điện thoại.
- **Phong cách Ghibli Botanical Art:** Thổ nhưỡng ụ đất nâng cao, rễ ngoằn ngoèo, thân cây uốn khúc 3 đoạn, tán lá Dodecahedron phân 3 tầng sắc độ ánh sáng.
- **12+ Giống cây đặc sản:** Sầu riêng Ri6, Lúa ST25, Cam sành, Xoài cát Hòa Lộc, Nho Ninh Thuận, Thanh long, Cà phê Robusta, Bơ sáp,...
- **Custom Crop Creator Studio:** Cho phép tự tạo và tùy biến giống cây, màu trái, hình dáng quả theo sở thích.
- **Mô phỏng 4 Giai đoạn sinh trưởng:** Từ hạt mầm $\rightarrow$ Đâm chồi $\rightarrow$ Trổ hoa $\rightarrow$ Trĩu quả chín thu hoạch.
- **Hệ thống tưới nước 3D & Drone LiDAR:** Quét laser vi khí hậu tự động.

### 2. 🛰️ Lớp Viễn Thám Quang Phổ NDVI Sức Khỏe Cây Trồng
- Quét diệp lục tố và sinh khối lá theo thời gian thực từ dữ liệu vệ tinh Sentinel-2.
- Phát hiện sớm hiện tượng thiếu ẩm, thiếu đạm hoặc nấm bệnh trước 7-10 ngày.

### 3. 🎙️ Trợ Lý Giọng Nói Nông Nghiệp AI (Voice AI Copilot)
- Tích hợp Web Speech API nhận diện giọng nói tiếng Việt tự nhiên.
- Tự động bóc tách loại hành động (tưới nước, bón phân) và số lượng để lưu trực tiếp vào sổ nhật ký canh tác.
- Phản hồi bằng giọng đọc tiếng Việt (Text-to-Speech).

### 4. 🔬 Bác Sĩ Cây Trồng AI (AI Plant Doctor)
- Chẩn đoán sâu bệnh hại (Thán thư, vàng lá thối rễ, rầy nâu, sâu đục thân).
- Đưa ra phác đồ điều trị sinh học thân thiện với môi trường và 1-click tự động ghi vào nhật ký VietGAP.

### 5. 🔔 Trung Tâm Cảnh Báo Sớm Khẩn Cấp 24/7
- Giám sát tự động hạn mặn ĐBSCL (Độ mặn sông Tiền/Hậu) $\rightarrow$ Tự động khóa van bơm tưới khi vượt ngưỡng $1.0‰$.
- Cảnh báo mưa dông, bức xạ mặt trời và rủi ro dịch bệnh kịp thời.

### 6. 📄 Hồ Sơ Kỹ Thuật & Sổ Nhật Ký Canh Tác Chuẩn VietGAP PDF
- Đóng gói đầy đủ mã định danh vùng trồng `VG-2026-01-VN`.
- Thẩm định cân bằng dinh dưỡng N-P-K (cắt giảm 32% lãng phí phân bón).
- Con dấu chứng thực số hóa và hỗ trợ in ấn 1-Click ra giấy A4/PDF nộp cho cơ quan kiểm định.

### 7. 📱 Mã QR Truy Xuất Nguồn Gốc Toàn Cầu
- Trang tra cứu công khai cho người tiêu dùng và siêu thị quét mã kiểm tra toàn bộ quy trình chăm sóc minh bạch.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

- **Frontend:** React 18, Vite 5, Tailwind CSS, Three.js, Lucide Icons, Heroicons, Recharts, Leaflet GIS.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt.
- **Cơ sở dữ liệu:** SQLite / PostgreSQL.
- **AI Core:** Stochastic Gradient Descent (SGD) Linear Regression thích ứng với vòng lặp phản hồi người dùng.
- **Dữ liệu Khí tượng:** Open-Meteo API Real-time (ECMWF/GFS).

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Khởi động Backend
```bash
cd backend
npm install
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```
> Backend chạy tại: `http://localhost:3000`

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```
> Frontend chạy tại: `http://localhost:5173`

---

## 👤 TÀI KHOẢN MẪU ĐĂNG NHẬP

| Vai Trò | Email | Mật Khẩu |
| :--- | :--- | :--- |
| 🧑‍🌾 Nông Dân | `farmer@farm.com` | `password123` |
| 🛡️ Quản Trị Viên (Admin) | `admin@farm.com` | `admin123` |

---
*Phát triển bởi Trần Hữu Thắng • Đồ Án Nông Nghiệp Thông Minh 4.0*
