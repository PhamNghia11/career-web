import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import crypto from "crypto"

// Hash OTP for secure storage
function hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex")
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, otp, type } = body

        if (!email || !otp) {
            return NextResponse.json({ error: "Thiếu thông tin xác thực" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)
        const user = await collection.findOne({ email })

        if (!user) {
            return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 })
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json({
                success: true,
                message: "Email đã được xác minh trước đó",
                data: { user }
            })
        }

        // Validate OTP
        const hashedInputOtp = hashOTP(otp)

        if (user.emailOtp !== hashedInputOtp) {
            return NextResponse.json({ error: "Mã OTP không chính xác" }, { status: 400 })
        }

        if (new Date() > new Date(user.emailOtpExpires)) {
            return NextResponse.json({ error: "Mã OTP đã hết hạn" }, { status: 400 })
        }

        // OTP Valid - Update User
        await collection.updateOne(
            { email },
            {
                $set: {
                    emailVerified: true,
                    updatedAt: new Date()
                },
                $unset: {
                    emailOtp: "",
                    emailOtpExpires: ""
                }
            }
        )

        // Send notification to Admin after verification
        if (process.env.ADMIN_EMAIL) {
            try {
                import("@/lib/email").then(async ({ sendEmail }) => {
                    try {
                        await sendEmail({
                            to: process.env.ADMIN_EMAIL!, // Verified from check above
                            subject: `✨ Người dùng mới đã xác minh: ${user.name}`,
                            html: `
                          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #0F52BA;">Người dùng mới đã xác minh tài khoản</h2>
                            <p>Thông tin chi tiết:</p>
                            <ul>
                              <li><strong>Họ tên:</strong> ${user.name}</li>
                              <li><strong>Email:</strong> ${user.email}</li>
                              <li><strong>Vai trò:</strong> ${user.role || "student"}</li>
                              <li><strong>Thời gian xác minh:</strong> ${(() => {
                                    const now = new Date()
                                    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
                                    const hours = vnTime.getUTCHours().toString().padStart(2, '0')
                                    const minutes = vnTime.getUTCMinutes().toString().padStart(2, '0')
                                    const day = vnTime.getUTCDate().toString().padStart(2, '0')
                                    const month = (vnTime.getUTCMonth() + 1).toString().padStart(2, '0')
                                    const year = vnTime.getUTCFullYear()
                                    return `${hours}:${minutes} ngày ${day}/${month}/${year}`
                                })()}</li>
                            </ul>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/users" 
                               style="background-color: #0F52BA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                               Quản lý người dùng
                            </a>
                          </div>
                        `
                        })
                    } catch (e) {
                        console.error("Failed to send async admin email:", e)
                    }
                })
            } catch (emailError) {
                console.error("Failed to trigger admin notification:", emailError)
            }
        }

        // Get updated user
        const updatedUser = await collection.findOne({ email })

        return NextResponse.json({
            success: true,
            message: "Xác minh thành công",
            data: {
                user: updatedUser,
                needsPhoneVerification: false // Can extend this logic later if needed
            }
        })

    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 })
    }
}
