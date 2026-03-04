import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { v2 as cloudinary } from "cloudinary"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

// Configure Cloudinary only if environment variables are present
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
}

export type StorageCategory = "avatars" | "cvs" | "jobs/logos" | "jobs/documents"

/**
 * Saves a file to cloud storage (Cloudinary) if configured, otherwise falls back to local.
 * @param source Base64 string (including data URI prefix) or Buffer
 * @param category The category/folder for the file
 * @param originalName The original name of the file
 * @returns The URL of the saved file (Cloudinary URL or local relative path)
 */
export async function saveFile(
    source: string | Buffer,
    category: StorageCategory,
    originalName: string
): Promise<string> {
    // 1. Try Cloudinary first for a "trơn tru" and permanent solution
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
            const fileToUpload = typeof source === "string" ? source : `data:image/png;base64,${source.toString("base64")}`

            const result = await cloudinary.uploader.upload(fileToUpload, {
                folder: `gdu-career/${category}`,
                resource_type: "auto",
            })

            return result.secure_url
        } catch (cloudError) {
            console.warn("[Storage] Cloudinary upload failed, falling back to local:", cloudError)
        }
    }

    // 2. Fallback to local storage (existing logic)
    try {
        const targetDir = path.join(UPLOAD_DIR, category)
        await fs.mkdir(targetDir, { recursive: true })

        let buffer: Buffer
        let extension = path.extname(originalName) || ""

        if (typeof source === "string") {
            const matches = source.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
            if (matches && matches.length === 3) {
                buffer = Buffer.from(matches[2], "base64")
            } else if (source.startsWith("http") || source.startsWith("/")) {
                return source
            } else {
                buffer = Buffer.from(source, "base64")
            }
        } else {
            buffer = source
        }

        const fileName = `${uuidv4()}${extension}`
        const filePath = path.join(targetDir, fileName)

        await fs.writeFile(filePath, buffer)

        return path.join("uploads", category, fileName).replace(/\\/g, "/")
    } catch (error) {
        console.warn("[Storage] Local write failed, falling back to original source/base64:", error)
        if (typeof source === "string") return source
        const buffer = source as Buffer
        const base64 = buffer.toString('base64')
        const extension = path.extname(originalName).toLowerCase()
        const mimeType = extension === '.pdf' ? 'application/pdf' :
            (extension === '.doc' ? 'application/msword' :
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

        return `data:${mimeType};base64,${base64}`
    }
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
