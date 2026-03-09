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

        // Auth check
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
        const application = await collection.findOne({ _id: new ObjectId(id) })

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        // Authorization
        const isAdmin = userRole === 'admin'
        const isEmployer = userRole === 'employer' && (application.employerId === userId || application.employerId?.toString() === userId)
        const isStudent = userRole === 'student' && (application.applicantId === userId || application.applicantId?.toString() === userId)

        if (!isAdmin && !isEmployer && !isStudent) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Determine CV source
        const cvPath = application.cvPath as string | undefined
        const cvBase64Legacy = application.cvBase64 as string | undefined
        const cvMimeType = (application.cvMimeType as string) || "application/pdf"
        const cvOriginalName = (application.cvOriginalName as string) || "cv.pdf"

        // Detect if this is a non-PDF document (DOCX, DOC)
        const isWordDoc = cvMimeType.includes("msword") ||
            cvMimeType.includes("wordprocessingml") ||
            cvOriginalName.toLowerCase().endsWith(".docx") ||
            cvOriginalName.toLowerCase().endsWith(".doc")

        // For DOCX/DOC files stored on Cloudinary, use Office Online Viewer
        if (isWordDoc && cvPath && cvPath.startsWith("http")) {
            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cvPath)}`
            return NextResponse.redirect(officeViewerUrl)
        }

        // For PDF files or local files, serve directly
        let fileBuffer: Buffer | null = null
        let contentType = cvMimeType

        const sourceUrl = cvPath || cvBase64Legacy

        if (sourceUrl) {
            if (sourceUrl.startsWith("http")) {
                // Fetch from Cloudinary/external URL
                try {
                    const response = await fetch(sourceUrl)
                    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
                    const arrayBuffer = await response.arrayBuffer()
                    fileBuffer = Buffer.from(arrayBuffer)
                    const responseContentType = response.headers.get("content-type")
                    if (responseContentType && !responseContentType.includes("octet-stream")) {
                        contentType = responseContentType
                    }
                } catch (fetchError) {
                    console.error("[CV Proxy] Failed to fetch from URL:", sourceUrl, fetchError)
                }
            } else if (sourceUrl.startsWith("data:")) {
                // Parse data URI
                const matches = sourceUrl.match(/^data:([^;]+);base64,(.+)$/)
                if (matches) {
                    contentType = matches[1]
                    fileBuffer = Buffer.from(matches[2], "base64")
                }
            } else {
                // Local file path
                try {
                    const { readFile } = await import("@/lib/storage")
                    fileBuffer = await readFile(sourceUrl)
                } catch (fileError) {
                    console.error("[CV Proxy] Failed to read local file:", sourceUrl, fileError)
                }
            }
        }

        if (!fileBuffer) {
            return NextResponse.json({ error: "CV not found or could not be loaded" }, { status: 404 })
        }

        // Return the file with inline Content-Disposition so browser displays it
        return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${cvOriginalName}"`,
                "Cache-Control": "private, max-age=3600",
            }
        })
    } catch (error) {
        console.error("[CV Proxy] Error:", error)
        return NextResponse.json({ error: "Failed to serve CV" }, { status: 500 })
    }
}
