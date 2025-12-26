"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Upload, CheckCircle2 } from "lucide-react"

interface ApplyJobDialogProps {
    isOpen: boolean
    onClose: () => void
    jobTitle: string
    companyName: string
    jobId?: string
    employerId?: string
}

export function ApplyJobDialog({ isOpen, onClose, jobTitle, companyName, jobId, employerId }: ApplyJobDialogProps) {
    const { toast } = useToast()
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [phoneError, setPhoneError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
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

        if (!selectedFile) {
            setError("Vui lòng đính kèm CV của bạn")
            return
        }

        setIsSubmitting(true)

        try {
            // Get form values
            const form = e.target as HTMLFormElement
            const email = (form.elements.namedItem("email") as HTMLInputElement).value

            if (!email.endsWith("@gmail.com")) {
                setError("Email phải là địa chỉ Gmail (@gmail.com)")
                return
            }

            const formData = new FormData()
            formData.append("jobTitle", jobTitle)
            formData.append("companyName", companyName)
            if (jobId) formData.append("jobId", jobId)
            if (employerId) formData.append("employerId", employerId)

            formData.append("fullname", (form.elements.namedItem("fullname") as HTMLInputElement).value)
            formData.append("email", email)
            formData.append("phone", (form.elements.namedItem("phone") as HTMLInputElement).value)
            formData.append("mssv", (form.elements.namedItem("mssv") as HTMLInputElement).value)
            formData.append("major", (form.elements.namedItem("major") as HTMLInputElement).value)
            formData.append("faculty", (form.elements.namedItem("faculty") as HTMLInputElement).value)
            formData.append("cohort", (form.elements.namedItem("cohort") as HTMLInputElement).value)

            formData.append("message", (form.elements.namedItem("message") as HTMLTextAreaElement).value)
            formData.append("cv", selectedFile)

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

            // Close dialog after a delay or let user close it
            setTimeout(() => {
                onClose()
                // Reset state after closing
                setTimeout(() => {
                    setIsSuccess(false)
                    setSelectedFile(null)
                    setError(null)
                }, 300)
            }, 2000)
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
            <DialogContent className="sm:max-w-[600px]">
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
                                    <p className="text-gray-500">Hình thức</p>
                                    <p className="font-medium text-blue-600">Trực tuyến (Online)</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Trạng thái</p>
                                    <p className="font-medium text-green-600">Đã gửi hồ sơ</p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-200 mt-2">
                                <p className="text-xs text-gray-500 italic">
                                    * Nhà tuyển dụng sẽ liên hệ lại với bạn qua Email hoặc Số điện thoại nếu hồ sơ phù hợp.
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
                                    <Input id="major" placeholder="Công nghệ thông tin, Marketing..." required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="faculty">Khoa / Viện <span className="text-gray-400 font-normal">(Tùy chọn)</span></Label>
                                        <Input id="faculty" placeholder="Khoa CNTT" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cohort">Khóa <span className="text-gray-400 font-normal">(Tùy chọn)</span></Label>
                                        <Input id="cohort" placeholder="K15" />
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
                                <Label htmlFor="cv">CV / Hồ sơ đính kèm</Label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group 
                                        ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}
                                        ${error ? "border-red-500 bg-red-50" : ""}
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
                                                }}
                                            >
                                                Xóa file
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
                                                <Upload className={`h-5 w-5 ${error ? "text-red-500" : "text-gray-500"}`} />
                                            </div>
                                            <p className={`text-sm font-medium ${error ? "text-red-600" : "text-gray-900"}`}>
                                                {error ? error : "Nhấn để tải lên CV"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {dragActive ? "Thả file vào đây" : "PDF, DOC, DOCX (Max 5MB)"}
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
