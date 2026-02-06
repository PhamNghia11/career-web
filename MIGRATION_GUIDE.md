# 🚚 HƯỚNG DẪN DI CHUYỂN DỰ ÁN (MIGRATION GUIDE)

Hướng dẫn này giúp bạn đóng gói mã nguồn và cơ sở dữ liệu để chuyển sang máy tính hoặc server khác.

---

## 1. SAO LƯU DỮ LIỆU (DATABASE EXPORT)

Trước khi gửi, bạn cần xuất dữ liệu từ MongoDB ra file JSON.

1. Mở terminal tại thư mục dự án (`d:\chatbot`).
2. Chạy lệnh sau:
   ```bash
   node scripts/backup-db.js
   ```
3. Sau khi chạy xong, một thư mục mới sẽ xuất hiện trong `backups/` (ví dụ: `backups/2026-02-05_...`). Thư mục này chứa toàn bộ dữ liệu của bạn.

---

## 2. ĐÓNG GÓI MÃ NGUỒN (PACKING)

Bạn hãy nén thư mục dự án lại thành file `.zip`, nhưng **CẦN LOẠI BỎ** các thư mục nặng không cần thiết sau để file nén nhẹ hơn:

*   ❌ `node_modules/` (Rất nặng, sẽ cài lại sau)
*   ❌ `.next/` (Thư mục build, sẽ build lại sau)
*   ❌ `.git/` (Nếu có)
*   ❌ `api_jobs.txt`, `api_response_raw.json` (Các file rác nếu có)

**✅ Các thư mục quan quan trọng cần giữ:** `src/`, `public/`, `scripts/`, `backups/`, `package.json`, `.env.local`, `tsconfig.json`, `next.config.mjs`, v.v.

---

## 3. THIẾT LẬP TẠI MÁY MỚI (SETUP)

Người nhận file cần thực hiện các bước sau:

### 3.1 Cài đặt phần mềm cơ bản
1. Cài đặt **Node.js** (Bản LTS).
2. Cài đặt **MongoDB Community Server**.
3. (Tùy chọn) Cài đặt **MongoDB Compass** để xem dữ liệu.

### 3.2 Cài đặt dự án
1. Giải nén file code vào thư mục làm việc.
2. Mở terminal tại thư mục đó và cài thư viện:
   ```bash
   npm install
   ```

### 3.3 Khôi phục dữ liệu (Database Restore)
1. Đảm bảo file `.env.local` có dòng:
   `MONGODB_URI=mongodb://localhost:27017/gdu_career`
2. Chạy lệnh khôi phục (Lệnh này sẽ lấy bản backup mới nhất trong thư mục `backups/` để nạp vào máy mới):
   ```bash
   node scripts/restore-db.js
   ```

### 3.4 Chạy ứng dụng
1. Build ứng dụng:
   ```bash
   npm run build
   ```
2. Chạy chính thức:
   ```bash
   npm start
   ```

---

## ⚠️ LƯU Ý
*   **File .env.local:** Đảm bảo các thông tin về `MONGODB_URI` và `EMAIL_USER`/`EMAIL_PASS` (nếu có dùng gửi OTP) đã được cấu hình đúng cho môi trường mới.
*   **Port:** Mặc định chạy ở port **3000**. Nếu cần đổi port, dùng `npm start -- -p 8080`.
