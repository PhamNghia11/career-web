"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Upload, CheckCircle2, Globe, Mail, Phone } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface ApplyJobDialogProps {
    isOpen: boolean
    onClose: () => void
    jobTitle: string
    companyName: string
    jobId?: string
    employerId?: string
    companyEmail?: string
    companyPhone?: string
    companyWebsite?: string
    jobType?: string
}

export function ApplyJobDialog({
    isOpen,
    onClose,
    jobTitle,
    companyName,
    jobId,
    employerId,
    companyEmail,
    companyPhone,
    companyWebsite,
    jobType
}: ApplyJobDialogProps) {
    const { toast } = useToast()
    const { user } = useAuth()

    // Helper to clean potential 'undefined' string values
    const cleanValue = (val: string | undefined | null) => {
        if (!val || val === 'undefined') return ''
        return val
    }

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [phoneError, setPhoneError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Auto-fill from user profile
    const [faculty, setFaculty] = useState(cleanValue(user?.faculty))
    const [major, setMajor] = useState(cleanValue(user?.major))
    const [cohort, setCohort] = useState(cleanValue(user?.cohort) || "")
    const [phoneValue, setPhoneValue] = useState(user?.phone || "")

    useEffect(() => {
        if (user?.phone && !phoneValue) {
            setPhoneValue(user.phone)
        }
        if (user?.major && !major) {
            setMajor(user.major)
        }
        // If user has a major but no faculty in profile, try to map it
        if (user?.major && !user.faculty && !faculty) {
            const mapped = MAJOR_FACULTY_MAP[user.major] || ""
            if (mapped) setFaculty(mapped)
        } else if (user?.faculty && !faculty) {
            setFaculty(user.faculty)
        }
    }, [user, major, faculty, phoneValue])

    // Mapping of Majors to their corresponding Faculties (Official GDU List)
    const MAJOR_FACULTY_MAP: Record<string, string> = {
        // Sức khỏe
        "Răng Hàm Mặt": "Sức khỏe",
        "Kỹ thuật phục hồi chức năng": "Sức khỏe",
        "Điều dưỡng": "Sức khỏe",
        // Công nghệ thông tin
        "Công nghệ thông tin": "Công nghệ thông tin",
        "Kỹ thuật phần mềm": "Công nghệ thông tin",
        "Mạng máy tính & Truyền thông dữ liệu": "Công nghệ thông tin",
        "Trí tuệ nhân tạo": "Công nghệ thông tin",
        // Truyền thông
        "Truyền thông đa phương tiện": "Truyền thông",
        "Công nghệ truyền thông": "Truyền thông",
        "Quan hệ công chúng": "Truyền thông",
        // Kinh doanh
        "Kinh doanh quốc tế": "Kinh doanh",
        "Kinh doanh thương mại": "Kinh doanh",
        "Thương mại điện tử": "Kinh doanh",
        // Quản trị - Quản lý
        "Quản trị kinh doanh": "Quản trị - Quản lý",
        "Marketing": "Quản trị - Quản lý",
        "Quản trị khách sạn": "Quản trị - Quản lý",
        "Quản trị dịch vụ du lịch & lữ hành": "Quản trị - Quản lý",
        "Logistics & Quản lý chuỗi cung ứng": "Quản trị - Quản lý",
        // Luật
        "Luật": "Luật",
        "Luật kinh tế": "Luật",
        // Khoa học xã hội & Ngôn ngữ quốc tế
        "Ngôn ngữ Anh": "Khoa học xã hội & Ngôn ngữ quốc tế",
        "Đông phương học": "Khoa học xã hội & Ngôn ngữ quốc tế",
        "Tâm lý học": "Khoa học xã hội & Ngôn ngữ quốc tế",
        "Ngôn ngữ Trung Quốc": "Khoa học xã hội & Ngôn ngữ quốc tế",
        // Tài chính ngân hàng
        "Tài chính - Ngân hàng": "Tài chính ngân hàng",
        "Công nghệ tài chính": "Tài chính ngân hàng",
        "Kế toán": "Tài chính ngân hàng",
    }

    const handleMajorChange = (value: string) => {
        setMajor(value)
        const matchedFaculty = MAJOR_FACULTY_MAP[value]
        if (matchedFaculty) {
            setFaculty(matchedFaculty)
        }
    }
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0])
        }
    }

    const validateAndSetFile = (file: File) => {
        setError(null)
        // Check file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!validTypes.includes(file.type)) {
            setError("Chỉ chấp nhận file PDF, DOC hoặc DOCX")
            return
        }

        // Check file size (20MB)
        if (file.size > 20 * 1024 * 1024) {
            setError("Kích thước file không được vượt quá 20MB")
            return
        }

        setSelectedFile(file)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0])
        }
    }

    const triggerFileInput = () => {
        inputRef.current?.click()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (user?.role === "employer" || user?.role === "admin") {
            toast({
                title: "Không được phép",
                description: "Tài khoản nhà tuyển dụng không thể ứng tuyển công việc.",
                variant: "destructive"
            })
            return
        }

        // Conditional CV check (Mandatory for Full-time and Internship)
        const type = jobType?.toLowerCase()
        const isMandatory = type === "full-time" || type === "toàn thời gian" || type === "internship" || type === "thực tập"

        if (isMandatory && !selectedFile) {
            setError("Vui lòng đính kèm CV của bạn (bắt buộc đối với công việc toàn thời gian và thực tập)")
            setIsSubmitting(false)
            return
        }

        setIsSubmitting(true)

        try {
            // Get form values
            const form = e.target as HTMLFormElement
            const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim()
            const phone = (form.elements.namedItem("phone") as HTMLInputElement).value.trim()
            if (!email.toLowerCase().endsWith("@gmail.com")) {
                setError("Email phải là địa chỉ Gmail (@gmail.com)")
                setIsSubmitting(false)
                return
            }

            if (!phone.startsWith('0') || phone.length < 10 || phone.length > 11) {
                setPhoneError("Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số")
                setIsSubmitting(false)
                return
            }

            const formData = new FormData()
            formData.append("jobTitle", jobTitle)
            formData.append("companyName", companyName)
            if (jobId) formData.append("jobId", jobId)
            if (employerId) formData.append("employerId", employerId)
            // Add applicantId for notification purposes (if user is logged in)
            if (user?.id) formData.append("applicantId", user.id)

            formData.append("fullname", (form.elements.namedItem("fullname") as HTMLInputElement).value.trim())
            formData.append("email", email)
            formData.append("phone", phone)
            formData.append("mssv", (form.elements.namedItem("mssv") as HTMLInputElement).value.trim())
            formData.append("major", major.trim())
            formData.append("faculty", faculty.trim())
            formData.append("cohort", cohort.trim())

            formData.append("message", (form.elements.namedItem("message") as HTMLTextAreaElement).value)
            if (selectedFile) {
                formData.append("cv", selectedFile)
            }

            const response = await fetch("/api/applications", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Có lỗi xảy ra")
            }

            setIsSubmitting(false)
            setIsSuccess(true)

            // Show toast confirmation
            toast({
                title: "Ứng tuyển thành công!",
                description: `Hồ sơ của bạn đã được gửi đến ${companyName}.`,
            })

            // Auto-close removed as per user request
            // We let the user see the contact info and close manually
        } catch (err: any) {
            setIsSubmitting(false)
            toast({
                title: "Lỗi ứng tuyển",
                description: err.message,
                variant: "destructive"
            })
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose()
            // Reset state when strictly closing
            if (isSuccess || selectedFile || error) {
                setTimeout(() => {
                    setIsSuccess(false)
                    setSelectedFile(null)
                    setError(null)
                }, 300)
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-[900px] max-h-[95vh] flex flex-col p-0 overflow-hidden rounded-[32px] border-none shadow-2xl"
                onPointerDownOutside={(e) => {
                    if (isSuccess) e.preventDefault();
                }}
                onEscapeKeyDown={(e) => {
                    if (isSuccess) e.preventDefault();
                }}
            >
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                            <CheckCircle2 className="h-14 w-14 text-green-600" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Ứng tuyển thành công!</h2>
                            <p className="text-gray-500 font-medium">
                                Hồ sơ của bạn đã được gửi đến nhà tuyển dụng một cách an toàn.
                            </p>
                        </div>

                        <div className="w-full bg-slate-50 rounded-[32px] p-8 border border-slate-100 text-left space-y-6">
                            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs border-b border-slate-200 pb-3">Tóm tắt thông tin</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                                <div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Vị trí</p>
                                    <p className="font-bold text-slate-900 truncate" title={jobTitle}>{jobTitle}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Công ty</p>
                                    <p className="font-bold text-slate-900 truncate" title={companyName}>{companyName}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Trạng thái</p>
                                    <p className="font-bold text-green-600 uppercase tracking-wider">Đã gửi</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Thời gian</p>
                                    <p className="font-bold text-slate-900">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date().toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            <Separator className="bg-slate-200" />

                            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs border-b border-slate-200 pb-3">Thông tin liên hệ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                <div className="space-y-1">
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                                        <Globe className="h-3.5 w-3.5" /> Website
                                    </p>
                                    <a href={companyWebsite || "#"} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline truncate block">
                                        {companyWebsite || "N/A"}
                                    </a>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5" /> Email
                                    </p>
                                    <p className="font-bold text-slate-900">{companyEmail || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5" /> Điện thoại
                                    </p>
                                    <p className="font-bold text-slate-900">{companyPhone || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full pt-4">
                            <Button onClick={onClose} variant="outline" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">
                                Đóng
                            </Button>
                            <Button onClick={() => window.location.href = "/dashboard/applications"} className="flex-1 h-14 rounded-2xl bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-blue-900/10">
                                Hồ sơ của tôi
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[95vh]">
                        <div className="bg-[#1e3a5f] text-white p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white underline decoration-blue-400 decoration-4 underline-offset-8">Ứng tuyển công việc</DialogTitle>
                                <DialogDescription className="text-blue-100/80 font-medium pt-4">
                                    Bạn đang ứng tuyển vị trí <span className="font-black text-white">{jobTitle}</span> <br className="hidden md:block" />
                                    tại <span className="font-black text-white uppercase">{companyName}</span>
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
                            <div className="grid gap-8">
                                {/* Academic Information */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px]">1</span>
                                        Thông tin sinh viên
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="fullname" className="font-bold text-slate-700">Họ và tên <span className="text-red-500">*</span></Label>
                                            <Input id="fullname" placeholder="Nguyễn Văn A" required defaultValue={user?.name || ""} className="h-12 rounded-xl" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="mssv" className="font-bold text-slate-700">Mã số sinh viên <span className="text-red-500">*</span></Label>
                                            <Input id="mssv" placeholder="21123456" required defaultValue={user?.studentId || ""} className="h-12 rounded-xl" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="cohort" className="font-bold text-slate-700">Khóa <span className="text-slate-400 font-normal">(Tùy chọn)</span></Label>
                                            <Select name="cohort" value={cohort} onValueChange={setCohort}>
                                                <SelectTrigger id="cohort" className="h-12 rounded-xl">
                                                    <SelectValue placeholder="Chọn Khóa" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="K14">K14</SelectItem>
                                                    <SelectItem value="K15">K15</SelectItem>
                                                    <SelectItem value="K16">K16</SelectItem>
                                                    <SelectItem value="K17">K17</SelectItem>
                                                    <SelectItem value="K18">K18</SelectItem>
                                                    <SelectItem value="K19">K19</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="major" className="font-bold text-slate-700">Ngành học <span className="text-red-500">*</span></Label>
                                            <Select name="major" value={major} onValueChange={handleMajorChange} required>
                                                <SelectTrigger id="major" className="h-12 rounded-xl">
                                                    <SelectValue placeholder="Chọn Ngành học" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="Răng Hàm Mặt">Răng Hàm Mặt</SelectItem>
                                                    <SelectItem value="Kỹ thuật phục hồi chức năng">Kỹ thuật phục hồi chức năng</SelectItem>
                                                    <SelectItem value="Điều dưỡng">Điều dưỡng</SelectItem>
                                                    <Separator className="my-1" />
                                                    <SelectItem value="Công nghệ thông tin">Công nghệ thông tin</SelectItem>
                                                    <SelectItem value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</SelectItem>
                                                    <SelectItem value="Mạng máy tính & Truyền thông dữ liệu">Mạng máy tính</SelectItem>
                                                    <SelectItem value="Trí tuệ nhân tạo">Trí tuệ nhân tạo</SelectItem>
                                                    <Separator className="my-1" />
                                                    <SelectItem value="Truyền thông đa phương tiện">Truyền thông đa phương tiện</SelectItem>
                                                    <SelectItem value="Công nghệ truyền thông">Công nghệ truyền thông</SelectItem>
                                                    <SelectItem value="Quan hệ công chúng">Quan hệ công chúng</SelectItem>
                                                    <Separator className="my-1" />
                                                    <SelectItem value="Kinh doanh quốc tế">Kinh doanh quốc tế</SelectItem>
                                                    <SelectItem value="Kinh doanh thương mại">Kinh doanh thương mại</SelectItem>
                                                    <SelectItem value="Thương mại điện tử">Thương mại điện tử</SelectItem>
                                                    <SelectItem value="Quản trị kinh doanh">Quản trị kinh doanh</SelectItem>
                                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                                    <SelectItem value="Quản trị khách sạn">Quản trị khách sạn</SelectItem>
                                                    <SelectItem value="Quản trị dịch vụ du lịch & lữ hành">Du lịch</SelectItem>
                                                    <SelectItem value="Logistics & Quản lý chuỗi cung ứng">Logistics</SelectItem>
                                                    <Separator className="my-1" />
                                                    <SelectItem value="Luật">Luật</SelectItem>
                                                    <SelectItem value="Luật kinh tế">Luật kinh tế</SelectItem>
                                                    <Separator className="my-1" />
                                                    <SelectItem value="Ngôn ngữ Anh">Ngôn ngữ Anh</SelectItem>
                                                    <SelectItem value="Đông phương học">Đông phương học</SelectItem>
                                                    <SelectItem value="Tâm lý học">Tâm lý học</SelectItem>
                                                    <SelectItem value="Ngôn ngữ Trung Quốc">Ngôn ngữ Trung Quốc</SelectItem>
                                                    <Separator className="my-1" />
                                                    <SelectItem value="Tài chính - Ngân hàng">Tài chính - Ngân hàng</SelectItem>
                                                    <SelectItem value="Công nghệ tài chính">Công nghệ tài chính</SelectItem>
                                                    <SelectItem value="Kế toán">Kế toán</SelectItem>
                                                    <SelectItem value="Khác">Khác</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="faculty" className="font-bold text-slate-700">Khoa / Viện <span className="text-slate-400 font-normal">(Tự động)</span></Label>
                                            <Select name="faculty" value={faculty} onValueChange={setFaculty} disabled={major !== "Khác" && major !== ""}>
                                                <SelectTrigger id="faculty" className="h-12 rounded-xl bg-slate-50 border-slate-200">
                                                    <SelectValue placeholder="Chọn Khoa / Viện" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="Sức khỏe">Sức khỏe</SelectItem>
                                                    <SelectItem value="Công nghệ thông tin">Công nghệ thông tin</SelectItem>
                                                    <SelectItem value="Truyền thông">Truyền thông</SelectItem>
                                                    <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                                                    <SelectItem value="Quản trị - Quản lý">Quản trị - Quản lý</SelectItem>
                                                    <SelectItem value="Luật">Luật</SelectItem>
                                                    <SelectItem value="Khoa học xã hội & Ngôn ngữ quốc tế">KHXH & Ngôn ngữ quốc tế</SelectItem>
                                                    <SelectItem value="Tài chính ngân hàng">Tài chính ngân hàng</SelectItem>
                                                    <SelectItem value="Khác">Khác</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px]">2</span>
                                        Liên hệ & Hồ sơ
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="font-bold text-slate-700">Email cá nhân <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="example@gmail.com"
                                                defaultValue={user?.email || ""}
                                                required
                                                className="h-12 rounded-xl"
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    if (val && !val.endsWith("@gmail.com")) {
                                                        setError("Email phải có định dạng @gmail.com")
                                                    } else {
                                                        setError(null)
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone" className="font-bold text-slate-700">Số điện thoại <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="0901234567"
                                                required
                                                defaultValue={user?.phone || ""}
                                                value={phoneValue}
                                                className="h-12 rounded-xl"
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    const numericVal = val.replace(/\D/g, '')
                                                    setPhoneValue(numericVal)
                                                    if (numericVal.length > 0) {
                                                        if (!numericVal.startsWith('0')) {
                                                            setPhoneError("Số điện thoại phải bắt đầu bằng số 0")
                                                        } else if (numericVal.length < 10 || numericVal.length > 11) {
                                                            setPhoneError("Số điện thoại phải có 10-11 số")
                                                        } else {
                                                            setPhoneError("")
                                                        }
                                                    } else {
                                                        setPhoneError("")
                                                    }
                                                }}
                                            />
                                            {phoneError && (
                                                <p className="text-red-500 text-xs mt-1 font-medium">{phoneError}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* CV Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="grid gap-4">
                                        <Label htmlFor="cv" className="flex items-center gap-1 font-bold text-slate-700">
                                            <span>CV / Hồ sơ đính kèm</span>
                                            {((type) => {
                                                const t = type?.toLowerCase()
                                                return t === "full-time" || t === "toàn thời gian" || t === "internship" || t === "thực tập"
                                            })(jobType) && (
                                                    <span className="text-red-500">*</span>
                                                )}
                                        </Label>
                                        <div
                                            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group h-[220px]
                                                ${dragActive ? "border-blue-500 bg-blue-50 shadow-inner" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"}
                                                ${error && !selectedFile ? "border-red-500 bg-red-50" : ""}
                                            `}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={triggerFileInput}
                                        >
                                            <input
                                                ref={inputRef}
                                                id="cv"
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                            />

                                            {selectedFile ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                                        <CheckCircle2 className="h-8 w-8" />
                                                    </div>
                                                    <p className="text-sm font-black text-slate-900 line-clamp-1 px-4">{selectedFile.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="mt-4 text-red-500 hover:text-red-700 hover:bg-red-50 h-9 px-4 rounded-xl font-bold text-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedFile(null);
                                                            setError(null);
                                                        }}
                                                    >
                                                        Thay đổi file khác
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-50 transition-all shadow-sm">
                                                        <Upload className={`h-8 w-8 ${error && !selectedFile ? "text-red-500" : "text-slate-400 group-hover:text-blue-600"}`} />
                                                    </div>
                                                    <p className={`text-sm font-bold ${error && !selectedFile ? "text-red-600" : "text-slate-800"}`}>
                                                        {error && !selectedFile ? error : "Nhấn để tải lên CV"}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-2 font-medium">
                                                        {dragActive ? "Thả file vào đây ngay" : "Hỗ trợ PDF, DOC, DOCX (Max 20MB)"}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-2 h-full">
                                        <Label htmlFor="message" className="font-bold text-slate-700">Thư giới thiệu <span className="text-slate-400 font-normal">(Tùy chọn)</span></Label>
                                        <Textarea
                                            id="message"
                                            placeholder="GDU Career khuyên bạn nên viết đôi lời giới thiệu về bản thân và lý do bạn phù hợp với vị trí này để ghi điểm với nhà tuyển dụng nhé..."
                                            className="h-[220px] rounded-3xl resize-none p-6 border-slate-200 focus:ring-blue-500/10 placeholder:text-slate-400 text-sm leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-end gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs">
                                Hủy ứng tuyển
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="h-14 px-10 rounded-2xl bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white font-black uppercase tracking-[0.1em] text-xs shadow-xl shadow-blue-900/10">
                                {isSubmitting ? "Đang xử lý hồ sơ..." : "Xác nhận gửi hồ sơ"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
