"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Phone, GraduationCap, BookOpen, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "student" as "student" | "employer",
    studentId: "",
    major: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.name.trim()) return setError("Vui lòng nhập họ và tên")
    if (!formData.email.trim()) return setError("Vui lòng nhập email")
    if (!formData.email.endsWith("@gmail.com")) return setError("Vui lòng sử dụng địa chỉ Gmail (@gmail.com)")
    if (formData.password !== formData.confirmPassword) return setError("Mật khẩu xác nhận không khớp")
    if (formData.password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự")

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // For email register, we explicitly exclude phone to avoid any confusion or validation errors
        body: JSON.stringify({
          ...formData,
          phone: ""
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.needsVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
        } else {
          router.push("/login")
        }
      } else {
        setError(data.error || "Email đã được sử dụng")
      }
    } catch (err) {
      console.error("Register error:", err)
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.name.trim()) return setError("Vui lòng nhập họ và tên")
    if (!formData.phone.trim()) return setError("Vui lòng nhập số điện thoại")
    if (formData.password !== formData.confirmPassword) return setError("Mật khẩu xác nhận không khớp")
    if (formData.password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự")

    setIsLoading(true)
    try {
      // Create payload with only necessary fields + explicit null for email
      const payload = {
        ...formData,
        email: "", // Explicitly empty
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/verify-phone?email=${encodeURIComponent(data.email || "")}&phone=${encodeURIComponent(data.phone || "")}&otpSent=true`)
      } else {
        setError(data.error || "Số điện thoại đã được sử dụng")
      }
    } catch (err) {
      console.error("Register error:", err)
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-red-600 text-white font-bold px-3 py-2 rounded-lg group-hover:bg-red-700 transition-colors shadow-sm">
              <span className="text-xl">GDU</span>
            </div>
            <span className="font-bold text-2xl text-gray-900 tracking-tight">Career</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Đăng ký tài khoản</CardTitle>
            <CardDescription className="text-base">Mở khóa cơ hội nghề nghiệp của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100/80 rounded-xl">
                <TabsTrigger
                  value="email"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all duration-200 py-2.5 font-medium"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger
                  value="phone"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all duration-200 py-2.5 font-medium"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Số điện thoại
                </TabsTrigger>
              </TabsList>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <div className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
                  {error}
                </div>
              )}

              <TabsContent value="email" className="mt-0 animate-in fade-in slide-in-from-left-4 duration-300">
                <form onSubmit={handleEmailRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700 font-medium">Bạn là</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as "student" | "employer" })}
                    >
                      <SelectTrigger className="w-full px-4 py-2.5 h-[46px] border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all text-gray-900">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Sinh viên</SelectItem>
                        <SelectItem value="employer">Nhà tuyển dụng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">Họ và tên</Label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@gdu.edu.vn"
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  {formData.role === "student" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentId" className="text-gray-700 font-medium">MSSV</Label>
                        <div className="relative group">
                          <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                          <input
                            id="studentId"
                            name="studentId"
                            type="text"
                            value={formData.studentId}
                            onChange={handleChange}
                            placeholder="GDU..."
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="major" className="text-gray-700 font-medium">Ngành học</Label>
                        <div className="relative group">
                          <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                          <Select
                            value={formData.major}
                            onValueChange={(value) => setFormData({ ...formData, major: value })}
                          >
                            <SelectTrigger className="w-full pl-11 pr-4 py-2.5 h-[46px] border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all text-gray-900 data-[placeholder]:text-gray-400">
                              <SelectValue placeholder="Chọn ngành học" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Công nghệ thông tin">Công nghệ thông tin</SelectItem>
                              <SelectItem value="Quản trị kinh doanh">Quản trị kinh doanh</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Tài chính ngân hàng">Tài chính ngân hàng</SelectItem>
                              <SelectItem value="Kế toán">Kế toán</SelectItem>
                              <SelectItem value="Ngôn ngữ Anh">Ngôn ngữ Anh</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
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
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Xác nhận mật khẩu</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone" className="mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handlePhoneRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="role_p" className="text-gray-700 font-medium">Bạn là</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as "student" | "employer" })}
                    >
                      <SelectTrigger className="w-full px-4 py-2.5 h-[46px] border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all text-gray-900">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Sinh viên</SelectItem>
                        <SelectItem value="employer">Nhà tuyển dụng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name_p" className="text-gray-700 font-medium">Họ và tên</Label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      <input
                        id="name_p"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_p" className="text-gray-700 font-medium">Số điện thoại</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      <input
                        id="phone_p"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value
                          if (/\D/.test(val)) setPhoneError("Chỉ được nhập số")
                          else {
                            const numericVal = val.replace(/\D/g, '')
                            if (numericVal.length > 0 && !numericVal.startsWith('0')) setPhoneError("Phải bắt đầu 0")
                            else setPhoneError("")

                            setFormData({ ...formData, phone: numericVal.startsWith('0') || numericVal.length === 0 ? numericVal : '' })
                          }
                        }}
                        placeholder="0901234567"
                        className={phoneError ? "w-full pl-11 pr-4 py-2.5 border border-red-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50 transition-all placeholder:text-gray-400" : "w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"}
                        required
                      />
                      {phoneError && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{phoneError}</p>}
                    </div>
                  </div>

                  {formData.role === "student" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentId_p" className="text-gray-700 font-medium">MSSV</Label>
                        <div className="relative group">
                          <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                          <input
                            id="studentId_p"
                            name="studentId"
                            type="text"
                            value={formData.studentId}
                            onChange={handleChange}
                            placeholder="GDU..."
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="major_p" className="text-gray-700 font-medium">Ngành học</Label>
                        <div className="relative group">
                          <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                          <select
                            id="major_p"
                            name="major"
                            value={formData.major}
                            onChange={handleChange}
                            className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white appearance-none transition-all placeholder:text-gray-400"
                          >
                            <option value="">Chọn ngành học</option>
                            <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                            <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Tài chính ngân hàng">Tài chính ngân hàng</option>
                            <option value="Kế toán">Kế toán</option>
                            <option value="Ngôn ngữ Anh">Ngôn ngữ Anh</option>
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password_p" className="text-gray-700 font-medium">Mật khẩu</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      <input
                        id="password_p"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
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
                    <Label htmlFor="confirmPassword_p" className="text-gray-700 font-medium">Xác nhận mật khẩu</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      <input
                        id="confirmPassword_p"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? "Đang xử lý..." : "Đăng ký bằng SĐT"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center border-t border-gray-100 p-6 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-red-600 hover:text-red-700 hover:underline font-semibold transition-colors">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
