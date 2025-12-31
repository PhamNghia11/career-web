"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Briefcase, MapPin, DollarSign, Building, ImagePlus, X, ChevronDown } from "lucide-react"

// Constants
const JOB_TYPES = [
    { value: "full-time", label: "Toàn thời gian" },
    { value: "part-time", label: "Bán thời gian" },
    { value: "internship", label: "Thực tập" },
]

// Cấu trúc phân cấp: Lĩnh vực → Chuyên ngành
const FIELDS_AND_MAJORS: Record<string, string[]> = {
    "Công nghệ Thông tin": ["Công nghệ thông tin", "Kỹ thuật Phần mềm", "Trí tuệ Nhân tạo", "Mạng máy tính"],
    "Kinh doanh & Quản lý": ["Kinh doanh Quốc tế", "Kinh doanh Thương mại", "Thương mại Điện tử", "Quản trị Kinh doanh", "Marketing", "Quản trị Khách sạn", "Logistics"],
    "Truyền thông": ["Truyền thông Đa phương tiện", "Công nghệ Truyền thông", "Quan hệ Công chúng"],
    "Tài chính - Ngân hàng": ["Tài chính - Ngân hàng", "Công nghệ Tài chính", "Kế toán"],
    "Luật": ["Luật", "Luật Kinh tế"],
    "Ngôn ngữ & Xã hội": ["Ngôn ngữ Anh", "Đông Phương học", "Tâm lý học", "Ngôn ngữ Trung Quốc"],
    "Sức khỏe": ["Răng – Hàm – Mặt"],
    "Thiết kế": ["Thiết kế đồ họa"],
}

const COMMON_BENEFITS = [
    "Bảo hiểm y tế/XH", "Thưởng tháng 13", "Du lịch hàng năm", "Laptop làm việc",
    "Đào tạo chuyên môn", "Phụ cấp ăn trưa", "Phụ cấp gửi xe", "Review lương định kỳ"
]

const formSchema = z.object({
    title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
    company: z.string().min(2, "Tên công ty phải có ít nhất 2 ký tự"),
    website: z.string().url("Vui lòng nhập đúng định dạng URL (http://...)").optional().or(z.literal("")),
    location: z.string().min(5, "Địa điểm phải có ít nhất 5 ký tự"),
    type: z.enum(["full-time", "part-time", "internship"]),
    field: z.string().min(2, "Vui lòng chọn hoặc nhập ngành nghề"),
    salaryMin: z.coerce.number().optional(),
    salaryMax: z.coerce.number().optional(),
    isNegotiable: z.boolean().default(false),
    relatedMajors: z.array(z.string()).min(1, "Chọn ít nhất 1 chuyên ngành liên quan"),
    benefits: z.array(z.string()).optional(),
    description: z.string().min(20, "Mô tả công việc phải chi tiết hơn (tối thiểu 20 ký tự)"),
    requirements: z.string().min(20, "Yêu cầu công việc phải chi tiết hơn (tối thiểu 20 ký tự)"),
    detailedBenefits: z.string().optional(),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Vui lòng chọn ngày hợp lệ",
    }),
    quantity: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
})

export default function PostJobPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [logoBase64, setLogoBase64] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            company: user?.role === "employer" ? user.name : "", // Auto-fill if employer
            website: "",
            location: "",
            type: "full-time",
            field: "",
            salaryMin: 0,
            salaryMax: 0,
            isNegotiable: false,
            relatedMajors: [],
            benefits: [],
            description: "",
            requirements: "",
            detailedBenefits: "",
            deadline: "",
            quantity: 1,
        },
    })

    const isNegotiable = form.watch("isNegotiable")

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!validTypes.includes(file.type)) {
            toast({
                title: "Định dạng không hỗ trợ",
                description: "Chỉ chấp nhận JPG, PNG, WEBP, GIF",
                variant: "destructive",
            })
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "File quá lớn",
                description: "Dung lượng tối đa 2MB",
                variant: "destructive",
            })
            return
        }

        // Convert to Base64
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setLogoPreview(base64String)
            setLogoBase64(base64String)
        }
        reader.readAsDataURL(file)
    }

    const removeLogo = () => {
        setLogoPreview(null)
        setLogoBase64(null)
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            // Format data
            let salaryString = "Thỏa thuận"
            if (!values.isNegotiable) {
                if (values.salaryMin && values.salaryMax) {
                    salaryString = `${(values.salaryMin / 1000000).toLocaleString()} - ${(values.salaryMax / 1000000).toLocaleString()} triệu`
                } else if (values.salaryMin) {
                    salaryString = `Từ ${(values.salaryMin / 1000000).toLocaleString()} triệu`
                } else if (values.salaryMax) {
                    salaryString = `Đến ${(values.salaryMax / 1000000).toLocaleString()} triệu`
                }
            }

            // Parse textareas into arrays for requirements (by newline)
            const requirementsList = values.requirements.split('\n').filter(line => line.trim() !== "")
            const detailedBenefitsList = values.detailedBenefits ? values.detailedBenefits.split('\n').filter(line => line.trim() !== "") : []

            // Format deadline to DD/MM/YYYY
            const deadlineDate = new Date(values.deadline)
            const formattedDeadline = `${deadlineDate.getDate().toString().padStart(2, '0')}/${(deadlineDate.getMonth() + 1).toString().padStart(2, '0')}/${deadlineDate.getFullYear()}`

            const payload = {
                ...values,
                deadline: formattedDeadline,
                salary: salaryString,
                requirements: requirementsList,
                detailedBenefits: detailedBenefitsList,
                role: user?.role,
                creatorId: user?._id || "unknown",
                logo: logoBase64 || "/placeholder.svg?height=100&width=100"
            }

            const response = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || "Có lỗi xảy ra")

            toast({
                title: "Đăng tin thành công!",
                description: user?.role === 'admin' ? "Tin tuyển dụng đã được đăng." : "Tin của bạn đang chờ duyệt.",
                variant: "default",
            })

            router.push("/dashboard/jobs")
        } catch (error) {
            console.error("Submit error:", error)
            toast({
                title: "Không thể đăng tin",
                description: "Vui lòng kiểm tra lại thông tin.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (user?.role === "student") {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Truy cập bị từ chối</CardTitle>
                        <CardDescription>Sinh viên không được phép đăng tin tuyển dụng.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Đăng tin tuyển dụng mới</h1>
                <p className="text-gray-500">Điền thông tin chi tiết về vị trí tuyển dụng của bạn.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* General Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" /> Thông tin chung</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiêu đề công việc <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: Thực tập sinh Frontend ReactJS" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên công ty <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Tên doanh nghiệp của bạn" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Địa điểm làm việc <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input className="pl-9" placeholder="VD: Quận 3, TP.HCM" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Logo Upload Section */}
                            <div className="space-y-3">
                                <FormLabel>Logo công ty</FormLabel>
                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <div className="relative">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-24 h-24 object-contain rounded-lg border bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeLogo}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                            <ImagePlus className="w-8 h-8 text-gray-400" />
                                            <span className="text-xs text-gray-500 mt-1">Thêm logo</span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                    <div className="text-sm text-gray-500">
                                        <p>Định dạng: JPG, PNG, WEBP, GIF</p>
                                        <p>Dung lượng tối đa: 2MB</p>
                                        <p>Kích thước khuyến nghị: 200x200px</p>
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website công ty</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://website-cong-ty.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="deadline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hạn nộp hồ sơ <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số lượng tuyển <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hình thức làm việc</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn hình thức" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {JOB_TYPES.map(type => (
                                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="field"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lĩnh vực / Ngành nghề <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="VD: IT Phần mềm" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormLabel className="text-base font-semibold">Ngành học liên quan</FormLabel>
                                <FormField
                                    control={form.control}
                                    name="relatedMajors"
                                    render={({ field }) => {
                                        const selectedMajors = field.value || []

                                        return (
                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 border rounded-md p-3">
                                                {Object.entries(FIELDS_AND_MAJORS).map(([fieldName, majors]) => (
                                                    <div key={fieldName}>
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-white py-1 z-10">{fieldName}</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {majors.map((major) => {
                                                                const isSelected = selectedMajors.includes(major)
                                                                return (
                                                                    <div
                                                                        key={major}
                                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border select-none ${isSelected
                                                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700"
                                                                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                                                            }`}
                                                                        onClick={() => {
                                                                            if (isSelected) {
                                                                                field.onChange(selectedMajors.filter((m) => m !== major))
                                                                            } else {
                                                                                field.onChange([...selectedMajors, major])
                                                                            }
                                                                        }}
                                                                    >
                                                                        {major}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    }}
                                />
                                <FormMessage>{form.formState.errors.relatedMajors?.message}</FormMessage>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Salary & Benefits */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> Lương & Phúc lợi</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="isNegotiable"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Mức lương Thoả thuận
                                                </FormLabel>
                                                <FormDescription>
                                                    Chọn nếu bạn muốn thương lượng trực tiếp
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {!isNegotiable && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="salaryMin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mức lương tối thiểu (VNĐ)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="salaryMax"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mức lương tối đa (VNĐ)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <FormLabel>Phúc lợi nổi bật</FormLabel>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {COMMON_BENEFITS.map((benefit) => (
                                        <FormField
                                            key={benefit}
                                            control={form.control}
                                            name="benefits"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={benefit}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(benefit)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), benefit])
                                                                        : field.onChange(
                                                                            (field.value || []).filter(
                                                                                (value) => value !== benefit
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal text-sm cursor-pointer">
                                                            {benefit}
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5 text-orange-600" /> Mô tả chi tiết</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả công việc (Làm những gì?) <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Mô tả chi tiết công việc hàng ngày..." className="h-32" {...field} />
                                        </FormControl>
                                        <FormDescription>Gợi ý: Xuống dòng để tách các ý.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="requirements"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yêu cầu công việc (Kỹ năng, Kinh nghiệm) <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="- Ít nhất 1 năm kinh nghiệm&#10;- Thành thạo ReactJS..." className="h-32" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="detailedBenefits"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phúc lợi chi tiết (Ngoài các mục đã chọn ở trên)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="- Môi trường làm việc trẻ trung&#10;- Team building hàng tháng..." className="h-24" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : "Đăng tin tuyển dụng"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
