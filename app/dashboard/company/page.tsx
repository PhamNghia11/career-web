"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, Globe, MapPin, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { UserProfileForm } from "@/components/dashboard/user-profile-form"

export default function CompanyPage() {
    const { user } = useAuth()
    const { toast } = useToast()

    // Mock initial state - in real app, fetch from User profile or Company collection
    const [formData, setFormData] = useState({
        companyName: "Công ty của " + (user?.name || ""),
        website: "",
        address: "",
        description: "",
        size: "10-50 nhân viên"
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate API call
        setTimeout(() => {
            toast({ title: "Thành công", description: "Thông tin công ty đã được cập nhật." })
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-foreground">
                    Hồ sơ công ty
                </h1>
                <p className="text-muted-foreground mt-1">
                    Cập nhật thông tin công ty để thu hút ứng viên
                </p>
            </div>

            {/* Representative Info Section */}
            <UserProfileForm
                title="Thông tin người đại diện"
                description="Thông tin cá nhân của người quản lý tài khoản này"
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Logo & Basic Info */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader className="text-center">
                        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4 border-2 border-dashed relative group cursor-pointer overflow-hidden">
                            <Building className="h-10 w-10 text-muted-foreground group-hover:hidden" />
                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-xs font-medium">
                                Đổi Logo
                            </div>
                        </div>
                        <CardTitle>{formData.companyName || "Tên công ty"}</CardTitle>
                        <CardDescription>Nhà tuyển dụng</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            {formData.website || "Chưa có website"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {formData.address || "Chưa cập nhật địa chỉ"}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Edit Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Chỉnh sửa thông tin</CardTitle>
                        <CardDescription>Thông tin này sẽ hiển thị trên các tin tuyển dụng của bạn.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="companyName">Tên công ty</Label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Nhập tên công ty"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="size">Quy mô công ty</Label>
                                    <Input
                                        id="size"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: 50-100 nhân viên"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Địa chỉ trụ sở</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Số nhà, đường, quận/huyện..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Giới thiệu về công ty</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Mô tả ngắn gọn về công ty, văn hóa, lĩnh vực hoạt động..."
                                    rows={5}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit">Lưu thay đổi</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
