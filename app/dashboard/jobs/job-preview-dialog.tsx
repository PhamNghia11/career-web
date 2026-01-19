
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Clock, DollarSign, Calendar, FileText, Download } from "lucide-react"
import Image from "next/image"

// Define a robust Job type that covers all potential fields
export type Job = {
    _id: string
    title: string
    company: string
    logo?: string
    status: "active" | "closed" | "pending" | "rejected" | "request_changes"
    postedAt: string
    type: string
    salary: string
    location?: string
    description?: string
    requirements?: string[]
    benefits?: string[]
    deadline?: string
    documentUrl?: string
    documentName?: string
}

interface JobPreviewDialogProps {
    job: Job | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function JobPreviewDialog({ job, open, onOpenChange }: JobPreviewDialogProps) {
    if (!job) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Chi tiết tin tuyển dụng</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex items-start gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-white">
                            <Image
                                src={job.logo || "/placeholder.svg?height=100&width=100"}
                                alt={job.company}
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-700">{job.company}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>Đăng ngày: {new Date(job.postedAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                        </div>
                        <div>
                            {/* Status Badge can go here if needed */}
                        </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-full border shadow-sm">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Mức lương</p>
                                <p className="font-semibold">{job.salary}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-full border shadow-sm">
                                <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Địa điểm</p>
                                <p className="font-semibold">{job.location || "Chưa cập nhật"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-full border shadow-sm">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Loại hình</p>
                                <p className="font-semibold capitalize">{job.type}</p>
                            </div>
                        </div>

                        {job.deadline && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-full border shadow-sm">
                                    <Calendar className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Hạn nộp</p>
                                    <p className="font-semibold">{new Date(job.deadline).toLocaleDateString("vi-VN")}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Content */}
                    <div className="space-y-4">
                        {job.description && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Mô tả công việc</h3>
                                <div className="text-gray-700 whitespace-pre-line">{job.description}</div>
                            </div>
                        )}

                        {job.requirements && job.requirements.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Yêu cầu ứng viên</h3>
                                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                    {job.requirements.map((req, i) => (
                                        <li key={i}>{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {job.benefits && job.benefits.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Quyền lợi</h3>
                                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                    {job.benefits.map((benefit, i) => (
                                        <li key={i}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {job.documentUrl && (
                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-semibold mb-3">Tài liệu đính kèm</h3>
                                <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50/50 group">
                                    <div className="p-3 bg-white rounded-lg border shadow-sm">
                                        <FileText className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{job.documentName || "Tai-lieu-dinh-kem"}</p>
                                        <p className="text-sm text-gray-500">Người đăng đã đính kèm tài liệu này</p>
                                    </div>
                                    <a
                                        href={job.documentUrl}
                                        download={job.documentName || "tai-lieu"}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                                    >
                                        <Download className="h-4 w-4" />
                                        Tải xuống
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
