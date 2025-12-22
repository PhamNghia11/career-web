"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, FileText, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Application {
    _id: string
    fullname: string
    email: string
    phone: string
    jobTitle: string
    companyName: string
    cvPath: string
    cvOriginalName: string
    createdAt: string
}

interface ApplicationsTableProps {
    initialApplications: Application[]
}

export function ApplicationsTable({ initialApplications }: ApplicationsTableProps) {
    const { toast } = useToast()
    const [applications, setApplications] = useState<Application[]>(initialApplications)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredApplications = applications.filter((app) =>
        app.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDownload = (filename: string) => {
        toast({
            title: "Đang tải xuống",
            description: `Đang tải file ${filename}... (Giả lập)`,
        })
        // Real logic would be: window.open(url, '_blank')
    }

    const handleDelete = (id: string) => {
        setApplications(prev => prev.filter(a => a._id !== id))
        toast({
            title: "Đã xóa đơn ứng tuyển",
            description: "Hồ sơ đã được xóa (Giả lập).",
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Danh sách ứng tuyển</h2>
                    <p className="text-gray-500 mt-1">Quản lý hồ sơ ứng viên nộp vào hệ thống.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Tìm kiếm ứng viên, vị trí..."
                        className="w-full sm:w-[300px] pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="shadow-sm border-gray-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[150px] font-semibold">Ngày ứng tuyển</TableHead>
                                <TableHead className="font-semibold">Ứng viên</TableHead>
                                <TableHead className="font-semibold">Vị trí / Công ty</TableHead>
                                <TableHead className="font-semibold">Liên hệ</TableHead>
                                <TableHead className="font-semibold">CV</TableHead>
                                <TableHead className="text-right font-semibold">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                        {searchQuery ? "Không tìm thấy kết quả nào" : "Không có dữ liệu"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredApplications.map((app) => (
                                    <TableRow key={app._id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="w-[150px] text-gray-600">
                                            {new Date(app.createdAt).toLocaleDateString("vi-VN", {
                                                day: '2-digit', month: '2-digit', year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">{app.fullname}</div>
                                            <Badge variant="secondary" className="mt-1 text-xs font-normal">
                                                Mới
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-blue-600">{app.jobTitle}</span>
                                                <span className="text-gray-500 text-xs mt-0.5">{app.companyName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-gray-900">{app.email}</span>
                                                <span className="text-xs text-gray-500">{app.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className="flex items-center gap-2 px-2 py-1 rounded bg-gray-100 w-fit text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                                                onClick={() => handleDownload(app.cvOriginalName)}
                                            >
                                                <FileText size={14} className="text-gray-500" />
                                                <span className="truncate max-w-[150px]">{app.cvOriginalName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleDownload(app.cvOriginalName)}
                                                >
                                                    <Download size={16} className="text-gray-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(app._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
