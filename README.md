# GDU Career - Cổng việc làm sinh viên Đại học Gia Định

Kết nối sinh viên GDU với hàng ngàn cơ hội việc làm từ các doanh nghiệp uy tín.

## I. Yêu cầu hệ thống

### 1. Server (Máy chủ)
- **Hệ điều hành:** Linux (Ubuntu 20.04/22.04 LTS) hoặc Windows Server.
- **CPU:** Tối thiểu 1 vCPU (Khuyến nghị 2 vCPU).
- **RAM:** Tối thiểu 1GB (Khuyến nghị 2GB trở lên).
- **Ổ cứng:** 10GB SSD trở lên.

### 2. Phần mềm yêu cầu
- **Node.js:** Phiên bản LTS mới nhất (v18.x hoặc v20.x).
- **Database:** MongoDB (Cài trực tiếp hoặc dùng MongoDB Atlas).
- **Package Manager:** npm hoặc yarn.

## II. Cài đặt và Cấu hình

### 1. Cài đặt các gói phụ thuộc
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
npm install
```

### 2. Cấu hình biến môi trường (.env.local)
Tạo file `.env.local` tại thư mục gốc và điền các thông tin sau:

```env
# Cấu hình Database (Bắt buộc)
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gdu_career"

# Cấu hình Email (Nodemailer - Dùng để gửi thông báo/OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Cấu hình NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"
```

## III. Vận hành

### 1. Chế độ phát triển (Development)
```bash
npm run dev
```
- Website sẽ chạy tại: `http://localhost:3000`

### 2. Chế độ sản xuất (Production)
```bash
# Bước 1: Build source code
npm run build

# Bước 2: Khởi chạy server
npm start
```

## IV. Khởi tạo dữ liệu (Seeding)
Truy cập đường dẫn: `your-domain/api/auth/seed` để tạo tài khoản mẫu:
- **Admin:** `admin@gdu.edu.vn` / `admin123`
- **Sinh viên:** `student@gdu.edu.vn` / `student123`
- **Nhà tuyển dụng:** `employer@company.com` / `employer123`

## V. Triển khai lên Vercel
1. Push code lên GitHub/GitLab.
2. Import repository vào Vercel.
3. Thêm các biến môi trường tương tự file `.env.local`.
4. Bấm **Deploy**.

## VI. Cấu trúc thư mục
- `/app` - Các trang và API routes (App Router).
- `/components` - Các React component dùng chung.
- `/lib` - Các utility (MongoDB, email, auth).
- `/data` - Dữ liệu JSON (jobs, reviews).
- `/public` - Tài nguyên tĩnh.
- `/scripts` - Các script tiện ích.

## VII. Lưu ý quan trọng
- **MongoDB:** Whitelist IP server trên MongoDB Atlas.
- **Email:** Sử dụng "App Password" cho Gmail.
- **Bảo mật:** Không bao giờ commit file `.env.local`.

---
**Ngày cập nhật:** 16/01/2026
