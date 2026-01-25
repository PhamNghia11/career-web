"use client"

import { Mail, Calculator, ArrowRight, TrendingUp } from "lucide-react"

export function NewsSidebar() {
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
                <button className="w-full py-4 bg-white text-[#FF3B5C] font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transform transition-all shadow-xl">
                    Tạo Ngay
                </button>
            </div>

            {/* Salary Calculator Mockup Card */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-emerald-50 rounded-xl">
                        <Calculator className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-slate-800">Công cụ tính lương</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Lương Gross (VNĐ)</label>
                        <input
                            placeholder="Nhập mức lương..."
                            className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl outline-none transition-all text-sm font-bold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Người phụ thuộc</label>
                        <input
                            placeholder="Số người..."
                            className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl outline-none transition-all text-sm font-bold"
                        />
                    </div>

                    <button className="w-full py-4 bg-emerald-500 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                        Tính Lương NET
                    </button>
                </div>
            </div>

            {/* Trending Tags Section */}
            <div className="p-8 bg-slate-50 rounded-[32px]">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Từ khóa hot</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {["Thực tập sinh", "Fresher IT", "CV Mẫu", "Phỏng vấn", "GDU Alumni", "Skill Up"].map(tag => (
                        <button key={tag} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-primary hover:border-primary transition-all">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    )
}
