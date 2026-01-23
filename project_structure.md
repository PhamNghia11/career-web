# Cấu Trúc Project Mới

Dưới đây là sơ đồ tổng quan và giải thích chức năng của từng thành phần trong thư mục `src/`. Cấu trúc này giúp tách biệt rõ ràng giữa **Giao diện (Frontend)**, **Dữ liệu (Database)** và **Xử lý (Backend/Services)**.

## Sơ đồ thư mục

```
src/
├── app/                        # [Frontend + API] Next.js App Router
│   ├── (pages)/                # Các trang giao diện (Ví dụ: /news, /jobs)
│   ├── api/                    # [Controller] Các API endpoints (API Routes)
│   │   ├── auth/               # API đăng nhập, đăng ký
│   │   ├── jobs/               # API quản lý việc làm
│   │   └── ...
│   └── layout.tsx              # Layout chính của web
├── components/                 # [Frontend] Các thành phần giao diện (UI)
│   ├── ui/                     # Các nút, ô nhập liệu cơ bản (shadcn/ui)
│   ├── jobs/                   # Component hiển thị việc làm (JobCard, JobDetails)
│   └── ...
├── database/                   # [Database] Kết nối và thao tác CSDL
│   └── connection.ts           # (Cũ là mongodb.ts) File kết nối MongoDB
├── services/                   # [Backend Logic] Xử lý nghiệp vụ chính
│   └── email.service.ts        # (Cũ là email.ts) Xử lý gửi email
├── types/                      # [Types] Định nghĩa dữ liệu TypeScript
│   └── index.ts                # (Cũ là types.ts) Định nghĩa kiểu User, Job...
├── lib/                        # [Utilities] Các thư viện hỗ trợ chung
│   ├── auth-context.tsx        # Quản lý trạng thái đăng nhập cho Frontend
│   ├── utils.ts                # Hàm hỗ trợ (ví dụ: gộp class CSS)
│   └── jobs-data.ts            # Dữ liệu mẫu / Hàm helper cho jobs
├── hooks/                      # [Hooks] Các React Hooks tùy biến
└── styles/                     # CSS toàn cục (globals.css)
```

## Chi tiết chức năng

### 1. `src/database/` (Tầng dữ liệu)
Nơi duy nhất chịu trách nhiệm kết nối với Cơ sở dữ liệu.
*   `connection.ts`: Chứa hàm `getCollection()`. Mọi chỗ cần lấy dữ liệu từ MongoDB đều phải gọi hàm này.

### 2. `src/services/` (Tầng nghiệp vụ - Backend)
Nơi chứa logic xử lý phức tạp, không dính dáng đến giao diện.
*   `email.service.ts`: Chứa các hàm gửi mail (OTP, thông báo...). API sẽ gọi các hàm trong này chứ không tự viết code gửi mail.

### 3. `src/app/api/` (Tầng điều khiển - Controller)
Là "cổng đón khách" của Server.
*   Nhiệm vụ: Nhận request từ người dùng -> Kiểm tra quyền (Auth) -> Gọi `services` hoặc `database` để lấy dữ liệu -> Trả về JSON cho Frontend.
*   Ví dụ: `api/auth/login` chỉ nhận email/pass rồi gọi DB check, chứ không nên chứa logic gửi mail confirm quá dài dòng.

### 4. `src/components/` (Tầng hiển thị - Frontend)
Chứa các khối giao diện được tái sử dụng.
*   `ui/`: Các thành phần nhỏ: Button, Input, Dialog.
*   `jobs/`, `admin/`: Các component lớn hơn phục vụ tính năng cụ thể.

### 5. `src/lib/` & `src/types/` (Hỗ trợ)
*   `types/index.ts`: Định nghĩa "khuôn mẫu" dữ liệu. Ví dụ: Một `User` bắt buộc phải có `email`, `role`... giúp code không bị sai kiểu.
*   `lib/auth-context.tsx`: Giúp toàn bộ Frontend biết được "Ai đang đăng nhập?" để hiển thị tên và avatar.

---
**Lợi ích của cấu trúc này:**
1.  **Dễ tìm file**: Cần sửa DB vào `database`, sửa mail vào `services`.
2.  **Dễ bảo trì**: Sửa logic gửi mail chỉ cần sửa 1 file `email.service.ts`, tất cả API dùng nó đều tự cập nhật.
3.  **Gọn gàng**: Không còn cảnh 1 thư mục gốc chứa hàng trăm file lộn xộn.
