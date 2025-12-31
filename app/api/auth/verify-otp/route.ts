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
        const user = await collection.findOne({ email })

        if (!user) {
            return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 })
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json({
                success: true,
                message: "Email đã được xác minh trước đó",
                data: { user }
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

        // OTP Valid - Update User
        await collection.updateOne(
            { email },
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

        // Get updated user
        const updatedUser = await collection.findOne({ email })

        return NextResponse.json({
            success: true,
            message: "Xác minh thành công",
            data: {
                user: updatedUser,
                needsPhoneVerification: false // Can extend this logic later if needed
            }
        })

    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 })
    }
}
