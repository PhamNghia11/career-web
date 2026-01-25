const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://localhost:27017/gdu_career";

async function seed() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const collection = db.collection("news");

        // Dữ liệu mẫu cực xịn
        const sampleNews = [
            // QUOTES (Danh mục: Quote)
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
                slug: "quote-pham-phu-cong"
            },

            // VIDEOS (Danh mục: Video)
            {
                title: "CareerViet Phủ Sóng Công Nghệ AI Matching",
                summary: "Khám phá cách AI thay đổi cuộc chơi tuyển dụng toàn cầu.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Ví dụ
                imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
                category: "Video",
                sourceName: "CareerViet",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 5400,
                slug: "video-ai-matching"
            },
            {
                title: "Bí mật quy trình tuyển dụng tại tập đoàn lớn",
                summary: "Chuyên gia HR chia sẻ những điều ít người biết.",
                videoUrl: "#",
                imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
                category: "Video",
                sourceName: "HR Insider",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 3200,
                slug: "video-hr-secrets"
            },
            {
                title: "Chìa khóa an toàn cho 'mẹ bỉm' quay lại đi làm",
                summary: "Hành trình bứt phá của phụ nữ hiện đại.",
                videoUrl: "#",
                imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
                category: "Video",
                sourceName: "Women In Tech",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 2100,
                slug: "video-women-career"
            },

            // TIN TỨC CHUYÊN SÂU (Đã có từ trước nhưng làm mới)
            {
                title: "GDU hợp tác cùng Techcombank: 500 vị trí thực tập chờ đón sinh viên",
                summary: "Ký kết thỏa thuận hợp tác đào tạo và tuyển dụng lớn nhất quý 1/2026.",
                imageUrl: "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80",
                category: "Thị trường",
                sourceName: "GDU Center",
                sourceUrl: "#",
                publishedAt: new Date().toISOString(),
                views: 1560,
                slug: "gdu-techcombank-partnership"
            }
        ];

        console.log("Nạp dữ liệu mẫu mới (Video & Quote)...");
        await collection.insertMany(sampleNews);
        console.log("Hoàn tất nạp dữ liệu!");
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        await client.close();
    }
}

seed();
