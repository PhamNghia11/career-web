import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"
import { readFile } from "@/lib/storage"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: applicationId } = await params
        console.log(`[CV API] Serving CV for application: ${applicationId}`)

        if (!ObjectId.isValid(applicationId)) {
            console.warn(`[CV API] Invalid Application ID: ${applicationId}`)
            return new Response("Invalid Application ID", { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)
        const application = await collection.findOne({ _id: new ObjectId(applicationId) })

        if (!application) {
            console.warn(`[CV API] Application not found: ${applicationId}`)
            return new Response("Application not found", { status: 404 })
        }

        if (!application.cvPath) {
            console.warn(`[CV API] CV file path not found for application: ${applicationId}`)
            return new Response("CV file not found for this application", { status: 404 })
        }

        // Read file from Local Storage
        const buffer = await readFile(application.cvPath)
        const contentType = application.cvMimeType || "application/pdf"

        // Use 'inline' to try to open in browser (e.g. PDF), 'attachment' to force download
        const filename = application.cvOriginalName || 'cv.pdf'
        const encodedFilename = encodeURIComponent(filename)

        // Convert Buffer to Uint8Array for Response compatibility
        const body = new Uint8Array(buffer)

        return new Response(body, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
                "Content-Length": buffer.length.toString(),
            },
        })
    } catch (error: any) {
        console.error("[CV API] CRITICAL ERROR serving CV:", error)
        return new Response(`Internal Server Error: ${error.message || 'Unknown error'}`, { status: 500 })
    }
}
