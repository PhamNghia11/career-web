import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Extract text fields
    const jobTitle = formData.get("jobTitle") as string
    const companyName = formData.get("companyName") as string
    const fullname = formData.get("fullname") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const message = formData.get("message") as string

    // Extract file
    const file = formData.get("cv") as File

    // Validate required fields
    if (!fullname || !email || !phone || !file) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 })
    }

    // Validate file (double check server side)
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Loại file không hợp lệ" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File quá lớn (>5MB)" }, { status: 400 })
    }

    // In a real app, you would upload the file to S3/Cloudinary/Blob Storage here.
    // For this demo/prototype, we will store metadata and assume local storage or similar if needed,
    // but typically we don't store files in MongoDB directly (GridFS is an option but complex).
    // For now, we'll confirm receipt and store metadata.

    // Mock file path for now
    const cvPath = `/uploads/${Date.now()}-${file.name}`

    const applicationsCollection = await getCollection(COLLECTIONS.APPLICATIONS)

    await applicationsCollection.insertOne({
      jobTitle,
      companyName,
      fullname,
      email,
      phone,
      message,
      cvPath, // This would be the URL from S3
      cvOriginalName: file.name,
      createdAt: new Date(),
      status: "new", // new, reviewed, interviewed, rejected, hired
    })

    return NextResponse.json(
      {
        success: true,
        message: "Ứng tuyển thành công",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
// ... (existing POST)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const role = searchParams.get("role")

    const collection = await getCollection(COLLECTIONS.APPLICATIONS)
    let query = {}

    // Simple role-based filter simulation
    // If student, filter by email. If admin, return all.
    // In a real secure app, we'd verify session/token here.
    if (role === "student" && email) {
      query = { email: email }
    } else if (role === "admin") {
      query = {} // All
    } else {
      // Default behavior (e.g. for API testing or if logic unclear)
      // Maybe return nothing to be safe? Or match email if present.
      if (email) query = { email: email }
      else query = {} // Or maybe block? For now let's allow all if no filter for dev ease or empty.
    }

    const applications = await collection.find(query).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      data: applications
    })
  } catch (error) {
    console.error("Fetch applications error:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
