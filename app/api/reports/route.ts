
import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

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

        return NextResponse.json({ success: true, message: 'Gửi báo cáo thành công' })

    } catch (error) {
        console.error('Error submitting report:', error)
        return NextResponse.json(
            { success: false, error: 'Đã xảy ra lỗi khi gửi báo cáo' },
            { status: 500 }
        )
    }
}
