"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Upload, CheckCircle2, Globe, Mail, Phone } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [phoneError, setPhoneError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [faculty, setFaculty] = useState("")
    const [major, setMajor] = useState("")
    const [cohort, setCohort] = useState("")

    // Mapping of Majors to their corresponding Faculties
    const MAJOR_FACULTY_MAP: Record<string, string> = {
        "Công nghệ thông tin": "Khoa Công nghệ thông tin",
        "Kỹ thuật phần mềm": "Khoa Công nghệ thông tin",
        "Mạng máy tính và truyền thông dữ liệu": "Khoa Công nghệ thông tin",
        "An toàn thông tin": "Khoa Công nghệ thông tin",
        "Quản trị kinh doanh": "Khoa Kinh tế - Quản trị",
        "Marketing": "Khoa Kinh tế - Quản trị",
        "Kế toán": "Khoa Kinh tế - Quản trị",
        "Tài chính ngân hàng": "Khoa Kinh tế - Quản trị",
        "Logistics và Quản lý chuỗi cung ứng": "Khoa Kinh tế - Quản trị",
        "Ngôn ngữ Anh": "Khoa Khoa học xã hội - Ngôn ngữ",
        "Ngôn ngữ Trung Quốc": "Khoa Khoa học xã hội - Ngôn ngữ",
        "Quản trị dịch vụ du lịch và lữ hành": "Khoa Khoa học xã hội - Ngôn ngữ",
        "Đông phương học": "Khoa Khoa học xã hội - Ngôn ngữ",
        "Việt Nam học": "Khoa Khoa học xã hội - Ngôn ngữ",
        "Quản trị kinh doanh (Quốc tế)": "Viện Đào tạo Quốc tế",
        "Marketing (Quốc tế)": "Viện Đào tạo Quốc tế",
        "Kỹ thuật phần mềm (Quốc tế)": "Viện Đào tạo Quốc tế",
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

        // Check file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Kích thước file không được vượt quá 5MB")
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

        // Conditional CV check
        const isFullTime = jobType?.toLowerCase() === "full-time" || jobType?.toLowerCase() === "toàn thời gian"
        if (isFullTime && !selectedFile) {
            setError("Vui lòng đính kèm CV của bạn (bắt buộc đối với công việc toàn thời gian)")
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
                className="sm:max-w-[600px]"
                onPointerDownOutside={(e) => {
                    if (isSuccess) e.preventDefault();
                }}
                onEscapeKeyDown={(e) => {
                    if (isSuccess) e.preventDefault();
                }}
            >
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Ứng tuyển thành công!</h2>
                            <p className="text-gray-500">
                                Hồ sơ của bạn đã được gửi đến nhà tuyển dụng.
                            </p>
                        </div>

                        <div className="w-full bg-gray-50 rounded-lg p-5 border border-gray-100 text-left space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin ứng tuyển</h3>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Vị trí</p>
                                    <p className="font-medium text-gray-900 truncate" title={jobTitle}>{jobTitle}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Công ty</p>
                                    <p className="font-medium text-gray-900 truncate" title={companyName}>{companyName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Trạng thái hồ sơ</p>
                                    <p className="font-medium text-green-600">Đã gửi thành công</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Thời gian</p>
                                    <p className="font-medium text-gray-900">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date().toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 pt-2">Thông tin liên hệ nhà tuyển dụng</h3>
                            <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-gray-400" />
                                    <p className="text-gray-500 w-20">Website:</p>
                                    <a href={companyWebsite || "#"} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline truncate">
                                        {companyWebsite || "N/A"}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <p className="text-gray-500 w-20">Email:</p>
                                    <p className="font-medium text-gray-900">{companyEmail || "N/A"}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <p className="text-gray-500 w-20">Điện thoại:</p>
                                    <p className="font-medium text-gray-900">{companyPhone || "N/A"}</p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-200 mt-2">
                                <p className="text-xs text-gray-500 italic">
                                    * Bạn có thể chủ động liên hệ với nhà tuyển dụng qua các kênh trên để được phản hồi nhanh hơn.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full">
                            <Button onClick={onClose} variant="outline" className="flex-1">
                                Đóng
                            </Button>
                            <Button onClick={() => window.location.href = "/dashboard/applications"} className="flex-1 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                                Xem hồ sơ của tôi
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Ứng tuyển công việc</DialogTitle>
                            <DialogDescription>
                                Ứng tuyển vị trí <span className="font-semibold text-foreground">{jobTitle}</span> tại {companyName}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="fullname">Họ và tên <span className="text-red-500">*</span></Label>
                                        <Input id="fullname" placeholder="Nguyễn Văn A" required defaultValue={user?.name || ""} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mssv">Mã số sinh viên <span className="text-red-500">*</span></Label>
                                        <Input id="mssv" placeholder="21123456" required />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="major">Ngành học <span className="text-red-500">*</span></Label>
                                    <Select name="major" value={major} onValueChange={handleMajorChange} required>
                                        <SelectTrigger id="major">
                                            <SelectValue placeholder="Chọn Ngành học" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Công nghệ thông tin">Công nghệ thông tin</SelectItem>
                                            <SelectItem value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</SelectItem>
                                            <SelectItem value="An toàn thông tin">An toàn thông tin</SelectItem>
                                            <SelectItem value="Mạng máy tính và truyền thông dữ liệu">Mạng máy tính</SelectItem>
                                            <SelectItem value="Quản trị kinh doanh">Quản trị kinh doanh</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="Kế toán">Kế toán</SelectItem>
                                            <SelectItem value="Tài chính ngân hàng">Tài chính ngân hàng</SelectItem>
                                            <SelectItem value="Logistics và Quản lý chuỗi cung ứng">Logistics</SelectItem>
                                            <SelectItem value="Ngôn ngữ Anh">Ngôn ngữ Anh</SelectItem>
                                            <SelectItem value="Ngôn ngữ Trung Quốc">Ngôn ngữ Trung Quốc</SelectItem>
                                            <SelectItem value="Quản trị dịch vụ du lịch và lữ hành">Du lịch</SelectItem>
                                            <SelectItem value="Đông phương học">Đông phương học</SelectItem>
                                            <SelectItem value="Việt Nam học">Việt Nam học</SelectItem>
                                            <SelectItem value="Quản trị kinh doanh (Quốc tế)">QTKD (Quốc tế)</SelectItem>
                                            <SelectItem value="Marketing (Quốc tế)">Marketing (Quốc tế)</SelectItem>
                                            <SelectItem value="Kỹ thuật phần mềm (Quốc tế)">Kỹ thuật phần mềm (Quốc tế)</SelectItem>
                                            <SelectItem value="Khác">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="faculty">Khoa / Viện <span className="text-gray-400 font-normal">(Tùy chọn)</span></Label>
                                        <Select name="faculty" value={faculty} onValueChange={setFaculty} disabled={major !== "Khác" && major !== ""}>
                                            <SelectTrigger id="faculty">
                                                <SelectValue placeholder="Chọn Khoa / Viện" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</SelectItem>
                                                <SelectItem value="Khoa Kinh tế - Quản trị">Khoa Kinh tế - Quản trị</SelectItem>
                                                <SelectItem value="Khoa Khoa học xã hội - Ngôn ngữ">Khoa Khoa học xã hội - Ngôn ngữ</SelectItem>
                                                <SelectItem value="Viện Đào tạo Quốc tế">Viện Đào tạo Quốc tế</SelectItem>
                                                <SelectItem value="Khác">Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cohort">Khóa <span className="text-gray-400 font-normal">(Tùy chọn)</span></Label>
                                        <Select name="cohort" value={cohort} onValueChange={setCohort}>
                                            <SelectTrigger id="cohort">
                                                <SelectValue placeholder="Chọn Khóa" />
                                            </SelectTrigger>
                                            <SelectContent>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email cá nhân <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="example@gmail.com"
                                            defaultValue={user?.email || ""}
                                            required
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
                                        <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="0901234567"
                                            required
                                            onChange={(e) => {
                                                const val = e.target.value
                                                if (/\D/.test(val)) {
                                                    setPhoneError("Số điện thoại chỉ được chứa các chữ số")
                                                } else {
                                                    setPhoneError("")
                                                }
                                                const numericVal = val.replace(/\D/g, '')
                                                if (numericVal.length > 0 && !numericVal.startsWith('0')) {
                                                    setPhoneError("Số điện thoại phải bắt đầu bằng số 0")
                                                    e.target.value = ''
                                                    return
                                                }
                                                e.target.value = numericVal
                                            }}
                                        />
                                        {phoneError && (
                                            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cv" className="flex justify-between items-center">
                                    <span>CV / Hồ sơ đính kèm</span>
                                    {jobType?.toLowerCase() === "full-time" || jobType?.toLowerCase() === "toàn thời gian" ? (
                                        <span className="text-xs font-normal text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse">Bắt buộc</span>
                                    ) : (
                                        <span className="text-xs font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">Không bắt buộc</span>
                                    )}
                                </Label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group 
                                        ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}
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
                                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                    setError(null);
                                                }}
                                            >
                                                Xóa file
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
                                                <Upload className={`h-5 w-5 ${error && !selectedFile ? "text-red-500" : "text-gray-500"}`} />
                                            </div>
                                            <p className={`text-sm font-medium ${error && !selectedFile ? "text-red-600" : "text-gray-900"}`}>
                                                {error && !selectedFile ? error : "Nhấn để tải lên CV"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {dragActive ? "Thả file vào đây" : "PDF, DOC, DOCX (Tối đa 5MB)"}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Thư giới thiệu (Tùy chọn)</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Viết đôi lời giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                                {isSubmitting ? "Đang gửi..." : "Gửi hồ sơ ứng tuyển"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
