import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import crypto from "crypto"

// Hash OTP for secure storage
function hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex")
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, otp, type } = body

        if (!email || !otp) {
            return NextResponse.json({ error: "Thiếu thông tin xác thực" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)
        const pendingCollection = await getCollection(COLLECTIONS.PENDING_USERS)

        // 1. First, search in main USERS (Legacy unverified users or already verified)
        let user = await collection.findOne({ email })
        let isFromPending = false

        if (!user) {
            // 2. Search in PENDING collection
            user = await pendingCollection.findOne({ email })
            isFromPending = true
        }

        if (!user) {
            return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 })
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json({
                success: true,
                message: "Email đã được xác minh trước đó",
                data: { user: { ...user, id: user._id.toString() } }
            })
        }

        // Validate OTP
        const hashedInputOtp = hashOTP(otp)

        if (user.emailOtp !== hashedInputOtp) {
            return NextResponse.json({ error: "Mã OTP không chính xác" }, { status: 400 })
        }

        if (new Date() > new Date(user.emailOtpExpires)) {
            return NextResponse.json({ error: "Mã OTP đã hết hạn" }, { status: 400 })
        }

        // OTP Valid - Finalize User Creation
        const { _id, emailOtp, emailOtpExpires, ...userData } = user
        const finalizedUser = {
            ...userData,
            emailVerified: true,
            updatedAt: new Date()
        }

        if (isFromPending) {
            // Move from PENDING to USERS
            await collection.insertOne(finalizedUser)
            await pendingCollection.deleteOne({ _id })
        } else {
            // Legacy unverified user in main collection
            await collection.updateOne(
                { _id },
                {
                    $set: {
                        emailVerified: true,
                        updatedAt: new Date()
                    },
                    $unset: {
                        emailOtp: "",
                        emailOtpExpires: ""
                    }
                }
            )
        }

        // Send notification to Admin after verification
        if (process.env.ADMIN_EMAIL) {
            try {
                // Inline import to avoid potential circular dependencies or just use standard import if possible
                const { sendEmail } = await import("@/lib/email")
                await sendEmail({
                    to: process.env.ADMIN_EMAIL!,
                    subject: `✨ Người dùng mới đã xác minh: ${user.name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #0F52BA;">Người dùng mới đã xác minh tài khoản</h2>
                        <p>Thông tin chi tiết:</p>
                        <ul>
                            <li><strong>Họ tên:</strong> ${user.name}</li>
                            <li><strong>Email:</strong> ${user.email}</li>
                            <li><strong>Vai trò:</strong> ${user.role || "student"}</li>
                        </ul>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/users" 
                            style="background-color: #0F52BA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Quản lý người dùng
                        </a>
                        </div>
                    `
                })
            } catch (emailError) {
                console.error("Failed to trigger admin notification:", emailError)
            }
        }

        // Get updated user WITHOUT password
        const updatedUser = await collection.findOne({ email }, { projection: { password: 0 } })

        if (!updatedUser) {
            return NextResponse.json({ error: "Lỗi sau khi cập nhật xác minh" }, { status: 500 })
        }

        const userResponse = {
            ...updatedUser,
            id: updatedUser._id.toString(),
            _id: updatedUser._id.toString(),
            emailVerified: true
        }

        return NextResponse.json({
            success: true,
            message: "Xác minh thành công",
            data: {
                user: userResponse,
                needsPhoneVerification: false
            }
        })

    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 })
    }
}
