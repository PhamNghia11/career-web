import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const collection = await getCollection(COLLECTIONS.HERO_SLIDES)
        const slides = await collection.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).toArray()

        return NextResponse.json({
            success: true,
            data: slides.map(s => ({ ...s, _id: s._id.toString() }))
        })
    } catch (error) {
        console.error("Error fetching hero slides:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch slides" }, { status: 500 })
    }
}
