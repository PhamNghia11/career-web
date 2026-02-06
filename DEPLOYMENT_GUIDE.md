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

### 4.1 Chuẩn bị Môi trường (Preparation)
Trước khi chạy ứng dụng trên máy mới, hãy đảm bảo đã cài đặt:
1.  **Node.js (LTS):** Phiên bản 18 hoặc 20.
2.  **MongoDB Community Server:** Cài đặt và đảm bảo service `MongoDB` đang chạy (mặc định port 27017).
3.  **Git (Tùy chọn):** Để quản lý mã nguồn.

### 4.2 Thiết lập tại máy mới (Setup)
Nếu bạn nhận được file nén `GDU_Career_Migration.zip`, hãy thực hiện các bước sau:
1.  **Giải nén:** Giải nén mã nguồn vào thư mục mong muốn.
2.  **Cài đặt thư viện:**
    ```bash
    npm install
    ```
3.  **Khôi phục dữ liệu (Database Restore):**
    Sử dụng script đi kèm để nạp dữ liệu từ thư mục `backups/` vào MongoDB local:
    ```bash
    node scripts/restore-db.js
    ```
    *(Lưu ý: Script này sẽ tự động lấy bản backup mới nhất).*

4.  **Cấu hình biến môi trường:**
    Kiểm tra file `.env` hoặc `.env.local` để đảm bảo `MONGODB_URI` và `NEXT_PUBLIC_APP_URL` chính xác.

5.  **Xây dựng và Khởi chạy:**
    ```bash
    npm run build
    npm start
    ```

### 4.3 Cấu hình Biến môi trường (`.env`)
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

### 4.4 Xây dựng (Build) & Quản lý Tiến trình (PM2)
Next.js cần được biên dịch và chạy bằng PM2 để đảm bảo tính ổn định:

1. **Build ứng dụng:**
   ```bash
   npm run build
   ```

2. **Chạy bằng PM2:**
   ```bash
   pm2 start npm --name "gdu-portal" -- start
   pm2 save
   ```

---

## 5. Vận hành và Lưu trữ (Operation & Storage)

### 5.1 Lưu trữ File (Storage)
-   Các file CV ứng viên tải lên sẽ được lưu trữ trong hệ thống file của Server.
-   Cần đảm bảo quyền ghi (Write Permission) cho thư mục đích trên server.

### 5.2 Cơ sở dữ liệu (DB Backup)
-   Sử dụng `node scripts/backup-db.js` để backup định kỳ ra file JSON.
-   Dữ liệu backup sẽ nằm trong thư mục `backups/`.

### 5.3 Domain & SSL
-   **Nginx:** Cấu hình làm Reverse Proxy trỏ từ port 80/443 về port 3000.
-   **SSL:** Khuyến nghị sử dụng Certbot (Let's Encrypt).

---

## 6. Quản lý Tài khoản Admin (Admin Management)

### 6.1 Thay đổi Admin gốc (Trước khi triển khai)

Mở file `src/app/api/auth/seed/route.ts` và thay đổi thông tin admin tại dòng 7-14:

```typescript
{
    email: "admin_moi@gdu.edu.vn",  // Email admin mới
    password: "matkhau_baomat123",  // Mật khẩu mới (sẽ tự động hash)
    name: "Tên Admin Mới",          // Tên hiển thị
    role: "admin",
    phone: "0909999999",
    avatar: "",
},
```

Sau khi sửa, build lại và truy cập URL sau để tạo/cập nhật admin:
```
https://your-domain.com/api/auth/seed
```

### 6.2 Thay đổi Admin trực tiếp trong Database

1. Mở **MongoDB Compass** hoặc **MongoDB Atlas**
2. Truy cập collection `users`
3. Tìm user có `role: "admin"`
4. Cập nhật các trường: `email`, `name`, `phone`

> ⚠️ **Lưu ý:** Mật khẩu phải được hash bằng bcrypt. Khuyến nghị dùng phương pháp 6.1 để thay đổi mật khẩu.

### 6.3 Nâng cấp User thành Admin

Để biến một user có sẵn thành admin:
1. Tìm user trong collection `users` theo email
2. Đổi trường `role` từ `"student"` hoặc `"employer"` thành `"admin"`

---

## 7. Checklist trước khi đánh giá
- [ ] MongoDB đã import dữ liệu ban đầu.
- [ ] File `.env` đã đúng thông số của GDU.
- [ ] Đã cấu hình tài khoản Admin gốc (xem mục 6).
- [ ] Port 3000 đã được mở nội bộ và Nginx đã nhận kết nối.
- [ ] Test thử chức năng Đăng ký/Gửi OTP thành công qua mail trường.

