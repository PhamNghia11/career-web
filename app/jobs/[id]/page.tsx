import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, DollarSign, Clock, Building, ChevronLeft, Calendar, CheckCircle2, Briefcase, Globe, Users, Award } from "lucide-react"
import Link from "next/link"
import { allJobs } from "@/lib/jobs-data"
import { ApplyButton } from "@/components/jobs/apply-button"
import { Separator } from "@/components/ui/separator"

interface JobPageProps {
    params: Promise<{
        id: string
    }>
}

export function generateStaticParams() {
    return allJobs.map((job) => ({
        id: job._id,
    }))
}

export default async function JobPage(props: JobPageProps) {
    const params = await props.params;
    let job = allJobs.find((j) => j._id === params.id)

    // Fallback: Try to fetch from DB if not found in static
    if (!job) {
        try {
            const { getCollection, COLLECTIONS } = await import("@/lib/mongodb")
            const { ObjectId } = await import("mongodb")
            const collection = await getCollection(COLLECTIONS.JOBS)

            try {
                const dbJob = await collection.findOne({ _id: new ObjectId(params.id) })
                if (dbJob) {
                    job = { ...dbJob, _id: dbJob._id.toString() } as any
                }
            } catch (e) {
                // Ignore invalid ID
            }
        } catch (error) {
            console.error("Error fetching job from DB:", error)
        }
    }

    if (!job) {
        notFound()
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Header />

            {/* Hero Section */}
            <div className="relative bg-[#1e3a5f] py-16">
                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-20 blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <Link href="/jobs" className="inline-flex items-center text-blue-100 hover:text-white mb-8 transition-colors text-sm font-medium">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại danh sách
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-4 flex items-center justify-center shadow-lg flex-shrink-0">
                            {job.logo ? (
                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                            ) : (
                                <Building className="h-12 w-12 text-gray-400" />
                            )}
                        </div>

                        <div className="flex-1 text-white">
                            <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-blue-100/90 text-base md:text-lg">
                                <span className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    {job.company}
                                </span>
                                <span className="hidden md:inline text-blue-100/30">•</span>
                                <span className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    {job.location}
                                </span>
                                <span className="hidden md:inline text-blue-100/30">•</span>
                                <Badge className="bg-white/10 hover:bg-white/20 text-white border-none px-3 py-1">
                                    {job.type === "full-time" ? "Toàn thời gian" :
                                        job.type === "part-time" ? "Bán thời gian" :
                                            job.type === "internship" ? "Thực tập" : "Freelance"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 -mt-8 relative z-20 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardContent className="p-8 md:p-10 space-y-10">
                                {/* Description Section */}
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-[#1e3a5f]">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        Mô tả công việc
                                    </h2>
                                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-base md:text-lg">
                                        {job.description}
                                    </div>
                                </section>

                                <Separator />

                                {/* Requirements Section */}
                                {job.requirements && (
                                    <section className="space-y-4">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-[#1e3a5f]">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            Yêu cầu ứng viên
                                        </h2>
                                        <ul className="grid gap-3">
                                            {job.requirements.map((req, index) => (
                                                <li key={index} className="flex items-start gap-4 text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100/50">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-base">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                <Separator />

                                {/* Benefits Section */}
                                {job.benefits && (
                                    <section className="space-y-4">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-[#1e3a5f]">
                                                <Award className="h-6 w-6" />
                                            </div>
                                            Quyền lợi
                                        </h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {job.benefits.map((benefit, index) => (
                                                <div key={index} className="flex items-center gap-3 text-gray-700 bg-blue-50/30 p-4 rounded-xl border border-blue-50">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                    <span className="font-medium">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar (Right) - Sticky */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Key Info Card */}
                            <Card className="border-none shadow-lg bg-white ring-1 ring-gray-100">
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                            Thông tin chung
                                        </h3>

                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-blue-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mức lương</p>
                                                        <p className="text-gray-900 font-bold">{job.salary}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-blue-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                                        <Clock className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Hạn nộp</p>
                                                        <p className="text-gray-900 font-bold">{job.deadline}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-blue-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                                        <Users className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Số lượng</p>
                                                        <p className="text-gray-900 font-bold">--</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-blue-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ngày đăng</p>
                                                        <p className="text-gray-900 font-bold">{new Date(job.postedAt).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="my-4" />

                                        <ApplyButton
                                            jobId={job._id}
                                            jobTitle={job.title}
                                            company={job.company}
                                        />

                                        <p className="text-center text-xs text-gray-400 mt-3">
                                            Bằng việc ấn vào nút thông báo tuyển dụng này bạn đồng ý với các điều khoản dịch vụ
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Company Info Mini Card (Optional) */}
                            <Card className="border-none shadow-md bg-white">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Globe className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Website công ty</p>
                                            <a
                                                href={job.website || "#"}
                                                target={job.website ? "_blank" : "_self"}
                                                rel="noopener noreferrer"
                                                className={`text-sm ${job.website ? "text-blue-600 hover:underline" : "text-gray-500 cursor-default"} truncate block max-w-[200px]`}
                                            >
                                                {job.website || "Đang cập nhật"}
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <SocialChatWidget />
        </div>
    )
}

