"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { MapPin, Users, Briefcase, Star, CheckCircle, ArrowLeft, Globe, Mail, Phone, Building, Share2, Heart, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

interface Company {
    id: string
    name: string
    logo: string
    industry: string
    size: string
    location: string
    description: string
    openPositions: number
    rating: number
    verified: boolean
    benefits: string[]
    website?: string
    email?: string
    phone?: string
}

export default function CompanyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [company, setCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await fetch(`/api/companies/${params.id}`)
                const data = await response.json()
                if (data.company) {
                    setCompany(data.company)
                }
            } catch (error) {
                console.error("Failed to fetch company:", error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchCompany()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-64 w-full rounded-xl mb-6" />
                    <div className="flex gap-6">
                        <Skeleton className="w-32 h-32 rounded-lg" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="p-12 text-center max-w-lg w-full">
                        <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-bold mb-4">Không tìm thấy công ty</h2>
                        <p className="text-muted-foreground mb-6">Công ty bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button onClick={() => router.push("/companies")} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại danh sách
                        </Button>
                    </Card>
                </div>
                <Footer />
            </div>
        )
    }

    // Mock images for gallery placeholders - deterministic based on ID
    const galleryImages = [
        "/office-1.jpg",
        "/office-2.jpg",
        "/office-3.jpg",
        "/team-1.jpg"
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <main className="flex-1 pb-16">
                {/* Hero Banner Area */}
                <div className="relative h-[250px] md:h-[320px] bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                    <div className="container mx-auto px-4 h-full relative">
                        <Button
                            variant="ghost"
                            className="absolute top-4 left-4 text-white hover:bg-white/10 hover:text-white"
                            onClick={() => router.push("/companies")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
                        </Button>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-20 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Company Logo Box */}
                        <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border border-slate-100 bg-white flex items-center justify-center">
                                <img
                                    src={company.logo || "/placeholder.svg"}
                                    alt={company.name}
                                    className="w-full h-full object-contain p-2"
                                />
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="flex-1 pt-4 md:pt-24 text-slate-800">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                                        {company.name}
                                        {company.verified && <CheckCircle className="h-6 w-6 text-blue-500 fill-blue-50" />}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <Building className="h-4 w-4" />
                                            <span>{company.industry}</span>
                                        </div>
                                        <span className="hidden md:inline">•</span>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            <span>{company.location}</span>
                                        </div>
                                        <span className="hidden md:inline">•</span>
                                        <div className="flex items-center gap-1 text-yellow-600 font-medium">
                                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                            <span>{company.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Heart className="h-4 w-4 mr-2" /> Theo dõi
                                    </Button>
                                    <Button variant="outline">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mt-8">

                        {/* Left Column (Content) */}
                        <div className="md:col-span-2 space-y-8">

                            {/* Tabs Navigation */}
                            <Tabs defaultValue="about" className="w-full">
                                <TabsList className="w-full justify-start bg-white p-1 h-auto rounded-lg border shadow-sm mb-6">
                                    <TabsTrigger value="about" className="py-2.5 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Về chúng tôi</TabsTrigger>
                                    <TabsTrigger value="jobs" className="py-2.5 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Tuyển dụng <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">{company.openPositions}</Badge></TabsTrigger>
                                    <TabsTrigger value="culture" className="py-2.5 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Hình ảnh & Văn hóa</TabsTrigger>
                                </TabsList>

                                <TabsContent value="about" className="space-y-6">
                                    {/* Introduction */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-xl">Giới thiệu chung</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                                                {company.description}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Benefits */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-xl">Tại sao chọn {company.name}?</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {company.benefits.map((benefit, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <span className="font-medium text-slate-700 mt-1">{benefit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* General Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                                            <div className="text-3xl font-bold text-blue-600 mb-1">{company.size}</div>
                                            <div className="text-sm text-slate-500">Quy mô nhân sự</div>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                                            <div className="text-3xl font-bold text-blue-600 mb-1">{new Date().getFullYear() - 2010}+</div>
                                            <div className="text-sm text-slate-500">Năm thành lập</div>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                                            <div className="text-3xl font-bold text-blue-600 mb-1">Top 10</div>
                                            <div className="text-sm text-slate-500">Doanh nghiệp tiêu biểu</div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="jobs">
                                    <Card>
                                        <CardContent className="p-8 text-center pt-12 pb-12">
                                            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Briefcase className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Đang tuyển dụng {company.openPositions} vị trí</h3>
                                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                                Hãy khám phá các cơ hội nghề nghiệp hấp dẫn tại {company.name} và ứng tuyển ngay hôm nay.
                                            </p>

                                            <Link href={`/jobs?company=${encodeURIComponent(company.name)}`}>
                                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                                    Xem tất cả công việc
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="culture">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Placeholder gallery */}
                                        <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group cursor-pointer">
                                            <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80" alt="Office" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group cursor-pointer">
                                            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" alt="Team" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group cursor-pointer col-span-2">
                                            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80" alt="Meeting" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                    </div>
                                    <p className="text-center text-slate-500 mt-4 italic text-sm">
                                        *Hình ảnh minh họa không gian làm việc chuyên nghiệp
                                    </p>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Right Column (Sidebar) */}
                        <div className="space-y-6">

                            {/* Contact Card */}
                            <Card className="shadow-md border-t-4 border-t-blue-600">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Building className="h-5 w-5 text-blue-600" />
                                        Thông tin liên hệ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {company.website && (
                                        <div className="flex items-start gap-3">
                                            <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-500">Website</div>
                                                <a href={company.website} target="_blank" className="text-blue-600 hover:underline font-medium break-all">{company.website}</a>
                                            </div>
                                        </div>
                                    )}
                                    {company.email && (
                                        <div className="flex items-start gap-3">
                                            <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-500">Email</div>
                                                <a href={`mailto:${company.email}`} className="text-slate-900 hover:text-blue-600 break-all">{company.email}</a>
                                            </div>
                                        </div>
                                    )}
                                    {company.phone && (
                                        <div className="flex items-start gap-3">
                                            <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-500">Điện thoại</div>
                                                <a href={`tel:${company.phone}`} className="text-slate-900 hover:text-blue-600">{company.phone}</a>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3 pt-3 border-t">
                                        <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-500">Địa chỉ</div>
                                            <p className="text-slate-900 text-sm leading-relaxed">{company.location}</p>
                                        </div>
                                    </div>

                                    {/* Mock Map Placeholder */}
                                    <div className="w-full h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm mt-2">
                                        <MapPin className="h-6 w-6 mr-1" /> Bản đồ
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Similar Companies (Mock) */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Doanh nghiệp tương tự</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-24 mb-1" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
