# Hướng dẫn Hệ thống Lưu trữ Hình ảnh (Image Storage Guide)

Tài liệu này giải thích cơ chế lưu trữ hình ảnh hiện tại của dự án GDU Career để bàn giao cho đối tác và đội ngũ vận hành.

## 1. Kiến trúc Tổng quan
Hệ thống sử dụng cơ chế **Hybrid Storage** (Lưu trữ hỗn hợp) để đảm bảo tính ổn định tối đa (High Availability) và hiệu suất cao.

- **Ưu tiên 1 (Cloud Storage)**: Sử dụng **Cloudinary** để lưu trữ vĩnh viễn trên đám mây.
- **Dự phòng 2 (Local Storage)**: Lưu trữ tạm thời vào thư mục `uploads/` trên máy chủ nếu Cloudinary gặp sự cố.
- **Dự phòng cuối (Base64)**: Lưu trực tiếp vào Database nếu cả hai phương thức trên không khả dụng.

## 2. Cấu hình Kỹ thuật (Cloudinary)
Để kích hoạt tính năng lưu trữ chuyên nghiệp, các biến môi trường sau đã được cấu hình:

```bash
CLOUDINARY_CLOUD_NAME=drz4r1v0j
CLOUDINARY_API_KEY=576534982223512
CLOUDINARY_API_SECRET=*********** (Bảo mật)
```

## 3. Lợi ích cho Đối tác
1. **Tính vĩnh viễn**: Ảnh không bao giờ bị mất khi khởi động lại server hoặc cập nhật mã nguồn (đặc biệt quan trọng khi dùng Vercel).
2. **Tốc độ tải (CDN)**: Ảnh được phục vụ từ máy chủ gần nhất của Cloudinary, giúp giảm độ trễ cho người dùng tại Việt Nam.
3. **Tối ưu dung lượng**: Cloudinary tự động nén ảnh và chuyển sang định dạng nhẹ hơn (WebP, AVIF) mà vẫn giữ nguyên chất lượng.
4. **Quản lý tập trung**: Đối tác có thể quản lý, xóa hoặc chỉnh sửa ảnh trực tiếp thông qua Dashboard của Cloudinary tại `cloudinary.com`.

## 4. Bảo trì và Mở rộng
Mọi logic xử lý được tập trung tại file `src/lib/storage.ts`. Hệ thống đã được thiết kế để dễ dàng thay đổi sang các nhà cung cấp khác (như AWS S3 hoặc Google Cloud Storage) trong tương lai nếu cần thiết mà không phải sửa đổi quá nhiều ở phần giao diện (Front-end).

---
*Tài liệu bàn giao ngày 04/03/2026*
