
import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { phone } = body

        if (!phone) {
            return NextResponse.json({ error: "Phone number required" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)
        const result = await collection.deleteOne({ phone })

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `Deleted user with phone ${phone}`
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const phone = searchParams.get("phone")

        if (!phone) {
            return NextResponse.json({ error: "Phone number required" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)
        const result = await collection.deleteOne({ phone })

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `Deleted user with phone ${phone}`
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}
