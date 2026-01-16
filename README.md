# GDU Career - Cổng việc làm sinh viên Đại học Gia Định

Kết nối sinh viên GDU với hàng ngàn cơ hội việc làm từ các doanh nghiệp uy tín.

##  Tính năng chính

###  Dành cho Sinh viên
- **Tìm kiếm thông minh:** Lọc việc làm theo ngành học, mức lương và loại hình công việc.
- **Ứng tuyển trực tuyến:** Nộp CV và theo dõi trạng thái hồ sơ ngay trên hệ thống.
- **Quản lý hồ sơ:** Lưu trữ các công việc yêu thích và cập nhật thông tin cá nhân.
- **Đánh giá & Phản hồi:** Tham khảo đánh giá thực tế từ cộng đồng sinh viên.

###  Dành cho Nhà tuyển dụng
- **Đăng tin tuyển dụng:** Công cụ tạo tin đăng chuyên nghiệp và thu hút.
- **Quản lý ứng viên:** Tiếp nhận, duyệt hồ sơ và tương tác trực tiếp với ứng viên.
- **Quảng bá thương hiệu:** Xây dựng trang thông tin doanh nghiệp uy tín.

###  Dành cho Quản trị viên
- **Kiểm duyệt nội dung:** Quản lý tin đăng và báo cáo vi phạm.
- **Quản trị người dùng:** Cấp quyền và hỗ trợ kỹ thuật cho các nhóm đối tượng.
- **Số liệu thống kê:** Theo dõi lượt truy cập và hiệu quả kết nối việc làm.

##  Công nghệ sử dụng
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/)
- **Authentication:** Custom Auth Context & MongoDB
- **Deployment:** [Vercel](https://vercel.com/)

##  Quy trình vận hành
Hệ thống hoạt động theo mô hình Serverless trên Vercel:
1. **Frontend/Backend:** Next.js xử lý cả giao diện người dùng và API xử lý logic.
2. **Data Flow:** Dữ liệu tương tác được lưu trữ và truy xuất từ MongoDB Atlas.
3. **Notifications:** Sử dụng Nodemailer để gửi OTP và thông báo tuyển dụng qua Email.
4. **CI/CD:** Tự động triển khai phiên bản mới mỗi khi có thay đổi trên GitHub.

##  Kiến trúc hệ thống

### 1. Frontend (Giao diện)
- **Framework:** Next.js 15 (App Router) - Tối ưu hóa render phía Server (SSR) và Client (CSR).
- **UI Library:** Tailwind CSS kết hợp Shadcn/UI giúp giao diện đồng nhất, hiện đại và phản hồi nhanh (Responsive).
- **Trạng thái:** Quản lý thông qua React Hooks và Context API (như `AuthContext` để quản lý đăng nhập).

### 2. Backend (Xử lý máy chủ)
- **API Routes:** Tích hợp sẵn trong thư mục `/app/api`. Xử lý mọi logic từ đăng ký, đăng tin đến ứng tuyển.
- **Middleware/Utilities:** Các hàm dùng chung nằm trong thư mục `/lib` (kết nối DB, gửi Mail, xử lý định dạng dữ liệu).
- **Xác thực:** Hệ thống phân quyền dựa trên Role (Admin, Employer, Student) được kiểm tra tại mỗi yêu cầu API.

### 3. Dữ liệu (Data)
- **Database:** MongoDB Atlas - Lưu trữ các collection chính: `users`, `jobs`, `applications`, `reviews`, `notifications`.
- **File Static:** Ảnh đại diện, Logo công ty được quản lý và lưu trữ trực tiếp hoặc qua các dịch vụ lưu trữ đám mây.
- **Import/Export:** Hỗ trợ công cụ import dữ liệu từ file JSON (`/data`) vào MongoDB để khởi tạo hệ thống nhanh chóng.

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
