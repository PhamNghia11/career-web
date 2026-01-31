"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save, Image as ImageIcon, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"

interface HeroSlide {
    _id?: string
    title: string
    subtitle: string
    image: string
    cta: string
    link: string
    order: number
    isActive: boolean
}

export default function AdminHeroPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([])
    const [loading, setLoading] = useState(true)
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const res = await fetch("/api/hero-slides")
            const data = await res.json()
            if (data.success) {
                setSlides(data.data)
            }
        } catch (error) {
            toast.error("Không thể tải danh sách slide")
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            if (editingSlide) {
                setEditingSlide({ ...editingSlide, image: reader.result as string })
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSave = async () => {
        if (!editingSlide) return

        try {
            const res = await fetch("/api/admin/hero-slides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingSlide._id,
                    ...editingSlide
                })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(editingSlide._id ? "Đã cập nhật slide" : "Đã tạo slide mới")
                setEditingSlide(null)
                fetchSlides()
            } else {
                toast.error(data.error || "Có lỗi xảy ra")
            }
        } catch (error) {
            toast.error("Không thể lưu slide")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa slide này?")) return

        try {
            const res = await fetch(`/api/admin/hero-slides?id=${id}`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                toast.success("Đã xóa slide")
                fetchSlides()
            }
        } catch (error) {
            toast.error("Không thể xóa slide")
        }
    }

    const handleToggleActive = async (slide: HeroSlide) => {
        try {
            const res = await fetch("/api/admin/hero-slides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: slide._id,
                    ...slide,
                    isActive: !slide.isActive
                })
            })
            if (res.ok) {
                fetchSlides()
            }
        } catch (error) {
            toast.error("Không thể thay đổi trạng thái")
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Hero Section</h1>
                    <p className="text-slate-500">Quản lý các slide hình ảnh và nội dung trên trang chủ</p>
                </div>
                <Button
                    onClick={() => setEditingSlide({
                        title: "",
                        subtitle: "",
                        image: "",
                        cta: "Khám phá ngay",
                        link: "/jobs",
                        order: 0,
                        isActive: true
                    })}
                    className="bg-[#0077B6] hover:bg-[#0077B6]/90"
                >
                    <Plus className="w-4 h-4 mr-2" /> Thêm slide mới
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slides.map((slide) => (
                    <div key={slide._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 group">
                        <div className="relative h-40 bg-slate-100">
                            {slide.image ? (
                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    onClick={() => handleToggleActive(slide)}
                                    className={`p-2 rounded-full shadow-sm ${slide.isActive ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}
                                    title={slide.isActive ? "Đang hiển thị" : "Đã ẩn"}
                                >
                                    {slide.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-slate-800 line-clamp-1">{slide.title || "(Không có tiêu đề)"}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">{slide.subtitle || "(Không có nội dung)"}</p>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                                <span className="text-xs font-medium text-slate-400">Thứ tự: {slide.order}</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setEditingSlide(slide)}>Sửa</Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => slide._id && handleDelete(slide._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal */}
            {editingSlide && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingSlide._id ? "Chỉnh sửa Slide" : "Thêm Slide mới"}
                            </h2>
                            <button onClick={() => setEditingSlide(null)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Hình ảnh nền</label>
                                <div
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative min-h-[200px]"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                >
                                    {editingSlide.image ? (
                                        <img src={editingSlide.image} className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <>
                                            <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                                            <p className="text-sm text-slate-500">Nhấp để tải ảnh lên (Max 2MB)</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        id="image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Tiêu đề chính</label>
                                    <Input
                                        value={editingSlide.title}
                                        onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                                        placeholder="VD: Hội chợ việc làm 2025"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Thứ tự hiển thị</label>
                                    <Input
                                        type="number"
                                        value={editingSlide.order}
                                        onChange={(e) => setEditingSlide({ ...editingSlide, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Phụ đề / Mô tả</label>
                                <Textarea
                                    value={editingSlide.subtitle}
                                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                                    placeholder="Mô tả ngắn gọn về slide này..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Tên nút (CTA)</label>
                                    <Input
                                        value={editingSlide.cta}
                                        onChange={(e) => setEditingSlide({ ...editingSlide, cta: e.target.value })}
                                        placeholder="VD: Khám phá ngay"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Đường dẫn khi nhấn nút</label>
                                    <Input
                                        value={editingSlide.link}
                                        onChange={(e) => setEditingSlide({ ...editingSlide, link: e.target.value })}
                                        placeholder="VD: /jobs hoặc https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <Button variant="outline" onClick={() => setEditingSlide(null)}>Hủy</Button>
                            <Button onClick={handleSave} className="bg-[#0077B6] hover:bg-[#0077B6]/90">
                                <Save className="w-4 h-4 mr-2" /> Lưu Slide
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
