import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// PATCH - Update application status
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        const { status } = await request.json()

        if (!id || !status) {
            return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)
        const application = await collection.findOne({ _id: new ObjectId(id) })

        if (!application) {
            return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
        }

        // Update status
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, updatedAt: new Date() } }
        )

        // Notify User (if email matches a user, or we just notify by email logic if we had email notifications, 
        // but here we use userId if we have it. 
        // Applications usually store userId? Let's check schema.
        // If not, we might need to find the user by email.)

        // Attempt to find user by email to send notification
        let userId = application.userId
        if (!userId && application.email) {
            const usersCollection = await getCollection(COLLECTIONS.USERS)
            const user = await usersCollection.findOne({ email: application.email })
            if (user) {
                userId = user._id.toString()
            }
        }

        if (userId) {
            // Map status to readable text
            const statusMap: Record<string, string> = {
                new: "Đã tiếp nhận",
                reviewed: "Đang xem xét",
                interviewed: "Mời phỏng vấn",
                rejected: "Đã từ chối",
                hired: "Đã tuyển dụng"
            }
            const statusText = statusMap[status] || status

            try {
                const notificationsCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
                await notificationsCollection.insertOne({
                    userId: userId,
                    type: 'job', // or interview
                    title: 'Cập nhật trạng thái hồ sơ',
                    message: `Hồ sơ ứng tuyển của bạn cho vị trí ${application.jobTitle} đang ở trạng thái: ${statusText}`,
                    read: false,
                    createdAt: new Date(),
                    link: '/dashboard/applications' // User dashboard link
                })
            } catch (notifError) {
                console.error("Failed to create user notification:", notifError)
            }
        }

        return NextResponse.json({
            success: true,
            message: "Application updated successfully",
        })
    } catch (error) {
        console.error("Error updating application:", error)
        return NextResponse.json({ success: false, error: "Failed to update application" }, { status: 500 })
    }
}
