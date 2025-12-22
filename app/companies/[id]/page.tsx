"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, Users, Briefcase, Star, CheckCircle, ArrowLeft, Globe, Mail, Phone, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

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
            <div className="min-h-screen bg-background py-8">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-8 w-32 mb-6" />
                    <Card className="p-8">
                        <div className="flex gap-6">
                            <Skeleton className="w-32 h-32 rounded-lg" />
                            <div className="flex-1 space-y-4">
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-background py-8">
                <div className="container mx-auto px-4">
                    <Card className="p-12 text-center">
                        <h2 className="text-xl font-bold mb-4">Không tìm thấy công ty</h2>
                        <p className="text-muted-foreground mb-6">Công ty bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button onClick={() => router.push("/companies")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại danh sách
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Button variant="ghost" onClick={() => router.push("/companies")} className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại danh sách
                </Button>

                {/* Company Header */}
                <Card className="p-8 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex flex-col md:flex-row gap-6">
                        <img
                            src={company.logo || "/placeholder.svg?height=128&width=128"}
                            alt={company.name}
                            className="w-32 h-32 rounded-lg object-cover border-2 border-border"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
                                {company.verified && (
                                    <CheckCircle className="h-6 w-6 text-secondary" />
                                )}
                            </div>
                            <Badge variant="secondary" className="mb-3 text-sm">
                                {company.industry}
                            </Badge>
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-lg font-semibold">{company.rating}</span>
                                <span className="text-muted-foreground">/ 5.0</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{company.description}</p>
                        </div>
                    </div>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Company Info */}
                    <Card className="p-6 md:col-span-2">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            Thông tin công ty
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Địa điểm</p>
                                    <p className="text-muted-foreground">{company.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Quy mô</p>
                                    <p className="text-muted-foreground">{company.size}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Vị trí đang tuyển</p>
                                    <p className="text-primary font-semibold">{company.openPositions} vị trí</p>
                                </div>
                            </div>
                            {company.website && (
                                <div className="flex items-start gap-3">
                                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Website</p>
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {company.website}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {company.email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                                            {company.email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {company.phone && (
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Điện thoại</p>
                                        <a href={`tel:${company.phone}`} className="text-primary hover:underline">
                                            {company.phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Benefits */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4">Phúc lợi</h2>
                        <div className="flex flex-wrap gap-2">
                            {company.benefits.map((benefit, index) => (
                                <Badge key={index} variant="outline" className="text-sm py-1.5">
                                    {benefit}
                                </Badge>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <Link href={`/jobs?company=${encodeURIComponent(company.name)}`}>
                                <Button className="w-full bg-primary hover:bg-primary/90">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    Xem {company.openPositions} vị trí đang tuyển
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
