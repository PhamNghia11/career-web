import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

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

    // Remove password from response
    const { password: _, _id, ...userWithoutPassword } = user

    // Return user with string ID
    const userResponse = {
      ...userWithoutPassword,
      id: _id.toString()
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
