# Hướng dẫn triển khai GDU Career Portal (Production)

Tài liệu này hướng dẫn cách đưa toàn bộ mã nguồn và dữ liệu từ môi trường phát triển lên máy chủ của trường để vận hành thực tế.

## 1. Yêu cầu hệ thống (Prerequisites)
Để chạy dự án, máy chủ cần cài đặt:
- **Hệ điều hành:** Linux (Ubuntu 20.04/22.04 LTS được khuyến nghị).
- **Node.js:** Phiên bản 18.x hoặc 20.x.
- **Cơ sở dữ liệu:** MongoDB (Phiên bản 6.0+). Có thể dùng MongoDB Atlas hoặc cài trực tiếp trên server.
- **Process Manager:** PM2 (để giữ app luôn chạy).
- **Web Server:** Nginx (để làm Reverse Proxy và cài SSL).

## 2. Các bước triển khai

### Bước 1: Chuẩn bị mã nguồn
1. Nén thư mục project (loại bỏ thư mục `node_modules` và `.next`).
2. Upload lên server qua SCP/SFTP hoặc dùng `git clone` từ GitHub/GitLab.

### Bước 2: Cài đặt dependencies
Tại thư mục gốc của dự án trên server, chạy lệnh:
```bash
npm install
npm run build
```

### Bước 3: Cấu hình biến môi trường
Tạo file `.env` trên server với các thông tin thực tế:
```env
MONGODB_URI=mongodb://username:password@localhost:27017/gdu_career
# Các thông tin email để gửi OTP
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
# Domain của web
NEXT_PUBLIC_APP_URL=https://career.giadinh.edu.vn
```

### Bước 4: Di chuyển dữ liệu (Database Migration)
Nếu bạn đang dùng dữ liệu thử nghiệm và muốn chuyển lên:
1. **Xuất file (Dump) từ local:**
   ```bash
   mongodump --uri="mongodb://localhost:27017/gdu_career" --out=./backup
   ```
2. **Nhập vào (Restore) server:**
   ```bash
   mongorestore --uri="mongodb://localhost:27017/gdu_career" ./backup/gdu_career
   ```

### Bước 5: Khởi chạy dự án bằng PM2
Chạy lệnh sau để app tự khởi động lại nếu server bị crash:
```bash
pm2 start npm --name "gdu-career" -- start
pm2 save
pm2 startup
```

## 3. Cấu hình Nginx (Recommended)
Để người dùng truy cập qua tên miền (ví dụ: `career.giadinh.edu.vn`), cấu hình Nginx trỏ về cổng `3000`:
```nginx
server {
    listen 80;
    server_name career.giadinh.edu.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 4. Kiểm tra bảo mật cuối cùng
- [ ] Chặn cổng 27017 (MongoDB) ra bên ngoài (chỉ cho phép localhost).
- [ ] Cài đặt SSL (Let's Encrypt) cho domain.
- [ ] Thay đổi toàn bộ mật khẩu mặc định.
