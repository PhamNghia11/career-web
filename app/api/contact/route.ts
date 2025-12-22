import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const contactsCollection = await getCollection(COLLECTIONS.CONTACTS)

    await contactsCollection.insertOne({
      name,
      email,
      phone,
      subject,
      message,
      createdAt: new Date(),
      status: "new", // new, read, replied
    })

    return NextResponse.json(
      {
        success: true,
        message: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
