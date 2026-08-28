# 🚀 TravelGo - Nền tảng Đặt chỗ Du lịch Tích hợp Dashboard Dữ liệu

> **Đề tài**: LV13-062 – Phần mềm đặt lịch/đặt chỗ tích hợp dashboard dữ liệu cho du lịch.  
> **Kiến trúc**: PHP Thuần (Mô hình MVC chuẩn, không framework nặng nề, bảo mật cao) + MySQL 8.0 + HTML5 / CSS3 (Design System độc quyền) + JavaScript Vanilla (Fetch API, Chart.js, Lucide Icons).

---

## 📌 1. Danh sách Tài khoản Demo (Tất cả mật khẩu: `password123`)

| Vai trò (Role) | Username | Email | Quyền hạn & Chức năng kiểm thử |
|---|---|---|---|
| 👑 **Admin** | `admin` | `admin@travelgo.vn` | Toàn quyền hệ thống, tạo chuyến đi mới, duyệt doanh nghiệp đối tác, xem Dashboard tổng quan GMV toàn sàn. |
| 💼 **Nhân viên (Employee)** | `nv_hoa` | `hoa.nguyen@travelgo.vn` | Duyệt mở bán chuyến đi (do Admin tạo), duyệt khách sạn đối tác, duyệt yêu cầu hoàn tiền vé. |
| 🤝 **Đối tác Xe (Partner)** | `dt_saigontour` | `saigontourist@travelgo.vn` | Quản lý đội xe, theo dõi doanh thu riêng của công ty, xem danh sách hành khách. |
| 🤝 **Đối tác Khách sạn (Partner)** | `dt_vinpearl` | `vinpearl@travelgo.vn` | Quản lý danh sách khách sạn & các loại phòng, cập nhật số phòng trống, theo dõi doanh thu phòng. |
| 👤 **Khách hàng (Customer)** | `kh_an` | `an.nguyen@gmail.com` | Tìm kiếm chuyến & phòng, thêm vào giỏ hàng kết hợp, đặt giữ chỗ 15 phút, xem vé điện tử, yêu cầu hủy hoàn tiền. |

*(💡 Mẹo: Trên trang Đăng nhập `/auth/login` có sẵn các nút **1-Click Autofill** để đăng nhập thử nghiệm ngay lập tức).*

---

## ⚙️ 2. Hướng dẫn Cài đặt & Khởi chạy (XAMPP / Laragon / PHP CLI)

### Bước 1: Clone hoặc tải thư mục mã nguồn
Đặt thư mục `DULICH` vào thư mục web server (ví dụ `C:\xampp\htdocs\DULICH` hoặc `D:\DULICH`).

### Bước 2: Tạo Cơ sở dữ liệu MySQL
1. Mở **phpMyAdmin** (hoặc MySQL Workbench / Navicat / HeidiSQL).
2. Tạo CSDL mới tên là `travelgo` với collation `utf8mb4_unicode_ci`.
3. Import file `database/schema.sql` để tạo cấu trúc 20 bảng, stored procedure và views.
4. Import file `database/seed.sql` để nạp dữ liệu mẫu (15 địa điểm Việt Nam, 9 chuyến đi, 5 khách sạn, tài khoản demo).

### Bước 3: Cấu hình Môi trường `.env`
Đổi tên file `.env.example` thành `.env` (hoặc kiểm tra file `.env` hiện có):
```ini
APP_NAME=TravelGo
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=travelgo
DB_USER=root
DB_PASS=
```

### Bước 4: Khởi chạy máy chủ Web
Mở Terminal / PowerShell tại thư mục dự án và chạy:
```bash
php -S localhost:8000 -t public
```
Truy cập trình duyệt: **`http://localhost:8000`**

---

## 🔄 3. Cấu hình Cron Job Tự động Xử lý Hết hạn Giữ chỗ (15 Phút)

Hệ thống có cơ chế **giữ chỗ 15 phút chống Race Condition** (`SELECT ... FOR UPDATE`). Để tự động hủy các booking chưa thanh toán quá 15 phút và hoàn trả số lượng ghế trống:

- **Chạy thủ công bằng lệnh**:
  ```bash
  php cron/expire_bookings.php
  ```
- **Thiết lập Cron Job (Linux / Windows Task Scheduler)**: Chạy định kỳ mỗi 1 hoặc 5 phút.

---

## 🏗️ 4. Cấu trúc Thư mục Dự án

```
DULICH/
├── app/
│   ├── config/             # Cấu hình Database & Ứng dụng
│   ├── controllers/        # Bộ điều khiển MVC
│   │   ├── admin/          # Admin Dashboard, Chuyến đi, Duyệt đối tác
│   │   ├── employee/       # Bảng điều hành nhân viên, Duyệt chuyến & KS
│   │   ├── partner/        # Dashboard đối tác, Quản lý KS & Phòng
│   │   └── api/            # API Live Auto-suggest & Smart Recommendations
│   ├── core/               # Core Framework (App, Router, Database PDO, Validator, Session, Helper)
│   ├── middleware/         # Phân quyền 4 cấp (Auth, Admin, Employee, Partner)
│   ├── models/             # Data Models (User, Trip, Hotel, Room, Order, Booking, Partner...)
│   ├── services/           # Nghiệp vụ phức tạp (BookingService - SELECT FOR UPDATE, RecommendationService)
│   └── views/              # Giao diện người dùng theo chuẩn Design System
├── cron/                   # Script xử lý background tác vụ hết hạn
├── database/               # File DDL schema.sql (20 bảng) và DML seed.sql
├── public/                 # Web Root (index.php, .htaccess, assets CSS/JS/Images)
│   └── assets/
│       ├── css/style.css   # Hệ thống CSS Design System chuẩn UX/UI
│       └── js/             # Script Auto-suggest, Interactive logic
├── .env                    # Biến môi trường
└── README.md               # Hướng dẫn đồ án
```

---

## 🔒 5. Điểm nhấn Kỹ thuật & Bảo mật trong Đồ án

1. **Khóa dòng chống Race Condition (`SELECT ... FOR UPDATE`)**: Khi nhiều khách hàng cùng đặt các ghế cuối cùng trong cùng 1 giây, Database Transaction sẽ khóa và kiểm tra số chỗ trước khi trừ chỗ, ngăn chặn hoàn toàn hiện tượng Overbooking.
2. **Chính sách Hoàn tiền Tự động bậc thang**: Tính toán tự động theo thời gian hủy trước ngày khởi hành (≥7 ngày: 100%, 3-6 ngày: 50%, 1-2 ngày: 20%, <1 ngày: 0%).
3. **Bảo vệ Brute-Force & Session Security**: Tự động khóa đăng nhập 15 phút nếu nhập sai mật khẩu quá 5 lần; sinh mã CSRF One-time Token chống giả mạo request.
4. **Dashboard Đa phân hệ**: Tích hợp Chart.js phân tích doanh thu theo tháng, cơ cấu dịch vụ Chuyến đi vs Khách sạn, tỷ lệ lấp đầy tuyến đường, hàng đợi tác vụ cho nhân viên.
5. **Động cơ Gợi ý Thông minh (Recommendation Engine)**: Tự động gợi ý chuyến thay thế lân cận khi chuyến chính hết vé, kết hợp gợi ý Combo Khách sạn tại điểm đến.
