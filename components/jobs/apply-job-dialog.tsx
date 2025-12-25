"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
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
            const formData = new FormData()
            formData.append("jobTitle", jobTitle)
            formData.append("companyName", companyName)
            if (jobId) formData.append("jobId", jobId)
            if (employerId) formData.append("employerId", employerId)

            // Get form values using the element definition from usage
            // Since the inputs are uncontrolled in the JSX (except for some reason previously they weren't fully controlled state but just ID ref),
            // and the form in JSX has IDs: fullname, email, phone, message.
            const form = e.target as HTMLFormElement
            formData.append("fullname", (form.elements.namedItem("fullname") as HTMLInputElement).value)
            formData.append("email", (form.elements.namedItem("email") as HTMLInputElement).value)
            formData.append("phone", (form.elements.namedItem("phone") as HTMLInputElement).value)
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
            <DialogContent className="sm:max-w-[500px]">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Ứng tuyển thành công!</h2>
                        <p className="text-gray-500 max-w-xs">
                            Hồ sơ của bạn đã được gửi thành công cho vị trí <span className="font-semibold text-gray-900">{jobTitle}</span> tại {companyName}.
                        </p>
                        <Button onClick={onClose} className="mt-4">
                            Đóng
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Ứng tuyển công việc</DialogTitle>
                            <DialogDescription>
                                Ứng tuyển vị trí <span className="font-semibold text-foreground">{jobTitle}</span> tại {companyName}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullname">Họ và tên</Label>
                                <Input id="fullname" placeholder="Nguyễn Văn A" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="example@gmail.com" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="0901234567"
                                        required
                                        onChange={(e) => {
                                            const val = e.target.value

                                            // Check if user tries to enter non-digits
                                            if (/\D/.test(val)) {
                                                setPhoneError("Số điện thoại chỉ được chứa các chữ số")
                                            } else {
                                                setPhoneError("")
                                            }

                                            const numericVal = val.replace(/\D/g, '')

                                            // Check leading zero logic
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
