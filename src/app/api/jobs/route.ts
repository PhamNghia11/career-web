import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"
import { parseNormalizedDeadline, getStartOfToday } from "@/lib/date-utils"
import { saveFile } from "@/lib/storage"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const field = searchParams.get("field")
    const search = searchParams.get("search")?.toLowerCase()
    const creatorId = searchParams.get("creatorId")
    const location = searchParams.get("location")
    const company = searchParams.get("company")

    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const collection = await getCollection(COLLECTIONS.JOBS)

    let query: any = {}

    if (creatorId) {
      if (ObjectId.isValid(creatorId)) {
        query.$or = [
          { creatorId: creatorId },
          { creatorId: new ObjectId(creatorId) }
        ]
      } else {
        query.creatorId = creatorId
      }

      if (status && status !== "all") {
        query.status = status
      }
    } else {
      if (status && status !== "all") {
        query.status = status
      } else if (!status) {
        query.status = "active"
      }
    }

    if (type && type !== "all" && type !== "null") {
      query.type = type
    }

    if (field && field !== "all" && field !== "null") {
      query.field = field
    }

    if (location && location !== "all" && location !== "null") {
      // Support city-based filtering if it's one of our keys, or free text
      query.location = { $regex: location, $options: 'i' }
    }

    if (company && company !== "all" && company !== "null") {
      query.company = company
    }

    if (search) {
      const searchTerms = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ]
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchTerms }]
        delete query.$or
      } else {
        query.$or = searchTerms
      }
    }

    const pipeline: any[] = [
      { $match: query }
    ]

    if (!creatorId) {

      const startOfToday = getStartOfToday()
      const matchStage = pipeline.find(p => p.$match)
      if (matchStage) {
        const deadlineOr = [
          { normalizedDeadline: { $gte: startOfToday } },
          { deadline: { $in: [null, "", "Vô thời hạn"] } }
        ]

        if (query.status === "active") {
          if (matchStage.$match.$or) {
            matchStage.$match.$and = [
              { $or: matchStage.$match.$or },
              { $or: deadlineOr }
            ]
            delete matchStage.$match.$or
          } else {
            matchStage.$match.$or = deadlineOr
          }
        }
      }

      pipeline.push(
        {
          $lookup: {
            from: COLLECTIONS.APPLICATIONS,
            let: { jobId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$jobId", "$$jobId"] },
                      { $eq: ["$status", "hired"] }
                    ]
                  }
                }
              }
            ],
            as: "hiredApplications"
          }
        },
        {
          $addFields: {
            hiredCount: { $size: "$hiredApplications" }
          }
        },
        {
          $match: {
            $expr: {
              $or: [
                { $eq: [{ $ifNull: ["$quantity", -1] }, -1] },
                { $lt: ["$hiredCount", { $convert: { input: "$quantity", to: "int", onError: 2147483647, onNull: 2147483647 } }] }
              ]
            }
          }
        }
      )
    }

    // Capture total before pagination
    const countPipeline = [...pipeline, { $count: "total" }]
    const countResult = await collection.aggregate(countPipeline).toArray()
    const total = countResult[0]?.total || 0

    pipeline.push(
      { $sort: { postedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          description: 0,
          requirements: 0,
          benefits: 0,
          detailedBenefits: 0,
          relatedMajors: 0,
          hiredApplications: 0
        }
      }
    )

    const jobs = await collection.aggregate(pipeline).toArray()

    const mappedJobs = jobs.map((job: any) => ({
      ...job,
      _id: job._id.toString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        jobs: mappedJobs,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      },
    })
  } catch (error) {
    console.error("Error reading jobs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title, company, companyId, location, type, field,
      experience, education,
      salary, salaryMin, salaryMax, isNegotiable,
      deadline, description, requirements, benefits,
      relatedMajors, detailedBenefits, creatorId, role, website, quantity,
      contactEmail, contactPhone, documentUrl, documentName, logoFit, status
    } = body

    // Validate permission (Only Employer or Admin)
    // Ideally use session check here, but relying on payload for now as per context
    // if (role === 'student') return NextResponse.json({ error: "Students cannot post jobs" }, { status: 403 })

    // Security check: Verify user exists in DB
    const usersCollection = await getCollection(COLLECTIONS.USERS)
    let userExists = null
    try {
      if (ObjectId.isValid(creatorId)) {
        userExists = await usersCollection.findOne({
          $or: [
            { _id: new ObjectId(creatorId) },
            { _id: creatorId }
          ]
        })
      } else {
        userExists = await usersCollection.findOne({ _id: creatorId })
      }
    } catch (e) {
      console.error("Error verifying creatorId:", e)
    }

    if (!userExists) { // User might have been deleted
      return NextResponse.json({ error: "Tài khoản không tồn tại hoặc đã bị xóa." }, { status: 401 })
    }

    const collection = await getCollection(COLLECTIONS.JOBS)

    // Handle Logo and Document Storage
    let finalLogo = body.logo || "/placeholder.svg?height=100&width=100"
    if (body.logo && body.logo.startsWith("data:")) {
      finalLogo = "/" + await saveFile(body.logo, "jobs/logos", "logo.png")
    }

    let finalDocumentPath = null
    if (documentUrl && documentUrl.startsWith("data:")) {
      finalDocumentPath = await saveFile(documentUrl, "jobs/documents", documentName || "document")
    }

    // Prepare the final job document for MongoDB
    const newJob: any = {
      title,
      company,
      companyId: companyId ? (ObjectId.isValid(companyId) ? new ObjectId(companyId) : companyId) : null,
      location,
      type,
      field,
      experience: experience || "no-exp",
      education: education || "bachelor",
      salary: salary || "Thỏa thuận",
      salaryMin: salaryMin || 0,
      salaryMax: salaryMax || 0,
      isNegotiable: !!isNegotiable,
      deadline,
      normalizedDeadline: parseNormalizedDeadline(deadline),
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      benefits: Array.isArray(benefits) ? benefits : (benefits ? [benefits] : []),
      detailedBenefits: Array.isArray(detailedBenefits) ? detailedBenefits : (detailedBenefits ? [detailedBenefits] : []),
      relatedMajors: Array.isArray(relatedMajors) ? relatedMajors : (relatedMajors ? [relatedMajors] : []),
      status: status || (role === 'admin' ? 'active' : 'pending'), // Admin posts are active immediately
      postedAt: body.postedAt ? new Date(body.postedAt) : new Date(),
      updatedAt: new Date(),
      creatorId: creatorId ? (ObjectId.isValid(creatorId) ? new ObjectId(creatorId) : creatorId) : null,
      role: role || "employer",
      website: website || "",
      quantity: typeof quantity === 'number' ? quantity : (parseInt(quantity as string) || (quantity === "-1" ? -1 : 1)),
      hiredCount: 0,
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      logo: finalLogo,
      logoFit: logoFit || "cover",
      documentUrl: body.documentUrl || null,
      documentPath: finalDocumentPath,
      documentName: documentName || null,
      views: 0,
      applicants: 0,
    }

    const result = await collection.insertOne(newJob)

    // Create notification for admin if needed
    if (newJob.status === "pending") {
      try {
        const notifCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
        await notifCollection.insertOne({
          targetRole: 'admin',
          type: 'job',
          title: 'Tin tuyển dụng mới chờ duyệt',
          message: `Công ty ${company} đã đăng tin "${title}" và đang chờ bạn phê duyệt.`,
          relatedId: result.insertedId,
          read: false,
          createdAt: new Date(),
          link: '/dashboard/jobs',
        })
      } catch (e) {
        console.error("Failed to create admin notification:", e)
      }
    }

    // Convert ObjectIds to strings for the JSON response
    const responseData = {
      ...newJob,
      _id: result.insertedId.toString(),
      companyId: newJob.companyId?.toString() || newJob.companyId,
      creatorId: newJob.creatorId?.toString() || newJob.creatorId,
      normalizedDeadline: newJob.normalizedDeadline ? newJob.normalizedDeadline.toISOString() : null,
      postedAt: newJob.postedAt.toISOString(),
      updatedAt: newJob.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: role === 'admin' ? "Đăng tuyển thành công!" : "Đã gửi duyệt tin tuyển dụng!",
      data: responseData,
    })
  } catch (error: any) {
    console.error("Post job error details:", {
      message: error.message,
      stack: error.stack,
      error
    })
    return NextResponse.json(
      {
        success: false,
        error: "Failed to post job",
        details: error.message
      },
      { status: 500 }
    )
  }
}
