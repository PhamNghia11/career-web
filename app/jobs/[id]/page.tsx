import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, DollarSign, Clock, Building, ChevronLeft, Calendar, CheckCircle2, Briefcase } from "lucide-react"
import Link from "next/link"
import { allJobs } from "@/lib/jobs-data"
import { ApplyButton } from "@/components/jobs/apply-button"

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

    if (!job) {
        try {
            const { getCollection, COLLECTIONS } = await import("@/lib/mongodb")
            const { ObjectId } = await import("mongodb")
            const collection = await getCollection(COLLECTIONS.JOBS)

            try {
                // Try to find by ObjectId
                const dbJob = await collection.findOne({ _id: new ObjectId(params.id) })
                if (dbJob) {
                    job = { ...dbJob, _id: dbJob._id.toString() } as any
                }
            } catch (e) {
                // If ID is not valid ObjectId, just ignore
            }
        } catch (error) {
            console.error("Error fetching job from DB:", error)
        }
    }

    if (!job) {
        notFound()
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4">
                    <Link href="/jobs" className="inline-flex items-center text-gray-500 hover:text-[#1e3a5f] mb-6 transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại danh sách việc làm
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header Card */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-24 h-24 rounded-xl border border-gray-100 bg-white p-4 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            {job.logo ? (
                                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                            ) : (
                                                <Building className="h-10 w-10 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                                            <div className="flex items-center gap-2 text-lg text-gray-600 font-medium mb-4">
                                                <Building className="h-5 w-5" />
                                                {job.company}
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 px-3 py-1 text-sm">
                                                    {job.type === "full-time" ? "Toàn thời gian" :
                                                        job.type === "part-time" ? "Bán thời gian" :
                                                            job.type === "internship" ? "Thực tập" : "Freelance"}
                                                </Badge>
                                                <span className="flex items-center gap-1.5 text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    Hạn nộp: {job.deadline}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Description */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-8 space-y-8">
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-[#1e3a5f]" />
                                            Mô tả công việc
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed">{job.description}</p>
                                    </section>

                                    {job.requirements && (
                                        <section>
                                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-[#1e3a5f]" />
                                                Yêu cầu ứng viên
                                            </h2>
                                            <ul className="space-y-3">
                                                {job.requirements.map((req, index) => (
                                                    <li key={index} className="flex items-start gap-3 text-gray-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                                                        {req}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}

                                    {job.benefits && (
                                        <section>
                                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <DollarSign className="h-5 w-5 text-[#1e3a5f]" />
                                                Quyền lợi
                                            </h2>
                                            <ul className="space-y-3">
                                                {job.benefits.map((benefit, index) => (
                                                    <li key={index} className="flex items-start gap-3 text-gray-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                                                        {benefit}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-sm sticky top-24">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="font-bold text-lg text-gray-900">Thông tin chung</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <DollarSign className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Mức lương</p>
                                                <p className="text-gray-900 font-semibold">{job.salary}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Địa điểm</p>
                                                <p className="text-gray-900 font-semibold">{job.location}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Ngày đăng</p>
                                                <p className="text-gray-900 font-semibold">{job.postedAt}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <ApplyButton
                                            jobId={job._id}
                                            jobTitle={job.title}
                                            company={job.company}
                                        />
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

