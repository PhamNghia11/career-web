"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, Globe, MapPin, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileForm } from "@/components/dashboard/user-profile-form"

export default function CompanyPage() {
    const { user } = useAuth()
    const { toast } = useToast()

    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const handleLogoClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        // In a real app, this would be a separate API endpoint for company logos

        // Simulating upload for UI feedback
        setTimeout(() => {
            setIsUploading(false)
            toast({ title: "Thành công", description: "Logo công ty đã được cập nhật." })
        }, 1500)
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

            <Tabs defaultValue="company" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="company">Thông tin công ty</TabsTrigger>
                    <TabsTrigger value="representative">Thông tin người đại diện</TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chỉnh sửa thông tin</CardTitle>
                            <CardDescription>Thông tin này sẽ hiển thị trên các tin tuyển dụng của bạn.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Logo Upload */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border-2 border-dashed relative group cursor-pointer overflow-hidden flex-shrink-0"
                                        onClick={handleLogoClick}
                                    >
                                        <Building className="h-8 w-8 text-muted-foreground group-hover:hidden" />
                                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-[10px] font-medium text-center p-1">
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Đổi Logo"}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleFileChange}
                                    />
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-sm">Logo công ty</h4>
                                        <p className="text-xs text-muted-foreground">Khuyến nghị: Tỉ lệ 1:1, tối đa 2MB.</p>
                                    </div>
                                </div>

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
                </TabsContent>

                <TabsContent value="representative">
                    <UserProfileForm
                        title="Thông tin người đại diện"
                        description="Thông tin cá nhân của người quản lý tài khoản này"
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
