import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"

// Create or Update
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { id, title, subtitle, image, cta, link, order, isActive } = body

        const collection = await getCollection(COLLECTIONS.HERO_SLIDES)

        if (id) {
            // Update
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        title,
                        subtitle,
                        image,
                        cta,
                        link,
                        order: parseInt(order) || 0,
                        isActive: isActive ?? true,
                        updatedAt: new Date()
                    }
                }
            )
            return NextResponse.json({ success: true, message: "Cập nhật thành công" })
        } else {
            // Create
            const newSlide = {
                title,
                subtitle,
                image,
                cta,
                link,
                order: parseInt(order) || 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            const result = await collection.insertOne(newSlide)
            return NextResponse.json({
                success: true,
                message: "Tạo mới thành công",
                data: { ...newSlide, _id: result.insertedId.toString() }
            })
        }
    } catch (error) {
        console.error("Error saving hero slide:", error)
        return NextResponse.json({ success: false, error: "Failed to save slide" }, { status: 500 })
    }
}

// Delete
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

        const collection = await getCollection(COLLECTIONS.HERO_SLIDES)
        await collection.deleteOne({ _id: new ObjectId(id) })

        return NextResponse.json({ success: true, message: "Đã xóa slide" })
    } catch (error) {
        console.error("Error deleting hero slide:", error)
        return NextResponse.json({ success: false, error: "Failed to delete slide" }, { status: 500 })
    }
}
