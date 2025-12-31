import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendEmail } from "@/lib/email"

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
    const { name, email, password, phone, role, studentId, major } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 })
    }

    const collection = await getCollection(COLLECTIONS.USERS)

    // Check if email already exists
    const existingUser = await collection.findOne({ email })
    if (existingUser) {
      // If user exists but not verified, allow re-sending OTP
      if (!existingUser.emailVerified) {
        // Generate new OTP
        const otp = generateOTP()
        const hashedOTP = hashOTP(otp)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

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
        try {
          await sendEmail({
            to: email,
            subject: "Mã xác minh tài khoản GDU Career",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">GDU Career Portal</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">Xác minh tài khoản</p>
                  </div>
                  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e3a5f; margin-top: 0;">Xin chào ${existingUser.name}!</h2>
                    <p style="color: #666;">Đây là mã xác minh mới của bạn:</p>
                    <div style="background: #1e3a5f; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
                      ${otp}
                    </div>
                    <p style="color: #999; font-size: 14px; text-align: center;">Mã này sẽ hết hạn sau <strong>5 phút</strong></p>
                  </div>
                </div>
              `,
          })
        } catch (emailError) {
          console.error("Failed to send OTP email:", emailError)
        }

        return NextResponse.json({
          success: true,
          needsVerification: true,
          email: email,
          message: "Tài khoản đã tồn tại nhưng chưa xác minh. Mã OTP mới đã được gửi.",
        })
      }
      return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Prepare new user object
    const newUser: any = {
      name,
      password: hashedPassword,
      role: role || "student",
      email,
      emailVerified: false,
      avatar: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
      createdAt: new Date(),
    }

    // Add student specific fields
    if (role === "student") {
      newUser.studentId = studentId || ""
      newUser.major = major || ""
    }

    // Prepare email verification
    const otp = generateOTP()
    newUser.emailOtp = hashOTP(otp)
    newUser.emailOtpExpires = new Date(Date.now() + 5 * 60 * 1000)

    // Insert user
    await collection.insertOne(newUser)

    // Send Email OTP
    try {
      await sendEmail({
        to: email,
        subject: "Mã xác minh tài khoản GDU Career",
        html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1 style="margin: 0; font-size: 24px;">GDU Career Portal</h1>
                      <p style="margin: 10px 0 0; opacity: 0.9;">Chào mừng bạn đến với GDU Career!</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                      <h2 style="color: #1e3a5f; margin-top: 0;">Xin chào ${name}!</h2>
                      <p style="color: #666; line-height: 1.6;">
                        Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhập mã xác minh dưới đây để hoàn tất:
                      </p>
                      <div style="background: #1e3a5f; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
                        ${otp}
                      </div>
                      <p style="color: #999; font-size: 14px; text-align: center;">
                        Mã này sẽ hết hạn sau <strong>5 phút</strong>
                      </p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                      <p style="color: #999; font-size: 12px; text-align: center;">
                        Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này.
                      </p>
                    </div>
                  </div>
                `,
      })
      console.log("[register] Sent OTP email to:", email)
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError)
    }



    return NextResponse.json({
      success: true,
      needsVerification: true,
      email: email,
      message: "Đăng ký thành công! Vui lòng xác minh tài khoản.",
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra. Vui lòng thử lại." }, { status: 500 })
  }
}
