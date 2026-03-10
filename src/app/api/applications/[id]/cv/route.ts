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

        // For local DOCX files, we need a fallback (serve as download)
        // For PDF files or any file, serve directly with proper headers
        let fileBuffer: Buffer | null = null
        let contentType = cvMimeType

        const rawSource = application.cvPath || application.cvBase64
        const sourceUrl = typeof rawSource === 'string' ? rawSource.trim() : null

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
                    console.error(`[CV Proxy] Failed to fetch from URL (${id}):`, sourceUrl, fetchError)
                }
            } else if (sourceUrl.startsWith("data:")) {
                // Parse data URI - be robust against newlines in base64
                const matches = sourceUrl.match(/^data:([^;]+);base64,([\s\S]+)$/)
                if (matches) {
                    contentType = matches[1]
                    // Remove any whitespace/newlines from the base64 part
                    const b64Data = matches[2].replace(/\s/g, "")
                    fileBuffer = Buffer.from(b64Data, "base64")
                }
            } else if (sourceUrl.length > 100 && !sourceUrl.includes("/") && !sourceUrl.includes("\\") && !sourceUrl.startsWith("http")) {
                // Heuristic: looks like raw base64 (long string, no path separators)
                try {
                    fileBuffer = Buffer.from(sourceUrl, "base64")
                    // If it starts with %PDF in base64 (JVBERi), it's a PDF
                    if (sourceUrl.startsWith("JVBERi")) {
                        contentType = "application/pdf"
                    }
                } catch (b64Error) {
                    console.error(`[CV Proxy] Failed to decode raw base64 (${id})`)
                }
            } else {
                // Local file path
                try {
                    const { readFile } = await import("@/lib/storage")
                    // Normalize path: handle leading slashes if they exist, but path.join(cwd, /path) on windows can be tricky
                    const normalizedPath = sourceUrl.startsWith("/") ? sourceUrl.substring(1) : sourceUrl
                    fileBuffer = await readFile(normalizedPath)
                } catch (fileError) {
                    console.error(`[CV Proxy] Failed to read local file (${id}):`, sourceUrl, fileError)
                }
            }
        }

        if (!fileBuffer) {
            console.warn(`[CV Proxy] CV not found for application ${id}. sourceUrl length: ${sourceUrl?.length || 0}`)
            return NextResponse.json({ error: "CV not found or could not be loaded", detail: "File buffer is empty" }, { status: 404 })
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
