import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function GET() {
    try {
        const config = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER,
            hasPassword: !!process.env.SMTP_PASSWORD,
            adminEmail: process.env.ADMIN_EMAIL,
        }

        if (!process.env.ADMIN_EMAIL) {
            return NextResponse.json({
                success: false,
                error: "ADMIN_EMAIL environment variable is missing",
                config
            })
        }

        const result = await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "🧪 GDU Career - Test Email",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #28a745;">Test Email Thành Công! 🎉</h2>
            <p>Nếu bạn nhận được email này, tính năng gửi mail đang hoạt động bình thường.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Thời gian: ${(() => {
                    const now = new Date()
                    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
                    const hours = vnTime.getUTCHours().toString().padStart(2, '0')
                    const minutes = vnTime.getUTCMinutes().toString().padStart(2, '0')
                    const day = vnTime.getUTCDate().toString().padStart(2, '0')
                    const month = (vnTime.getUTCMonth() + 1).toString().padStart(2, '0')
                    const year = vnTime.getUTCFullYear()
                    return `${hours}:${minutes} ngày ${day}/${month}/${year}`
                })()}</p>
        </div>
      `,
        })

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "Email sent successfully",
                messageId: result.messageId,
                config
            })
        } else {
            return NextResponse.json({
                success: false,
                error: "Failed to send email",
                details: result.error,
                config
            }, { status: 500 })
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
