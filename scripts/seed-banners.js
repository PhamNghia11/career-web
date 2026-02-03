const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

function getEnvValue(key) {
    try {
        const envPath = path.resolve(process.cwd(), ".env.local");
        if (!fs.existsSync(envPath)) return null;
        const content = fs.readFileSync(envPath, "utf8");
        const lines = content.split("\n");
        for (const line of lines) {
            if (line.startsWith(key + "=")) {
                return line.substring(key.length + 1).replace(/"/g, "").trim();
            }
        }
    } catch (e) {
        return null;
    }
}

const uri = process.env.MONGODB_URI || getEnvValue("MONGODB_URI");

if (!uri) {
    console.error("Could not find MONGODB_URI. Make sure .env.local exists.");
    process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB via " + uri.substring(0, 15) + "...");

        const db = client.db("gdu-career");
        const collection = db.collection("hero_slides");

        const jobsBanner = {
            title: "Tìm kiếm cơ hội nghề nghiệp",
            subtitle: "Khám phá hàng ngàn việc làm hấp dẫn từ các doanh nghiệp hàng đầu dành cho sinh viên GDU",
            image: "/vercel-banner.jpg",
            page: "jobs",
            isActive: true,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const existing = await collection.findOne({ page: "jobs" });
        if (existing) {
            console.log("Jobs banner already exists in DB. Updating...");
            await collection.updateOne({ _id: existing._id }, { $set: jobsBanner });
        } else {
            console.log("Creating jobs banner in DB...");
            await collection.insertOne(jobsBanner);
        }


        const companiesBanner = {
            title: "Khám phá doanh nghiệp",
            subtitle: "Tìm hiểu về các doanh nghiệp hàng đầu và cơ hội nghề nghiệp dành cho bạn",
            image: "/companies-banner.jpg",
            page: "companies",
            isActive: true,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const existingCompanies = await collection.findOne({ page: "companies" });
        if (existingCompanies) {
            console.log("Companies banner already exists in DB. Updating...");
            await collection.updateOne({ _id: existingCompanies._id }, { $set: companiesBanner });
        } else {
            console.log("Creating companies banner in DB...");
            await collection.insertOne(companiesBanner);
        }

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await client.close();
    }
}

main();
