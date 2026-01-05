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

        // Notification Logic: Notify Employer
        if (job.creatorId && status && status !== job.status) {
            try {
                const notifCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
                let message = ""
                let title = ""

                if (status === 'active') {
                    title = "Tin tuyển dụng được duyệt"
                    message = `Tin tuyển dụng "${job.title}" của bạn đã được phê duyệt và hiển thị công khai.`
                } else if (status === 'rejected' || status === 'request_changes') {
                    title = "Tin tuyển dụng cần chỉnh sửa"
                    if (feedback) {
                        message = `Tin tuyển dụng "${job.title}" cần chỉnh sửa thêm. Lý do: ${feedback}`
                    } else {
                        message = `Tin tuyển dụng "${job.title}" của bạn cần được chỉnh sửa trước khi đăng. Vui lòng kiểm tra và cập nhật lại.`
                    }
                }

                if (title) {
                    await notifCollection.insertOne({
                        userId: job.creatorId,
                        type: 'system',
                        title: title,
                        message: message,
                        read: false,
                        createdAt: new Date(),
                        link: `/dashboard/my-jobs`,
                    })
                }
            } catch (err) {
                console.error("Failed to create status notification:", err)
            }
        }

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
