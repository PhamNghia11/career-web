import { NextResponse } from "next/server"
import { readFile } from "@/lib/storage"
import path from "path"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filePath = searchParams.get("path")

        if (!filePath) {
            return new Response("Missing file path", { status: 400 })
        }

        // Security check: Ensure we only serve from uploads/avatars or uploads/jobs/logos
        if (!filePath.startsWith("uploads/avatars/") && !filePath.startsWith("uploads/jobs/logos/")) {
            return new Response("Forbidden", { status: 403 })
        }

        const buffer = await readFile(filePath)
        const ext = path.extname(filePath).toLowerCase()

        let contentType = "image/png"
        if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
        else if (ext === ".webp") contentType = "image/webp"
        else if (ext === ".gif") contentType = "image/gif"

        const body = new Uint8Array(buffer)

        return new Response(body, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        })
    } catch (error) {
        console.error("[Avatar API] Error serving file:", error)
        return new Response("File not found", { status: 404 })
    }
}
