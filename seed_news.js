const { MongoClient } = require('mongodb');

// Sử dụng URI từ cloud trong .env.local của bạn
const MONGODB_URI = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

async function seed() {
    const client = new MongoClient(MONGODB_URI);
    try {
        console.log("Đang kết nối tới Cloud MongoDB...");
        await client.connect();
        const db = client.db("gdu_career");
        const collection = db.collection("news");

        const sampleNews = [
            // QUOTES
            {
                title: "Phạm Phú Công (Mr.)",
                summary: "Thường xuyên cập nhật CV và những thành tựu cá nhân, chủ động tìm kiếm tin qua mối quan hệ với các doanh nghiệp đối tác GDU... Chính là con đường dẫn bạn đến với những cơ hội giá trị.",
                content: "Giám đốc Nguồn nhân lực - TECHCOMBANK (Alumni 2018)",
                imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
                category: "Quote",
                sourceName: "GDU Alumni",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 999,
                slug: "quote-pham-phu-cong-cloud"
            },

            // VIDEOS
            {
                title: "CareerViet Phủ Sóng Công Nghệ AI Matching",
                summary: "Khám phá cách AI thay đổi cuộc chơi tuyển dụng toàn cầu.",
                imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
                category: "Video",
                sourceName: "CareerViet",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 5400,
                slug: "video-ai-matching-cloud"
            },
            {
                title: "Bí mật quy trình tuyển dụng tại tập đoàn lớn",
                summary: "Chuyên gia HR chia sẻ những điều ít người biết.",
                imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
                category: "Video",
                sourceName: "HR Insider",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 3200,
                slug: "video-hr-secrets-cloud"
            },

            // TIN TỨC CHUYÊN SÂU
            {
                title: "GDU hợp tác cùng Techcombank: 500 vị trí thực tập chờ đón sinh viên",
                summary: "Ký kết thỏa thuận hợp tác đào tạo và tuyển dụng lớn nhất quý 1/2026.",
                imageUrl: "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80",
                category: "Thị trường",
                sourceName: "GDU Center",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 1560,
                slug: "gdu-techcombank-partnership-cloud"
            },
            {
                title: "5 bước để có một bộ CV 'bách phát bách trúng'",
                summary: "Hướng dẫn thực tế từ chuyên gia nhân sự giúp sinh viên GDU tối ưu hóa CV.",
                imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
                category: "Kỹ năng",
                sourceName: "Career Hacks",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 2800,
                slug: "5-buoc-toi-uu-cv-cloud"
            },
            {
                title: "Thông báo tuyển thực tập GDU Nest - Mùa 5",
                summary: "Chương trình thực tập trả lương tại GDU Nest đã chính thức mở đơn.",
                imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
                category: "Thông báo",
                sourceName: "GDU Center",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 5200,
                slug: "tuyen-thuc-tap-gdu-nest-cloud"
            }
        ];

        console.log("Đang nạp dữ liệu lên Cloud Database...");
        await collection.insertMany(sampleNews);
        console.log("Hoàn tất nạp dữ liệu lên Cloud!");
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        await client.close();
    }
}

seed();
