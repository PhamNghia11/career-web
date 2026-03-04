import fs from "fs/promises"
import path from "path"
// Lưu ý: Trong thực tế sẽ cần các thư viện như @microsoft/microsoft-graph-client
// và cấu hình OAuth2 (ClientId, TenantId, ClientSecret)

const UPLOADS_DIR = path.join(process.cwd(), "uploads")
const BACKUP_DIR = path.join(process.cwd(), "backups/office_cloud")

/**
 * Đây là một bản phác thảo logic backup.
 * Khuyến nghị: Sử dụng rsync hoặc một công cụ đồng bộ hóa file chuyên dụng 
 * để đẩy thư mục `uploads/` lên OneDrive/SharePoint thông qua MS Graph API.
 */
export async function backupToMS365() {
    console.log("[Backup] Bắt đầu quá trình sao lưu lên MS 365...")

    try {
        // Đảm bảo thư mục backup tồn tại (giả lập điểm gắn kết mạng LAN hoặc Office Cloud)
        await fs.mkdir(BACKUP_DIR, { recursive: true })

        // Trong môi trường LAN/GDU Server, ta có thể copy file trực tiếp 
        // sang một thư mục được đồng bộ với OneDrive.
        const categories = ["avatars", "cvs", "jobs/logos", "jobs/documents"]

        for (const category of categories) {
            const srcDir = path.join(UPLOADS_DIR, category)
            const destDir = path.join(BACKUP_DIR, category)

            await fs.mkdir(destDir, { recursive: true })

            try {
                const files = await fs.readdir(srcDir)
                for (const file of files) {
                    const srcFile = path.join(srcDir, file)
                    const destFile = path.join(destDir, file)

                    // Copy file (giả lập việc đẩy lên cloud qua sync folder)
                    await fs.copyFile(srcFile, destFile)
                }
            } catch (err) {
                // Thư mục có thể chưa có file nào
                console.log(`[Backup] Thư mục ${category} trống hoặc không tồn tại.`)
            }
        }

        console.log("[Backup] Sao lưu thành công tại:", BACKUP_DIR)
        return { success: true, timestamp: new Date() }
    } catch (error) {
        console.error("[Backup] Lỗi sao lưu:", error)
        return { success: false, error }
    }
}

// Nếu chạy trực tiếp từ dòng lệnh
if (require.main === module) {
    backupToMS365()
}
