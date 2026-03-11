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
            // Return an HTML page that the iframe can render visually
            // (JSON responses appear blank in iframes)
            const errorHtml = `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;color:#374151}
.card{text-align:center;padding:2.5rem;max-width:420px}
.icon{width:64px;height:64px;margin:0 auto 1.5rem;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center}
.icon svg{width:32px;height:32px;color:#ef4444}
h2{font-size:1.1rem;margin-bottom:.5rem;color:#111827}
p{font-size:.875rem;color:#6b7280;line-height:1.6;margin-bottom:1.5rem}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.625rem 1.25rem;background:#2563eb;color:#fff;border:none;border-radius:.5rem;font-size:.875rem;cursor:pointer;text-decoration:none;transition:background .2s}
.btn:hover{background:#1d4ed8}
</style></head>
<body>
<div class="card">
<div class="icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg></div>
<h2>Không tìm thấy file CV</h2>
<p>File CV này không còn tồn tại trên hệ thống. Có thể file đã bị xóa hoặc chưa được tải lên đúng cách.<br/>Vui lòng sử dụng nút <b>Tải CV</b> ở phía trên hoặc liên hệ quản trị viên.</p>
</div>
</body></html>`
            return new NextResponse(errorHtml, {
                status: 404,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
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
