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
    return (
        <Card className="h-full flex flex-col overflow-hidden shadow-none rounded-none bg-white">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 p-1.5 flex items-center justify-center shadow-sm shrink-0">
                        {job.logo ? (
                            <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                        ) : (
                            <Building className="h-6 w-6 text-gray-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h2 className="text-base font-bold text-gray-900 leading-tight line-clamp-2">{job.title}</h2>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0 whitespace-nowrap bg-white">
                                {job.type === 'full-time' ? 'Toàn thời gian' : job.type === 'part-time' ? 'Bán thời gian' : job.type === 'internship' ? 'Thực tập' : 'Freelance'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mt-1">
                            <Building className="h-3 w-3" />
                            <span className="truncate">{job.company}</span>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 bg-white">
                <div className="p-4 space-y-4">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase mb-1">
                                <DollarSign className="h-3 w-3" />
                                Mức lương
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">{job.salary}</div>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase mb-1">
                                <MapPin className="h-3 w-3" />
                                Địa điểm
                            </div>
                            <div className="font-semibold text-gray-900 text-sm truncate" title={job.location}>{job.location}</div>
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
