import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File
        const userId = formData.get("userId") as string

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        if (!userId) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, GIF allowed." }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 5MB allowed." }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public", "uploads", "avatars")
        await mkdir(uploadDir, { recursive: true })

        // Create unique filename
        const ext = file.name.split(".").pop()
        const filename = `${userId}-${Date.now()}.${ext}`
        const filepath = join(uploadDir, filename)

        // Write file to disk
        await writeFile(filepath, buffer)

        // Generate public URL
        const avatarUrl = `/uploads/avatars/${filename}`

        // Update user in MongoDB
        const collection = await getCollection(COLLECTIONS.USERS)
        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { avatar: avatarUrl, updatedAt: new Date() } }
        )

        return NextResponse.json({
            success: true,
            url: avatarUrl,
            message: "Avatar uploaded successfully"
        })

    } catch (error) {
        console.error("[API] Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
