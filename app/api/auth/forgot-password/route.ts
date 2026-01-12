import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import userModel from "@/lib/user-model"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Vui lòng nhập email" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)
        const user = await collection.findOne({ email })

        if (!user) {
            // For security, don't reveal if email exists or not
            // But for this project, checking is fine, or simulate success
            return NextResponse.json({ success: true, message: "Nếu email tồn tại, link đã được gửi." })
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetExpires = new Date(Date.now() + 3600000) // 1 hour

        // Save token to user
        await collection.updateOne(
            { email },
            {
                $set: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires: resetExpires
                }
            }
        )

        // Create reset link
        // Assuming the app is hosted at process.env.NEXT_PUBLIC_APP_URL or we use req.url based hostname
        // For simplicity in this env, we construct from origin if possible, otherwise hardcode or use env
        const urlObj = new URL(req.url)
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

        // Send email
        const emailResult = await sendEmail({
            to: email,
            subject: "Khôi phục mật khẩu - GDU Career",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d32f2f;">Yêu cầu đặt lại mật khẩu</h2>
                    <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản GDU Career của mình.</p>
                    <p>Vui lòng nhấn vào nút bên dưới để đặt mật khẩu mới:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
                    </div>
                    <p>Link này sẽ hết hạn sau 1 giờ.</p>
                    <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                </div>
            `
        })

        if (!emailResult.success) {
            console.error("Failed to send email:", emailResult.error)
            return NextResponse.json({ error: "Không thể gửi email. Vui lòng thử lại sau." }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "Email sent" })

    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 })
    }
}
