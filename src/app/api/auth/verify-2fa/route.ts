import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json()

        if (!email || !otp) {
            return NextResponse.json({ error: "Thiếu thông tin xác thực" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)
        const user = await collection.findOne({
            email,
            twoFactorToken: otp,
            twoFactorExpires: { $gt: new Date() }
        })

        if (!user) {
            return NextResponse.json({ error: "Mã OTP không chính xác hoặc đã hết hạn" }, { status: 400 })
        }

        // Clear the token after successful verification
        await collection.updateOne(
            { _id: user._id },
            {
                $unset: {
                    twoFactorToken: "",
                    twoFactorExpires: ""
                }
            }
        )

        // Return user session data (same as standard login)
        const { password: _, _id, ...userWithoutPassword } = user

        const userResponse = {
            ...userWithoutPassword,
            id: _id.toString(),
            _id: _id.toString(),
            emailVerified: user.emailVerified ?? true,
            phoneVerified: user.phoneVerified ?? false,
        }

        return NextResponse.json({
            success: true,
            user: userResponse
        })

    } catch (error) {
        console.error("Verify 2FA error:", error)
        return NextResponse.json({ error: "Đã xảy ra lỗi xác thực" }, { status: 500 })
    }
}
