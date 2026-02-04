/**
 * HƯỚNG DẪN CẬP NHẬT TRANG CHỦ
 * 
 * Để thay đổi Tiêu đề, Mô tả hoặc các thẻ Hot Tags:
 * 1. Mở file này.
 * 2. Thay đổi nội dung trong biến `newConfig` bên dưới.
 * 3. Chạy lệnh: node scripts/update-home-config.js
 */

const { MongoClient } = require('mongodb');

// URI kết nối (Tự động dùng từ môi trường hoặc bản local)
const MONGODB_URI = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

const newConfig = {
    key: "home_quick_search",
    title: "Bạn đã sẵn sàng đón đầu xu hướng?",
    description: "Khám phá ngay hàng ngàn cơ hội việc làm hấp dẫn phù hợp với kỹ năng của bạn.",
    hotTags: ["#Intern", "#ReactJS", "#Marketing", "#Design", "#AI", "#Logistics"], // Thay đổi danh sách tag tại đây
    isActive: true,
    updatedAt: new Date()
};

async function update() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const collection = db.collection("site_configs");

        const result = await collection.updateOne(
            { key: newConfig.key },
            { $set: newConfig },
            { upsert: true }
        );

        console.log("------------------------------------------");
        console.log("✅ CẬP NHẬT THÀNH CÔNG!");
        console.log("Nội dung mới:");
        console.log("- Tiêu đề:", newConfig.title);
        console.log("- Tags:", newConfig.hotTags.join(", "));
        console.log("------------------------------------------");
        console.log("Lưu ý: Bạn có thể cần tải lại trang để thấy thay đổi.");
    } catch (error) {
        console.error("❌ LỖI CẬP NHẬT:", error.message);
    } finally {
        await client.close();
    }
}

update();
