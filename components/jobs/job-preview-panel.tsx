import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Job } from "@/lib/jobs-data"
import { Building, MapPin, DollarSign, Clock, CheckCircle2, Award, Briefcase } from "lucide-react"
import Link from "next/link"

interface JobPreviewPanelProps {
    job: Job | null
    onApply: (job: Job) => void
    onSave: (job: Job) => void
    isSaved: boolean
}

export function JobPreviewPanel({ job, onApply, onSave, isSaved }: JobPreviewPanelProps) {
    if (!job) {
        return (
            <Card className="h-full border-dashed flex flex-col items-center justify-center text-center p-8 text-gray-400 bg-gray-50/50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Xem nhanh công việc</h3>
                <p className="text-sm max-w-xs">Di chuột vào một tin tuyển dụng bên trái để xem chi tiết tại đây</p>
            </Card>
        )
    }

    return (
        <Card className="h-full flex flex-col overflow-hidden shadow-none rounded-none bg-white">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2b528a] p-6 text-white shrink-0">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-md">
                        {job.logo ? (
                            <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                        ) : (
                            <Building className="h-8 w-8 text-gray-400" />
                        )}
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                        {job.type === 'full-time' ? 'Toàn thời gian' : job.type === 'part-time' ? 'Bán thời gian' : job.type === 'internship' ? 'Thực tập' : 'Freelance'}
                    </Badge>
                </div>
                <h2 className="text-xl font-bold mb-2 leading-tight">{job.title}</h2>
                <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                    <Building className="h-4 w-4" />
                    {job.company}
                </div>
            </div>

            <ScrollArea className="flex-1 bg-white">
                <div className="p-6 space-y-6">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase mb-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                Mức lương
                            </div>
                            <div className="font-semibold text-gray-900">{job.salary}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase mb-1">
                                <MapPin className="h-3.5 w-3.5" />
                                Địa điểm
                            </div>
                            <div className="font-semibold text-gray-900 truncate" title={job.location}>{job.location}</div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-4">
                        {/* Description */}
                        <div>
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                                <Briefcase className="h-4 w-4 text-primary" />
                                Mô tả công việc
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                                {job.description}
                            </p>
                        </div>

                        {/* Requirements Preview */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    Yêu cầu (Tóm tắt)
                                </h4>
                                <ul className="space-y-1">
                                    {job.requirements.slice(0, 3).map((req: string, i: number) => (
                                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                                            <span className="line-clamp-1">{req}</span>
                                        </li>
                                    ))}
                                    {job.requirements.length > 3 && (
                                        <li className="text-xs text-primary font-medium pl-3.5">+ xem thêm {job.requirements.length - 3} yêu cầu khác</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Benefits Preview */}
                        {job.benefits && job.benefits.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                                    <Award className="h-4 w-4 text-primary" />
                                    Quyền lợi
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.benefits.slice(0, 4).map((ben: string, i: number) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                                            {ben}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                <Button
                    className="flex-1 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                    onClick={(e) => {
                        e.stopPropagation()
                        onApply(job)
                    }}
                >
                    Ứng tuyển ngay
                </Button>
                <Link href={`/jobs/${job._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                        Xem chi tiết
                    </Button>
                </Link>
            </div>
        </Card>
    )
}
