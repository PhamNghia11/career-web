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

        // Fetch application before update to get applicantId, jobTitle, etc.
        const currentApplication = await collection.findOne({ _id: new ObjectId(id) })
        if (!currentApplication) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        const updateData: Record<string, any> = {
            updatedAt: new Date()
        }
        if (status) updateData.status = status
        if (notes !== undefined) updateData.notes = notes

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )

        // Create notification for student if status changed and applicantId exists
        if (status && status !== currentApplication.status && currentApplication.applicantId) {
            try {
                const notificationsCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
                const jobTitle = currentApplication.jobTitle || "công việc"

                let notificationTitle = ""
                let notificationMessage = ""
                let notificationType: "job" | "interview" | "system" = "job"

                switch (status) {
                    case "reviewed":
                        notificationTitle = "Hồ sơ đã được xem"
                        notificationMessage = `Nhà tuyển dụng đã xem hồ sơ của bạn cho vị trí ${jobTitle}.`
                        break
                    case "interviewed":
                        notificationTitle = "Mời phỏng vấn"
                        notificationMessage = `Bạn có lời mời phỏng vấn cho vị trí ${jobTitle}. Vui lòng kiểm tra email hoặc điện thoại để biết chi tiết.`
                        notificationType = "interview"
                        break
                    case "hired":
                        notificationTitle = "Chúc mừng!"
                        notificationMessage = `Chúc mừng! Bạn đã được nhận vào vị trí ${jobTitle}.`
                        break
                    case "rejected":
                        notificationTitle = "Kết quả ứng tuyển"
                        notificationMessage = `Cảm ơn bạn đã quan tâm. Rất tiếc hồ sơ vị trí ${jobTitle} chưa phù hợp lần này. Hẹn bạn ở cơ hội khác nhé!`
                        break
                }

                if (notificationTitle) {
                    await notificationsCollection.insertOne({
                        userId: currentApplication.applicantId,
                        type: notificationType,
                        title: notificationTitle,
                        message: notificationMessage,
                        read: false,
                        createdAt: new Date(),
                        link: `/dashboard/applications`,
                        applicationId: id
                    })
                    console.log(`[Applications API] Created ${status} notification for student:`, currentApplication.applicantId)
                }
            } catch (notifError) {
                console.error("Failed to create student status notification:", notifError)
                // Don't fail the main request if notification fails
            }
        }

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
