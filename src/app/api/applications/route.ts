import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { sendEmail } from "@/services/email.service"
import { ObjectId } from "mongodb"
import { checkNotificationPreference } from "@/lib/notification-utils"
import { saveFile } from "@/lib/storage"

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

    // Verify applicant still exists if logged in
    if (applicantId && ObjectId.isValid(applicantId)) {
      const usersCollection = await getCollection(COLLECTIONS.USERS)
      const userExists = await usersCollection.findOne({ _id: new ObjectId(applicantId) })
      if (!userExists) {
        return NextResponse.json({ error: "Tài khoản của bạn không tồn tại hoặc đã bị xóa. Vui lòng đăng xuất và đăng ký lại." }, { status: 401 })
      }
      if (userExists.role === "employer" || userExists.role === "admin") {
        return NextResponse.json({ error: "Nhà tuyển dụng hoặc quản trị viên không thể ứng tuyển công việc." }, { status: 403 })
      }
    }

    console.log("[Applications API] POST - jobId:", jobId, "employerId from form:", employerId, "applicantId:", applicantId)

    // Always lookup job if jobId provided for security and deadline validation
    if (jobId) {
      try {
        const jobsCollection = await getCollection(COLLECTIONS.JOBS)
        let job = null
        try {
          if (ObjectId.isValid(jobId)) {
            job = await jobsCollection.findOne({ _id: new ObjectId(jobId) })
          }
        } catch (e) {
          console.error("[Applications API] Invalid ObjectId:", jobId)
        }

        if (!job) {
          job = await jobsCollection.findOne({ _id: jobId as any })
        }

        if (job) {
          // 1. Sync employerId
          if (job.creatorId) {
            employerId = job.creatorId
            console.log("[Applications API] Found/Verified employerId from job:", employerId)
          }

          // 2. Strict Deadline validation
          if (job.deadline) {
            const parseDateHelper = (dateVal: any): number => {
              if (!dateVal) return 0
              try {
                if (dateVal instanceof Date) return dateVal.getTime()
                if (typeof dateVal === 'string') {
                  if (dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                    const [day, month, year] = dateVal.split('/').map(Number)
                    return new Date(year, month - 1, day).getTime()
                  }
                  const date = new Date(dateVal)
                  return isNaN(date.getTime()) ? 0 : date.getTime()
                }
                const date = new Date(dateVal)
                return isNaN(date.getTime()) ? 0 : date.getTime()
              } catch {
                return 0
              }
            }

            const timeDeadline = parseDateHelper(job.deadline)
            // Adjust to end of day if it's DD/MM/YYYY (optional, but keep it consistent for now)
            // For now, simple check is enough as per front-end
            if (timeDeadline > 0 && timeDeadline < new Date().getTime()) {
              return NextResponse.json({ error: "Công việc này đã hết hạn nhận hồ sơ." }, { status: 403 })
            }
          }

          // 3. Optional: Check if job is full (quantity vs hiredCount)
          // This would require another lookup for hiredCount, but let's stick to deadline for now.
        }
      } catch (lookupError) {
        console.error("[Applications API] Error looking up job:", lookupError)
      }
    }

    // Extract file
    const file = formData.get("cv") as File | null

    // Validate required fields (file is now optional)
    if (!fullname || !email || !phone || !mssv || !major) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 })
    }

    // Server-side strict phone validation
    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone.startsWith('0') || cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và có 10-11 chữ số." }, { status: 400 })
    }

    let cvFilePath = null
    let cvOriginalName = null
    let cvMimeType = null

    // Process file only if it exists
    if (file && file.size > 0 && typeof file.arrayBuffer === 'function') {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ error: "Loại file không hợp lệ" }, { status: 400 })
      }

      // Validate file size (20MB)
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: "File quá lớn (>20MB)" }, { status: 400 })
      }

      // Save CV to Local Storage
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      cvFilePath = await saveFile(buffer, "cvs", file.name)
      cvOriginalName = file.name
      cvMimeType = file.type
    }

    const applicationsCollection = await getCollection(COLLECTIONS.APPLICATIONS)

    const applicationData = {
      jobId,
      jobTitle,
      companyName,
      employerId: employerId || null,
      applicantId: applicantId || null,
      fullname,
      email,
      phone,
      mssv,
      major,
      faculty,
      cohort,
      message,
      cvPath: cvFilePath,  // Store path instead of Base64
      cvOriginalName: cvOriginalName,
      cvMimeType: cvMimeType,
      createdAt: new Date(),
      status: "new",
    }

    const result = await applicationsCollection.insertOne(applicationData)
    const applicationId = result.insertedId.toString()

    // --- POST-SUBMISSION LOGIC (Non-blocking for the main success response) ---
    try {
      // 1. Increment applicants count on the job
      if (jobId) {
        try {
          const jobsCollection = await getCollection(COLLECTIONS.JOBS)
          if (ObjectId.isValid(jobId)) {
            await jobsCollection.updateOne({ _id: new ObjectId(jobId) }, { $inc: { applicants: 1 } })
          } else {
            await jobsCollection.updateOne({ _id: jobId as any }, { $inc: { applicants: 1 } })
          }
        } catch (e) { console.error("Job count increment failed:", e) }
      }

      // 2. Create Notifications
      const notificationsCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)

      // Admin Notif
      await notificationsCollection.insertOne({
        targetRole: 'admin', type: 'job', title: 'Hồ sơ ứng tuyển mới',
        message: `${fullname} vừa ứng tuyển vị trí ${jobTitle} tại ${companyName}`,
        read: false, createdAt: new Date(), link: `/dashboard/applicants-manager?id=${applicationId}`, applicationId
      }).catch(e => console.error("Admin notif failed:", e))

      // Employer Notif
      if (employerId && employerId !== applicantId) {
        await notificationsCollection.insertOne({
          userId: employerId.toString(), type: 'job', title: 'Ứng viên mới ứng tuyển',
          message: `${fullname} vừa ứng tuyển vị trí ${jobTitle}`,
          read: false, createdAt: new Date(), link: `/dashboard/applicants-manager?id=${applicationId}`, applicationId
        }).catch(e => console.error("Employer notif failed:", e))
      }

      // Student Notif
      if (applicantId) {
        await notificationsCollection.insertOne({
          userId: applicantId.toString(), type: 'job', title: 'Ứng tuyển thành công',
          message: `Bạn đã ứng tuyển thành công vào vị trí ${jobTitle} tại ${companyName}.`,
          read: false, createdAt: new Date(), link: `/dashboard/applications`, applicationId
        }).catch(e => console.error("Student notif failed:", e))
      }

      // 3. Send Email Notifications
      const host = request.headers.get('host')
      const protocol = host?.includes('localhost') ? 'http' : 'https'
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : '')
      const applicationLink = `${baseUrl.replace(/\/$/, '')}/dashboard/applicants-manager?id=${applicationId}`
      const emailSubject = `[GDU Career] Hồ sơ ứng tuyển mới: ${jobTitle}`

      // Admin Email
      if (process.env.ADMIN_EMAIL) {
        const usersCollection = await getCollection(COLLECTIONS.USERS)
        const adminUser = await usersCollection.findOne({ email: process.env.ADMIN_EMAIL })
        if (await checkNotificationPreference(adminUser?._id?.toString(), 'email')) {
          sendEmail({ to: process.env.ADMIN_EMAIL, subject: emailSubject, html: "New application received. Check dashboard." }).catch(e => console.error("Admin email failed:", e))
        }
      }

      // Employer Email
      if (employerId) {
        const usersCollection = await getCollection(COLLECTIONS.USERS)
        const employer = await usersCollection.findOne(ObjectId.isValid(employerId) ? { _id: new ObjectId(employerId) } : { _id: employerId as any })
        if (employer?.email && await checkNotificationPreference(employerId, 'email')) {
          sendEmail({ to: employer.email, subject: emailSubject, html: "New candidate applied. Check dashboard." }).catch(e => console.error("Employer email failed:", e))
        }
      }
    } catch (postError) {
      console.error("[Applications API] Post-submission processing error (silenced):", postError)
    }

    return NextResponse.json(
      { success: true, message: "Ứng tuyển thành công", applicationId },
      { status: 200 }
    )
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    // Get session for server-side auth
    const { cookies } = await import("next/headers")
    const { decrypt } = await import("@/lib/session")
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value
    const session = await decrypt(sessionCookie)

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.userId as string
    const userRole = session.role as string

    const collection = await getCollection(COLLECTIONS.APPLICATIONS)
    let query: Record<string, any> = {}
    const queryParts: any[] = []

    if (userRole === "admin") {
      // Admins see everything
    } else if (userRole === "employer") {
      // Employers see applications for their jobs
      queryParts.push({
        $or: [
          { employerId: userId },
          { employerId: new ObjectId(userId) }
        ]
      })
    } else {
      // Students see only their own applications
      // For students, we match by applicantId (preferred) or email (fallback)
      const usersCollection = await getCollection(COLLECTIONS.USERS)
      const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) })

      if (currentUser) {
        queryParts.push({
          $or: [
            { applicantId: userId },
            { applicantId: new ObjectId(userId) },
            { email: currentUser.email }
          ]
        })
      } else {
        return NextResponse.json({ success: true, data: [] })
      }
    }

    // Add jobId filter if provided
    if (jobId) {
      if (ObjectId.isValid(jobId)) {
        queryParts.push({
          $or: [
            { jobId: jobId },
            { jobId: new ObjectId(jobId) }
          ]
        })
      } else {
        queryParts.push({ jobId: jobId })
      }
    }

    if (queryParts.length === 1) {
      query = queryParts[0]
    } else if (queryParts.length > 1) {
      query = { $and: queryParts }
    }

    // Don't return cvPath in list to save bandwidth
    const applications = await collection
      .find(query)
      .project({ cvPath: 0 })
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
