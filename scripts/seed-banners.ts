import { MongoClient } from "mongodb"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const uri = process.env.MONGODB_URI
if (!uri) {
    console.error("Please set MONGODB_URI in .env.local")
    process.exit(1)
}

const client = new MongoClient(uri)

async function main() {
    try {
        await client.connect()
        console.log("Connected to MongoDB")

        const db = client.db("gdu-career") // Adjust DB name if needed, usually parse from URI but hardcoding/env works
        const collection = db.collection("hero_slides")

        const jobsBanner = {
            title: "Tìm kiếm cơ hội nghề nghiệp",
            subtitle: "Khám phá hàng ngàn việc làm hấp dẫn từ các doanh nghiệp hàng đầu dành cho sinh viên GDU",
            image: "/jobs-banner.png",
            page: "jobs",
            isActive: true,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        // Check if exists
        const existing = await collection.findOne({ page: "jobs" })
        if (existing) {
            console.log("Jobs banner already exists. Updating...")
            await collection.updateOne({ _id: existing._id }, { $set: jobsBanner })
        } else {
            console.log("Creating jobs banner...")
            await collection.insertOne(jobsBanner)
        }

        console.log("Database seeded successfully!")
    } catch (error) {
        console.error("Error seeding database:", error)
    } finally {
        await client.close()
    }
}

main()
