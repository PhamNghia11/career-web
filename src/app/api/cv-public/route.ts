import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"
import crypto from "crypto"

const CV_TOKEN_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "gdu-career-cv-token-secret"

/**
 * Generate a signed token for public CV access (time-limited, 10 minutes)
 */
function generateCvToken(applicationId: string): string {
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
    const payload = `${applicationId}:${expiresAt}`
    const signature = crypto.createHmac("sha256", CV_TOKEN_SECRET).update(payload).digest("hex").substring(0, 16)
    // URL-safe base64 encode
    const token = Buffer.from(`${payload}:${signature}`).toString("base64url")
    return token
}

/**
 * Verify a CV token and return the application ID if valid
 */
function verifyCvToken(token: string): string | null {
    try {
        const decoded = Buffer.from(token, "base64url").toString()
        const parts = decoded.split(":")
        if (parts.length !== 3) return null

        const [applicationId, expiresAtStr, signature] = parts
        const expiresAt = parseInt(expiresAtStr)

        // Check expiry
        if (Date.now() > expiresAt) return null

        // Verify signature
        const payload = `${applicationId}:${expiresAtStr}`
        const expectedSig = crypto.createHmac("sha256", CV_TOKEN_SECRET).update(payload).digest("hex").substring(0, 16)
        if (signature !== expectedSig) return null

        return applicationId
    } catch {
        return null
    }
}

/**
 * GET /api/cv-public?token=XXX
 * Public endpoint (no auth required) that serves CV files for Office Online Viewer.
 * Access is controlled via time-limited signed tokens.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ error: "Token required" }, { status: 400 })
        }

        const applicationId = verifyCvToken(token)
        if (!applicationId) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 })
        }

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)
        const application = await collection.findOne({ _id: new ObjectId(applicationId) })

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        const cvPath = application.cvPath as string | undefined
        const cvBase64 = application.cvBase64 as string | undefined
        const cvMimeType = (application.cvMimeType as string) || "application/pdf"
        const cvOriginalName = (application.cvOriginalName as string) || "cv.pdf"

        let fileBuffer: Buffer | null = null
        let contentType = cvMimeType
        const sourceUrl = cvPath || cvBase64

        if (sourceUrl) {
            if (sourceUrl.startsWith("http")) {
                try {
                    const response = await fetch(sourceUrl)
                    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
                    const arrayBuffer = await response.arrayBuffer()
                    fileBuffer = Buffer.from(arrayBuffer)
                } catch (fetchError) {
                    console.error("[CV Public] Failed to fetch from URL:", sourceUrl, fetchError)
                }
            } else if (sourceUrl.startsWith("data:")) {
                const matches = sourceUrl.match(/^data:([^;]+);base64,(.+)$/)
                if (matches) {
                    contentType = matches[1]
                    fileBuffer = Buffer.from(matches[2], "base64")
                }
            } else {
                try {
                    const { readFile } = await import("@/lib/storage")
                    fileBuffer = await readFile(sourceUrl)
                } catch (fileError) {
                    console.error("[CV Public] Failed to read local file:", sourceUrl, fileError)
                }
            }
        }

        if (!fileBuffer) {
            return NextResponse.json({ error: "CV file not found" }, { status: 404 })
        }

        return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${cvOriginalName}"`,
                "Cache-Control": "private, max-age=600",
            }
        })
    } catch (error) {
        console.error("[CV Public] Error:", error)
        return NextResponse.json({ error: "Failed to serve CV" }, { status: 500 })
    }
}

// Export the token generation function for use by other API routes
export { generateCvToken }
