"use client"

import type React from "react"

import { useState, useRef } from "react"
import { User, Mail, Phone, GraduationCap, Briefcase, Save, Upload, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    studentId: user?.studentId || "",
    major: user?.major || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateProfile(formData)
    setIsEditing(false)
    setIsSaving(false)
    toast({ title: "Đã lưu", description: "Thông tin hồ sơ đã được cập nhật." })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", user.id)

    try {
      const response = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (data.success) {
        await updateProfile({ avatar: data.url })
        toast({ title: "Thành công", description: "Ảnh đại diện đã được cập nhật." })
      } else {
        toast({ title: "Lỗi", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({ title: "Lỗi", description: "Không thể tải ảnh lên.", variant: "destructive" })
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 rounded-full hover:bg-accent transition-colors">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold overflow-hidden border-2 border-background shadow-md">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "U"
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Upload className="h-6 w-6 text-white" />}
              </div>
              <button
                className="absolute bottom-0 right-0 bg-secondary text-secondary-foreground p-2 rounded-full shadow-lg hover:bg-secondary/90 transition-colors z-10"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.role === "student"
                  ? "Sinh viên"
                  : user?.role === "employer"
                    ? "Nhà tuyển dụng"
                    : "Quản trị viên"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value
                    if (/\D/.test(val)) {
                      toast({ title: "Lỗi định dạng", description: "Số điện thoại chỉ được chứa các chữ số.", variant: "destructive" })
                    }
                    const numericVal = val.replace(/\D/g, '')
                    if (numericVal.length > 0 && !numericVal.startsWith('0')) {
                      toast({ title: "Lỗi định dạng", description: "Số điện thoại phải bắt đầu bằng số 0.", variant: "destructive" })
                    }
                    setFormData({ ...formData, phone: numericVal.startsWith('0') || numericVal.length === 0 ? numericVal : '' })
                  }}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {user?.role === "student" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Mã số sinh viên</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="studentId"
                      name="studentId"
                      type="text"
                      value={formData.studentId}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Ngành học</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed bg-background"
                    >
                      <option value="">Chọn ngành học</option>
                      <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                      <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Tài chính ngân hàng">Tài chính ngân hàng</option>
                      <option value="Kế toán">Kế toán</option>
                      <option value="Ngôn ngữ Anh">Ngôn ngữ Anh</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
