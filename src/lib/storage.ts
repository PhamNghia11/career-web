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
    try {
        const targetDir = path.join(UPLOAD_DIR, category)

        // Ensure directory exists - this will fail on Vercel
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

        // If it's a string (Base64), just return it so it can be stored in DB
        if (typeof source === "string") return source

        // If it's a Buffer, convert to Base64 and return as data URI
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
