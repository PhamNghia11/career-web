import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

const execAsync = promisify(exec)

export async function POST() {
    try {
        // Run the Python script to process JSON data
        const scriptPath = join(process.cwd(), "scripts", "process_reviews_json.py")

        if (!existsSync(scriptPath)) {
            return NextResponse.json({
                success: false,
                error: "Python script not found: scripts/process_reviews_json.py",
            }, { status: 404 })
        }

        // Execute Python script
        const { stdout, stderr } = await execAsync(`python "${scriptPath}"`, {
            cwd: process.cwd(),
        })

        if (stderr && !stderr.includes("✓")) {
            console.error("[v0] Python script stderr:", stderr)
        }

        console.log("[v0] Python script output:", stdout)

        // Read the generated stats file to return to frontend
        const statsPath = join(process.cwd(), "public", "data", "reviews-stats.json")

        if (existsSync(statsPath)) {
            const statsContent = readFileSync(statsPath, "utf-8")
            const stats = JSON.parse(statsContent)

            return NextResponse.json({
                success: true,
                message: "Dữ liệu JSON đã được xử lý thành công bằng Python script.",
                stats,
                output: stdout,
            })
        }

        return NextResponse.json({
            success: true,
            message: "Script đã chạy nhưng không tìm thấy file stats.",
            output: stdout,
        })

    } catch (error: any) {
        console.error("[v0] Error running Python script:", error)
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to process JSON data",
            details: error.stderr || error.stdout || "",
        }, { status: 500 })
    }
}
