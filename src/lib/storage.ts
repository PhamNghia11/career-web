import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

export type StorageCategory = "avatars" | "cvs" | "jobs/logos" | "jobs/documents"

/**
 * Saves a file from a Base64 string or a Buffer to local storage.
 * @param source Base64 string (including data URI prefix) or Buffer
 * @param category The category of the file (determines subdirectory)
 * @param originalName The original name of the file
 * @returns The relative path of the saved file
 */
export async function saveFile(
    source: string | Buffer,
    category: StorageCategory,
    originalName: string
): Promise<string> {
    const targetDir = path.join(UPLOAD_DIR, category)

    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true })

    let buffer: Buffer
    let extension = path.extname(originalName) || ""

    if (typeof source === "string") {
        // Handle Base64 Data URI
        const matches = source.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        if (matches && matches.length === 3) {
            buffer = Buffer.from(matches[2], "base64")
        } else if (source.startsWith("content://") || source.startsWith("http")) {
            // If it's already a URL, we might not need to save it again, 
            // but for consistency we return it or handle error
            return source
        } else {
            // Assume it's a raw base64 string without prefix
            buffer = Buffer.from(source, "base64")
        }
    } else {
        buffer = source
    }

    const fileName = `${uuidv4()}${extension}`
    const filePath = path.join(targetDir, fileName)

    await fs.writeFile(filePath, buffer)

    // Return the relative path from project root
    return path.join("uploads", category, fileName).replace(/\\/g, "/")
}

/**
 * Reads a file from local storage.
 * @param relativePath The path relative to project root
 * @returns Buffer of the file content
 */
export async function readFile(relativePath: string): Promise<Buffer> {
    const absolutePath = path.join(process.cwd(), relativePath)
    return await fs.readFile(absolutePath)
}

/**
 * Deletes a file from local storage if it exists.
 * @param relativePath The path relative to project root
 */
export async function deleteFile(relativePath: string): Promise<void> {
    if (!relativePath || relativePath.startsWith("http") || relativePath.startsWith("/")) return

    try {
        const absolutePath = path.join(process.cwd(), relativePath)
        await fs.unlink(absolutePath)
    } catch (error) {
        console.error(`[Storage] Failed to delete file: ${relativePath}`, error)
    }
}
