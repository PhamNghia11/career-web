"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Phone, RefreshCw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

function VerifyPhoneContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const email = searchParams.get("email") || ""
    const phone = searchParams.get("phone") || ""

    const otpSent = searchParams.get("otpSent") === "true"

    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")
    const [countdown, setCountdown] = useState(0)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Helper to fetch user phone
    useEffect(() => {
        if ((email || phone)) {
            if (otpSent && countdown === 0) {
                // Optimization: If we just came from register with OTP sent, don't resend immediately.
                // Just start countdown.
                setCountdown(60);
            } else if (countdown === 0) {
                handleResend()
            }
        }
    }, []) // Run onceHTML

    // Countdown for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return // Only digits

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1) // Only last character
        setOtp(newOtp)
        setError("")

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all filled
        if (newOtp.every(d => d) && newOtp.join("").length === 6) {
            handleVerify(newOtp.join(""))
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        const newOtp = [...otp]
        pastedData.split("").forEach((char, i) => {
            if (i < 6) newOtp[i] = char
        })
        setOtp(newOtp)
        const lastIndex = Math.min(pastedData.length - 1, 5)
        inputRefs.current[lastIndex]?.focus()
        if (pastedData.length === 6) {
            handleVerify(pastedData)
        }
    }

    const handleVerify = async (otpCode: string) => {
        if (otpCode.length !== 6) {
            setError("Vui lòng nhập đủ 6 số")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, phone, otp: otpCode, type: "phone" }),
            })

            const data = await response.json()

            if (data.success) {
                setIsSuccess(true)

                // Update local storage user if returned
                if (data.data?.user) {
                    localStorage.setItem("gdu_user", JSON.stringify(data.data.user))
                }

                toast({
                    title: "Xác minh SĐT thành công!",
                    description: "Tài khoản của bạn đã hoàn toàn kích hoạt.",
                })

                setTimeout(() => {
                    router.push("/dashboard")
                }, 2000)
            } else {
                setError(data.error || "Mã OTP không đúng")
                setOtp(["", "", "", "", "", ""])
                inputRefs.current[0]?.focus()
            }
        } catch (err) {
            console.error("Verify error:", err)
            setError("Có lỗi xảy ra. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        setIsResending(true)
        setError("")

        try {
            const response = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, phone, type: "phone" }),
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Đã gửi mã SMS",
                    description: "Vui lòng kiểm tra tin nhắn điện thoại.",
                })
                setCountdown(60)
                setOtp(["", "", "", "", "", ""])
                // Focus first input
                setTimeout(() => inputRefs.current[0]?.focus(), 100)
            } else {
                setError(data.error || "Không thể gửi tin nhắn SMS")
                // If phone number is missing, maybe redirect to update profile?
                if (data.error?.includes("số điện thoại")) {
                    // Optional: handle missing phone
                }
            }
        } catch (err) {
            console.error("Resend error:", err)
            setError("Có lỗi xảy ra.")
        } finally {
            setIsResending(false)
        }
    }

    if (!email && !phone) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <p>Thiếu thông tin xác minh (Email hoặc SĐT).</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="bg-red-600 text-white font-bold px-3 py-2 rounded">
                            <span className="text-xl">GDU</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">Career</span>
                    </Link>
                </div>

                <Card className="shadow-lg border-0">
                    {isSuccess ? (
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tất cả đã xong!</h2>
                                <p className="text-gray-600 mb-4">Chào mừng bạn đến với GDU Career Portal.</p>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        </CardContent>
                    ) : (
                        <>
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Phone className="h-8 w-8 text-blue-600" />
                                </div>
                                <CardTitle className="text-2xl font-bold">Xác minh Số điện thoại</CardTitle>
                                <CardDescription className="mt-2">
                                    Chúng tôi đã gửi mã xác minh SMS đến SĐT của bạn
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="flex justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => { inputRefs.current[index] = el }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleChange(index, e.target.value)}
                                            onKeyDown={e => handleKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            disabled={isLoading}
                                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    ))}
                                </div>

                                <Button
                                    onClick={() => handleVerify(otp.join(""))}
                                    disabled={isLoading || otp.some(d => !d)}
                                    className="w-full bg-red-600 hover:bg-red-700"
                                >
                                    {isLoading ? "Đang xác minh..." : "Xác minh & Hoàn tất"}
                                </Button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-2">Không nhận được mã?</p>
                                    <Button
                                        variant="ghost"
                                        onClick={handleResend}
                                        disabled={isResending || countdown > 0}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isResending ? "animate-spin" : ""}`} />
                                        {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại SMS"}
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default function VerifyPhonePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyPhoneContent />
        </Suspense>
    )
}
