import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import bcrypt from "bcryptjs"
import { sendEmail } from "@/services/email.service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    const normalizedEmail = email.toLowerCase().trim()

    const collection = await getCollection(COLLECTIONS.USERS)

    // Find user by email
    const user = await collection.findOne({ email: normalizedEmail })

    if (!user) {
      return NextResponse.json({ error: "Email chưa được đăng ký" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 401 })
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
      // Check if TOTP is enabled
      if (user.totpEnabled) {
        // User has Google Authenticator set up - request TOTP code
        return NextResponse.json({
          success: true,
          needs2FA: true,
          totpEnabled: true,
          email: user.email
        })
      } else {
        // TOTP not set up yet - require setup
        return NextResponse.json({
          success: true,
          needs2FA: true,
          needsTotpSetup: true,
          email: user.email,
          userId: user._id.toString()
        })
      }
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
