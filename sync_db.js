const { MongoClient } = require('mongodb');

const LOCAL_URI = "mongodb://localhost:27017/gdu_career";
const CLOUD_URI = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

async function syncAll() {
    const localClient = new MongoClient(LOCAL_URI);
    const cloudClient = new MongoClient(CLOUD_URI);

    try {
        console.log("--- BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU ---");
        await localClient.connect();
        await cloudClient.connect();

        const localDb = localClient.db("gdu_career");
        const cloudDb = cloudClient.db("gdu_career");

        const collections = await localDb.listCollections().toArray();
        console.log(`Tìm thấy ${collections.length} bảng dữ liệu cần đồng bộ.`);

        for (const colInfo of collections) {
            const colName = colInfo.name;
            console.log(`\nĐang xử lý bảng: [${colName}]`);

            // 1. Lấy dữ liệu từ local
            const localData = await localDb.collection(colName).find({}).toArray();
            console.log(` - Local có: ${localData.length} bản ghi.`);

            if (localData.length === 0) {
                console.log(` - Bỏ qua vì bảng trống.`);
                continue;
            }

            // 2. Xóa dữ liệu cũ trên Cloud (để đảm bảo đồng bộ sạch)
            console.log(` - Đang làm sạch bảng trên Cloud...`);
            await cloudDb.collection(colName).deleteMany({});

            // 3. Đẩy dữ liệu mới lên Cloud
            console.log(` - Đang đẩy ${localData.length} bản ghi lên Cloud...`);
            await cloudDb.collection(colName).insertMany(localData);
            console.log(` - Hoàn tất: [${colName}]`);
        }

        console.log("\n--- CHÚC MỪNG! TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ LÊN CLOUD ---");
        process.exit(0);
    } catch (error) {
        console.error("Lỗi trong quá trình đồng bộ:", error);
        process.exit(1);
    } finally {
        await localClient.close();
        await cloudClient.close();
    }
}

syncAll();
