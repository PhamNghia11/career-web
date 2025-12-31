import {
    Heart,
    Monitor,
    Radio,
    Briefcase,
    Users,
    Scale,
    Languages,
    Landmark,
} from "lucide-react"

export interface Major {
    id: string
    name: string
    specializations: string[]
}

export interface Field {
    id: string
    name: string
    icon: string
    color: string
    majors: Major[]
}

export const fieldsData: Field[] = [
    {
        id: "healthcare",
        name: "Sức khỏe",
        icon: "Heart",
        color: "from-rose-500 to-pink-500",
        majors: [
            {
                id: "dental",
                name: "Răng – Hàm – Mặt",
                specializations: [],
            },
        ],
    },
    {
        id: "it",
        name: "Công nghệ thông tin",
        icon: "Monitor",
        color: "from-blue-500 to-cyan-500",
        majors: [
            {
                id: "it-general",
                name: "Công nghệ thông tin",
                specializations: [
                    "Khai thác dữ liệu lớn",
                    "Lập trình kết nối vạn vật (IoT)",
                    "An toàn thông tin mạng",
                    "Đồ họa kỹ thuật số",
                ],
            },
            {
                id: "software-engineering",
                name: "Kỹ thuật phần mềm",
                specializations: [],
            },
            {
                id: "networking",
                name: "Mạng máy tính và truyền thông dữ liệu",
                specializations: [],
            },
            {
                id: "ai",
                name: "Trí tuệ nhân tạo",
                specializations: [],
            },
        ],
    },
    {
        id: "media",
        name: "Truyền thông",
        icon: "Radio",
        color: "from-orange-500 to-red-500",
        majors: [
            {
                id: "multimedia",
                name: "Truyền thông đa phương tiện",
                specializations: [
                    "Truyền hình, điện ảnh, quảng cáo",
                    "Xây dựng và quản trị kênh truyền thông độc lập",
                ],
            },
            {
                id: "comm-tech",
                name: "Công nghệ truyền thông",
                specializations: [],
            },
            {
                id: "pr",
                name: "Quan hệ công chúng",
                specializations: ["Tổ chức sự kiện"],
            },
        ],
    },
    {
        id: "business",
        name: "Kinh doanh",
        icon: "Briefcase",
        color: "from-emerald-500 to-teal-500",
        majors: [
            {
                id: "intl-business",
                name: "Kinh doanh quốc tế",
                specializations: ["Ngoại thương", "Kinh doanh xuất nhập khẩu"],
            },
            {
                id: "commerce",
                name: "Kinh doanh thương mại",
                specializations: [],
            },
            {
                id: "ecommerce",
                name: "Thương mại điện tử",
                specializations: [],
            },
        ],
    },
    {
        id: "management",
        name: "Quản trị – Quản lý",
        icon: "Users",
        color: "from-violet-500 to-purple-500",
        majors: [
            {
                id: "biz-admin",
                name: "Quản trị kinh doanh",
                specializations: [
                    "Quản trị nguồn nhân lực",
                    "Quản trị doanh nghiệp",
                    "Quản trị vận hành",
                    "Quản trị khởi nghiệp",
                    "Quản trị bán lẻ",
                    "Kinh doanh bất động sản",
                    "Quản trị dịch vụ hàng không",
                ],
            },
            {
                id: "marketing",
                name: "Marketing",
                specializations: [
                    "Marketing kỹ thuật số",
                    "Quản trị truyền thông và thương hiệu",
                ],
            },
            {
                id: "hotel-mgmt",
                name: "Quản trị khách sạn",
                specializations: ["Quản trị cơ sở lưu trú", "Quản trị dịch vụ ăn uống"],
            },
            {
                id: "tourism",
                name: "Quản trị dịch vụ du lịch và lữ hành",
                specializations: [],
            },
            {
                id: "logistics",
                name: "Logistics và quản lý chuỗi cung ứng",
                specializations: [],
            },
        ],
    },
    {
        id: "law",
        name: "Luật",
        icon: "Scale",
        color: "from-amber-500 to-yellow-500",
        majors: [
            {
                id: "law-general",
                name: "Luật",
                specializations: ["Luật kinh doanh", "Luật thương mại quốc tế"],
            },
            {
                id: "economic-law",
                name: "Luật kinh tế",
                specializations: [],
            },
        ],
    },
    {
        id: "social-lang",
        name: "Khoa học xã hội & Ngôn ngữ",
        icon: "Languages",
        color: "from-sky-500 to-indigo-500",
        majors: [
            {
                id: "english",
                name: "Ngôn ngữ Anh",
                specializations: [
                    "Tiếng Anh thương mại",
                    "Tiếng Anh biên – phiên dịch",
                    "Tiếng Anh du lịch",
                ],
            },
            {
                id: "oriental",
                name: "Đông phương học",
                specializations: [],
            },
            {
                id: "psychology",
                name: "Tâm lý học",
                specializations: [],
            },
            {
                id: "chinese",
                name: "Ngôn ngữ Trung Quốc",
                specializations: [],
            },
        ],
    },
    {
        id: "finance",
        name: "Tài chính – Ngân hàng",
        icon: "Landmark",
        color: "from-green-500 to-emerald-500",
        majors: [
            {
                id: "banking",
                name: "Tài chính – Ngân hàng",
                specializations: [
                    "Tín dụng ngân hàng",
                    "Tài chính và thanh toán quốc tế",
                ],
            },
            {
                id: "fintech",
                name: "Công nghệ tài chính (Fintech)",
                specializations: [],
            },
            {
                id: "accounting",
                name: "Kế toán",
                specializations: [],
            },
        ],
    },
]

// Icon mapping for dynamic rendering
export const fieldIcons = {
    Heart,
    Monitor,
    Radio,
    Briefcase,
    Users,
    Scale,
    Languages,
    Landmark,
}
