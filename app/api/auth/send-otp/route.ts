import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash OTP for secure storage
function hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex")
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, type = "email" } = body

        if (!email && !body.phone) {
            return NextResponse.json(
                { success: false, error: "Email hoặc số điện thoại là bắt buộc" },
                { status: 400 }
            )
        }

        const collection = await getCollection(COLLECTIONS.USERS)

        // Find user by email or phone
        let user;
        if (email) {
            user = await collection.findOne({ email })
        } else if (body.phone) {
            user = await collection.findOne({ phone: body.phone })
        }

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Không tìm thấy tài khoản" },
                { status: 404 }
            )
        }

        // Check if already verified
        if (type === "email" && user.emailVerified) {
            return NextResponse.json(
                { success: false, error: "Email đã được xác minh" },
                { status: 400 }
            )
        }

        // Generate OTP
        const otp = generateOTP()
        const hashedOTP = hashOTP(otp)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Update user with OTP
        if (type === "email") {
            await collection.updateOne(
                { email },
                {
                    $set: {
                        emailOtp: hashedOTP,
                        emailOtpExpires: expiresAt,
                    },
                }
            )

            // Send OTP email
            const emailResult = await sendEmail({
                to: email,
                subject: "Mã xác minh tài khoản GDU Career",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">GDU Career Portal</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Xác minh tài khoản</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1e3a5f; margin-top: 0;">Xin chào ${user.name}!</h2>
              <p style="color: #666; line-height: 1.6;">
                Đây là mã xác minh của bạn. Vui lòng nhập mã này để hoàn tất đăng ký:
              </p>
              <div style="background: #1e3a5f; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
                ${otp}
              </div>
              <p style="color: #999; font-size: 14px; text-align: center;">
                Mã này sẽ hết hạn sau <strong>5 phút</strong>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">
                Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
              </p>
            </div>
          </div>
        `,
            })

            if (!emailResult.success) {
                console.error("Failed to send OTP email:", emailResult.error)
                return NextResponse.json(
                    { success: false, error: "Không thể gửi email. Vui lòng thử lại." },
                    { status: 500 }
                )
            }

            console.log("[send-otp] Sent email OTP to:", email)
            console.log("[send-otp] Sent email OTP to:", email)
        } else if (type === "phone") {
            // SMS OTP integration
            if (!user.phone) {
                return NextResponse.json(
                    { success: false, error: "Tài khoản chưa có số điện thoại" },
                    { status: 400 }
                )
            }

            // Update user with OTP
            await collection.updateOne(
                { email },
                {
                    $set: {
                        phoneOtp: hashedOTP,
                        phoneOtpExpires: expiresAt,
                    },
                }
            )

            // Send via SMS
            const { sendSMS } = await import("@/lib/sms")
            const message = `Ma xac minh GDU Career cua ban la: ${otp}. Ma se het han sau 5 phut.`
            await sendSMS(user.phone, message)

            console.log("[send-otp] Phone OTP processed for:", user.phone)

        }

        return NextResponse.json({
            success: true,
            message: type === "email"
                ? "Mã OTP đã được gửi đến email của bạn"
                : "Mã OTP đã được gửi đến số điện thoại của bạn",
        })
    } catch (error) {
        console.error("Send OTP error:", error)
        return NextResponse.json(
            { success: false, error: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 }
        )
    }
}
