import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Users, FileText, TrendingUp, Calendar, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminPage() {
    const contactsCollection = await getCollection(COLLECTIONS.CONTACTS)
    const applicationsCollection = await getCollection(COLLECTIONS.APPLICATIONS)

    const contactsCount = await contactsCollection.countDocuments()
    const applicationsCount = await applicationsCollection.countDocuments()

    // Calculate new today (mock specific logic or just use createdAt match)
    // For now we just mock "New today" as 0 or 1 for demo purposes if we don't query it.

    const recentContacts = await contactsCollection.find().sort({ createdAt: -1 }).limit(5).toArray()
    const recentApplications = await applicationsCollection.find().sort({ createdAt: -1 }).limit(5).toArray()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tổng quan</h2>
                <p className="text-gray-500 mt-1">Chào mừng trở lại, đây là số liệu thống kê hôm nay.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Tổng đơn ứng tuyển</CardTitle>
                        <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <FileText size={18} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{applicationsCount}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp size={12} className="mr-1" /> +12% so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Tổng liên hệ</CardTitle>
                        <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <Users size={18} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{contactsCount}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp size={12} className="mr-1" /> +4% so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Công ty đối tác</CardTitle>
                        <div className="h-8 w-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                            <LayoutDashboard size={18} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Mock static number for now as we didn't fetch this collection explicitly in this view */}
                        <div className="text-2xl font-bold text-gray-900">24</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Đang hoạt động
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Lịch phỏng vấn</CardTitle>
                        <div className="h-8 w-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <Calendar size={18} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">8</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Trong tuần này
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Liên hệ mới nhất</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/contacts" className="text-blue-600 gap-1">Xem tất cả <ArrowUpRight size={16} /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-0">
                        {recentContacts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Chưa có liên hệ nào</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentContacts.map((contact: any) => (
                                    <div key={contact._id.toString()} className="flex items-start p-4 hover:bg-gray-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3 shrink-0">
                                            {contact.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(contact.createdAt).toLocaleDateString("vi-VN")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-1">{contact.email}</p>
                                            <p className="text-sm text-gray-600 line-clamp-1">{contact.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Ứng tuyển gần đây</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/applications" className="text-blue-600 gap-1">Xem tất cả <ArrowUpRight size={16} /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-0">
                        {recentApplications.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Chưa có đơn ứng tuyển nào</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentApplications.map((app: any) => (
                                    <div key={app._id.toString()} className="flex items-start p-4 hover:bg-gray-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm mr-3 shrink-0">
                                            {app.fullname.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{app.fullname}</p>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-blue-600 mb-1 font-medium">{app.jobTitle}</p>
                                            <p className="text-xs text-gray-500">Tại: {app.companyName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
