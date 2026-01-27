import { Mail, ArrowRight, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface NewsSidebarProps {
    onTagClick: (tag: string) => void
}

export function NewsSidebar({ onTagClick }: NewsSidebarProps) {
    const { toast } = useToast()
    const [isSubscribing, setIsSubscribing] = React.useState(false)

    const handleSubscribe = () => {
        setIsSubscribing(true)
        // Simulate a small delay for better UX
        setTimeout(() => {
            toast({
                title: "Đăng ký thành công!",
                description: "Hệ thống đã ghi nhận email của bạn để gửi thông báo việc làm mới nhất.",
            })
            setIsSubscribing(false)
        }, 600)
    }

    return (
        <aside className="space-y-8">
            {/* Newsletter Subscription Card */}
            <div className="bg-primary rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl shadow-primary/10">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <Mail className="w-6 h-6" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Quan Tâm</h3>
                    <p className="text-white/80 text-sm font-medium mb-6 leading-relaxed">
                        Thông báo việc làm - Hoàn toàn miễn phí và dễ dàng
                    </p>
                    <Button
                        type="button"
                        disabled={isSubscribing}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSubscribe();
                        }}
                        className="w-full py-6 bg-white text-primary hover:bg-slate-50 font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 border-none relative z-20"
                    >
                        {isSubscribing ? "Đang xử lý..." : "Tạo Ngay"}
                    </Button>
                </div>
            </div>

            {/* Trending Tags Section */}
            <div className="p-8 bg-slate-50 rounded-[32px]">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Từ khóa hot</h3>
                </div>
                <div className="flex flex-wrap gap-2 relative z-10">
                    {["Thực tập sinh", "Fresher IT", "CV Mẫu", "Phỏng vấn", "GDU Alumni", "Skill Up"].map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onTagClick(tag);
                            }}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-primary hover:border-primary transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    )
}
