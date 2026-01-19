
import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const collection = await getCollection(COLLECTIONS.REPORTS)

        const query: any = {}
        if (status && status !== 'all') {
            query.status = status
        }

        const reports = await collection.find(query).sort({ createdAt: -1 }).toArray()

        return NextResponse.json({ success: true, reports })
    } catch (error) {
        console.error('Error fetching reports:', error)
        return NextResponse.json(
            { success: false, error: 'Đã xảy ra lỗi khi tải danh sách báo cáo' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { jobId, jobTitle, companyName, reporterName, reporterPhone, reporterEmail, content } = body

        if (!jobId || !content || !reporterName || !reporterPhone) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        const collection = await getCollection(COLLECTIONS.REPORTS)
        const reporterUserId = body.userId // Capture userId from body

        const report = {
            jobId: new ObjectId(jobId),
            jobTitle,
            companyName,
            reporterName,
            reporterPhone,
            reporterEmail,
            reporterUserId: reporterUserId ? (typeof reporterUserId === 'string' ? reporterUserId : reporterUserId.toString()) : null,
            content,
            status: 'pending', // pending, resolved, dismissed
            createdAt: new Date().toISOString()
        }

        await collection.insertOne(report)

        // Notify admins
        try {
            const notifCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
            await notifCollection.insertOne({
                targetRole: 'admin',
                type: 'system',
                title: 'Báo cáo tin tuyển dụng mới',
                message: `Tin tuyển dụng "${jobTitle}" của ${companyName} vừa bị báo cáo bởi ${reporterName}.`,
                read: false,
                createdAt: new Date(),
                link: '/dashboard/admin/reports'
            })
        } catch (err) {
            console.error('Failed to create admin notification for report:', err)
        }

        return NextResponse.json({ success: true, message: 'Gửi báo cáo thành công' })

    } catch (error) {
        console.error('Error submitting report:', error)
        return NextResponse.json(
            { success: false, error: 'Đã xảy ra lỗi khi gửi báo cáo' },
            { status: 500 }
        )
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { reportId, status, adminResponse, jobAction } = body

        if (!reportId || !status || !adminResponse) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        const reportsCollection = await getCollection(COLLECTIONS.REPORTS)
        const report = await reportsCollection.findOne({ _id: new ObjectId(reportId) })

        if (!report) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy báo cáo' },
                { status: 404 }
            )
        }

        const jobsCollection = await getCollection(COLLECTIONS.JOBS)
        const job = await jobsCollection.findOne({ _id: new ObjectId(report.jobId) })

        // Update report status and response
        await reportsCollection.updateOne(
            { _id: new ObjectId(reportId) },
            {
                $set: {
                    status,
                    adminResponse,
                    jobAction: jobAction || 'none',
                    resolvedAt: new Date().toISOString()
                }
            }
        )

        // Handle Job Actions
        if (job) {
            if (jobAction === 'hide') {
                await jobsCollection.updateOne(
                    { _id: new ObjectId(report.jobId) },
                    { $set: { status: 'rejected', updatedAt: new Date().toISOString() } }
                )
                // Notify job creator
                if (job.creatorId) {
                    try {
                        const notifCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
                        await notifCollection.insertOne({
                            userId: job.creatorId,
                            type: 'system',
                            title: 'Tin tuyển dụng đã bị gỡ',
                            message: `Tin tuyển dụng "${job.title}" của bạn đã bị gỡ sau khi có báo cáo vi phạm được xác thực. Phản hồi của admin: ${adminResponse}`,
                            read: false,
                            createdAt: new Date(),
                            link: '/dashboard/my-jobs'
                        })
                    } catch (e) { console.error('Notify creator hide failed', e) }
                }
            } else if (jobAction === 'delete') {
                await jobsCollection.deleteOne({ _id: new ObjectId(report.jobId) })
                // Notify job creator
                if (job.creatorId) {
                    try {
                        const notifCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
                        await notifCollection.insertOne({
                            userId: job.creatorId,
                            type: 'system',
                            title: 'Tin tuyển dụng đã bị xóa',
                            message: `Tin tuyển dụng "${job.title}" của bạn đã bị xóa vĩnh viễn sau khi có báo cáo vi phạm nghiêm trọng.`,
                            read: false,
                            createdAt: new Date(),
                            link: '/dashboard/my-jobs'
                        })
                    } catch (e) { console.error('Notify creator delete failed', e) }
                }
            }
        }

        // Notify reporter if userId exists
        if (report.reporterUserId) {
            try {
                const notifCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
                let message = `Admin đã xử lý báo cáo của bạn về tin "${report.jobTitle}": ${adminResponse}`
                if (jobAction === 'hide') message += " (Tin đã bị gỡ bỏ)."
                if (jobAction === 'delete') message += " (Tin đã được xóa vĩnh viễn)."

                await notifCollection.insertOne({
                    userId: report.reporterUserId,
                    type: 'system',
                    title: status === 'resolved' ? 'Kết quả xử lý báo cáo' : 'Phản hồi báo cáo vi phạm',
                    message,
                    read: false,
                    createdAt: new Date(),
                    link: jobAction === 'delete' ? undefined : `/jobs/${report.jobId}`
                })
            } catch (err) {
                console.error('Failed to notify reporter:', err)
            }
        }

        return NextResponse.json({ success: true, message: 'Xử lý báo cáo thành công' })

    } catch (error) {
        console.error('Error updating report:', error)
        return NextResponse.json(
            { success: false, error: 'Đã xảy ra lỗi khi xử lý báo cáo' },
            { status: 500 }
        )
    }
}
