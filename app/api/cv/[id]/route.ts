import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const applicationId = params.id

        if (!ObjectId.isValid(applicationId)) {
            return new NextResponse("Invalid Application ID", { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)
        const application = await collection.findOne({ _id: new ObjectId(applicationId) })

        if (!application) {
            return new NextResponse("Application not found", { status: 404 })
        }

        if (!application.cvBase64) {
            return new NextResponse("CV file not found for this application", { status: 404 })
        }

        // Parse data URI: data:[<mediatype>][;base64],<data>
        // Example: "data:application/pdf;base64,JVBERi0xLjQK..."
        const matches = application.cvBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)

        if (!matches || matches.length !== 3) {
            return new NextResponse("Invalid CV file format", { status: 500 })
        }

        const contentType = matches[1]
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')

        // Use 'inline' to try to open in browser (e.g. PDF), 'attachment' to force download
        // User asked for "view", so 'inline' is better for PDFs.
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${application.cvOriginalName || 'cv.pdf'}"`,
                "Content-Length": buffer.length.toString(),
            },
        })
    } catch (error) {
        console.error("Error serving CV:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
