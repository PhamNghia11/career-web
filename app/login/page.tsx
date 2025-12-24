"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Phone Login State
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)

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
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        localStorage.setItem("gdu_user", JSON.stringify(data.user))
        window.location.href = "/dashboard"
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

  // Phone Login Handlers
  const handleSendOtp = async () => {
    if (!phone) {
      setError("Vui lòng nhập số điện thoại")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, type: "phone" }), // Send only phone
      })

      const data = await response.json()

      if (data.success) {
        setIsOtpSent(true)
        setOtpCountdown(60)
        toast({
          title: "Đã gửi mã OTP",
          description: "Vui lòng kiểm tra tin nhắn điện thoại",
        })

        // Countdown timer
        const timer = setInterval(() => {
          setOtpCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || "Không thể gửi mã OTP")
      }
    } catch (error) {
      console.error("Send OTP error:", error)
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) {
      setError("Vui lòng nhập mã OTP")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, type: "phone" }),
      })

      const data = await response.json()

      if (data.success && data.data?.user) {
        localStorage.setItem("gdu_user", JSON.stringify(data.data.user))
        window.location.href = "/dashboard"
      } else {
        setError(data.error || "Mã OTP không đúng")
      }
    } catch (error) {
      console.error("Verify OTP error:", error)
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
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
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
            <CardDescription>Chọn phương thức đăng nhập</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Số điện thoại</TabsTrigger>
              </TabsList>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>
              )}

              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@gdu.edu.vn"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span>Ghi nhớ đăng nhập</span>
                    </label>
                    <Link href="/forgot-password" className="text-blue-600 hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                <form onSubmit={handlePhoneLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0901234567"
                        className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                        disabled={isOtpSent}
                        autoComplete="tel"
                      />
                      {(!isOtpSent || otpCountdown <= 0) && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isLoading || !phone || (isOtpSent && otpCountdown > 0)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          {isOtpSent ? "Gửi lại" : "Gửi mã"}
                        </button>
                      )}
                      {isOtpSent && otpCountdown > 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 px-2 py-1">
                          {otpCountdown}s
                        </span>
                      )}
                    </div>
                  </div>

                  {isOtpSent && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="otp">Mã xác minh (OTP)</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="otp"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Nhập 6 số OTP"
                          maxLength={6}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading || !isOtpSent}>
                    {isLoading ? "Đang xử lý..." : "Đăng nhập bằng SĐT"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
