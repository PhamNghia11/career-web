"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Chào mừng trở lại</CardTitle>
            <CardDescription className="text-base">Đăng nhập để tiếp tục</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-2 animate-in fade-in zoom-in-95">
                <div className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}

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
