import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// DELETE /api/jobs/[id]
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.JOBS)

        // In real app: Check if user owns this job before deleting!
        // For now we assume frontend checks or we rely on trust (demo mode)

        const result = await collection.deleteOne({ _id: new ObjectId(id) })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Job deleted successfully" })
    } catch (error) {
        console.error("Delete job error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete job" },
            { status: 500 }
        )
    }
}

// PATCH /api/jobs/[id] - Update Job Details
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await req.json()

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.JOBS)

        // Filter fields to safeguard
        const { _id, creatorId, ...updateFields } = body

        // Auto update updated timestamp
        const updateData = {
            ...updateFields,
            updatedAt: new Date().toISOString()
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Job updated successfully" })
    } catch (error) {
        console.error("Update job error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update job" },
            { status: 500 }
        )
    }
}

// GET /api/jobs/[id] - Get Single Job Details for Edit
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.JOBS)
        const job = await collection.findOne({ _id: new ObjectId(id) })

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: { ...job, _id: job._id.toString() }
        })
    } catch (error) {
        console.error("Get job error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch job" },
            { status: 500 }
        )
    }
}
