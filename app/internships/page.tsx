"use client"

import { Suspense, useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import { JobsListClient } from "@/components/jobs/jobs-list-client"
import { Briefcase, GraduationCap, Users, TrendingUp } from "lucide-react"
import { Job } from "@/lib/jobs-data"

const benefits = [
    {
        icon: GraduationCap,
        title: "Học hỏi thực tế",
        description: "Áp dụng kiến thức vào môi trường làm việc chuyên nghiệp"
    },
    {
        icon: Users,
        title: "Mở rộng mạng lưới",
        description: "Kết nối với chuyên gia và đồng nghiệp trong ngành"
    },
    {
        icon: Briefcase,
        title: "Kinh nghiệm quý báu",
        description: "Tích lũy kinh nghiệm để sẵn sàng cho sự nghiệp"
    },
    {
        icon: TrendingUp,
        title: "Cơ hội việc làm",
        description: "Nhiều công ty tuyển dụng chính thức từ thực tập sinh"
    }
]

export default function InternshipsPage() {
    const [internshipJobs, setInternshipJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchInternships() {
            try {
                const response = await fetch("/api/jobs")
                if (response.ok) {
                    const allJobs = await response.json()
                    // Filter for internship jobs (by type or title containing "thực tập" or "intern")
                    const filtered = allJobs.filter((job: Job) => {
                        const titleLower = job.title.toLowerCase()
                        const typeLower = (job.type || "").toLowerCase()
                        return (
                            typeLower === "internship" ||
                            typeLower === "thực tập" ||
                            typeLower === "part-time" ||
                            titleLower.includes("thực tập") ||
                            titleLower.includes("intern") ||
                            titleLower.includes("thực tập sinh")
                        )
                    })
                    setInternshipJobs(filtered)
                }
            } catch (error) {
                console.error("Error fetching internships:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchInternships()
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 via-background to-muted/30">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative py-20 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/internship-program-students-learning.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0077B6]/90 to-[#1e3a5f]/85" />

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <GraduationCap className="h-5 w-5 text-white" />
                            <span className="text-white font-medium">Dành cho sinh viên GDU</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white tracking-tight">
                            Cơ hội Thực tập hấp dẫn
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                            Bước chân đầu tiên vào thế giới nghề nghiệp - Khám phá hàng trăm vị trí thực tập từ các doanh nghiệp hàng đầu
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-white/80">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                                <Briefcase className="h-4 w-4" />
                                <span>500+ vị trí</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                                <Users className="h-4 w-4" />
                                <span>100+ doanh nghiệp</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                                <TrendingUp className="h-4 w-4" />
                                <span>Đa ngành nghề</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-gradient-to-b from-[#0077B6]/5 to-transparent py-12">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
                            Lợi ích khi tham gia thực tập
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                >
                                    <div className="w-12 h-12 bg-[#0077B6]/10 rounded-lg flex items-center justify-center mb-4">
                                        <benefit.icon className="h-6 w-6 text-[#0077B6]" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Jobs List */}
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">
                            Vị trí thực tập đang tuyển
                            {!loading && (
                                <span className="text-lg font-normal text-muted-foreground ml-2">
                                    ({internshipJobs.length} vị trí)
                                </span>
                            )}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077B6]"></div>
                            <p className="mt-4 text-muted-foreground">Đang tải danh sách thực tập...</p>
                        </div>
                    ) : internshipJobs.length > 0 ? (
                        <Suspense fallback={<div className="text-center py-20">Đang tải...</div>}>
                            <JobsListClient dbJobs={internshipJobs} />
                        </Suspense>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border">
                            <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Chưa có vị trí thực tập</h3>
                            <p className="text-muted-foreground mb-4">
                                Hiện tại chưa có vị trí thực tập nào. Vui lòng quay lại sau hoặc xem tất cả việc làm.
                            </p>
                            <a
                                href="/jobs"
                                className="inline-flex items-center gap-2 bg-[#0077B6] text-white px-6 py-3 rounded-lg hover:bg-[#0077B6]/90 transition-colors"
                            >
                                <Briefcase className="h-4 w-4" />
                                Xem tất cả việc làm
                            </a>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <SocialChatWidget />
        </div>
    )
}
