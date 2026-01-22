# Hướng dẫn Kỹ thuật Triển khai GDU Career Portal (Production)

Tài liệu này cung cấp mô tả kỹ thuật chi tiết, hướng dẫn cài đặt và vận hành hệ thống GDU Career Portal trên máy chủ GDU Server để phục vụ đánh giá và chạy thử nghiệm.

---

## 1. Kiến trúc Kỹ thuật (Technical Architecture)

Hệ thống được xây dựng trên mô hình **Monolithic Modern** sử dụng framework Next.js:

-   **Front-end:** React 19, Next.js 15 (App Router), Tailwind CSS cho giao diện, Framer Motion cho hiệu ứng.
-   **Back-end (API Layer):** Next.js API Routes (Serverless Functions), chạy trong môi trường Node.js.
-   **Database:** MongoDB 7.x - Cơ sở dữ liệu NoSQL lưu trữ thông tin người dùng, tin tuyển dụng, và ứng tuyển.
-   **Authentication:** JWT (JSON Web Token) kết hợp với mã OTP gửi qua Email.
-   **Storage:** 
    -   **Local Storage (Server):** Lưu trữ tạm thời các file upload (CV, hình ảnh).
    -   **Dữ liệu tĩnh:** Được quản lý trong thư mục `public/`.

---

## 2. Cấu trúc Thư mục (Folder Structure)

| Thư mục | Chức năng |
| :--- | :--- |
| `/app` | Chứa toàn bộ logic các trang (Pages) và API (Back-end logic). |
| `/components` | Các thành phần UI tái sử dụng (Button, Table, Modal, Dashboard components). |
| `/lib` | Chứa các thư viện dùng chung, cấu hình kết nối MongoDB, các hàm tiện ích (utils). |
| `/public` | Chứa các tài sản tĩnh (Ảnh logo, Icons, Files tải về công cộng). |
| `/styles` | Cấu hình CSS toàn cục và các biến thiết kế. |
| `/data` | Chứa các file dữ liệu mẫu hoặc cấu hình (ví dụ: `jobs.json`). |
| `/scripts` | Các script hỗ trợ (Backup, Seeding dữ liệu). |
| `/hooks` | Các React Custom Hooks xử lý logic state. |

---

## 3. Cấu hình Hệ thống Yêu cầu (System Requirements)

### 3.1 Phần cứng (Khuyến nghị cho chạy thử)
-   **CPU:** 2 Cores trở lên.
-   **RAM:** Tối thiểu 4GB (Khuyến nghị 8GB để build Next.js mượt mà).
-   **Storage:** 20GB SSD (Dành cho OS, Apps và lưu trữ CV).

### 3.2 Phần mềm
-   **OS:** Ubuntu 22.04 LTS hoặc Windows Server 2019+ (Khuyến nghị Linux).
-   **Node.js:** Phiên bản 18.x hoặc 20.x (Bản LTS).
-   **MongoDB:** Phiên bản 6.0 hoặc 7.0.
-   **Process Manager:** PM2 (để quản lý tiến trình).
-   **Reverse Proxy:** Nginx (để quản lý domain và SSL).

---

## 4. Hướng dẫn Cài đặt & Triển khai

### Bước 1: Chuẩn bị Môi trường
Cài đặt Node.js và MongoDB trên GDU Server. Đảm bảo MongoDB đang chạy và có thể truy cập nội bộ (localhost:27017).

### Bước 2: Triển khai Mã nguồn
1. Clone hoặc Upload mã nguồn vào thư mục `/var/www/gdu-career`.
2. Chạy lệnh cài đặt thư viện:
   ```bash
   npm install --production=false
   ```

### Bước 3: Cấu hình Biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc với các thông số:
```env
# Kết nối DB
MONGODB_URI=mongodb://localhost:27017/gdu_career

# Cấu hình Email (Gửi OTP)
EMAIL_USER=your_system_email@giadinh.edu.vn
EMAIL_PASS=your_app_password

# Địa chỉ Domain
NEXT_PUBLIC_APP_URL=https://career.giadinh.edu.vn
```

### Bước 4: Xây dựng (Build) Ứng dụng
Next.js cần được biên dịch trước khi chạy production:
```bash
npm run build
```

---

## 5. Vận hành và Lưu trữ (Operation & Storage)

### 5.1 Quản lý Tiến trình (PM2)
Để ứng dụng chạy ngầm và tự khởi động lại:
```bash
pm2 start npm --name "gdu-portal" -- start
pm2 save
```

### 5.2 Lưu trữ File (Storage)
-   Các file CV ứng viên tải lên sẽ được lưu trữ trong hệ thống file của Server (hoặc cấu hình Cloud Storage nếu cần mở rộng).
-   Cần đảm bảo quyền ghi (Write Permission) cho thư mục đích trên server.

### 5.3 Cơ sở dữ liệu (DB)
-   Sử dụng `mongodump` để backup định kỳ.
-   File `backup.bat` (trên Windows) hoặc cronjob trên Linux có thể được sử dụng để tự động hóa.

### 5.4 Domain & SSL
-   **Domain:** Cần trỏ bản ghi A về IP của GDU Server.
-   **Nginx:** Cấu hình làm Reverse Proxy trỏ từ port 80/443 về port 3000 của ứng dụng.
-   **SSL:** Khuyến nghị sử dụng Certbot (Let's Encrypt) để cài đặt SSL miễn phí.

---

## 6. Checklist trước khi đánh giá
- [ ] MongoDB đã import dữ liệu ban đầu.
- [ ] File `.env` đã đúng thông số của GDU.
- [ ] Port 3000 đã được mở nội bộ và Nginx đã nhận kết nối.
- [ ] Test thử chức năng Đăng ký/Gửi OTP thành công qua mail trường.
