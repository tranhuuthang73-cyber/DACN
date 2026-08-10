# Smart Farm Management System

Hệ thống quản lý nông trại thông minh giúp nông dân ghi chép nhật ký canh tác (tưới nước, bón phân), quản lý mùa vụ và nhận các gợi ý từ AI dựa trên dữ liệu thực tế.

## Yêu cầu
- Node.js (v18+)
- PostgreSQL đang chạy ở port 5432.

## Cài đặt cơ sở dữ liệu
1. Mở file `backend/.env` và cập nhật `DATABASE_URL` theo cấu hình PostgreSQL của bạn.
   Mặc định là: `postgresql://postgres:postgres@localhost:5432/manage_farm?schema=public`
2. Tạo database `manage_farm` trong PostgreSQL.
3. Chạy lệnh sau để migrate cấu trúc database:
   ```bash
   cd backend
   npx prisma db push
   ```

## Chạy dự án

Dự án gồm 2 phần: Backend (Node.js/Express) và Frontend (React/Vite).

### 1. Chạy Backend
Mở một terminal mới:
```bash
cd backend
npm run dev
```
Backend sẽ chạy ở `http://localhost:3000`.

### 2. Chạy Frontend
Mở một terminal mới khác:
```bash
cd frontend
npm run dev
```
Frontend sẽ chạy ở `http://localhost:5173`.

## Hướng dẫn sử dụng cơ bản
1. Mở trình duyệt vào `http://localhost:5173/login`.
2. Bấm vào "Đăng ký ngay" để tạo một tài khoản nông dân mới.
3. Sau khi đăng nhập, bấm "Thêm thửa đất" bên thanh menu trái.
4. Chọn thửa đất vừa tạo và bấm "Bắt đầu vụ mùa mới".
5. Trong bảng điều khiển, bạn có thể "Thêm nhật ký" (tưới nước, bón phân).
6. Hệ thống AI (linear regression) sẽ tự động tạo "Gợi ý từ AI". Bạn có thể bấm Có, Bỏ, hoặc Sửa. Khi bấm "Sửa", AI sẽ tự động học (incremental learning bằng gradient descent) từ lượng thực tế bạn nhập vào để cập nhật mô hình riêng cho thửa đất đó.

## Công nghệ sử dụng
- **Cơ sở dữ liệu**: PostgreSQL, Prisma ORM
- **Backend**: Node.js, Express, jsonwebtoken
- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide React
- **AI Logic**: Manual Gradient Descent Linear Regression (tích hợp trực tiếp trong code backend).
