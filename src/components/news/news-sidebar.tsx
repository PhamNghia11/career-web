import { Mail, Calculator, ArrowRight, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface NewsSidebarProps {
    onTagClick: (tag: string) => void
}

export function NewsSidebar({ onTagClick }: NewsSidebarProps) {
    const handleSubscribe = () => {
        toast.success("Đã đăng ký nhận tin thành công!")
    }

    return (
        <aside className="space-y-8">
            {/* Newsletter Subscription Card */}
            <div className="bg-[#FF3B5C] rounded-[32px] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-4 right-4 bg-white/20 p-3 rounded-2xl">
                    <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Quan Tâm</h3>
                <p className="text-white/80 text-sm font-medium mb-6 leading-relaxed">
                    Thông báo việc làm - Hoàn toàn miễn phí và dễ dàng
                </p>
                <button
                    onClick={handleSubscribe}
                    className="w-full py-4 bg-white text-[#FF3B5C] font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transform transition-all shadow-xl"
                >
                    Tạo Ngay
                </button>
            </div>

            {/* Trending Tags Section */}
            <div className="p-8 bg-slate-50 rounded-[32px]">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Từ khóa hot</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {["Thực tập sinh", "Fresher IT", "CV Mẫu", "Phỏng vấn", "GDU Alumni", "Skill Up"].map(tag => (
                        <button
                            key={tag}
                            onClick={() => onTagClick(tag)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-primary hover:border-primary transition-all"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    )
}
