import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import { parseNormalizedDeadline } from "@/lib/date-utils"
import { saveFile, deleteFile } from "@/lib/storage"

// DELETE /api/jobs/[id]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.JOBS)

        // Filter fields to safeguard
        const { _id, creatorId, ...updateFields } = body

        // Auto update timestamps
        const now = new Date().toISOString()
        const updateData: any = {
            ...updateFields,
            updatedAt: now
        }

        // Handle Logo and Document Updates
        const currentJob = await collection.findOne({ _id: new ObjectId(id) })
        if (currentJob) {
            // Logo update
            if (updateFields.logo && updateFields.logo.startsWith("data:")) {
                // Delete old logo if it was a local file
                if (currentJob.logo && currentJob.logo.startsWith("/uploads/")) {
                    await deleteFile(currentJob.logo.substring(1))
                }
                updateData.logo = "/" + await saveFile(updateFields.logo, "jobs/logos", "logo.png")
            }

            // Document update
            if (updateFields.documentUrl && updateFields.documentUrl.startsWith("data:")) {
                // Delete old document if it was a local file
                if (currentJob.documentPath) {
                    await deleteFile(currentJob.documentPath)
                }
                updateData.documentPath = await saveFile(updateFields.documentUrl, "jobs/documents", updateFields.documentName || "document")
                delete updateData.documentUrl // Remove the large Base64 from updateData
            }
        }

        // Add normalizedDeadline if deadline is being updated
        if ('deadline' in updateFields) {
            updateData.normalizedDeadline = parseNormalizedDeadline(updateFields.deadline)
        }

        // If job is being activated or renewed, refresh the postedAt date
        // to bump it to the top of "Newest" and "Featured" lists,
        // unless a specific postedAt was provided in the update.
        if (updateFields.status === 'active' && !updateFields.postedAt) {
            updateData.postedAt = now
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )

        // Notification Logic: Thông báo cho Employer khi status thay đổi
        if (currentJob && updateData.status && updateData.status !== currentJob.status) {
            try {
                const notifCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
                let message = ""
                let title = ""
                let targetLink = "/dashboard/my-jobs"

                if (updateData.status === 'active') {
                    title = "Tin tuyển dụng được duyệt"
                    message = `Tin tuyển dụng "${currentJob.title}" của bạn đã được phê duyệt và hiển thị công khai.`
                    targetLink = `/jobs/${id}`
                } else if (updateData.status === 'rejected') {
                    title = "Tin tuyển dụng cần chỉnh sửa"
                    const reason = updateData.rejectionReason || body.rejectionReason || updateData.adminFeedback || body.adminFeedback
                    if (reason) {
                        message = `Tin tuyển dụng "${currentJob.title}" cần chỉnh sửa thêm. Lý do: ${reason}`
                    } else {
                        message = `Tin tuyển dụng "${currentJob.title}" của bạn cần được chỉnh sửa trước khi đăng. Vui lòng kiểm tra và cập nhật lại.`
                    }
                    targetLink = "/dashboard/jobs"
                }

                if (title && currentJob.creatorId) {
                    await notifCollection.insertOne({
                        userId: currentJob.creatorId.toString(),
                        type: 'job',
                        title: title,
                        message: message,
                        read: false,
                        createdAt: new Date(),
                        link: targetLink,
                    })
                    console.log(`[Jobs API] Created ${updateData.status} notification for employer:`, currentJob.creatorId.toString())
                }
            } catch (err) {
                console.error("Failed to create status notification:", err)
            }
        }

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        // Revalidate paths to refresh cache
        revalidatePath("/jobs/" + id)
        revalidatePath("/")
        revalidatePath("/dashboard/my-jobs")

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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

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
