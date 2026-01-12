
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

        const report = {
            jobId: new ObjectId(jobId),
            jobTitle,
            companyName,
            reporterName,
            reporterPhone,
            reporterEmail,
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
                message: `Tin tuyển dụng ${jobTitle} của ${companyName} vừa bị báo cáo bởi ${reporterName}.`,
                read: false,
                createdAt: new Date(),
                link: '/dashboard/admin/reports' // Assuming there will be a page to view reports
            })
        } catch (err) {
            console.error('Failed to create admin notification for report:', err)
            // Continue success response even if notification fails
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
