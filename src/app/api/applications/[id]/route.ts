import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"
import { sendEmail } from "@/services/email.service"

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
        const { status, notes, updaterId, updaterRole } = body

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid application ID" }, { status: 400 })
        }

        const validStatuses = ["new", "reviewed", "interviewed", "rejected", "hired"]
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)

        // Fetch application before update to check permissions and get metadata
        const currentApplication = await collection.findOne({ _id: new ObjectId(id) })
        if (!currentApplication) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        // Authorization check
        const isAdmin = updaterRole === 'admin'
        const isOwner = updaterRole === 'employer' && currentApplication.employerId === updaterId

        console.log(`[Auth Debug] App: ${id}, Updater: ${updaterId}, Role: ${updaterRole}, Owner: ${currentApplication.employerId}`)

        if (!isAdmin && !isOwner) {
            console.log("[Auth Debug] ACCESS DENIED")
            return NextResponse.json({ error: "Bạn không có quyền cập nhật trạng thái này" }, { status: 403 })
        }

        // Logic check: Enforce hiring limit
        if (status === "hired" && currentApplication.status !== "hired") {
            try {
                const jobsCollection = await getCollection(COLLECTIONS.JOBS)
                const jobId = currentApplication.jobId

                let job = null
                if (ObjectId.isValid(jobId)) {
                    job = await jobsCollection.findOne({ _id: new ObjectId(jobId) })
                } else {
                    job = await jobsCollection.findOne({ _id: jobId })
                }

                if (job) {
                    // quantity -1 means unlimited
                    if (job.quantity && job.quantity > 0) {
                        const hiredCount = await collection.countDocuments({
                            jobId: jobId,
                            status: "hired"
                        })

                        console.log(`[Limit Check] Job: ${jobId}, Quantity: ${job.quantity}, Hired: ${hiredCount}`)

                        if (hiredCount >= job.quantity) {
                            return NextResponse.json({
                                error: `Đã tuyển đủ số lượng (${job.quantity} người). Không thể tuyển thêm.`
                            }, { status: 400 })
                        }
                    }
                }
            } catch (err) {
                console.error("Error checking hiring limit:", err)
            }
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

                // --- Send Email Notification to Candidate ---
                if (status === "interviewed" || status === "rejected") {
                    const candidateEmail = currentApplication.email
                    const candidateName = currentApplication.fullname
                    const jobTitle = currentApplication.jobTitle

                    let emailSubject = ""
                    let emailHtml = ""

                    if (status === "interviewed") {
                        emailSubject = `[GDU Career] Mời phỏng vấn vị trí: ${jobTitle}`
                        emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                                <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
                                    <h1 style="margin: 0;">GDU Career Portal</h1>
                                </div>
                                <div style="padding: 24px; color: #333; line-height: 1.6;">
                                    <p>Xin chào <strong>${candidateName}</strong>,</p>
                                    <p>Chúc mừng! Chúng tôi vui mừng thông báo rằng hồ sơ của bạn cho vị trí <strong>${jobTitle}</strong> đã được nhà tuyển dụng lựa chọn để phỏng vấn.</p>
                                    <div style="background-color: #f0f4ff; border-left: 4px solid #1e3a8a; padding: 16px; margin: 20px 0;">
                                        <p style="margin: 0; font-weight: bold; color: #1e3a8a;">Hành động tiếp theo:</p>
                                        <p style="margin: 8px 0 0;">Vui lòng kiểm tra điện thoại hoặc hộp thư đến trong Gmail thường xuyên. Nhà tuyển dụng sẽ trực tiếp liên hệ với bạn để sắp xếp lịch phỏng vấn chi tiết.</p>
                                    </div>
                                    <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua hệ thống portal.</p>
                                    <p>Trân trọng,<br><strong>Đội ngũ GDU Career</strong></p>
                                </div>
                                <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
                                    <p style="margin: 0;">Đây là email tự động, vui lòng không trả lời email này.</p>
                                    <p style="margin: 4px 0 0;">&copy; 2026 Gia Dinh University Career Portal</p>
                                </div>
                            </div>
                        `
                    } else if (status === "rejected") {
                        emailSubject = `[GDU Career] Kết quả ứng tuyển vị trí: ${jobTitle}`
                        emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                                    <h1 style="margin: 0;">GDU Career Portal</h1>
                                </div>
                                <div style="padding: 24px; color: #333; line-height: 1.6;">
                                    <p>Xin chào <strong>${candidateName}</strong>,</p>
                                    <p>Cảm ơn bạn đã quan tâm và nộp hồ sơ vào vị trí <strong>${jobTitle}</strong> thông qua GDU Career Portal.</p>
                                    <p>Rất tiếc, sau khi xem xét kỹ lưỡng, chúng tôi nhận thấy hồ sơ của bạn chưa thực sự phù hợp với yêu cầu hiện tại cho vị trí này. Tuy nhiên, chúng tôi sẽ lưu trữ hồ sơ của bạn để xem xét cho các cơ hội phù hợp khác trong tương lai.</p>
                                    <p>Chúc bạn sớm tìm được công việc ưng ý và gặt hái được nhiều thành công trên con đường sự nghiệp của mình.</p>
                                    <p>Trân trọng,<br><strong>Đội ngũ GDU Career</strong></p>
                                </div>
                                <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
                                    <p style="margin: 0;">Đây là email tự động, vui lòng không trả lời email này.</p>
                                    <p style="margin: 4px 0 0;">&copy; 2026 Gia Dinh University Career Portal</p>
                                </div>
                            </div>
                        `
                    }

                    if (emailSubject && candidateEmail) {
                        sendEmail({
                            to: candidateEmail,
                            subject: emailSubject,
                            html: emailHtml
                        }).catch(err => console.error("Async email sending failed:", err))
                    }
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
