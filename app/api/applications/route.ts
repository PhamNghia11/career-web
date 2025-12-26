import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Extract text fields
    const jobTitle = formData.get("jobTitle") as string
    const companyName = formData.get("companyName") as string
    const jobId = formData.get("jobId") as string
    let employerId = formData.get("employerId") as string
    // Student Info
    const fullname = formData.get("fullname") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const mssv = formData.get("mssv") as string
    const major = formData.get("major") as string
    const faculty = formData.get("faculty") as string
    const cohort = formData.get("cohort") as string

    const message = formData.get("message") as string
    const applicantId = formData.get("applicantId") as string // User ID for notifications

    console.log("[Applications API] POST - jobId:", jobId, "employerId from form:", employerId, "applicantId:", applicantId)

    // If employerId not provided, try to lookup from job in MongoDB
    if (!employerId && jobId) {
      try {
        const jobsCollection = await getCollection(COLLECTIONS.JOBS)
        // Try to find job by ObjectId first (MongoDB jobs)
        let job = null
        try {
          job = await jobsCollection.findOne({ _id: new ObjectId(jobId) })
        } catch {
          // If jobId is not a valid ObjectId, try string match (for static JSON jobs)
          job = await jobsCollection.findOne({ _id: jobId as any })
        }

        if (job?.creatorId) {
          employerId = job.creatorId
          console.log("[Applications API] Found employerId from job:", employerId)
        }
      } catch (lookupError) {
        console.error("[Applications API] Error looking up job:", lookupError)
      }
    }

    // Extract file
    const file = formData.get("cv") as File

    // Validate required fields
    if (!fullname || !email || !phone || !file || !mssv || !major) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Loại file không hợp lệ" }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File quá lớn (>5MB)" }, { status: 400 })
    }

    // Convert CV to Base64 for storage in MongoDB
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const cvBase64 = buffer.toString("base64")
    const cvDataUrl = `data:${file.type};base64,${cvBase64}`

    const applicationsCollection = await getCollection(COLLECTIONS.APPLICATIONS)

    const applicationData = {
      jobId,
      jobTitle,
      companyName,
      employerId: employerId || null, // Store the resolved employerId
      applicantId: applicantId || null, // Store user ID for notifications
      fullname,
      email,
      phone,
      mssv,
      major,
      faculty,
      cohort,
      message,
      cvBase64: cvDataUrl,
      cvOriginalName: file.name,
      cvMimeType: file.type,
      createdAt: new Date(),
      status: "new", // new, reviewed, interviewed, rejected, hired
    }

    const result = await applicationsCollection.insertOne(applicationData)
    const applicationId = result.insertedId.toString()

    // Create Notifications
    const notificationsCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)

    // 1. Notification for Admin
    try {
      await notificationsCollection.insertOne({
        targetRole: 'admin',
        type: 'job',
        title: 'Hồ sơ ứng tuyển mới',
        message: `${fullname} vừa ứng tuyển vị trí ${jobTitle} tại ${companyName}`,
        read: false,
        createdAt: new Date(),
        link: `/dashboard/applications`,
        applicationId: applicationId
      })
      console.log("[Applications API] Created admin notification")
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError)
    }

    // 2. Notification for Employer (if employerId exists)
    if (employerId) {
      try {
        await notificationsCollection.insertOne({
          userId: employerId,
          type: 'job',
          title: 'Ứng viên mới ứng tuyển',
          message: `${fullname} vừa ứng tuyển vị trí ${jobTitle}`,
          read: false,
          createdAt: new Date(),
          link: `/dashboard/applications`,
          applicationId: applicationId
        })
        console.log("[Applications API] Created employer notification for:", employerId)
      } catch (notifError) {
        console.error("Failed to create employer notification:", notifError)
      }
    } else {
      // If no employerId (Static Job), notify ALL employers
      try {
        await notificationsCollection.insertOne({
          targetRole: 'employer',
          type: 'job',
          title: 'Ứng viên mới (Sample Job)',
          message: `${fullname} vừa ứng tuyển vị trí ${jobTitle} (Demo)`,
          read: false,
          createdAt: new Date(),
          link: `/dashboard/applications`,
          applicationId: applicationId
        })
        console.log("[Applications API] Created broadcast employer notification")
      } catch (notifError) {
        console.error("Failed to create broadcast employer notification:", notifError)
      }
    }

    // 3. Notification for Student/Applicant (if applicantId exists - logged in user)
    if (applicantId) {
      try {
        await notificationsCollection.insertOne({
          userId: applicantId,
          type: 'job',
          title: 'Ứng tuyển thành công',
          message: `Bạn đã ứng tuyển thành công vào vị trí ${jobTitle} tại ${companyName}. Chúc bạn may mắn!`,
          read: false,
          createdAt: new Date(),
          link: `/dashboard/applications`,
          applicationId: applicationId
        })
        console.log("[Applications API] Created student notification for:", applicantId)
      } catch (notifError) {
        console.error("Failed to create student notification:", notifError)
      }
    }

    // 3. Send Email Notifications
    const emailSubject = `[GDU Career] Hồ sơ ứng tuyển mới: ${jobTitle}`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">GDU Career Portal</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Có ứng viên mới!</h2>
          <p><strong>Vị trí:</strong> ${jobTitle}</p>
          <p><strong>Công ty:</strong> ${companyName}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <h3 style="color: #333;">Thông tin ứng viên:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0;"><strong>Họ tên:</strong> ${fullname}</li>
            <li style="padding: 8px 0;"><strong>Email:</strong> ${email}</li>
            <li style="padding: 8px 0;"><strong>Số điện thoại:</strong> ${phone}</li>
            <li style="padding: 8px 0;"><strong>MSSV:</strong> ${mssv}</li>
            <li style="padding: 8px 0;"><strong>Ngành:</strong> ${major}</li>
            <li style="padding: 8px 0;"><strong>CV:</strong> ${file.name}</li>
            ${message ? `<li style="padding: 8px 0;"><strong>Lời nhắn:</strong> ${message}</li>` : ''}
          </ul>
          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://career-web-three.vercel.app'}/dashboard/applications/${applicationId}" 
               style="background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Xem hồ sơ chi tiết
            </a>
          </p>
        </div>
        <div style="padding: 15px; text-align: center; color: #666; font-size: 12px;">
          <p>Email này được gửi tự động từ GDU Career Portal</p>
        </div>
      </div>
    `

    // Send email to admin
    try {
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: emailSubject,
          html: emailHtml
        })
      }
    } catch (emailError) {
      console.error("Failed to send admin email:", emailError)
    }

    // Send email to employer (if we have their email)
    if (employerId) {
      try {
        const usersCollection = await getCollection(COLLECTIONS.USERS)
        const { ObjectId } = await import("mongodb")
        const employer = await usersCollection.findOne({ _id: new ObjectId(employerId) })
        if (employer?.email) {
          await sendEmail({
            to: employer.email,
            subject: emailSubject,
            html: emailHtml
          })
        }
      } catch (emailError) {
        console.error("Failed to send employer email:", emailError)
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ứng tuyển thành công",
        applicationId: applicationId
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const role = searchParams.get("role")
    const employerId = searchParams.get("employerId")

    const collection = await getCollection(COLLECTIONS.APPLICATIONS)
    let query: Record<string, any> = {}

    if (role === "student" && email) {
      query = { email: email }
    } else if (role === "admin") {
      query = {} // All
    } else if (role === "employer" && employerId) {
      // Show applications for this employer OR applications for static jobs (employerId is null)
      query = {
        $or: [
          { employerId: employerId },
          { employerId: null },
          { employerId: { $exists: false } }
        ]
      }
    } else {
      if (email) query = { email: email }
      else query = {}
    }

    // Don't return cvBase64 in list to save bandwidth
    const applications = await collection
      .find(query)
      .project({ cvBase64: 0 })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      data: applications
    })
  } catch (error) {
    console.error("Fetch applications error:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
