const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

async function seedVideos() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const collection = db.collection("news");

        // Xóa các video cũ trước khi nạp mới cho sạch
        await collection.deleteMany({ category: "Video" });

        const realVideos = [
            {
                title: "Đột Phá Công Nghệ AI Matching: Tìm Đúng Việc, Tuyển Đúng Người",
                summary: "Khám phá công nghệ AI đột phá giúp kết nối ứng viên và nhà tuyển dụng hiệu quả nhất từ CareerViet.",
                videoUrl: "https://www.youtube.com/watch?v=M5F_S-dE-u0", // Video thật từ CareerViet
                imageUrl: "https://img.youtube.com/vi/M5F_S-dE-u0/hqdefault.jpg",
                category: "Video",
                sourceName: "CareerViet",
                sourceUrl: "https://careerviet.vn/",
                publishedAt: new Date().toISOString(),
                views: 15400,
                slug: "video-careerviet-ai-matching-v3"
            },
            {
                title: "Bí kíp sở hữu CV ấn tượng trong mắt nhà tuyển dụng | VietnamWorks",
                summary: "Chuyên gia VietnamWorks chia sẻ những mẹo nhỏ nhưng cực kỳ quan trọng để CV của bạn nổi bật giữa hàng ngàn hồ sơ.",
                videoUrl: "https://www.youtube.com/watch?v=m-sh6L_NqRE",
                imageUrl: "https://img.youtube.com/vi/m-sh6L_NqRE/hqdefault.jpg",
                category: "Video",
                sourceName: "VietnamWorks",
                sourceUrl: "https://www.vietnamworks.com/",
                publishedAt: new Date().toISOString(),
                views: 8200,
                slug: "video-vietnamworks-cv-tips-v3"
            },
            {
                title: "Hành trình chinh phục PROsition cùng VietnamWorks 2025",
                summary: "Chiến dịch định vị giá trị bản thân và mở khóa tiềm năng sự nghiệp trong năm 2025.",
                videoUrl: "https://www.youtube.com/watch?v=mYshY-0p_K8",
                imageUrl: "https://img.youtube.com/vi/mYshY-0p_K8/hqdefault.jpg",
                category: "Video",
                sourceName: "VietnamWorks",
                sourceUrl: "https://www.vietnamworks.com/",
                publishedAt: new Date().toISOString(),
                views: 12000,
                slug: "video-vietnamworks-2025-campaign"
            }
        ];

        console.log("Đang nạp 3 video thật lên Cloud Database...");
        await collection.insertMany(realVideos);
        console.log("Hoàn tất nạp video thật!");
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        await client.close();
    }
}

seedVideos();
