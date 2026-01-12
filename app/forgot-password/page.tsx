"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (data.success) {
                setIsSubmitted(true)
                toast({
                    title: "Email đã được gửi",
                    description: "Vui lòng kiểm tra hộp thư của bạn (cả mục spam).",
                })
            } else {
                toast({
                    title: "Lỗi",
                    description: data.error || "Có lỗi xảy ra. Vui lòng thử lại.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi kết nối",
                description: "Không thể kết nối đến máy chủ.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

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

                <Card className="shadow-xl border-0 ring-1 ring-gray-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Quên mật khẩu?</CardTitle>
                        <CardDescription className="text-base">
                            {isSubmitted
                                ? "Link khôi phục đã được gửi!"
                                : "Nhập email của bạn để nhận link đặt lại mật khẩu"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSubmitted ? (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <p className="text-gray-600">
                                    Chúng tôi đã gửi một email đến <strong>{email}</strong> với hướng dẫn đặt lại mật khẩu.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Nếu không thấy email, vui lòng kiểm tra thư mục Spam hoặc thử lại sau vài phút.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 font-medium">Email đăng ký</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@student.giadinh.edu.vn"
                                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Đang gửi..." : "Gửi link khôi phục"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="justify-center border-t border-gray-100 p-6 bg-gray-50/50">
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại đăng nhập
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
