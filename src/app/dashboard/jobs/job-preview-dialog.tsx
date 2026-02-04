"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Clock, DollarSign, Calendar, FileText, Download, Eye, Maximize2, Minimize2 } from "lucide-react"
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
    const [isExpanded, setIsExpanded] = useState(false)

    if (!job) return null

    const handleOpenChange = (openState: boolean) => {
        if (!openState) {
            setIsExpanded(false)
        }
        onOpenChange(openState)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={`${isExpanded ? 'max-w-[98vw] w-[98vw] h-[98vh]' : 'max-w-4xl w-[95vw] sm:w-full h-[90vh]'} overflow-y-auto p-0 gap-0 border border-gray-200 shadow-2xl rounded-2xl sm:rounded-xl transition-all duration-300`}>
                <DialogHeader className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex flex-row items-center justify-between space-y-0 pr-14">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Chi tiết tin tuyển dụng</DialogTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-9 w-9 p-0 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        title={isExpanded ? "Thu nhỏ" : "Phóng to toàn màn hình"}
                    >
                        {isExpanded ? <Minimize2 className="h-5 w-5 text-gray-600" /> : <Maximize2 className="h-5 w-5 text-gray-600" />}
                    </Button>
                </DialogHeader>


                <div className="p-4 sm:p-8 space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
                            <Image
                                src={job.logo || "/placeholder.svg?height=100&width=100"}
                                alt={job.company}
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                                {job.title}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                                <span className="font-semibold text-gray-700 text-sm sm:text-base truncate">{job.company}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <span>Đăng ngày: {new Date(job.postedAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100/50 shadow-inner">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            <div className="p-1.5 bg-green-50 rounded-full shrink-0">
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Mức lương</p>
                                <p className="font-bold text-sm text-gray-900 truncate">{job.salary}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            <div className="p-1.5 bg-blue-50 rounded-full shrink-0">
                                <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Địa điểm</p>
                                <p className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">{job.location || "Chưa cập nhật"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            <div className="p-1.5 bg-orange-50 rounded-full shrink-0">
                                <Clock className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Loại hình</p>
                                <p className="font-bold text-sm text-gray-900 capitalize">{job.type}</p>
                            </div>
                        </div>

                        {job.deadline && (
                            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                <div className="p-1.5 bg-red-50 rounded-full shrink-0">
                                    <Calendar className="h-4 w-4 text-red-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Hạn nộp</p>
                                    <p className="font-bold text-sm text-gray-900">{new Date(job.deadline).toLocaleDateString("vi-VN")}</p>
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
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <a
                                            href={job.documentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm min-w-[120px]"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Xem nhanh
                                        </a>
                                        <a
                                            href={job.documentUrl}
                                            download={job.documentName || "tai-lieu"}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm min-w-[120px]"
                                        >
                                            <Download className="h-4 w-4" />
                                            Tải ngay
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
