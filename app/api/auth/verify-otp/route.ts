import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import crypto from "crypto"

// Hash OTP for comparison
function hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex")
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, phone, otp, type = "email" } = body

        if ((!email && !phone) || !otp) {
            return NextResponse.json(
                { success: false, error: "Thông tin xác minh và mã OTP là bắt buộc" },
                { status: 400 }
            )
        }

        const collection = await getCollection(COLLECTIONS.USERS)

        // Find user
        let user;
        if (email) {
            user = await collection.findOne({ email })
        } else if (phone) {
            user = await collection.findOne({ phone })
        }

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Không tìm thấy tài khoản" },
                { status: 404 }
            )
        }

        const hashedInputOTP = hashOTP(otp)

        if (type === "email") {
            // Check if OTP matches
            if (user.emailOtp !== hashedInputOTP) {
                return NextResponse.json(
                    { success: false, error: "Mã OTP không đúng" },
                    { status: 400 }
                )
            }

            // Check if OTP expired
            if (new Date() > new Date(user.emailOtpExpires)) {
                return NextResponse.json(
                    { success: false, error: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." },
                    { status: 400 }
                )
            }

            // Mark email as verified
            await collection.updateOne(
                { email },
                {
                    $set: { emailVerified: true },
                    $unset: { emailOtp: "", emailOtpExpires: "" },
                }
            )

            console.log("[verify-otp] Email verified for:", email)

            // Check if phone verification needed
            const needsPhoneVerification = user.phone && !user.phoneVerified

            return NextResponse.json({
                success: true,
                message: "Xác minh email thành công!",
                data: {
                    emailVerified: true,
                    needsPhoneVerification,
                    // Return user data for login
                    user: {
                        id: user._id.toString(),
                        _id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                        phone: user.phone,
                        emailVerified: true,
                        phoneVerified: user.phoneVerified || false,
                    },
                },
            })
        } else if (type === "phone") {
            // Check if OTP matches
            if (user.phoneOtp !== hashedInputOTP) {
                return NextResponse.json(
                    { success: false, error: "Mã OTP không đúng" },
                    { status: 400 }
                )
            }

            // Check if OTP expired
            if (new Date() > new Date(user.phoneOtpExpires)) {
                return NextResponse.json(
                    { success: false, error: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." },
                    { status: 400 }
                )
            }

            // Mark phone as verified
            await collection.updateOne(
                { email },
                {
                    $set: { phoneVerified: true },
                    $unset: { phoneOtp: "", phoneOtpExpires: "" },
                }
            )

            console.log("[verify-otp] Phone verified for:", email)

            return NextResponse.json({
                success: true,
                message: "Xác minh số điện thoại thành công!",
                data: {
                    phoneVerified: true,
                    user: {
                        id: user._id.toString(),
                        _id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                        phone: user.phone,
                        emailVerified: user.emailVerified || true,
                        phoneVerified: true,
                    },
                },
            })
        }

        return NextResponse.json(
            { success: false, error: "Invalid verification type" },
            { status: 400 }
        )
    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json(
            { success: false, error: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 }
        )
    }
}
