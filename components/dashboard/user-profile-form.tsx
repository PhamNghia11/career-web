"use client"

import type React from "react"
import { useState, useRef } from "react"
import { User, Mail, Phone, Save, Upload, Loader2, Edit2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"

interface UserProfileFormProps {
    title?: string
    description?: string
    className?: string
}

export function UserProfileForm({
    title = "Thông tin cá nhân",
    description = "Cập nhật thông tin cá nhân của bạn",
    className
}: UserProfileFormProps) {
    const { user, updateProfile } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [phoneError, setPhoneError] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
    })

    // Synchronize form data with user data when not editing
    // useEffect(() => {
    //   if (!isEditing && user) {
    //     setFormData({
    //       name: user.name || "",
    //       email: user.email || "",
    //       phone: user.phone || "",
    //     })
    //   }
    // }, [user, isEditing])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        setIsSaving(true)
        await updateProfile({
            name: formData.name,
            phone: formData.phone
            // Email is usually not editable or requires special handling, but let's keep it consistent
        })
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
        formData.append("userId", user?.id || "")

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
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                Hủy
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar Section */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
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
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Chạm để đổi ảnh</p>
                    </div>

                    {/* Fields Section */}
                    <div className="flex-1 space-y-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                setPhoneError("Số điện thoại chỉ được chứa các chữ số")
                                            } else {
                                                setPhoneError("")
                                            }
                                            const numericVal = val.replace(/\D/g, '')
                                            // Just simple update, strict validation can be added on save if needed
                                            setFormData({ ...formData, phone: numericVal })
                                        }}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                                    />
                                </div>
                                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        disabled={true} // Email is usually immutable
                                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none bg-muted cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
