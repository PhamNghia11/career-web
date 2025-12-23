import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendEmail } from "@/lib/email"

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await req.json()
        const { status, feedback } = body

        if (!status || !["active", "rejected", "request_changes"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status provided" },
                { status: 400 }
            )
        }

        const collection = await getCollection(COLLECTIONS.JOBS)

        // Find the job to get creator info (for email)
        const job = await collection.findOne({ _id: new ObjectId(id) })

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: status,
                    adminFeedback: feedback || "",
                    updatedAt: new Date().toISOString()
                }
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            )
        }

        // Send email notification to employer if creatorId exists (and we can find their email)
        // For now, if we don't have user email easily, we skip or use a placeholder
        // In a real app, we would look up the user by creatorId

        // TODO: Look up user email by job.creatorId and send email
        // const usersCollection = await getCollection(COLLECTIONS.USERS)
        // const user = await usersCollection.findOne({ _id: new ObjectId(job.creatorId) })
        // if (user && user.email) { ... sendEmail ... }

        return NextResponse.json({
            success: true,
            message: `Job status updated to ${status}`,
        })
    } catch (error) {
        console.error("Error updating job status:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update job status" },
            { status: 500 }
        )
    }
}
