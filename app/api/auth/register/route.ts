import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

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
      return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      phone: phone || "",
      avatar: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
      ...(role === "student" && {
        studentId: studentId || "",
        major: major || "",
      }),
      createdAt: new Date(),
    }

    const result = await collection.insertOne(newUser)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    // Add id from MongoDB _id
    const userResponse = {
      ...userWithoutPassword,
      id: result.insertedId.toString()
    }

    // Send notification email to Admin
    // Send notification email to Admin
    if (process.env.ADMIN_EMAIL) {
      try {
        const { sendEmail } = await import("@/lib/email")
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `✨ Người dùng mới đăng ký: ${name}`,
          html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #0F52BA;">Người dùng mới đăng ký tài khoản</h2>
                        <p>Thông tin chi tiết:</p>
                        <ul>
                            <li><strong>Họ tên:</strong> ${name}</li>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Vai trò:</strong> ${role || "student"}</li>
                            <li><strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}</li>
                        </ul>
                        <p>Vui lòng đăng nhập vào trang quản trị để xem chi tiết.</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/users" 
                           style="background-color: #0F52BA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                           Quản lý người dùng
                        </a>
                    </div>
                `
        })
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError)
        // Don't fail the registration if email fails
      }
    }

    return NextResponse.json({
      success: true,
      user: userResponse,
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra. Vui lòng thử lại." }, { status: 500 })
  }
}
