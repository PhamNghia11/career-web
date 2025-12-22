import { NextResponse } from "next/server"

const companies = [
    {
        id: "1",
        name: "Techcombank",
        logo: "/logos/techcombank.png",
        industry: "Ngân hàng",
        size: "11,000+ nhân viên",
        location: "Hà Nội, Việt Nam",
        description: "Ngân hàng TMCP Kỹ thương Việt Nam - một trong những ngân hàng thương mại cổ phần lớn nhất Việt Nam, thành lập năm 1993, cung cấp đầy đủ dịch vụ tài chính cho khách hàng cá nhân và doanh nghiệp trên toàn quốc.",
        openPositions: 25,
        rating: 4.2,
        verified: true,
        benefits: ["Lương thưởng hấp dẫn", "Bảo hiểm cao cấp", "Đào tạo chuyên nghiệp", "Môi trường quốc tế", "Cơ hội thăng tiến"],
        website: "https://techcombank.com/",
        email: "call_center@techcombank.com.vn",
        phone: "1800 588 822",
    },
    {
        id: "2",
        name: "FPT Software",
        logo: "/logos/fpt.png",
        industry: "Công nghệ thông tin",
        size: "33,000+ nhân viên",
        location: "Hà Nội, Việt Nam",
        description: "Công ty dịch vụ công nghệ thông tin toàn cầu thuộc Tập đoàn FPT, chuyên cung cấp chuyển đổi số, phần mềm, AI, cloud & data, tự động hóa, IoT và các giải pháp công nghệ cho doanh nghiệp trên toàn thế giới.",
        openPositions: 120,
        rating: 4.5,
        verified: true,
        benefits: ["Đào tạo chuyên sâu", "Cơ hội quốc tế", "Lương cạnh tranh", "Team building", "Bảo hiểm toàn diện"],
        website: "https://fptsoftware.com/",
        email: "contact@fpt-software.com",
        phone: "(+84) 243 768 9048",
    },
    {
        id: "3",
        name: "ITP - ĐHQG-HCM",
        logo: "/logos/itp.png",
        industry: "Công nghệ - Khởi nghiệp",
        size: "35+ nhân viên",
        location: "TP. Thủ Đức, TP. Hồ Chí Minh",
        description: "Khu Công nghệ Phần mềm ĐHQG-HCM (ITP) là đơn vị trực thuộc Đại học Quốc gia TP.HCM, hoạt động trong lĩnh vực công nghệ thông tin, đổi mới sáng tạo và hỗ trợ khởi nghiệp, cung cấp hạ tầng và môi trường phát triển cho doanh nghiệp công nghệ.",
        openPositions: 8,
        rating: 4.3,
        verified: true,
        benefits: ["Môi trường học thuật", "Hỗ trợ khởi nghiệp", "Networking", "Đào tạo", "Phát triển dự án"],
        website: "https://itp.vn/",
        email: "contact@vnu-itp.edu.vn",
        phone: "0384828467",
    },
    {
        id: "4",
        name: "IPS Independent",
        logo: "/logos/ips.png",
        industry: "Quản lý bất động sản",
        size: "400+ nhân viên",
        location: "Bình Chánh, TP. Hồ Chí Minh",
        description: "Công ty CP Dịch vụ Quản lý Bất động sản Independent (IPS) hoạt động trong lĩnh vực quản lý và vận hành bất động sản, cung cấp dịch vụ quản lý chung cư, khu biệt thự, cao ốc văn phòng với trên 12 năm kinh nghiệm tại Việt Nam.",
        openPositions: 15,
        rating: 4.1,
        verified: true,
        benefits: ["Môi trường chuyên nghiệp", "Đào tạo nghiệp vụ", "Phúc lợi tốt", "Thăng tiến rõ ràng", "Bảo hiểm xã hội"],
        website: "https://firstindependent.vn/",
        email: "info@independent.vn",
        phone: "0918 807 863",
    },
    {
        id: "5",
        name: "TekNix Corporation",
        logo: "/logos/teknix.png",
        industry: "Công nghệ thông tin",
        size: "200+ nhân viên",
        location: "Quận Bình Thạnh, TP. HCM",
        description: "TekNix Corporation là công ty công nghệ thông tin tại Việt Nam chuyên cung cấp sản phẩm, ứng dụng và giải pháp số hóa cho doanh nghiệp, tập trung vào chuyển đổi số, AI, đám mây, tự động hóa và các giải pháp công nghệ hiện đại.",
        openPositions: 18,
        rating: 4.4,
        verified: true,
        benefits: ["Công nghệ mới nhất", "Start-up culture", "Remote work", "Thưởng dự án", "Flexible hours"],
        website: "https://www.teknixcorp.com/",
        email: "info@teknixcorp.com",
        phone: "(+84) 28 7101 6565",
    },
    {
        id: "6",
        name: "Cohota",
        logo: "/logos/cohota.png",
        industry: "EdTech - Giáo dục",
        size: "50+ nhân viên",
        location: "TP. Thủ Đức, TP. Hồ Chí Minh",
        description: "Cohota là nền tảng công nghệ LMS (Hệ thống Quản lý Học tập trực tuyến), được triển khai cho các đơn vị giáo dục và doanh nghiệp đào tạo tại Việt Nam.",
        openPositions: 10,
        rating: 4.2,
        verified: true,
        benefits: ["Môi trường sáng tạo", "Học hỏi liên tục", "Flexible hours", "Stock options", "Team building"],
        website: "https://cohota.com/",
        email: "contact@cohota.com",
        phone: "(028) 1234 5678",
    },
]

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const company = companies.find((c) => c.id === params.id)

        if (!company) {
            return NextResponse.json(
                { success: false, error: "Company not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            company,
        })
    } catch (error) {
        console.error("Error fetching company:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch company" },
            { status: 500 }
        )
    }
}
