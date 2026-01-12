"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")
    const { toast } = useToast()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            toast({ title: "Lỗi", description: "Link không hợp lệ hoặc thiếu token.", variant: "destructive" })
            return
        }

        if (password !== confirmPassword) {
            toast({ title: "Lỗi", description: "Mật khẩu nhập lại không khớp.", variant: "destructive" })
            return
        }

        if (password.length < 6) {
            toast({ title: "Lỗi", description: "Mật khẩu phải có ít nhất 6 ký tự.", variant: "destructive" })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            })

            const data = await response.json()

            if (data.success) {
                setIsSuccess(true)
                toast({
                    title: "Thành công",
                    description: "Mật khẩu đã được thay đổi. Bạn có thể đăng nhập ngay.",
                })
                setTimeout(() => router.push("/login"), 3000)
            } else {
                toast({
                    title: "Lỗi",
                    description: data.error || "Link đã hết hạn hoặc không hợp lệ.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi kết nối",
                description: "Có lỗi xảy ra. Vui lòng thử lại.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-4 py-8 max-w-md mx-auto">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 outline outline-4 outline-green-50">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu thành công!</h2>
                <p className="text-gray-600">
                    Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát.
                </p>
                <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                    <Link href="/login">Đăng nhập ngay</Link>
                </Button>
            </div>
        )
    }

    return (
        <Card className="shadow-xl border-0 ring-1 ring-gray-200/50 bg-white/80 backdrop-blur-sm w-full">
            <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Đặt lại mật khẩu</CardTitle>
                <CardDescription className="text-base">Nhập mật khẩu mới cho tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu mới</Label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ít nhất 6 ký tự"
                                className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex flex-col items-center gap-2 group">
                        <img
                            src="/gdu-logo.png"
                            alt="GDU Logo"
                            className="h-24 w-auto object-contain"
                        />
                    </Link>
                </div>

                <Suspense fallback={<div className="text-center">Đang tải...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
