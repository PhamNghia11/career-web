import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Get application details by ID (including CV)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid application ID" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)
        const application = await collection.findOne({ _id: new ObjectId(id) })

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: application
        })
    } catch (error) {
        console.error("Error fetching application:", error)
        return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
    }
}

// PATCH - Update application status
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, notes } = body

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid application ID" }, { status: 400 })
        }

        const validStatuses = ["new", "reviewed", "interviewed", "rejected", "hired"]
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)

        const updateData: Record<string, any> = {
            updatedAt: new Date()
        }
        if (status) updateData.status = status
        if (notes !== undefined) updateData.notes = notes

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )

        return NextResponse.json({
            success: true,
            message: "Application updated successfully"
        })
    } catch (error) {
        console.error("Error updating application:", error)
        return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }
}

// DELETE - Delete application
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid application ID" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)
        await collection.deleteOne({ _id: new ObjectId(id) })

        return NextResponse.json({
            success: true,
            message: "Application deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting application:", error)
        return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
    }
}
