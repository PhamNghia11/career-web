const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

// Các ảnh chắc chắn hoạt động 100% (từ picsum.photos - CDN miễn phí luôn online)
const WORKING_IMAGES = [
    "https://picsum.photos/seed/news1/800/600",
    "https://picsum.photos/seed/news2/800/600",
    "https://picsum.photos/seed/news3/800/600",
    "https://picsum.photos/seed/news4/800/600",
    "https://picsum.photos/seed/news5/800/600",
    "https://picsum.photos/seed/news6/800/600",
    "https://picsum.photos/seed/news7/800/600",
    "https://picsum.photos/seed/news8/800/600",
    "https://picsum.photos/seed/news9/800/600",
    "https://picsum.photos/seed/news10/800/600",
];

async function fixAllImages() {
    const client = new MongoClient(MONGODB_URI);
    try {
        console.log("Đang kết nối tới Cloud MongoDB...");
        await client.connect();
        const db = client.db("gdu_career");
        const collection = db.collection("news");

        // Lấy tất cả bài viết
        const allNews = await collection.find({}).toArray();
        console.log(`Tìm thấy ${allNews.length} bài viết. Đang cập nhật ảnh...`);

        for (let i = 0; i < allNews.length; i++) {
            const news = allNews[i];
            const newImageUrl = WORKING_IMAGES[i % WORKING_IMAGES.length];

            await collection.updateOne(
                { _id: news._id },
                { $set: { imageUrl: newImageUrl } }
            );
            console.log(`[${i + 1}/${allNews.length}] Đã cập nhật: ${news.title.substring(0, 40)}...`);
        }

        console.log("\n✅ HOÀN TẤT! Tất cả ảnh đã được thay bằng nguồn ổn định.");
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        await client.close();
    }
}

fixAllImages();
