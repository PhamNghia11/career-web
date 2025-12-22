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

    return NextResponse.json({
      success: true,
      user: userResponse,
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra. Vui lòng thử lại." }, { status: 500 })
  }
}
