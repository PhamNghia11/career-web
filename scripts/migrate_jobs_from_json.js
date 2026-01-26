const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

async function migrateJobs() {
    const client = new MongoClient(MONGODB_URI);
    try {
        console.log("Đang kết nối tới MongoDB...");
        await client.connect();
        const db = client.db("gdu_career");
        const collection = db.collection("jobs");

        const jobsFilePath = path.join(__dirname, '../src/data/jobs.json');
        const jobsDataRaw = fs.readFileSync(jobsFilePath, 'utf8');
        const jobsData = JSON.parse(jobsDataRaw);

        const jobs = Array.isArray(jobsData) ? jobsData : (jobsData.jobs || []);

        if (jobs.length === 0) {
            console.log("Không tìm thấy dữ liệu công việc để migrate.");
            return;
        }

        console.log(`Tìm thấy ${jobs.length} công việc. Đang kiểm tra tồn tại...`);

        for (const job of jobs) {
            // Use existing _id if possible, otherwise let Mongo handle it
            const existing = await collection.findOne({ _id: job._id });
            if (!existing) {
                // Ensure postedAt is a Date or ISO string
                if (!job.postedAt) {
                    job.postedAt = new Date().toISOString();
                }

                await collection.insertOne(job);
                console.log(` - Đã thêm: ${job.title} (${job.company})`);
            } else {
                console.log(` - Bỏ qua (đã tồn tại): ${job.title}`);
            }
        }

        console.log("\n✅ HOÀN TẤT migrate dữ liệu từ JSON sang Database!");
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        await client.close();
    }
}

migrateJobs();
