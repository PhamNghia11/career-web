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
        const cvBase64Legacy = application.cvBase64 as string | undefined
        const cvOriginalName = (application.cvOriginalName as string) || "cv.pdf"
        const cvMimeType = (application.cvMimeType as string) || "application/pdf"

        // Priority 1: cvPath (Cloudinary or Local)
        // Priority 2: cvBase64 (Legacy/Fallback)
        const rawSource = cvPath || cvBase64Legacy
        let fileBuffer: Buffer | null = null
        let contentType = cvMimeType

        if (rawSource) {
            const sourceUrl = rawSource.trim()

            if (sourceUrl.startsWith("http")) {
                // External URL (Cloudinary)
                try {
                    const response = await fetch(sourceUrl)
                    if (response.ok) {
                        fileBuffer = Buffer.from(await response.arrayBuffer())
                        contentType = response.headers.get("content-type") || contentType
                    }
                } catch (fetchError) {
                    console.error(`[CV Proxy] Failed to fetch from URL (${id}):`, sourceUrl, fetchError)
                }
            } else if (sourceUrl.startsWith("data:")) {
                // Parse data URI - be robust against newlines in base64
                const matches = sourceUrl.match(/^data:([^;]+);base64,([\s\S]+)$/)
                if (matches) {
                    contentType = matches[1]
                    // Remove any whitespace/newlines from the base64 part
                    const b64Data = matches[2].replace(/\s/gi, "")
                    fileBuffer = Buffer.from(b64Data, "base64")
                }
            } else if (sourceUrl.length > 200 && !sourceUrl.includes("/") && !sourceUrl.includes("\\") && !sourceUrl.startsWith("http")) {
                // Heuristic: looks like raw base64 (long string, no path separators)
                try {
                    fileBuffer = Buffer.from(sourceUrl.replace(/\s/gi, ""), "base64")
                } catch (e) { }
            } else {
                // Local file path
                try {
                    const { readFile } = await import("@/lib/storage")
                    // Normalize path: handle leading slashes
                    const normalizedPath = sourceUrl.startsWith("/") ? sourceUrl.substring(1) : sourceUrl
                    fileBuffer = await readFile(normalizedPath)
                } catch (fileError) {
                    console.error(`[CV Proxy] Failed to read local file (${id}):`, sourceUrl, fileError)
                }
            }
        }

        if (!fileBuffer || fileBuffer.length === 0) {
            console.warn(`[CV Proxy] File buffer is empty for application ${id}`)
            return NextResponse.json({ error: "File buffer is empty" }, { status: 404 })
        }

        const headers = new Headers()
        headers.set("Content-Type", contentType)

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
