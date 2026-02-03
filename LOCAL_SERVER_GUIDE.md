# 🖥️ HƯỚNG DẪN CHI TIẾT: Biến Laptop thành Server Nội Bộ

> **Mục đích:** Biến Laptop thành Server để các thiết bị khác (điện thoại, máy tính) trong cùng mạng WiFi có thể truy cập và test ứng dụng.

---

## 📋 TỔNG QUAN CÁC BƯỚC

| Bước | Công việc | Thời gian ước tính |
|------|-----------|-------------------|
| 1 | Cài đặt Node.js | 5 phút |
| 2 | Cài đặt MongoDB | 10 phút |
| 3 | Cài đặt PM2 | 2 phút |
| 4 | Tìm IP nội bộ | 1 phút |
| 5 | Cấu hình Firewall | 3 phút |
| 6 | Cấu hình file .env | 2 phút |
| 7 | Build và chạy ứng dụng | 5 phút |
| 8 | Test từ thiết bị khác | 2 phút |

**Tổng thời gian:** ~30 phút

---

## 📦 BƯỚC 1: CÀI ĐẶT NODE.JS

### 1.1 Kiểm tra Node.js đã cài chưa
Mở **PowerShell** (nhấn `Windows + X`, chọn **Windows PowerShell**), nhập:
```powershell
node --version
```

- ✅ Nếu hiện `v18.x.x` hoặc `v20.x.x` → **Bỏ qua bước này**
- ❌ Nếu hiện lỗi → **Tiếp tục cài đặt**

### 1.2 Cách cài đặt Node.js
1. Mở trình duyệt, truy cập: **https://nodejs.org**
2. Nhấn nút **LTS** (bản ổn định) để tải file `.msi`
3. Chạy file vừa tải, nhấn **Next** liên tục cho đến khi hoàn tất
4. **Khởi động lại PowerShell** và kiểm tra lại bằng lệnh `node --version`

---

## 🍃 BƯỚC 2: CÀI ĐẶT MONGODB

### 2.1 Kiểm tra MongoDB đã cài chưa
Mở **PowerShell**, nhập:
```powershell
mongod --version
```

- ✅ Nếu hiện phiên bản → **Bỏ qua bước này**
- ❌ Nếu hiện lỗi → **Tiếp tục cài đặt**

### 2.2 Cách cài đặt MongoDB
1. Truy cập: **https://www.mongodb.com/try/download/community**
2. Chọn:
   - **Version:** 7.0.x (hoặc mới nhất)
   - **Platform:** Windows
   - **Package:** MSI
3. Nhấn **Download** và chạy file `.msi`
4. Trong quá trình cài:
   - ✅ Chọn **Complete** installation
   - ✅ Tick chọn **Install MongoDB as a Service** (quan trọng!)
   - ✅ Tick chọn **Install MongoDB Compass** (GUI quản lý dữ liệu)
5. Nhấn **Finish** để hoàn tất

### 2.3 Kiểm tra MongoDB đang chạy
Mở **PowerShell** với quyền Admin (chuột phải → Run as Administrator):
```powershell
Get-Service MongoDB
```
- ✅ Nếu thấy `Status: Running` → MongoDB đang hoạt động
- ❌ Nếu `Status: Stopped` → Chạy lệnh:
```powershell
Start-Service MongoDB
```

---

## ⚙️ BƯỚC 3: CÀI ĐẶT PM2 (Process Manager)

PM2 giúp ứng dụng chạy liên tục, tự khởi động lại nếu có lỗi.

### 3.1 Cài đặt PM2 toàn cục
Mở **PowerShell**, nhập:
```powershell
npm install -g pm2
```

### 3.2 Kiểm tra cài đặt thành công
```powershell
pm2 --version
```
- ✅ Nếu hiện số phiên bản → Thành công!

---

## 🌐 BƯỚC 4: TÌM ĐỊA CHỈ IP NỘI BỘ

### 4.1 Mở PowerShell và nhập lệnh:
```powershell
ipconfig
```

### 4.2 Tìm thông tin sau:
```
Wireless LAN adapter Wi-Fi:
   ...
   IPv4 Address. . . . . . . . . . . : 192.168.1.15   ← GHI LẠI SỐ NÀY
   ...
```

### 4.3 Cách tìm IP chính xác nhất (Dùng PowerShell)
Mở **PowerShell** và dán lệnh sau để lấy đúng IP của card Wi-Fi:
```powershell
Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" | Select-Object IPAddress
```
> 💡 **Mẹo:** Nếu bạn dùng mạng dây, hãy thay `"Wi-Fi"` bằng `"Ethernet"`.

---

## 🔥 BƯỚC 5: CẤU HÌNH FIREWALL (Tường lửa Windows)

Mặc định Windows chặn kết nối từ bên ngoài. Cần mở cổng 3000.

### 5.1 Mở cửa sổ Firewall
1. Nhấn **Windows + R**
2. Gõ: `wf.msc`
3. Nhấn **Enter**

### 5.2 Tạo Rule mới cho Port 3000
1. Ở cột bên trái, click **Inbound Rules**
2. Ở cột bên phải, click **New Rule...**
3. Chọn **Port** → Next
4. Chọn **TCP**
5. Chọn **Specific local ports:** nhập `3000`
6. Click **Next**
7. Chọn **Allow the connection** → Next
8. Tick cả 3 ô: ✅ Domain, ✅ Private, ✅ Public → Next
9. Đặt tên: `GDU-Career-Port-3000`
10. Click **Finish**

### 5.3 Làm tương tự cho MongoDB (Port 27017)
Lặp lại các bước trên với:
- Port: `27017`
- Tên: `MongoDB-Port-27017`

---

## 📝 BƯỚC 6: CẤU HÌNH FILE .ENV

### 6.1 Mở file `.env` trong thư mục dự án
Đường dẫn: `d:\chatbot\.env`

### 6.2 Sửa các dòng sau:

```env
# Thay localhost bằng IP của bạn (ví dụ: 192.168.1.15)
NEXT_PUBLIC_APP_URL=http://192.168.1.15:3000

# MongoDB - giữ nguyên localhost vì MongoDB chạy trên cùng máy
MONGODB_URI=mongodb://localhost:27017/gdu-career

# Email (Giữ nguyên)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

> ⚠️ **QUAN TRỌNG:** Thay `192.168.1.15` bằng IP của BẠN (đã tìm ở Bước 4)

---

## 🚀 BƯỚC 7: BUILD VÀ CHẠY ỨNG DỤNG

### 7.1 Mở PowerShell tại thư mục dự án
```powershell
cd d:\chatbot
```

### 7.2 Cài đặt dependencies (nếu chưa cài)
```powershell
npm install
```

### 7.3 Build ứng dụng
```powershell
npm run build
```
> ⏳ Đợi 2-5 phút cho đến khi thấy dòng `✓ Compiled successfully`

### 7.4 Chạy ứng dụng (Chọn 1 trong 2 cách)

#### Cách A: Chế độ Development (Chậm - Dùng để sửa code)
> ⚠️ **Lưu ý:** Chế độ này sẽ rất lag nếu có từ 2 người truy cập trở lên vì phải biên dịch liên tục.
```powershell
npm run dev -- -H 0.0.0.0
```

#### Cách B: Chế độ Production (Nhanh - Dùng để TEST thực tế)
> ✅ **Khuyên dùng:** Chạy mượt mà, tốc độ cao, chịu tải được nhiều người.
```powershell
# 1. Build (Đợi chạy xong)
npm run build

# 2. Start
npx next start -H 0.0.0.0 -p 3000
```

### 7.5 Chạy ứng dụng với PM2 (Tự động chạy lại khi crash)
```powershell
pm2 delete all
pm2 start ecosystem.config.js --env production
```

### 7.5 Kiểm tra ứng dụng đang chạy
```powershell
pm2 status
```
- ✅ Thấy trạng thái `online` → Thành công!

### 7.6 Xem log nếu có lỗi
```powershell
pm2 logs
```

---

## 📱 BƯỚC 8: TEST TỪ THIẾT BỊ KHÁC

### 8.1 Đảm bảo thiết bị test cùng mạng WiFi
Điện thoại/Laptop test phải kết nối **cùng WiFi** với Server.

### 8.2 Mở trình duyệt và nhập địa chỉ
```
http://192.168.1.15:3000
```
> Thay `192.168.1.15` bằng IP của bạn

### 8.3 Kết quả mong đợi
- ✅ Trang web hiển thị bình thường → **THÀNH CÔNG!**
- ❌ Không tải được → Kiểm tra lại:
  - Firewall đã mở port 3000 chưa?
  - PM2 có đang chạy không? (`pm2 status`)
  - Có cùng mạng WiFi không?

---

## 🔧 CÁC LỆNH THƯỜNG DÙNG

| Mục đích | Lệnh |
|----------|------|
| Xem trạng thái ứng dụng | `pm2 status` |
| Xem log ứng dụng | `pm2 logs` |
| Khởi động lại ứng dụng | `pm2 restart all` |
| Dừng ứng dụng | `pm2 stop all` |
| Xóa và chạy lại | `pm2 delete all && pm2 start ecosystem.config.js` |

---

## 💾 BƯỚC 9: BACKUP DỮ LIỆU (Tùy chọn)

### 9.1 Chạy file backup thủ công
Nhấn đúp chuột vào file `backup.bat` trong thư mục dự án.
→ Dữ liệu sẽ được lưu vào thư mục `backup_data/`

### 9.2 Hẹn giờ backup tự động hàng ngày
1. Nhấn **Windows + R**, gõ `taskschd.msc`, nhấn Enter
2. Click **Create Basic Task...**
3. Đặt tên: `GDU Career Backup`
4. Chọn **Daily** → Đặt giờ chạy (ví dụ: 23:00)
5. Chọn **Start a program**
6. Browse đến file `d:\chatbot\backup.bat`
7. Finish

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Không cho Laptop ngủ:** Vào Settings → System → Power → Đặt **Never** cho "Put device to sleep"

2. **Sau khi khởi động lại máy:**
   - MongoDB sẽ tự chạy (nếu cài làm Service)
   - Cần chạy lại lệnh: `pm2 start ecosystem.config.js`

3. **IP có thể thay đổi:** Mỗi lần kết nối WiFi, IP có thể khác. Kiểm tra lại bằng `ipconfig`

---

## 🆘 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: "Không thể kết nối đến server"
- [ ] Kiểm tra Firewall đã mở port 3000 chưa
- [ ] Kiểm tra thiết bị có cùng mạng WiFi không
- [ ] Chạy `pm2 status` xem ứng dụng có online không

### Lỗi: "Database connection failed"
- [ ] Kiểm tra MongoDB đang chạy: `Get-Service MongoDB`
- [ ] Khởi động MongoDB: `Start-Service MongoDB`

### Lỗi: "Port 3000 already in use"
```powershell
# Tìm process đang dùng port 3000![alt text](image.png)
netstat -ano | findstr :3000

# Kill process (thay PID bằng số tìm được)
taskkill /F /PID [PID]

# Chạy lại ứng dụng
pm2 restart all
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Node.js đã cài đặt
- [ ] MongoDB đã cài đặt và đang chạy
- [ ] PM2 đã cài đặt
- [ ] Biết IP nội bộ của máy
- [ ] Firewall đã mở port 3000 và 27017
- [ ] File .env đã cập nhật đúng IP
- [ ] Ứng dụng đã build thành công
- [ ] PM2 đang chạy ứng dụng
- [ ] Có thể truy cập từ thiết bị khác

---

**🎉 Chúc bạn triển khai thành công!**
