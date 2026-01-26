"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Phone, ShieldCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const isPending = searchParams.get("pending") === "true"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [needs2FA, setNeeds2FA] = useState(false)

  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Email Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await response.json()

      if (data.needs2FA) {
        setNeeds2FA(true)
        toast({
          title: "Xác thực 2 lớp",
          description: "Một mã OTP đã được gửi đến email của bạn.",
        })
      } else if (data.success && data.user) {
        localStorage.setItem("gdu_user", JSON.stringify(data.user))
        window.location.href = "/"
      } else if (data.needsVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
      } else {
        setError(data.error || "Email hoặc mật khẩu không đúng")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  // 2FA Verification Handler
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        localStorage.setItem("gdu_user", JSON.stringify(data.user))
        window.location.href = "/"
      } else {
        setError(data.error || "Mã OTP không chính xác")
      }
    } catch (error) {
      console.error("[v0] 2FA error:", error)
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
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
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
              {needs2FA ? "Xác thực 2 lớp" : "Chào mừng trở lại"}
            </CardTitle>
            <CardDescription className="text-base">
              {needs2FA ? "Vui lòng nhập mã OTP được gửi tới email của bạn" : "Đăng nhập để tiếp tục"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && (
              <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm p-4 rounded-xl mb-6 flex flex-col gap-1 animate-in fade-in zoom-in-95">
                <div className="font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  Đang chờ phê duyệt
                </div>
                <p className="text-blue-600/80">Tài khoản của bạn đã được xác minh. Vui lòng chờ Admin kiểm tra và phê duyệt thông tin doanh nghiệp.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-2 animate-in fade-in zoom-in-95">
                <div className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}

            {!needs2FA ? (
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-1">
                    Hỗ trợ: @student.giadinh.edu.vn, @gmail.com, @outlook.com...
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                      required
                      autoComplete="current-password"
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

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-600 group-hover:border-red-400 transition-colors" />
                    <span className="text-gray-600 group-hover:text-gray-800 transition-colors">Ghi nhớ đăng nhập</span>
                  </label>
                  <Link href="/forgot-password" className="text-red-600 hover:text-red-700 hover:underline font-medium transition-colors">
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerify2FA} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-700 font-medium text-center block">Nhập mã xác thực</Label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Nhập 6 số OTP"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all text-center text-xl font-bold tracking-[0.5em] placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
                      required
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Mã đã được gửi đến: <span className="font-semibold text-gray-900">{email}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? "Đang xác thực..." : "Xác nhận OTP"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setNeeds2FA(false)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors py-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t border-gray-100 p-6 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-red-600 hover:text-red-700 hover:underline font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
