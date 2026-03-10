import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"
import fs from "fs/promises"
import path from "path"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.APPLICATIONS)
        const application = await collection.findOne({ _id: new ObjectId(id) })

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        const report: any = {
            id: application._id,
            fullname: application.fullname,
            cvOriginalName: application.cvOriginalName,
            cvMimeType: application.cvMimeType,
            hasCvPath: !!application.cvPath,
            hasCvBase64: !!application.cvBase64,
            cvPathValue: application.cvPath,
            cvBase64Length: application.cvBase64?.length || 0,
            checkResults: {}
        }

        if (application.cvPath) {
            if (application.cvPath.startsWith("http")) {
                report.checkResults.cvPathType = "URL"
                try {
                    const res = await fetch(application.cvPath, { method: "HEAD" })
                    report.checkResults.urlAccessible = res.ok
                    report.checkResults.urlStatus = res.status
                } catch (e: any) {
                    report.checkResults.urlAccessible = false
                    report.checkResults.urlError = e.message
                }
            } else {
                report.checkResults.cvPathType = "Local Path"
                const absolutePath = path.join(process.cwd(), application.cvPath)
                report.checkResults.absolutePath = absolutePath
                try {
                    const stats = await fs.stat(absolutePath)
                    report.checkResults.fileExists = true
                    report.checkResults.fileSize = stats.size
                } catch (e: any) {
                    report.checkResults.fileExists = false
                    report.checkResults.fileError = e.code === "ENOENT" ? "File not found" : e.message
                }
            }
        }

        if (application.cvBase64) {
            if (application.cvBase64.startsWith("data:")) {
                report.checkResults.base64Type = "Data URI"
                const matches = application.cvBase64.match(/^data:([^;]+);base64,/)
                report.checkResults.dataUriMime = matches ? matches[1] : "unknown"
            } else {
                report.checkResults.base64Type = "Raw Base64"
            }
        }

        return NextResponse.json({ success: true, report })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
