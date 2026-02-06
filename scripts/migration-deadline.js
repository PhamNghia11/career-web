/**
 * Migration script to populate normalizedDeadline for existing jobs.
 * Run this script using: node scripts/migration-deadline.js
 */
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gdu_career";

function parseNormalizedDeadline(deadline) {
    if (!deadline || deadline === "Vô thời hạn") return null;
    if (deadline instanceof Date) return deadline;

    const str = String(deadline).trim();
    if (!str) return null;

    // DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmyMatch) {
        const [_, day, month, year] = dmyMatch;
        const date = new Date(`${year}-${month}-${day}T00:00:00+07:00`);
        return isNaN(date.getTime()) ? null : date;
    }

    // YYYY-MM-DD
    const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
        const date = new Date(`${str}T00:00:00+07:00`);
        return isNaN(date.getTime()) ? null : date;
    }

    const fallbackDate = new Date(str);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

async function migrate() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("gdu_career");
        const jobsCollection = db.collection("jobs");

        const jobs = await jobsCollection.find({}).toArray();
        console.log(`Found ${jobs.length} jobs to process.`);

        let updatedCount = 0;
        for (const job of jobs) {
            const normalized = parseNormalizedDeadline(job.deadline);
            await jobsCollection.updateOne(
                { _id: job._id },
                { $set: { normalizedDeadline: normalized } }
            );
            updatedCount++;
            if (updatedCount % 10 === 0) {
                console.log(`Processed ${updatedCount}/${jobs.length} jobs...`);
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} jobs.`);
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await client.close();
    }
}

migrate();
