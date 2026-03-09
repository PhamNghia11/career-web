import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"

/**
 * GET /api/applications/[id]/cv
 * Serves the CV file inline with proper Content-Type headers.
 * This proxy approach works for Cloudinary URLs, local files, and base64 data URIs.
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
        const cvBase64 = application.cvBase64 as string | undefined
        const cvMimeType = (application.cvMimeType as string) || "application/pdf"
        const cvOriginalName = (application.cvOriginalName as string) || "cv.pdf"

        let pdfBuffer: Buffer | null = null
        let contentType = cvMimeType

        if (cvPath) {
            if (cvPath.startsWith("http")) {
                // Fetch from Cloudinary/external URL
                try {
                    const response = await fetch(cvPath)
                    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
                    const arrayBuffer = await response.arrayBuffer()
                    pdfBuffer = Buffer.from(arrayBuffer)
                    // Use content-type from response if available
                    const responseContentType = response.headers.get("content-type")
                    if (responseContentType && !responseContentType.includes("octet-stream")) {
                        contentType = responseContentType
                    }
                } catch (fetchError) {
                    console.error("[CV Proxy] Failed to fetch from URL:", cvPath, fetchError)
                }
            } else if (cvPath.startsWith("data:")) {
                // Parse data URI
                const matches = cvPath.match(/^data:([^;]+);base64,(.+)$/)
                if (matches) {
                    contentType = matches[1]
                    pdfBuffer = Buffer.from(matches[2], "base64")
                }
            } else {
                // Local file
                try {
                    const { readFile } = await import("@/lib/storage")
                    pdfBuffer = await readFile(cvPath)
                } catch (fileError) {
                    console.error("[CV Proxy] Failed to read local file:", cvPath, fileError)
                }
            }
        } else if (cvBase64) {
            // Legacy base64 field
            if (cvBase64.startsWith("data:")) {
                const matches = cvBase64.match(/^data:([^;]+);base64,(.+)$/)
                if (matches) {
                    contentType = matches[1]
                    pdfBuffer = Buffer.from(matches[2], "base64")
                }
            } else if (cvBase64.startsWith("http")) {
                try {
                    const response = await fetch(cvBase64)
                    const arrayBuffer = await response.arrayBuffer()
                    pdfBuffer = Buffer.from(arrayBuffer)
                } catch (e) {
                    console.error("[CV Proxy] Failed to fetch cvBase64 URL:", e)
                }
            }
        }

        if (!pdfBuffer) {
            return NextResponse.json({ error: "CV not found or could not be loaded" }, { status: 404 })
        }

        // Return the file with inline Content-Disposition so browser displays it
        return new NextResponse(new Uint8Array(pdfBuffer), {
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
