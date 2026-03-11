import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"

/**
 * GET /api/applications/[id]/cv
 * Serves the CV file inline.
 * - PDF files: served directly with Content-Disposition: inline
 * - DOCX/DOC files: redirected to Microsoft Office Online Viewer
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const isDownload = searchParams.get("download") === "true"

        // Auth check
        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get("session")?.value
        const session = await decrypt(sessionCookie)

        if (!session || !session.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userRole = session.role as string
        const userId = session.userId as string

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)
        const application = await collection.findOne({ _id: new ObjectId(id) })

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        // Authorization check
        const isAdmin = userRole === 'admin'
        const isEmployer = userRole === 'employer' && (application.employerId === userId || application.employerId?.toString() === userId)
        const isStudent = userRole === 'student' && (application.applicantId === userId || application.applicantId?.toString() === userId)

        if (!isAdmin && !isEmployer && !isStudent) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const cvPath = application.cvPath as string | undefined
        const cvBase64Field = application.cvBase64 as string | undefined
        const cvOriginalName = (application.cvOriginalName as string) || "cv.pdf"
        const cvMimeType = (application.cvMimeType as string) || "application/pdf"

        // Debug log
        console.log(`[CV Proxy] Accessing CV for app ${id}. Path: ${cvPath}, Base64Field length: ${cvBase64Field?.length || 0}`)

        // Priority 1: cvPath (Cloudinary or Local)
        // Priority 2: cvBase64 field (sometimes used to store paths or raw data)
        const rawSource = cvPath || cvBase64Field
        let fileBuffer: Buffer | null = null
        let contentType = cvMimeType

        if (rawSource) {
            const sourceUrl = rawSource.trim()

            if (sourceUrl.startsWith("http")) {
                // External URL (Cloudinary)
                try {
                    const encodedUrl = encodeURI(sourceUrl)
                    const response = await fetch(encodedUrl)
                    if (response.ok) {
                        fileBuffer = Buffer.from(await response.arrayBuffer())
                        contentType = response.headers.get("content-type") || contentType
                    } else {
                        console.error(`[CV Proxy] External fetch failed with status ${response.status} for ${encodedUrl}`)
                    }
                } catch (fetchError) {
                    console.error(`[CV Proxy] Failed to fetch from URL (${id}):`, sourceUrl, fetchError)
                }
            } else if (sourceUrl.startsWith("data:")) {
                const matches = sourceUrl.match(/^data:([^;]+);base64,([\s\S]+)$/)
                if (matches) {
                    contentType = matches[1]
                    const b64Data = matches[2].replace(/\s/gi, "")
                    fileBuffer = Buffer.from(b64Data, "base64")
                }
            } else if (sourceUrl.length > 300 && !sourceUrl.includes("/") && !sourceUrl.includes("\\") && !sourceUrl.startsWith("http")) {
                // Probable raw base64
                try {
                    fileBuffer = Buffer.from(sourceUrl.replace(/\s/gi, ""), "base64")
                } catch (e) { }
            } else {
                // Local File path
                try {
                    const { readFile } = await import("@/lib/storage")
                    // Handle various path formats
                    let normalizedPath = sourceUrl
                    if (normalizedPath.startsWith("/")) normalizedPath = normalizedPath.substring(1)

                    // Possible prefixes: "uploads/cvs/", "/uploads/cvs/", "cvs/"
                    fileBuffer = await readFile(normalizedPath).catch(async () => {
                        // Retry without 'uploads/' if present
                        if (normalizedPath.startsWith("uploads/")) {
                            return await readFile(normalizedPath.replace("uploads/", ""))
                        }
                        throw new Error("File not found")
                    })
                } catch (fileError) {
                    console.error(`[CV Proxy] Failed to read local file (${id}):`, sourceUrl, fileError)
                }
            }
        }

        // Fallback for PDF/External: If we couldn't get the buffer but have a direct URL, redirect the user to it
        if ((!fileBuffer || fileBuffer.length === 0) && rawSource?.startsWith("http")) {
            console.log(`[CV Proxy] Using redirection fallback for external file: ${id}`)
            return NextResponse.redirect(new URL(rawSource))
        }

        if (!fileBuffer || fileBuffer.length === 0) {
            console.warn(`[CV Proxy] CV not found or empty for application ${id}. source: ${rawSource?.substring(0, 50)}...`)
            return NextResponse.json({
                error: "CV file not found",
                message: "Không tìm thấy file CV trên hệ thống. Vui lòng thử tải lại hoặc liên hệ quản trị viên.",
                detail: `Source: ${rawSource?.substring(0, 100)}`
            }, {
                status: 404,
                headers: {
                    "Cache-Control": "no-store, must-revalidate",
                    "X-Content-Type-Options": "nosniff"
                }
            })
        }

        const headers = new Headers()
        headers.set("Content-Type", contentType)
        headers.set("X-Content-Type-Options", "nosniff")
        headers.set("Cache-Control", "private, max-age=3600")

        if (isDownload) {
            headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(cvOriginalName)}"`)
        } else {
            headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(cvOriginalName)}"`)
        }

        return new NextResponse(new Uint8Array(fileBuffer), { headers })
    } catch (error) {
        console.error("Error in CV proxy:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
