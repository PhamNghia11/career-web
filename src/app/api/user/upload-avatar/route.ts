import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"
import { saveFile, deleteFile } from "@/lib/storage"

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

        // Validate file size (max 5MB for Local storage)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 5MB allowed." }, { status: 400 })
        }

        // Save file - Cloud-first approach
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const savedUrl = await saveFile(buffer, "avatars", file.name)

        // If it's a local relative path, wrap with proxy, otherwise use as-is (Cloudinary URL)
        const avatarUrl = savedUrl.startsWith("uploads/")
            ? `/api/user/avatar?path=${encodeURIComponent(savedUrl)}`
            : savedUrl

        const collection = await getCollection(COLLECTIONS.USERS)

        // Get old avatar to delete it
        const user = await collection.findOne({ _id: new ObjectId(userId) })
        if (user && user.avatar && user.avatar.startsWith("uploads/")) {
            await deleteFile(user.avatar)
        }

        // Update user in MongoDB with path
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
