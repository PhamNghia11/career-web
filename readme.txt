HƯỚNG DẪN VẬN HÀNH WEBSITE GDU CAREER

TÀI LIỆU HƯỚNG DẪN KỸ THUẬT
---------------------------

I. YÊU CẦU HỆ THỐNG
1. Server (Máy chủ):
   - Hệ điều hành: Linux (Ubuntu 20.04/22.04 LTS) hoặc Windows Server.
   - CPU: Tối thiểu 1 vCPU (Khuyến nghị 2 vCPU).
   - RAM: Tối thiểu 1GB (Khuyến nghị 2GB trở lên).
   - Ổ cứng: 10GB SSD trở lên.
   
2. Phần mềm yêu cầu:
   - Node.js: Phiên bản LTS mới nhất (v18.x hoặc v20.x).
   - Database: MongoDB (Có thể cài trực tiếp trên server hoặc dùng MongoDB Atlas).
   - Package Manager: npm (đã đi kèm Node.js) hoặc yarn.

II. CÀI ĐẶT VÀ CẤU HÌNH
1. Cài đặt các gói phụ thuộc (Dependencies):
   Mở terminal tại thư mục gốc của dự án và chạy:
   > npm install

2. Cấu hình biến môi trường (.env.local):
   Tạo file .env.local tại thư mục gốc và điền các thông tin sau:
   
   # Cấu hình Database (Bắt buộc)
   MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gdu_career"

   # Cấu hình Email (Nodemailer - Dùng để gửi thông báo/OTP)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"



   # Cấu hình NextAuth (Tùy chọn nếu mở rộng sau này)
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-random-secret-key"

III. VẬN HÀNH
1. Chế độ phát triển (Development):
   > npm run dev
   - Website sẽ chạy tại: http://localhost:3000

2. Chế độ sản xuất (Production):
   Bước 1: Build source code
   > npm run build
   
   Bước 2: Khởi chạy server
   > npm start
   - Website sẽ chạy và tối ưu hóa cho môi trường thực tế.

IV. LƯU Ý QUAN TRỌNG
- MongoDB: Đảm bảo IP của server đã được Whitelist trên MongoDB Atlas nếu dùng cloud.
- Email: Nếu dùng Gmail, cần bật "2-Step Verification" và tạo "App Password" để điền vào SMTP_PASSWORD.
- Bảo mật: Không bao giờ commit file .env.local lên git.

---------------------------
Hỗ trợ kỹ thuật: Liên hệ Admin hoặc Dev Team.
Ngày cập nhật: 30/12/2025
