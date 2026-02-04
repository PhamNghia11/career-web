const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

async function seed() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const collection = db.collection("site_configs");

        const config = {
            key: "home_quick_search",
            title: "Bạn đã sẵn sàng đón đầu xu hướng?",
            description: "Khám phá ngay hàng ngàn cơ hội việc làm hấp dẫn phù hợp với kỹ năng của bạn.",
            hotTags: ["#Intern", "#ReactJS", "#Marketing", "#Designer", "#AI"],
            isActive: true,
            updatedAt: new Date()
        };

        await collection.updateOne(
            { key: config.key },
            { $set: config },
            { upsert: true }
        );

        console.log("Seeded site_configs successfully");
    } catch (error) {
        console.error("Error seeding:", error);
    } finally {
        await client.close();
    }
}

seed();
