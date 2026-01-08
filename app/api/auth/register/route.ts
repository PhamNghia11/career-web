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

    // Validate phone number format
    if (phone && !/^0\d{9,10}$/.test(phone)) {
      return NextResponse.json({ error: "Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số" }, { status: 400 })
    }

    const collection = await getCollection(COLLECTIONS.USERS)

    // Check if email already exists
    const existingUser = await collection.findOne({ email })
    if (existingUser) {
      // If user exists but not verified, auto-verify and login as per user's "direct access" request
      if (!existingUser.emailVerified) {
        await collection.updateOne(
          { email },
          { $set: { emailVerified: true } }
        )

        const userResponse = {
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          avatar: existingUser.avatar,
          emailVerified: true,
          createdAt: existingUser.createdAt
        }

        return NextResponse.json({
          success: true,
          user: userResponse,
          message: "Tài khoản đã tồn tại và đã được kích hoạt.",
        })
      }
      return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 409 })
    }

    // Check if studentId already exists (only for students)
    if (role === "student") {
      if (!studentId || !/^\d{8}$/.test(studentId)) {
        return NextResponse.json({ error: "Mã số sinh viên phải có đủ 8 số" }, { status: 400 })
      }

      const existingStudentId = await collection.findOne({ studentId })
      if (existingStudentId) {
        return NextResponse.json({ error: "Mã số sinh viên đã được đăng ký" }, { status: 409 })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // DEFENSIVE CLEANUP: Ensure no leftover data for this email exists from previous deleted accounts
    try {
      const applicationsCollection = await getCollection(COLLECTIONS.APPLICATIONS)

      // Find old apps to see if we can extract an old applicantId for more cleanup
      const oldApps = await applicationsCollection.find({ email: email }).toArray()
      const oldUserIds = Array.from(new Set(oldApps.map(a => a.applicantId).filter(Boolean)))

      // Clean applications by email
      await applicationsCollection.deleteMany({ email: email })

      const notificationsCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
      const savedJobsCollection = await getCollection(COLLECTIONS.SAVED_JOBS)

      // If we found old user IDs, clean them too
      if (oldUserIds.length > 0) {
        await notificationsCollection.deleteMany({ userId: { $in: oldUserIds } })
        await savedJobsCollection.deleteMany({ userId: { $in: oldUserIds } })
      }
    } catch (cleanupErr) {
      console.error("[Register] Defensive cleanup error:", cleanupErr)
    }

    // Prepare new user object
    const newUser: any = {
      name,
      password: hashedPassword,
      role: role || "student",
      email,
      emailVerified: true, // Now verified by default as per user request for direct access
      avatar: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
      createdAt: new Date(),
    }

    // Add student specific fields
    if (role === "student") {
      newUser.studentId = studentId || ""
      newUser.major = major || ""
    }

    // Insert user
    const insertResult = await collection.insertOne(newUser)
    const userId = insertResult.insertedId

    // Send Welcome Email
    try {
      await sendEmail({
        to: email,
        subject: "Chào mừng bạn đến với GDU Career",
        html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1 style="margin: 0; font-size: 24px;">GDU Career Portal</h1>
                      <p style="margin: 10px 0 0; opacity: 0.9;">Chào mừng bạn đến với GDU Career!</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                      <h2 style="color: #1e3a5f; margin-top: 0;">Xin chào ${name}!</h2>
                      <p style="color: #666; line-height: 1.6;">
                        Tài khoản của bạn đã được khởi tạo thành công. Chào mừng bạn gia nhập cộng đồng GDU Career.
                      </p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                      <p style="color: #999; font-size: 12px; text-align: center;">
                        Đây là email tự động, vui lòng không phản hồi.
                      </p>
                    </div>
                  </div>
                `,
      })
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
    }

    // Prepare user response (no password)
    const userResponse = {
      id: userId.toString(),
      name,
      email,
      role: newUser.role,
      avatar: newUser.avatar,
      emailVerified: true,
      createdAt: newUser.createdAt
    }

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: "Đăng ký thành công!",
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra. Vui lòng thử lại." }, { status: 500 })
  }
}
