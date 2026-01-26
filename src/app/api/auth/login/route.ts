import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import bcrypt from "bcryptjs"
import { sendEmail } from "@/services/email.service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const collection = await getCollection(COLLECTIONS.USERS)

    // Find user by email
    const user = await collection.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Check if email is verified
    // Allow old users who don't have emailVerified field (treat as verified)
    if (user.emailVerified === false) {
      return NextResponse.json({
        error: "Tài khoản chưa được xác minh",
        needsVerification: true,
        email: user.email
      }, { status: 403 })
    }

    // Check for employer approval status
    if (user.role === "employer" && user.status === "pending") {
      return NextResponse.json({
        error: "Tài khoản đang chờ Admin phê duyệt. Vui lòng kiểm tra email hoặc liên hệ Admin.",
        pendingApproval: true
      }, { status: 403 })
    }

    // 2FA for Admin Role
    if (user.role === "admin") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            twoFactorToken: otp,
            twoFactorExpires: otpExpires
          }
        }
      )

      await sendEmail({
        to: user.email,
        subject: "[GDU Career] Mã xác thực 2FA",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="${process.env.NEXT_PUBLIC_APP_URL}/gdu-logo.png" alt="GDU Logo" style="height: 60px; width: auto;">
            </div>
            <h2 style="color: #d32f2f; text-align: center;">Mã xác thực đăng nhập (2FA)</h2>
            <p>Xin chào Admin <strong>${user.fullName || user.email}</strong>,</p>
            <p>Bạn đang đăng nhập vào trang quản trị GDU Career. Vui lòng sử dụng mã OTP dưới đây để hoàn tất xác thực:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background-color: #f5f5f5; color: #333; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; border: 1px solid #ccc;">${otp}</span>
            </div>
            <p style="text-align: center; color: #666;">Mã này sẽ hết hạn sau 10 phút.</p>
            <p style="color: #d32f2f; font-weight: bold; font-size: 13px;">Lưu ý: Nếu không phải bạn thực hiện đăng nhập này, vui lòng báo cáo ngay cho Root Admin.</p>
          </div>
        `
      })

      return NextResponse.json({
        success: true,
        needs2FA: true,
        email: user.email
      })
    }

    // Remove password from response
    const { password: _, _id, ...userWithoutPassword } = user

    // Return user with both id and _id for compatibility
    const userResponse = {
      ...userWithoutPassword,
      id: _id.toString(),
      _id: _id.toString(),
      emailVerified: user.emailVerified ?? true, // Old users without field are verified
      phoneVerified: user.phoneVerified ?? false,
    }

    return NextResponse.json({
      success: true,
      user: userResponse,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra. Vui lòng thử lại." }, { status: 500 })
  }
}
