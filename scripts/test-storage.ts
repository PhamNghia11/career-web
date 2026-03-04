import { saveFile, readFile, deleteFile } from "../src/lib/storage"
import fs from "fs/promises"
import path from "path"

async function testStorage() {
    console.log("--- Bắt đầu kiểm tra Storage ---")

    const testData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    const testFileName = "test-pixel.png"

    try {
        // Test 1: Save File
        console.log("1. Đang kiểm tra saveFile...")
        const savedPath = await saveFile(testData, "avatars", testFileName)
        console.log("   File đã lưu tại:", savedPath)

        // Check if file exists on disk
        const absolutePath = path.join(process.cwd(), savedPath)
        const stats = await fs.stat(absolutePath)
        console.log(`   Xác nhận: File tồn tại, kích thước ${stats.size} bytes.`)

        // Test 2: Read File
        console.log("2. Đang kiểm tra readFile...")
        const buffer = await readFile(savedPath)
        if (buffer.length > 0) {
            console.log("   Xác nhận: Đọc file thành công.")
        }

        // Test 3: Delete File
        console.log("3. Đang kiểm tra deleteFile...")
        await deleteFile(savedPath)
        try {
            await fs.stat(absolutePath)
            console.error("   Lỗi: File vẫn tồn tại sau khi xóa!")
        } catch (e) {
            console.log("   Xác nhận: File đã được xóa thành công.")
        }

        console.log("--- Kiểm tra Storage hoàn tất thành công! ---")
    } catch (error) {
        console.error("--- Kiểm tra Storage thất bại! ---", error)
        process.exit(1)
    }
}

testStorage()
